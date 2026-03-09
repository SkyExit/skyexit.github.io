(function() {
  'use strict';

  // ── State ──
  let drivingMode = false;
  let currentZoom = 1;
  let panX = 0, panY = 0;
  let isDragging = false;
  let dragStartX, dragStartY, panStartX, panStartY;
  let currentCountry = null;

  const mapContainer = document.getElementById('map-container');
  const svg = document.getElementById('world-map');
  const countriesGroup = document.getElementById('countries-group');
  const tooltip = document.getElementById('tooltip');
  const overlay = document.getElementById('overlay');
  const searchInput = document.getElementById('search-input');
  const searchResults = document.getElementById('search-results');

  // ── Build Graticule ──
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

  // ── Build Map ──
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

  // ── Coverage Labels ──
  const coveredCountries = [
    "AL", "AD", "AR", "AU", "AT", "BD", "BE", "BT", "BO", "BW", "BR", "BG", "KH", "CA", "CL", 
    "CO", "CR", "HR", "CZ", "DK", "DO", "EC", "EE", "SZ", "FI", "FR", "DE", "GH", "GR", "GT", 
    "HU", "IS", "IN", "ID", "IE", "IL", "IT", "JP", "JO", "KE", "KG", "LA", "LV", "LS", "LT", 
    "LU", "MK", "MG", "MY", "MT", "MX", "MN", "ME", "NL", "NZ", "NG", "NO", "PA", "PE", "PH", 
    "PL", "PT", "PR", "RO", "RW", "SN", "RS", "SG", "SK", "SI", "ZA", "KR", "ES", "LK", "SE", 
    "CH", "TW", "TH", "TR", "UG", "UA", "AE", "GB", "US", "UY"
  ];

  function buildCoverageLabels() {
    const labelsGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    labelsGroup.setAttribute('id', 'coverage-labels');
    countriesGroup.appendChild(labelsGroup);

    coveredCountries.forEach(iso => {
      const path = document.getElementById(iso.toLowerCase()) || document.getElementById(iso.toUpperCase());
      if (path) {
        path.classList.add('has-coverage');
        const bbox = path.getBBox();
        const centerX = bbox.x + bbox.width / 2;
        const centerY = bbox.y + bbox.height / 2;

        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', centerX);
        text.setAttribute('y', centerY);
        text.setAttribute('class', 'country-label');
        text.dataset.iso = iso.toUpperCase();
        
        const info = (typeof COUNTRIES !== 'undefined') ? COUNTRIES[iso.toUpperCase()] || COUNTRIES[iso.toLowerCase()] : null;
        text.dataset.name = info ? (info.name || iso) : iso;

        text.textContent = text.dataset.iso;
        labelsGroup.appendChild(text);
      }
    });

    updateLabelsState(currentZoom);
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

  // ── Tooltip ──
  function showTooltip(iso, e) {
    if (typeof COUNTRIES === 'undefined') return;
    const info = COUNTRIES[iso];
    if (!info) return;
    currentCountry = iso;

    const flagEl = document.getElementById('tooltip-flag');
    if (info.flag_image) {
      flagEl.innerHTML = `<img src="${info.flag_image}" alt="${info.name}">`;
    } else {
      flagEl.textContent = info.flag || '';
    }

    document.getElementById('tooltip-name').textContent = info.name || iso;
    document.getElementById('tooltip-tld').textContent = info.tld || '';

    const drivingText = info.driving === 'left' ? 'Linksverkehr' : 'Rechtsverkehr';
    const sideClass = info.driving === 'left' ? 'left' : 'right';
    document.getElementById('tooltip-driving').innerHTML =
      `<span class="side-icon ${sideClass}"></span>${drivingText}`;

    moveTooltip(e);
    tooltip.classList.add('show');
  }

  function moveTooltip(e) {
    const x = e.clientX + 16;
    const y = e.clientY - 10;
    const tw = tooltip.offsetWidth;
    const th = tooltip.offsetHeight;
    const finalX = (x + tw > window.innerWidth - 10) ? e.clientX - tw - 16 : x;
    const finalY = (y + th > window.innerHeight - 10) ? e.clientY - th - 10 : y;
    tooltip.style.left = finalX + 'px';
    tooltip.style.top = finalY + 'px';
  }

  function hideTooltip() {
    tooltip.classList.remove('show');
    currentCountry = null;
  }

  // ── Info Panel ──
  function openPanel(iso) {
    if (typeof COUNTRIES === 'undefined') return;
    const info = COUNTRIES[iso];
    if (!info) return;

    const flagEl = document.getElementById('panel-flag');
    if (info.flag_image) {
      flagEl.innerHTML = `<img src="${info.flag_image}" alt="${info.name}">`;
    } else {
      flagEl.textContent = info.flag || '';
    }

    document.getElementById('panel-title').textContent = info.name || iso;
    document.getElementById('panel-subtitle').textContent = (info.name_en || '') + (info.continent ? ' — ' + info.continent : '');

    let html = '<div class="info-grid">';
    html += `<div class="info-card"><div class="info-label">Webseitenendung</div><div class="info-value accent">${info.tld || '—'}</div></div>`;
    html += `<div class="info-card"><div class="info-label">Hauptstadt</div><div class="info-value">${info.capital || '—'}</div></div>`;

    const drivingLabel = info.driving === 'left' ? 'Linksverkehr' : 'Rechtsverkehr';
    const drivingClass = info.driving === 'left' ? 'left' : 'right';
    const drivingIcon = info.driving === 'left'
      ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="M12 5l-7 7 7 7"/></svg>'
      : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg>';
    html += `<div class="info-card"><div class="info-label">Verkehrsseite</div><div class="info-value"><span class="driving-badge ${drivingClass}">${drivingIcon} ${drivingLabel}</span></div></div>`;
    html += `<div class="info-card"><div class="info-label">ISO-Code</div><div class="info-value">${iso}</div></div></div>`;

    if (info.plate_image) {
      html += '<div class="panel-section-title">Kennzeichen</div>';
      html += `<div class="panel-plate-wrap"><img src="${info.plate_image}" alt="Kennzeichen ${info.name}"></div>`;
    }
    if (info.road_sign_image) {
      html += '<div class="panel-section-title">Straßenschilder</div>';
      html += `<div class="panel-images"><div class="panel-img-wrap"><img src="${info.road_sign_image}" alt="Straßenschilder ${info.name}"><div class="panel-img-caption">Straßenschilder — ${info.name}</div></div></div>`;
    }
    if (info.custom_images && info.custom_images.length > 0) {
      html += '<div class="panel-section-title">Bilder</div><div class="panel-images">';
      for (const img of info.custom_images) {
        html += `<div class="panel-img-wrap"><img src="${img.src}" alt="${img.caption || ''}"><div class="panel-img-caption">${img.caption || ''}</div></div>`;
      }
      html += '</div>';
    }
    if (info.additional_info) {
      html += '<div class="panel-section-title">Weitere Informationen</div>';
      html += `<div class="panel-additional">${info.additional_info}</div>`;
    }

    document.getElementById('panel-body').innerHTML = html;
    overlay.classList.add('open');
    document.getElementById('info-panel').scrollTop = 0;
  }

  function closePanel(e, force) {
    if (force || e.target === overlay) overlay.classList.remove('open');
  }
  window.closePanel = closePanel;

  // ── Driving Mode Toggle ──
  window.toggleDriving = function() {
    drivingMode = !drivingMode;
    document.getElementById('driving-toggle').classList.toggle('active', drivingMode);
    document.getElementById('legend').classList.toggle('visible', drivingMode);
    mapContainer.classList.toggle('driving-mode', drivingMode);
  };

  // ── Zoom & Pan ──
  let frameRequested = false;

  function updateTransform() {
    if (currentZoom < 1) currentZoom = 1;

    const minX = 2000 * (1 - currentZoom);
    const minY = 1000 * (1 - currentZoom);

    if (panX > 0) panX = 0;
    if (panX < minX) panX = minX;
    
    if (panY > 0) panY = 0;
    if (panY < minY) panY = minY;

    countriesGroup.style.transform = `translate(${panX}px, ${panY}px) scale(${currentZoom})`;
    document.getElementById('graticule').style.transform = `translate(${panX}px, ${panY}px) scale(${currentZoom})`;
    
    // Labels gegen-skalieren
    updateLabelsState(currentZoom);

    frameRequested = false;
  }

  window.zoomMap = function(factor) {
    const newZoom = Math.max(1, Math.min(10, currentZoom * factor));
    const cx = 1000, cy = 500;
    panX = cx - (cx - panX) * (newZoom / currentZoom);
    panY = cy - (cy - panY) * (newZoom / currentZoom);
    currentZoom = newZoom;
    updateTransform();
  };

  window.resetZoom = function() {
    currentZoom = 1; panX = 0; panY = 0;
    updateTransform();
  };

  let zoomTimeout;
  mapContainer.addEventListener('wheel', (e) => {
    e.preventDefault();
    mapContainer.classList.add('is-dragging');
    clearTimeout(zoomTimeout);
    zoomTimeout = setTimeout(() => mapContainer.classList.remove('is-dragging'), 150);

    const factor = e.deltaY < 0 ? 1.12 : 0.89;
    const rect = svg.getBoundingClientRect();
    const svgX = (e.clientX - rect.left) / rect.width * 2000;
    const svgY = (e.clientY - rect.top) / rect.height * 1000;
    const newZoom = Math.max(1.0, Math.min(10, currentZoom * factor));
    panX = svgX - (svgX - panX) * (newZoom / currentZoom);
    panY = svgY - (svgY - panY) * (newZoom / currentZoom);
    currentZoom = newZoom;
    updateTransform();
  }, {passive: false});

  mapContainer.addEventListener('mousedown', (e) => {
    isDragging = true;
    dragStartX = e.clientX; dragStartY = e.clientY;
    panStartX = panX; panStartY = panY;
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    mapContainer.classList.add('is-dragging'); 
    const rect = svg.getBoundingClientRect();
    const dx = (e.clientX - dragStartX) / rect.width * 2000;
    const dy = (e.clientY - dragStartY) / rect.height * 1000;
    panX = panStartX + dx; panY = panStartY + dy;
    updateTransform();
  });

  window.addEventListener('mouseup', () => { 
    isDragging = false; 
    mapContainer.classList.remove('is-dragging'); 
  });

  // Touch support
  let lastTouchDist = 0;
  mapContainer.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      isDragging = true;
      mapContainer.classList.remove('is-dragging');
      dragStartX = e.touches[0].clientX; dragStartY = e.touches[0].clientY;
      panStartX = panX; panStartY = panY;
    } else if (e.touches.length === 2) {
      lastTouchDist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
    }
  }, {passive: true});

  mapContainer.addEventListener('touchmove', (e) => {
    if (e.touches.length === 1 && isDragging) {
      mapContainer.classList.add('is-dragging');
      const rect = svg.getBoundingClientRect();
      const dx = (e.touches[0].clientX - dragStartX) / rect.width * 2000;
      const dy = (e.touches[0].clientY - dragStartY) / rect.height * 1000;
      panX = panStartX + dx; panY = panStartY + dy;
      updateTransform();
    } else if (e.touches.length === 2) {
      mapContainer.classList.add('is-dragging');
      const dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
      if (lastTouchDist > 0) {
        const factor = dist / lastTouchDist;
        currentZoom = Math.max(1.0, Math.min(10, currentZoom * factor));
        updateTransform();
      }
      lastTouchDist = dist;
    }
  }, {passive: true});

  mapContainer.addEventListener('touchend', () => { 
    isDragging = false; lastTouchDist = 0; 
    mapContainer.classList.remove('is-dragging');
  });

  // ── Search ──
  searchInput.addEventListener('input', () => {
    const q = searchInput.value.trim().toLowerCase();
    if (q.length < 1) { searchResults.classList.remove('open'); return; }
    if (typeof COUNTRIES === 'undefined') return;

    const matches = [];
    for (const [iso, info] of Object.entries(COUNTRIES)) {
      const searchStr = `${info.name} ${info.name_en} ${info.tld} ${iso}`.toLowerCase();
      if (searchStr.includes(q)) matches.push({iso, info});
    }
    if (matches.length === 0) { searchResults.classList.remove('open'); return; }
    
    let html = '';
    for (const m of matches.slice(0, 8)) {
      html += `<div class="search-result-item" onclick="searchSelect('${m.iso}')">
        <span class="sr-flag">${m.info.flag || ''}</span>
        <span class="sr-name">${m.info.name}</span>
        <span class="sr-tld">${m.info.tld}</span>
      </div>`;
    }
    searchResults.innerHTML = html;
    searchResults.classList.add('open');
  });

  searchInput.addEventListener('blur', () => { setTimeout(() => searchResults.classList.remove('open'), 200); });

  window.searchSelect = function(iso) {
    searchInput.value = ''; searchResults.classList.remove('open');
    openPanel(iso);
    const el = document.getElementById(iso);
    if (el) { el.style.fill = 'var(--accent)'; setTimeout(() => { el.style.fill = ''; }, 800); }
  };

  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') overlay.classList.remove('open'); });

  // ── Init ──
  buildGraticule();
  buildMap();
  buildCoverageLabels(); // Ruft unsere neue Label-Logik auf
})();