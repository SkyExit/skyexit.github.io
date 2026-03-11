'use strict';

buildGraticule();
buildMap();
buildCoverageLabels();

// Sobald alle async-Ressourcen (LOD2/LOD3) geladen sind, LOD aktualisieren
window.addEventListener('load', () => updateLod(GeoApp.currentZoom));
