import 'maplibre-gl/dist/maplibre-gl.css';
import './styles.css';

import { createIcons, icons } from 'lucide';
import maplibregl from 'maplibre-gl';
import type { Feature, FeatureCollection, Geometry } from 'geojson';
import countriesJson from './data/countries.json';
import type { ColorMode, CountryInfo, CountryMapProperties, GeoGuessrCoverage } from './types';

type CountryFeature = Feature<Geometry, CountryMapProperties> & { id: string };
type CountryCollection = FeatureCollection<Geometry, CountryMapProperties> & { generatedAt?: string };

const countries = countriesJson as CountryInfo[];
const countryByIso = new Map(countries.map((country) => [country.iso2, country]));

const colorModes: Array<{ id: ColorMode; label: string; icon: string }> = [
  { id: 'driving', label: 'Verkehr', icon: 'navigation' },
  { id: 'coverage', label: 'Coverage', icon: 'scan-eye' },
  { id: 'continent', label: 'Region', icon: 'map' },
  { id: 'currency', label: 'Währung', icon: 'coins' },
];

const drivingLabels: Record<string, string> = {
  left: 'Linksverkehr',
  right: 'Rechtsverkehr',
  mixed: 'Gemischt',
  unknown: 'Unbekannt',
};

const coverageLabels: Record<GeoGuessrCoverage, string> = {
  official: 'GeoGuessr',
  unofficial: 'Inoffiziell',
  none: 'Keine',
  unknown: 'Unbekannt',
};

const baseColors = {
  hover: '#f8d66d',
  unknown: '#a7b0ba',
  muted: '#d9dee3',
};

const drivingColors = new Map([
  ['right', '#3d9b72'],
  ['left', '#4377c8'],
  ['mixed', '#bf7a30'],
  ['unknown', baseColors.unknown],
]);

const coverageColors = new Map([
  ['official', '#de5d48'],
  ['unofficial', '#7f62c9'],
  ['none', '#b9c0c8'],
  ['unknown', baseColors.unknown],
]);

const continentColors = new Map([
  ['Europa', '#2f80a7'],
  ['Europa/Asien', '#8b6ac8'],
  ['Asien', '#d18432'],
  ['Afrika', '#7d9f3c'],
  ['Nordamerika', '#3c67b1'],
  ['Sudamerika', '#2e9668'],
  ['Südamerika', '#2e9668'],
  ['Ozeanien', '#c29c32'],
  ['Antarktika', '#7b8792'],
  ['Unbekannt', baseColors.unknown],
]);

const fallbackPalette = [
  '#386cb0',
  '#f28e2b',
  '#59a14f',
  '#b07aa1',
  '#e15759',
  '#76b7b2',
  '#edc948',
  '#4e79a7',
  '#9c755f',
  '#bab0ab',
  '#8cd17d',
  '#ff9da7',
];

const currencyPreferredColors = new Map([
  ['EUR', '#2563eb'],
  ['USD', '#15803d'],
  ['GBP', '#b91c1c'],
  ['JPY', '#7e22ce'],
  ['AUD', '#0891b2'],
  ['CAD', '#ea580c'],
  ['BRL', '#65a30d'],
  ['MXN', '#0f766e'],
  ['INR', '#c2410c'],
  ['ZAR', '#374151'],
  ['unknown', baseColors.unknown],
]);

function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function normalizeSearch(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');
}

function assetUrl(assetPath: string): string {
  return `${import.meta.env.BASE_URL}${assetPath.replace(/^\/+/, '')}`;
}

function countryFlag(country: CountryInfo, className = 'flag'): string {
  if (country.assets.flag) {
    return `<img class="${className}" src="${assetUrl(country.assets.flag)}" alt="${escapeHtml(country.names.de)} Flagge" />`;
  }
  return `<span class="${className} emoji-flag">${escapeHtml(country.flagEmoji || country.iso2)}</span>`;
}

function buildMatchExpression(property: string, colors: Map<string, string>) {
  const match: unknown[] = ['match', ['coalesce', ['get', property], 'unknown']];
  for (const [value, color] of colors.entries()) {
    match.push(value, color);
  }
  match.push(baseColors.unknown);

  return [
    'case',
    ['boolean', ['feature-state', 'hover'], false],
    baseColors.hover,
    match,
  ];
}

function paintExpression(expression: unknown[]): never {
  return expression as never;
}

function sortedCounts(values: string[]): Array<[string, number]> {
  const counts = new Map<string, number>();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  return Array.from(counts.entries()).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

class GeoCheatApp {
  private map!: maplibregl.Map;
  private hoveredFeatureId: string | number | null = null;
  private selectedMode: ColorMode = 'driving';
  private readonly featureByIso = new Map<string, CountryFeature>();
  private readonly currencyColors = new Map(currencyPreferredColors);
  private readonly mapContainer: HTMLElement;
  private readonly tooltip: HTMLElement;
  private readonly searchInput: HTMLInputElement;
  private readonly searchResults: HTMLElement;
  private readonly legend: HTMLElement;
  private readonly detailPanel: HTMLElement;
  private readonly detailContent: HTMLElement;
  private readonly detailTitle: HTMLElement;
  private readonly detailSubtitle: HTMLElement;
  private readonly detailFlag: HTMLElement;

  constructor(private readonly geojson: CountryCollection) {
    this.mapContainer = this.mustGet('map');
    this.tooltip = this.mustGet('tooltip');
    this.searchInput = this.mustGet<HTMLInputElement>('search-input');
    this.searchResults = this.mustGet('search-results');
    this.legend = this.mustGet('legend');
    this.detailPanel = this.mustGet('detail-panel');
    this.detailContent = this.mustGet('detail-content');
    this.detailTitle = this.mustGet('detail-title');
    this.detailSubtitle = this.mustGet('detail-subtitle');
    this.detailFlag = this.mustGet('detail-flag');

    this.indexFeatures();
    this.assignCurrencyColors();
    this.createMap();
    this.bindUi();
    this.renderLegend();
  }

  private mustGet<T extends HTMLElement = HTMLElement>(id: string): T {
    const element = document.getElementById(id);
    if (!element) throw new Error(`Missing #${id}`);
    return element as T;
  }

  private indexFeatures(): void {
    for (const feature of this.geojson.features as CountryFeature[]) {
      if (feature.properties.iso2 && !this.featureByIso.has(feature.properties.iso2)) {
        this.featureByIso.set(feature.properties.iso2, feature);
      }
    }
  }

  private assignCurrencyColors(): void {
    const currencies = sortedCounts(countries.map((country) => country.currencies[0]?.code ?? 'unknown'));
    let paletteIndex = 0;
    for (const [currency] of currencies) {
      if (!this.currencyColors.has(currency)) {
        this.currencyColors.set(currency, fallbackPalette[paletteIndex % fallbackPalette.length]);
        paletteIndex += 1;
      }
    }
  }

  private createMap(): void {
    this.map = new maplibregl.Map({
      container: this.mapContainer,
      style: {
        version: 8,
        name: 'GeoCheatMK2',
        sources: {
          countries: {
            type: 'geojson',
            data: this.geojson,
          },
        },
        layers: [
          {
            id: 'ocean',
            type: 'background',
            paint: {
              'background-color': '#d8e7ec',
            },
          },
          {
            id: 'country-fill',
            type: 'fill',
            source: 'countries',
            paint: {
              'fill-color': paintExpression(buildMatchExpression('drivingSide', drivingColors)),
              'fill-opacity': paintExpression([
                'case',
                ['boolean', ['feature-state', 'hover'], false],
                0.96,
                0.86,
              ]),
            },
          },
          {
            id: 'country-outline',
            type: 'line',
            source: 'countries',
            paint: {
              'line-color': '#ffffff',
              'line-width': paintExpression([
                'interpolate',
                ['linear'],
                ['zoom'],
                0,
                0.35,
                3,
                0.7,
                6,
                1.2,
              ]),
              'line-opacity': 0.76,
            },
          },
        ],
      },
      center: [8, 22],
      zoom: 1.18,
      minZoom: 0.75,
      maxZoom: 7,
      renderWorldCopies: false,
      attributionControl: false,
    });

    this.map.addControl(new maplibregl.NavigationControl({ visualizePitch: false }), 'bottom-right');
    this.map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-left');

    this.map.on('load', () => {
      this.bindMapEvents();
      this.map.resize();
    });
  }

  private bindMapEvents(): void {
    this.map.on('mousemove', 'country-fill', (event) => {
      const feature = event.features?.[0] as CountryFeature | undefined;
      if (!feature) return;

      const featureId = feature.id;
      if (this.hoveredFeatureId !== featureId) {
        this.clearHover();
        this.hoveredFeatureId = featureId;
        this.map.setFeatureState({ source: 'countries', id: featureId }, { hover: true });
      }

      this.map.getCanvas().style.cursor = 'pointer';
      this.showTooltip(feature, event.point.x, event.point.y);
    });

    this.map.on('mouseleave', 'country-fill', () => {
      this.clearHover();
      this.map.getCanvas().style.cursor = '';
      this.hideTooltip();
    });

    this.map.on('click', 'country-fill', (event) => {
      const feature = event.features?.[0] as CountryFeature | undefined;
      if (!feature) return;
      this.openCountry(feature.properties.iso2, feature);
    });
  }

  private clearHover(): void {
    if (this.hoveredFeatureId !== null) {
      this.map.setFeatureState({ source: 'countries', id: this.hoveredFeatureId }, { hover: false });
      this.hoveredFeatureId = null;
    }
  }

  private bindUi(): void {
    document.querySelectorAll<HTMLButtonElement>('[data-mode]').forEach((button) => {
      button.addEventListener('click', () => {
        const mode = button.dataset.mode as ColorMode;
        this.setMode(mode);
      });
    });

    this.searchInput.addEventListener('input', () => this.renderSearchResults());
    this.searchInput.addEventListener('focus', () => this.renderSearchResults());
    this.searchResults.addEventListener('mousedown', (event) => {
      const target = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-search-iso]');
      if (!target) return;
      event.preventDefault();
      this.selectSearchResult(target.dataset.searchIso ?? '');
    });

    this.mustGet<HTMLButtonElement>('close-panel').addEventListener('click', () => this.closePanel());
    this.mustGet<HTMLButtonElement>('reset-view').addEventListener('click', () => this.resetView());

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        this.hideSearch();
        this.closePanel();
      }
    });
  }

  private setMode(mode: ColorMode): void {
    this.selectedMode = mode;
    document.querySelectorAll<HTMLButtonElement>('[data-mode]').forEach((button) => {
      const isActive = button.dataset.mode === mode;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-pressed', String(isActive));
    });

    const expressions = {
      driving: buildMatchExpression('drivingSide', drivingColors),
      coverage: buildMatchExpression('geoguessrCoverage', coverageColors),
      continent: buildMatchExpression('continent', continentColors),
      currency: buildMatchExpression('currency', this.currencyColors),
    };

    this.map.setPaintProperty('country-fill', 'fill-color', expressions[mode]);
    this.renderLegend();
  }

  private renderLegend(): void {
    const entries = this.legendEntries();
    this.legend.innerHTML = entries
      .map(
        ([label, color]) =>
          `<span class="legend-item"><span class="legend-swatch" style="--swatch:${escapeHtml(
            color
          )}"></span>${escapeHtml(label)}</span>`
      )
      .join('');
  }

  private legendEntries(): Array<[string, string]> {
    if (this.selectedMode === 'driving') {
      return Array.from(drivingColors.entries()).map(([value, color]) => [drivingLabels[value] ?? value, color]);
    }
    if (this.selectedMode === 'coverage') {
      return Array.from(coverageColors.entries()).map(([value, color]) => [
        coverageLabels[value as GeoGuessrCoverage] ?? value,
        color,
      ]);
    }
    if (this.selectedMode === 'continent') {
      return Array.from(continentColors.entries()).map(([value, color]) => [value, color]);
    }

    return sortedCounts(countries.map((country) => country.currencies[0]?.code ?? 'unknown'))
      .slice(0, 12)
      .map(([currency]) => [currency === 'unknown' ? 'Unbekannt' : currency, this.currencyColors.get(currency) ?? baseColors.unknown]);
  }

  private renderSearchResults(): void {
    const query = normalizeSearch(this.searchInput.value.trim());
    if (query.length === 0) {
      this.hideSearch();
      return;
    }

    const matches = countries
      .map((country) => ({
        country,
        haystack: normalizeSearch(
          [
            country.names.de,
            country.names.en,
            country.iso2,
            country.iso3,
            ...country.tld,
            ...country.callingCodes,
            ...country.currencies.map((currency) => currency.code),
          ].join(' ')
        ),
      }))
      .filter((entry) => entry.haystack.includes(query))
      .slice(0, 9)
      .map(({ country }) => country);

    if (matches.length === 0) {
      this.searchResults.innerHTML = '<div class="search-empty">Keine Treffer</div>';
      this.searchResults.classList.add('is-open');
      return;
    }

    this.searchResults.innerHTML = matches
      .map(
        (country) => `
          <button class="search-result" type="button" data-search-iso="${escapeHtml(country.iso2)}">
            ${countryFlag(country, 'search-flag')}
            <span>
              <strong>${escapeHtml(country.names.de)}</strong>
              <small>${escapeHtml([country.iso2, country.tld[0], country.callingCodes[0]].filter(Boolean).join(' · '))}</small>
            </span>
          </button>
        `
      )
      .join('');
    this.searchResults.classList.add('is-open');
  }

  private selectSearchResult(iso2: string): void {
    const country = countryByIso.get(iso2);
    if (!country) return;
    this.searchInput.value = '';
    this.hideSearch();
    this.openCountry(iso2);
    this.flyToCountry(iso2);
  }

  private hideSearch(): void {
    this.searchResults.classList.remove('is-open');
  }

  private flyToCountry(iso2: string): void {
    const feature = this.featureByIso.get(iso2);
    if (!feature) return;

    if (feature.bbox && feature.bbox.length === 4) {
      const [west, south, east, north] = feature.bbox;
      this.map.fitBounds(
        [
          [west, south],
          [east, north],
        ],
        { padding: 84, maxZoom: 4.8, duration: 700 }
      );
      return;
    }

    this.map.flyTo({
      center: [feature.properties.labelLng, feature.properties.labelLat],
      zoom: Math.max(this.map.getZoom(), 3),
      duration: 700,
    });
  }

  private resetView(): void {
    this.map.flyTo({ center: [8, 22], zoom: 1.18, duration: 700 });
  }

  private showTooltip(feature: CountryFeature, x: number, y: number): void {
    const country = countryByIso.get(feature.properties.iso2);
    const title = country?.names.de ?? feature.properties.nameDe;
    const flag = country ? countryFlag(country, 'tooltip-flag') : '<span class="tooltip-flag emoji-flag">?</span>';
    const tld = country?.tld?.[0] ?? '';
    const currency = country?.currencies?.[0]?.code ?? feature.properties.currency;
    const phone = country?.callingCodes?.[0] ?? '';
    const driving = country?.drivingSide ?? feature.properties.drivingSide;

    this.tooltip.innerHTML = `
      ${flag}
      <span>
        <strong>${escapeHtml(title)}</strong>
        <small>${escapeHtml([drivingLabels[driving] ?? driving, tld, currency, phone].filter(Boolean).join(' · '))}</small>
      </span>
    `;

    const offset = 18;
    const width = this.tooltip.offsetWidth || 220;
    const height = this.tooltip.offsetHeight || 64;
    const left = Math.min(window.innerWidth - width - 12, x + offset);
    const top = Math.min(window.innerHeight - height - 12, y + offset);
    this.tooltip.style.transform = `translate(${Math.max(12, left)}px, ${Math.max(12, top)}px)`;
    this.tooltip.classList.add('is-visible');
  }

  private hideTooltip(): void {
    this.tooltip.classList.remove('is-visible');
  }

  private openCountry(iso2: string, fallbackFeature?: CountryFeature): void {
    const country = countryByIso.get(iso2);
    if (!country) {
      this.openUnknownCountry(fallbackFeature);
      return;
    }

    this.detailFlag.innerHTML = countryFlag(country, 'panel-flag');
    this.detailTitle.textContent = country.names.de;
    this.detailSubtitle.textContent = [country.names.en, country.continent, country.region].filter(Boolean).join(' · ');

    const currencyLabel =
      country.currencies.length > 0
        ? country.currencies.map((currency) => `${currency.code}${currency.symbol ? ` (${currency.symbol})` : ''}`).join(', ')
        : 'Unbekannt';
    const callingLabel = country.callingCodes.length > 0 ? country.callingCodes.slice(0, 8).join(', ') : 'Unbekannt';

    this.detailContent.innerHTML = `
      <div class="info-grid">
        ${this.infoTile('ISO', [country.iso2, country.iso3].filter(Boolean).join(' / '))}
        ${this.infoTile('Domain', country.tld.join(', ') || 'Unbekannt')}
        ${this.infoTile('Verkehr', drivingLabels[country.drivingSide] ?? 'Unbekannt')}
        ${this.infoTile('Coverage', coverageLabels[country.geoguessrCoverage])}
        ${this.infoTile('Hauptstadt', country.capital || 'Unbekannt')}
        ${this.infoTile('Währung', currencyLabel)}
        ${this.infoTile('Vorwahl', callingLabel)}
        ${this.infoTile('Region', [country.continent, country.region].filter(Boolean).join(' · ') || 'Unbekannt')}
      </div>
      ${this.renderPlate(country)}
      ${this.renderNotes(country)}
    `;

    this.detailPanel.classList.add('is-open');
    this.detailPanel.setAttribute('aria-hidden', 'false');
  }

  private openUnknownCountry(feature?: CountryFeature): void {
    const title = feature?.properties.nameDe || 'Unbekannt';
    this.detailFlag.innerHTML = '<span class="panel-flag emoji-flag">?</span>';
    this.detailTitle.textContent = title;
    this.detailSubtitle.textContent = 'Keine kuratierten Daten vorhanden';
    this.detailContent.innerHTML = `
      <div class="info-grid">
        ${this.infoTile('ISO', feature?.properties.iso2 || 'Unbekannt')}
        ${this.infoTile('Region', feature?.properties.region || 'Unbekannt')}
        ${this.infoTile('Status', 'Noch nicht gepflegt')}
      </div>
    `;
    this.detailPanel.classList.add('is-open');
    this.detailPanel.setAttribute('aria-hidden', 'false');
  }

  private closePanel(): void {
    this.detailPanel.classList.remove('is-open');
    this.detailPanel.setAttribute('aria-hidden', 'true');
  }

  private infoTile(label: string, value: string): string {
    return `
      <div class="info-tile">
        <span>${escapeHtml(label)}</span>
        <strong>${escapeHtml(value)}</strong>
      </div>
    `;
  }

  private renderPlate(country: CountryInfo): string {
    if (!country.assets.licensePlate) {
      return `
        <section class="detail-section">
          <h3>Kennzeichen</h3>
          <p class="empty-state">Kein Kennzeichenbild hinterlegt.</p>
        </section>
      `;
    }

    return `
      <section class="detail-section">
        <h3>Kennzeichen</h3>
        <div class="plate-wrap">
          <img src="${assetUrl(country.assets.licensePlate)}" alt="Kennzeichen ${escapeHtml(country.names.de)}" />
        </div>
      </section>
    `;
  }

  private renderNotes(country: CountryInfo): string {
    if (country.notes.length === 0) return '';
    return `
      <section class="detail-section">
        <h3>Notizen</h3>
        <div class="note-list">
          ${country.notes.map((note) => `<p>${escapeHtml(note)}</p>`).join('')}
        </div>
      </section>
    `;
  }
}

async function loadGeoJson(): Promise<CountryCollection> {
  const response = await fetch(`${import.meta.env.BASE_URL}data/countries.geojson`);
  if (!response.ok) {
    throw new Error(`Could not load countries.geojson: ${response.status}`);
  }
  return response.json();
}

function renderShell(): void {
  const app = document.getElementById('app');
  if (!app) throw new Error('Missing #app');

  app.innerHTML = `
    <main class="app-shell">
      <div id="map" class="map-surface" aria-label="Interaktive Weltkarte"></div>

      <header class="topbar">
        <div class="brand">
          <span class="brand-mark">GC</span>
          <span>
            <strong>GeoCheatMK2</strong>
            <small>GeoGuessr Länderkarte</small>
          </span>
        </div>

        <div class="search-box">
          <i data-lucide="search" aria-hidden="true"></i>
          <input id="search-input" type="search" placeholder="Land, ISO, .de, +49" autocomplete="off" />
          <div id="search-results" class="search-results"></div>
        </div>

        <nav class="mode-tabs" aria-label="Farbmodus">
          ${colorModes
            .map(
              (mode, index) => `
                <button class="${index === 0 ? 'is-active' : ''}" type="button" data-mode="${mode.id}" aria-pressed="${
                  index === 0
                }" aria-label="${mode.label}">
                  <i data-lucide="${mode.icon}" aria-hidden="true"></i>
                  <span>${mode.label}</span>
                </button>
              `
            )
            .join('')}
        </nav>

        <button id="reset-view" class="icon-button" type="button" title="Weltansicht" aria-label="Weltansicht">
          <i data-lucide="globe-2" aria-hidden="true"></i>
        </button>
      </header>

      <div id="legend" class="legend"></div>
      <div id="tooltip" class="tooltip" role="status"></div>

      <aside id="detail-panel" class="detail-panel" aria-hidden="true">
        <header class="detail-header">
          <div id="detail-flag" class="detail-flag"></div>
          <div>
            <h2 id="detail-title"></h2>
            <p id="detail-subtitle"></p>
          </div>
          <button id="close-panel" class="icon-button" type="button" title="Schließen" aria-label="Schließen">
            <i data-lucide="x" aria-hidden="true"></i>
          </button>
        </header>
        <div id="detail-content" class="detail-content"></div>
      </aside>
    </main>
  `;

  createIcons({ icons });
}

async function main(): Promise<void> {
  renderShell();
  const geojson = await loadGeoJson();
  new GeoCheatApp(geojson);
}

main().catch((error) => {
  console.error(error);
  const app = document.getElementById('app');
  if (app) {
    app.innerHTML = `<main class="fatal-error"><strong>GeoCheatMK2 konnte nicht geladen werden.</strong><span>${escapeHtml(
      error instanceof Error ? error.message : String(error)
    )}</span></main>`;
  }
});
