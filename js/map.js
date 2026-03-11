'use strict';

// ── LOD-Konfiguration ──────────────────────────────────────────────────────────
// Jede Stufe ist unterhalb des angegebenen Zoom-Werts aktiv.
const LOD_CONFIG = [
  { maxZoom: 2.5,      varName: 'MAP_PATHS_LOD0' },  // Übersicht  (~17 km)
  { maxZoom: 5.0,      varName: 'MAP_PATHS_LOD1' },  // Regional   (~ 3 km)
  { maxZoom: 8.0,      varName: 'MAP_PATHS_LOD2' },  // Länder     (~780 m)
  { maxZoom: Infinity, varName: 'MAP_PATHS_LOD3' },  // Detail     (~220 m)
];

// LOD2 + LOD3 werden per <script async> in index.html im Hintergrund geladen.
// Kein dynamisches Nachladen nötig.
let _activeLod = -1;

function _getLodIndex(zoom) {
  for (let i = 0; i < LOD_CONFIG.length; i++) {
    if (zoom <= LOD_CONFIG[i].maxZoom) return i;
  }
  return LOD_CONFIG.length - 1;
}

function _getLodData(index) {
  // window[name] funktioniert nur für var-Deklarationen, nicht für const/let.
  // Daher direkter Zugriff per Variablenname.
  switch (LOD_CONFIG[index]?.varName) {
    case 'MAP_PATHS_LOD0': return typeof MAP_PATHS_LOD0 !== 'undefined' ? MAP_PATHS_LOD0 : null;
    case 'MAP_PATHS_LOD1': return typeof MAP_PATHS_LOD1 !== 'undefined' ? MAP_PATHS_LOD1 : null;
    case 'MAP_PATHS_LOD2': return typeof MAP_PATHS_LOD2 !== 'undefined' ? MAP_PATHS_LOD2 : null;
    case 'MAP_PATHS_LOD3': return typeof MAP_PATHS_LOD3 !== 'undefined' ? MAP_PATHS_LOD3 : null;
    default: return null;
  }
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
  // Bug-Fix: _activeLod korrekt auf die tatsächlich geladene Stufe setzen
  let mapData = null;
  for (let i = 0; i < LOD_CONFIG.length; i++) {
    mapData = _getLodData(i);
    if (mapData) { _activeLod = i; break; }
  }
  if (!mapData && typeof MAP_PATHS !== 'undefined') {
    mapData = MAP_PATHS;
    _activeLod = -1; // Fallback-Daten, kein automatisches LOD-Switching
  }
  if (!mapData) {
    console.error('Keine Kartendaten gefunden. Führe generate_maps.py aus oder stelle map-paths.js bereit.');
    return;
  }

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
function updateLod(zoom) {
  const target = _getLodIndex(zoom);
  if (target === _activeLod) return;
  // Nächstbeste verfügbare Stufe verwenden (LOD2/3 laden ggf. noch asynchron)
  for (let i = target; i >= 0; i--) {
    const data = _getLodData(i);
    if (data) { _applyLod(i); return; }
  }
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
  _cullingTimer = setTimeout(updateViewportCulling, 150);
}

function updateViewportCulling() {
  if (typeof MAP_BOUNDS === 'undefined') return;

  // Bei vollständiger Übersicht alle Länder einblenden — kein Culling nötig.
  // Schwelle bei 3.0: darunter ist die Welt fast vollständig sichtbar und
  // Länder mit Übersee-Territorien (z.B. FR) haben riesige Bounding-Boxes.
  if (GeoApp.currentZoom < 3.0) {
    document.querySelectorAll('.country').forEach(el => { el.style.display = ''; });
    return;
  }

  const z  = GeoApp.currentZoom;
  const px = GeoApp.panX;
  const py = GeoApp.panY;

  // Puffer in SVG-ViewBox-Einheiten (0–2000 × 0–1000).
  // 400 H / 200 V entspricht ~20 % der Bildschirmbreite/-höhe — unabhängig vom Zoom.
  const vL = -400, vR = 2400, vT = -200, vB = 1200;

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
