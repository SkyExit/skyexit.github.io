'use strict';

window.toggleDriving = function() {
  GeoApp.drivingMode = !GeoApp.drivingMode;
  document.getElementById('driving-toggle').classList.toggle('active', GeoApp.drivingMode);
  document.getElementById('legend').classList.toggle('visible', GeoApp.drivingMode);
  mapContainer.classList.toggle('driving-mode', GeoApp.drivingMode);
};
