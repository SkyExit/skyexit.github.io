'use strict';

// ── Robinson-Projektion ────────────────────────────────────────────────────────
// Identische Tabellen und Formeln wie in generate_maps.py → pixel-genaue Übereinstimmung.
// Tabellenwerte nach Abdulkarim & Snyder (1986), 5°-Schritte von 0°–90°.

const _ROB_PLEN = [
  1.0000, 0.9986, 0.9954, 0.9900, 0.9822, 0.9730,
  0.9600, 0.9427, 0.9216, 0.8962, 0.8679, 0.8350,
  0.7986, 0.7597, 0.7186, 0.6732, 0.6213, 0.5722, 0.5322,
];
const _ROB_PDFE = [
  0.0000, 0.0620, 0.1240, 0.1860, 0.2480, 0.3100,
  0.3720, 0.4340, 0.4958, 0.5571, 0.6176, 0.6769,
  0.7346, 0.7903, 0.8435, 0.8936, 0.9394, 0.9761, 1.0000,
];

const _ROB_X_MAX = 0.8487 * Math.PI;  // ≈ 2.6659
const _ROB_Y_MAX = 1.3523;

/**
 * Projiziert lon/lat → SVG-Koordinaten (0–2000 × 0–1000).
 * @returns {{ x: number, y: number }}
 */
function robinsonToSVG(lon, lat) {
  lon = Math.max(-179.9, Math.min(179.9, lon));
  lat = Math.max(-89.9,  Math.min(89.9,  lat));

  const li   = Math.abs(lat) / 5;
  const i    = Math.min(Math.floor(li), 17);
  const t    = li - i;
  const sign = lat >= 0 ? 1 : -1;

  const plen = _ROB_PLEN[i] + t * (_ROB_PLEN[i + 1] - _ROB_PLEN[i]);
  const pdfe = (_ROB_PDFE[i] + t * (_ROB_PDFE[i + 1] - _ROB_PDFE[i])) * sign;

  const x = 0.8487 * plen * (lon * Math.PI / 180);
  const y = 1.3523 * pdfe;

  return {
    x: (x / _ROB_X_MAX + 1) / 2 * 2000,
    y: (1 - (y / _ROB_Y_MAX + 1) / 2) * 1000,
  };
}
