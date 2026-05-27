import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const COUNTRY_JSON = path.join(ROOT, 'src/data/countries.json');
const NATURAL_EARTH = path.join(ROOT, 'ne_50m_admin_0_countries.geojson');
const OUT_FILE = path.join(ROOT, 'public/data/countries.geojson');
const VALIDATE_ONLY = process.argv.includes('--validate-only');

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function isValidIso2(value) {
  return typeof value === 'string' && /^[A-Z]{2}$/.test(value) && value !== '-99';
}

function firstValidIso(properties, countryByIso, countryByIso3) {
  const directFields = ['ISO_A2_EH', 'ISO_A2', 'WB_A2', 'FIPS_10'];
  for (const field of directFields) {
    const value = String(properties[field] ?? '').toUpperCase();
    if (isValidIso2(value)) return value;
  }

  const a3Fields = ['ISO_A3_EH', 'ISO_A3', 'ADM0_A3', 'ADM0_A3_DE', 'SOV_A3'];
  for (const field of a3Fields) {
    const value = String(properties[field] ?? '').toUpperCase();
    const country = countryByIso3.get(value);
    if (country) return country.iso2;
  }

  const postal = String(properties.POSTAL ?? '').toUpperCase();
  if (isValidIso2(postal) && countryByIso.has(postal)) return postal;
  return '';
}

function flattenCoordinates(geometry, points = []) {
  if (!geometry) return points;
  if (geometry.type === 'Point') {
    points.push(geometry.coordinates);
  } else if (geometry.type === 'Polygon') {
    geometry.coordinates.flat(1).forEach((point) => points.push(point));
  } else if (geometry.type === 'MultiPolygon') {
    geometry.coordinates.flat(2).forEach((point) => points.push(point));
  }
  return points;
}

function bboxForGeometry(geometry) {
  const points = flattenCoordinates(geometry);
  if (points.length === 0) return undefined;

  let minLng = Infinity;
  let minLat = Infinity;
  let maxLng = -Infinity;
  let maxLat = -Infinity;

  for (const [lng, lat] of points) {
    minLng = Math.min(minLng, lng);
    minLat = Math.min(minLat, lat);
    maxLng = Math.max(maxLng, lng);
    maxLat = Math.max(maxLat, lat);
  }

  return [minLng, minLat, maxLng, maxLat].map((value) => Number(value.toFixed(5)));
}

function primaryCurrency(country) {
  return country?.currencies?.[0]?.code ?? 'unknown';
}

function featureName(properties, country) {
  return country?.names?.de ?? properties.NAME_DE ?? properties.NAME_EN ?? properties.ADMIN ?? 'Unbekannt';
}

function cleanAssetPaths(country) {
  const assets = country.assets ?? {};
  return [assets.flag, assets.licensePlate, assets.roadSign, ...(assets.customImages ?? []).map((item) => item.src)]
    .filter(Boolean)
    .map((assetPath) => String(assetPath).replace(/^\/+/, ''));
}

function validateAssets(countries) {
  const missing = [];
  for (const country of countries) {
    for (const assetPath of cleanAssetPaths(country)) {
      if (/^https?:\/\//.test(assetPath)) {
        missing.push(`${country.iso2}: remote asset is not allowed (${assetPath})`);
        continue;
      }
      if (!fs.existsSync(path.join(ROOT, 'public', assetPath))) {
        missing.push(`${country.iso2}: missing public/${assetPath}`);
      }
    }
  }
  return missing;
}

function main() {
  const countries = readJson(COUNTRY_JSON);
  const source = readJson(NATURAL_EARTH);
  const countryByIso = new Map(countries.map((country) => [country.iso2, country]));
  const countryByIso3 = new Map(countries.filter((country) => country.iso3).map((country) => [country.iso3, country]));

  const seenIds = new Map();
  const unknownFeatures = [];
  const features = source.features.map((feature, index) => {
    const properties = feature.properties ?? {};
    const iso2 = firstValidIso(properties, countryByIso, countryByIso3);
    const country = countryByIso.get(iso2);
    const baseId = iso2 || `unknown-${properties.NE_ID ?? index}`;
    const seen = seenIds.get(baseId) ?? 0;
    seenIds.set(baseId, seen + 1);
    const mapId = seen === 0 ? baseId : `${baseId}-${seen + 1}`;
    const bbox = bboxForGeometry(feature.geometry);

    if (!iso2 || !country) {
      unknownFeatures.push(properties.ADMIN ?? properties.NAME_EN ?? mapId);
    }

    return {
      type: 'Feature',
      id: mapId,
      bbox,
      properties: {
        mapId,
        iso2,
        iso3: country?.iso3 ?? properties.ADM0_A3 ?? '',
        nameDe: featureName(properties, country),
        nameEn: country?.names?.en ?? properties.NAME_EN ?? properties.ADMIN ?? '',
        drivingSide: country?.drivingSide ?? 'unknown',
        geoguessrCoverage: country?.geoguessrCoverage ?? 'unknown',
        continent: country?.continent ?? properties.CONTINENT ?? 'Unbekannt',
        region: country?.region ?? properties.SUBREGION ?? '',
        currency: primaryCurrency(country),
        labelLng: Number(properties.LABEL_X ?? bbox?.[0] ?? 0),
        labelLat: Number(properties.LABEL_Y ?? bbox?.[1] ?? 0),
        dataStatus: country ? 'ready' : 'unknown',
      },
      geometry: feature.geometry,
    };
  });

  const output = {
    type: 'FeatureCollection',
    generatedAt: new Date().toISOString(),
    features,
  };

  const missingAssets = validateAssets(countries);
  if (missingAssets.length > 0) {
    console.error(`Missing or invalid assets:\n${missingAssets.join('\n')}`);
    process.exit(1);
  }

  if (!VALIDATE_ONLY) {
    fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
    fs.writeFileSync(OUT_FILE, `${JSON.stringify(output)}\n`, 'utf8');
  }

  console.log(
    `${VALIDATE_ONLY ? 'Validated' : 'Wrote'} ${path.relative(ROOT, OUT_FILE)} ` +
      `(${features.length} features, ${unknownFeatures.length} unknown)`
  );
  if (unknownFeatures.length > 0) {
    console.log(`Unknown map features: ${unknownFeatures.slice(0, 12).join(', ')}`);
  }
}

main();
