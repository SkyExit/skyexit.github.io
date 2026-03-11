'use strict';

const coveredCountries = [
  // Ursprüngliche Liste
  "AL", "AD", "AR", "AU", "AT", "BD", "BE", "BT", "BO", "BW", "BR", "BG", "KH", "CA", "CL",
  "CO", "CR", "HR", "CZ", "DK", "DO", "EC", "EE", "SZ", "FI", "FR", "DE", "GH", "GR", "GT",
  "HU", "IS", "IN", "ID", "IE", "IL", "IT", "JP", "JO", "KE", "KG", "LA", "LV", "LS", "LT",
  "LU", "MK", "MG", "MY", "MT", "MX", "MN", "ME", "NL", "NZ", "NG", "NO", "PA", "PE", "PH",
  "PL", "PT", "PR", "RO", "RW", "SN", "RS", "SG", "SK", "SI", "ZA", "KR", "ES", "LK", "SE",
  "CH", "TW", "TH", "TR", "UG", "UA", "AE", "GB", "US", "UY",
  // Neue (vorher fehlende) Länder:
  "BA", "XK", "MD", "VN", "RU", "KZ", "NP", "OM", "QA", "PS", "PY", "LB"
];

// Berechnet Bounding-Box aus einem SVG-Pfad-String ohne DOM-Zugriff (kein getBBox).
function _pathBbox(d) {
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  const re = /[ML]([\d.]+),([\d.]+)/g;
  let m;
  while ((m = re.exec(d)) !== null) {
    const x = parseFloat(m[1]), y = parseFloat(m[2]);
    if (x < minX) minX = x; if (x > maxX) maxX = x;
    if (y < minY) minY = y; if (y > maxY) maxY = y;
  }
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

// Algorithmus zur Findung des Festland-Zentrums
function getCountryCenter(path, iso) {
  // Manuelle Offsets für Länder mit ungünstigem geometrischen Schwerpunkt (SVG-Koordinaten)
  const offsets = {
    "HR": { dx: -6, dy: 8 },  // Kroatien wg. Bumerang-Form
    "VN": { dx: 3,  dy: 0 },
    "CL": { dx: 8,  dy: 0 },
    "US": { dx: 15, dy: 15 },
    "RU": { dx: -30, dy: 0 }  // Russland: europäischen und asiatischen Teil ausbalancieren
  };

  const d = path.getAttribute('d');
  const subpaths = d.match(/[Mm][^Mm]+/g);

  let bbox;
  if (!subpaths || subpaths.length === 1) {
    bbox = _pathBbox(d);
  } else {
    // Subpfad mit der größten Bounding-Box-Fläche (≈ Festland) wählen
    let bestArea = -1;
    for (const sub of subpaths) {
      const b = _pathBbox(sub);
      const area = b.width * b.height;
      if (area > bestArea) { bestArea = area; bbox = b; }
    }
  }

  let centerX = bbox.x + bbox.width  / 2;
  let centerY = bbox.y + bbox.height / 2;
  if (offsets[iso]) { centerX += offsets[iso].dx; centerY += offsets[iso].dy; }
  return { x: centerX, y: centerY };
}

function buildCoverageLabels() {
  const labelsGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  labelsGroup.setAttribute('id', 'coverage-labels');
  countriesGroup.appendChild(labelsGroup);

  coveredCountries.forEach(iso => {
    const path = document.getElementById(iso.toLowerCase()) || document.getElementById(iso.toUpperCase());
    if (!path) return;

    path.classList.add('has-coverage');

    const isoUpper = iso.toUpperCase();
    const center = getCountryCenter(path, isoUpper);

    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', center.x);
    text.setAttribute('y', center.y);
    text.setAttribute('class', 'country-label');
    text.dataset.iso = isoUpper;

    const info = (typeof COUNTRIES !== 'undefined') ? COUNTRIES[isoUpper] || COUNTRIES[iso.toLowerCase()] : null;
    text.dataset.name = info ? (info.name || isoUpper) : isoUpper;
    text.textContent = isoUpper;

    labelsGroup.appendChild(text);
  });

  updateLabelsState(GeoApp.currentZoom);
}

function updateLabelsState(zoom) {
  const labels = document.querySelectorAll('.country-label');
  const zoomThreshold = 3.5;

  labels.forEach(label => {
    if (zoom >= zoomThreshold) {
      label.textContent = label.dataset.name;
      label.style.fontSize = (10 / zoom) + 'px';
    } else {
      label.textContent = label.dataset.iso;
      label.style.fontSize = (18 / zoom) + 'px';
    }
  });
}
