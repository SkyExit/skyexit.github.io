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
// Bereits statisch geladen? Dann kein erneutes Lazy-Loading nötig.
let _lod2Loading = typeof MAP_PATHS_LOD2 !== 'undefined';
let _lod3Loading = typeof MAP_PATHS_LOD3 !== 'undefined';

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
function _lazyLoad(src, lodIndex) {
  const s = document.createElement('script');
  s.src = src;
  s.onload = () => {
    // Nach dem Laden sofort anwenden, falls diese Stufe jetzt gebraucht wird
    updateLod(GeoApp.currentZoom);
  };
  s.onerror = () => {
    // Datei nicht gefunden → zukünftige Versuche sollen auf das nächstbeste LOD fallen
    console.info(`LOD${lodIndex} (${src}) nicht gefunden – bleibe bei bestem verfügbaren LOD`);
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

  // Bug-Fix: nicht still scheitern — nächstbeste verfügbare Stufe verwenden
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

  // Bei vollständiger Übersicht alle Länder einblenden — kein Culling nötig
  if (GeoApp.currentZoom < 1.8) {
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
