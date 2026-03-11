'use strict';

// Gemeinsamer Zustand für alle Module
const GeoApp = {
  drivingMode: false,
  currentZoom: 1,
  panX: 0,
  panY: 0,
  isDragging: false,
  dragStartX: 0,
  dragStartY: 0,
  panStartX: 0,
  panStartY: 0,
  currentCountry: null,
  lastTouchDist: 0,
  zoomTimeout: null,
};

// DOM-Referenzen (Scripts stehen am Ende von <body>, daher direkt verfügbar)
const mapContainer   = document.getElementById('map-container');
const svg            = document.getElementById('world-map');
const countriesGroup = document.getElementById('countries-group');
const tooltip        = document.getElementById('tooltip');
const overlay        = document.getElementById('overlay');
const searchInput    = document.getElementById('search-input');
const searchResults  = document.getElementById('search-results');
