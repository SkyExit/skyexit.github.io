'use strict';

// ── LOD-Konfiguration ──────────────────────────────────────────────────────────
// Jede Stufe ist unterhalb des angegebenen Zoom-Werts aktiv.
const LOD_CONFIG = [
  { maxZoom: 2.5,      varName: 'MAP_PATHS_LOD0' },  // Übersicht  (~17 km)
  { maxZoom: 5.0,      varName: 'MAP_PATHS_LOD1' },  // Regional   (~ 3 km)
  { maxZoom: 8.0,      varName: 'MAP_PATHS_LOD2' },  // Länder     (~780 m)
  { maxZoom: Infinity, varName: 'MAP_PATHS_LOD3' },  // Detail     (~220 m)
];

// Ab diesen Schwellen werden die höheren LOD-Stufen im Hintergrund vorgeladen
const LOD2_PRELOAD_ZOOM = 3.5;
const LOD3_PRELOAD_ZOOM = 6.5;

let _activeLod   = -1;
let _lod2Loading = false;
let _lod3Loading = false;

function _getLodIndex(zoom) {
  for (let i = 0; i < LOD_CONFIG.length; i++) {
    if (zoom <= LOD_CONFIG[i].maxZoom) return i;
  }
  return LOD_CONFIG.length - 1;
}

function _getLodData(index) {
  const name = LOD_CONFIG[index]?.varName;
  return name && typeof window[name] !== 'undefined' ? window[name] : null;
}

// Startreihenfolge: LOD0 → LOD1 → Original MAP_PATHS (Fallback)
function _getStartData() {
  return _getLodData(0)
      || _getLodData(1)
      || (typeof MAP_PATHS !== 'undefined' ? MAP_PATHS : null);
}

// ── Gradnetz (Robinson-Projektion) ────────────────────────────────────────────
function buildGraticule() {
  const g = document.getElementById('graticule');
  let d = '';

  // Meridiane — in Robinson kurvenförmig, daher in Schritten aufgebaut
  for (let lon = -180; lon <= 180; lon += 30) {
    let seg = '';
    for (let lat = -90; lat <= 90; lat += 3) {
      const p = robinsonToSVG(lon, lat);
      seg += lat === -90
        ? `M${p.x.toFixed(1)},${p.y.toFixed(1)}`
        : `L${p.x.toFixed(1)},${p.y.toFixed(1)}`;
    }
    d += seg + ' ';
  }

  // Breitengrade
  for (let lat = -90; lat <= 90; lat += 30) {
    let seg = '';
    for (let lon = -180; lon <= 180; lon += 3) {
      const p = robinsonToSVG(lon, lat);
      seg += lon === -180
        ? `M${p.x.toFixed(1)},${p.y.toFixed(1)}`
        : `L${p.x.toFixed(1)},${p.y.toFixed(1)}`;
    }
    d += seg + ' ';
  }

  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', d);
  path.classList.add('graticule');
  g.appendChild(path);
}

// ── Karte aufbauen ────────────────────────────────────────────────────────────
function buildMap() {
  const mapData = _getStartData();
  if (!mapData) {
    console.error('Keine Kartendaten gefunden. Führe generate_maps.py aus oder stelle map-paths.js bereit.');
    return;
  }

  _activeLod = 0;

  for (const [iso, pathD] of Object.entries(mapData)) {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', pathD);
    path.setAttribute('id', iso);
    path.classList.add('country');

    const info = (typeof COUNTRIES !== 'undefined') ? COUNTRIES[iso] : null;
    if (info) path.dataset.driving = info.driving || 'right';

    path.addEventListener('mouseenter', (e) => showTooltip(iso, e));
    path.addEventListener('mousemove',  (e) => moveTooltip(e));
    path.addEventListener('mouseleave', hideTooltip);
    path.addEventListener('click', (e) => { e.stopPropagation(); openPanel(iso); });
    countriesGroup.appendChild(path);
  }
}

// ── LOD-Umschalten ────────────────────────────────────────────────────────────
function _lazyLoad(src, lodIndex) {
  const s = document.createElement('script');
  s.src = src;
  s.onload = () => {
    if (_getLodIndex(GeoApp.currentZoom) === lodIndex) _applyLod(lodIndex);
  };
  document.head.appendChild(s);
}

function updateLod(zoom) {
  // Höhere LOD-Stufen vorsorglich im Hintergrund laden
  if (zoom >= LOD2_PRELOAD_ZOOM && !_lod2Loading) {
    _lod2Loading = true;
    _lazyLoad('data/map-paths-lod2.js', 2);
  }
  if (zoom >= LOD3_PRELOAD_ZOOM && !_lod3Loading) {
    _lod3Loading = true;
    _lazyLoad('data/map-paths-lod3.js', 3);
  }

  const target = _getLodIndex(zoom);
  if (target === _activeLod) return;

  const data = _getLodData(target);
  if (!data) return;   // Noch nicht geladen — wird per onload nachgeholt

  _applyLod(target);
}

function _applyLod(index) {
  const data = _getLodData(index);
  if (!data) return;
  _activeLod = index;
  for (const [iso, pathD] of Object.entries(data)) {
    const el = document.getElementById(iso);
    if (el) el.setAttribute('d', pathD);
  }
}

// ── Viewport-Culling ──────────────────────────────────────────────────────────
let _cullingTimer = null;

function scheduleViewportCulling() {
  clearTimeout(_cullingTimer);
  _cullingTimer = setTimeout(updateViewportCulling, 80);
}

function updateViewportCulling() {
  if (typeof MAP_BOUNDS === 'undefined') return;

  // Bei vollständiger Übersicht alle Länder einblenden — kein Culling nötig
  if (GeoApp.currentZoom < 1.8) {
    document.querySelectorAll('.country').forEach(el => { el.style.display = ''; });
    return;
  }

  const z  = GeoApp.currentZoom;
  const px = GeoApp.panX;
  const py = GeoApp.panY;

  // 5 % Puffer an allen Seiten verhindert Flackern beim Scrollen
  const vL = -100, vR = 2100, vT = -100, vB = 1100;

  for (const [iso, b] of Object.entries(MAP_BOUNDS)) {
    const el = document.getElementById(iso);
    if (!el) continue;
    const l  = px + b.x * z;
    const r  = px + (b.x + b.w) * z;
    const t  = py + b.y * z;
    const bo = py + (b.y + b.h) * z;
    el.style.display = (r > vL && l < vR && bo > vT && t < vB) ? '' : 'none';
  }
}
