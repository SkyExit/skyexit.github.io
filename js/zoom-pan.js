'use strict';

function updateTransform() {
  if (GeoApp.currentZoom < 1) GeoApp.currentZoom = 1;

  const minX = 2000 * (1 - GeoApp.currentZoom);
  const minY = 1000 * (1 - GeoApp.currentZoom);

  if (GeoApp.panX > 0) GeoApp.panX = 0;
  if (GeoApp.panX < minX) GeoApp.panX = minX;
  if (GeoApp.panY > 0) GeoApp.panY = 0;
  if (GeoApp.panY < minY) GeoApp.panY = minY;

  countriesGroup.style.transform = `translate(${GeoApp.panX}px, ${GeoApp.panY}px) scale(${GeoApp.currentZoom})`;
  document.getElementById('graticule').style.transform = `translate(${GeoApp.panX}px, ${GeoApp.panY}px) scale(${GeoApp.currentZoom})`;

  updateLabelsState(GeoApp.currentZoom);
}

window.zoomMap = function(factor) {
  const newZoom = Math.max(1, Math.min(10, GeoApp.currentZoom * factor));
  const cx = 1000, cy = 500;
  GeoApp.panX = cx - (cx - GeoApp.panX) * (newZoom / GeoApp.currentZoom);
  GeoApp.panY = cy - (cy - GeoApp.panY) * (newZoom / GeoApp.currentZoom);
  GeoApp.currentZoom = newZoom;
  updateTransform();
};

window.resetZoom = function() {
  GeoApp.currentZoom = 1;
  GeoApp.panX = 0;
  GeoApp.panY = 0;
  updateTransform();
};

// ── Mausrad-Zoom ──
mapContainer.addEventListener('wheel', (e) => {
  e.preventDefault();
  mapContainer.classList.add('is-dragging');
  clearTimeout(GeoApp.zoomTimeout);
  GeoApp.zoomTimeout = setTimeout(() => mapContainer.classList.remove('is-dragging'), 150);

  const factor = e.deltaY < 0 ? 1.12 : 0.89;
  const rect = svg.getBoundingClientRect();
  const svgX = (e.clientX - rect.left) / rect.width * 2000;
  const svgY = (e.clientY - rect.top)  / rect.height * 1000;
  const newZoom = Math.max(1.0, Math.min(10, GeoApp.currentZoom * factor));
  GeoApp.panX = svgX - (svgX - GeoApp.panX) * (newZoom / GeoApp.currentZoom);
  GeoApp.panY = svgY - (svgY - GeoApp.panY) * (newZoom / GeoApp.currentZoom);
  GeoApp.currentZoom = newZoom;
  updateTransform();
}, { passive: false });

// ── Maus-Pan ──
mapContainer.addEventListener('mousedown', (e) => {
  GeoApp.isDragging  = true;
  GeoApp.dragStartX  = e.clientX;
  GeoApp.dragStartY  = e.clientY;
  GeoApp.panStartX   = GeoApp.panX;
  GeoApp.panStartY   = GeoApp.panY;
});

window.addEventListener('mousemove', (e) => {
  if (!GeoApp.isDragging) return;
  mapContainer.classList.add('is-dragging');
  const rect = svg.getBoundingClientRect();
  const dx = (e.clientX - GeoApp.dragStartX) / rect.width  * 2000;
  const dy = (e.clientY - GeoApp.dragStartY) / rect.height * 1000;
  GeoApp.panX = GeoApp.panStartX + dx;
  GeoApp.panY = GeoApp.panStartY + dy;
  updateTransform();
});

window.addEventListener('mouseup', () => {
  GeoApp.isDragging = false;
  mapContainer.classList.remove('is-dragging');
});

// ── Touch-Support ──
mapContainer.addEventListener('touchstart', (e) => {
  if (e.touches.length === 1) {
    GeoApp.isDragging = true;
    mapContainer.classList.remove('is-dragging');
    GeoApp.dragStartX = e.touches[0].clientX;
    GeoApp.dragStartY = e.touches[0].clientY;
    GeoApp.panStartX  = GeoApp.panX;
    GeoApp.panStartY  = GeoApp.panY;
  } else if (e.touches.length === 2) {
    GeoApp.lastTouchDist = Math.hypot(
      e.touches[0].clientX - e.touches[1].clientX,
      e.touches[0].clientY - e.touches[1].clientY
    );
  }
}, { passive: true });

mapContainer.addEventListener('touchmove', (e) => {
  if (e.touches.length === 1 && GeoApp.isDragging) {
    mapContainer.classList.add('is-dragging');
    const rect = svg.getBoundingClientRect();
    const dx = (e.touches[0].clientX - GeoApp.dragStartX) / rect.width  * 2000;
    const dy = (e.touches[0].clientY - GeoApp.dragStartY) / rect.height * 1000;
    GeoApp.panX = GeoApp.panStartX + dx;
    GeoApp.panY = GeoApp.panStartY + dy;
    updateTransform();
  } else if (e.touches.length === 2) {
    mapContainer.classList.add('is-dragging');
    const dist = Math.hypot(
      e.touches[0].clientX - e.touches[1].clientX,
      e.touches[0].clientY - e.touches[1].clientY
    );
    if (GeoApp.lastTouchDist > 0) {
      const factor = dist / GeoApp.lastTouchDist;
      GeoApp.currentZoom = Math.max(1.0, Math.min(10, GeoApp.currentZoom * factor));
      updateTransform();
    }
    GeoApp.lastTouchDist = dist;
  }
}, { passive: true });

mapContainer.addEventListener('touchend', () => {
  GeoApp.isDragging    = false;
  GeoApp.lastTouchDist = 0;
  mapContainer.classList.remove('is-dragging');
});
