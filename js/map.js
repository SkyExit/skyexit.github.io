'use strict';

function buildGraticule() {
  const g = document.getElementById('graticule');
  let d = '';
  for (let lon = -180; lon <= 180; lon += 30) {
    const x = (lon + 180) * (2000 / 360);
    d += `M${x},0 L${x},1000 `;
  }
  for (let lat = -90; lat <= 90; lat += 30) {
    const y = (90 - lat) * (1000 / 180);
    d += `M0,${y} L2000,${y} `;
  }
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', d);
  path.classList.add('graticule');
  g.appendChild(path);
}

function buildMap() {
  if (typeof MAP_PATHS === 'undefined') {
    console.error('MAP_PATHS not loaded. Make sure data/map-paths.js is present.');
    return;
  }
  for (const [iso, pathD] of Object.entries(MAP_PATHS)) {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', pathD);
    path.setAttribute('id', iso);
    path.classList.add('country');

    const info = (typeof COUNTRIES !== 'undefined') ? COUNTRIES[iso] : null;
    if (info) {
      path.dataset.driving = info.driving || 'right';
    }
    path.addEventListener('mouseenter', (e) => showTooltip(iso, e));
    path.addEventListener('mousemove', (e) => moveTooltip(e));
    path.addEventListener('mouseleave', hideTooltip);
    path.addEventListener('click', (e) => { e.stopPropagation(); openPanel(iso); });
    countriesGroup.appendChild(path);
  }
}
