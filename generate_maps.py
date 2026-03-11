#!/usr/bin/env python3
"""
GeoCheat Karten-Generator
=========================
Generiert LOD-Kartenpfade mit Robinson-Projektion.

Benötigte Pakete:
    pip install geopandas shapely

GeoJSON herunterladen (Natural Earth, kostenlos & Public Domain):
    50m (empfohlen):
      https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_admin_0_countries.geojson

    10m (hochauflösend, für LOD2 deutlich besser):
      https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_admin_0_countries.geojson

Verwendung:
    python generate_maps.py ne_50m_admin_0_countries.geojson

    Optional – zwei Quelldateien (grob + fein):
    python generate_maps.py ne_50m_admin_0_countries.geojson ne_10m_admin_0_countries.geojson

Ausgabe (im Ordner data/):
    map-paths-lod0.js  – Zoom 1–3  (grob,   für schnelle Übersicht)
    map-paths-lod1.js  – Zoom 3–6  (mittel, Standard)
    map-paths-lod2.js  – Zoom 6+   (fein,   lazy geladen)
    map-bounds.js      – Bounding-Boxes für Viewport-Culling
"""

import json, math, sys
from pathlib import Path

# ── Abhängigkeiten prüfen / installieren ───────────────────────────────────────
for pkg in ('geopandas', 'shapely'):
    try:
        __import__(pkg)
    except ImportError:
        import subprocess
        print(f"Installiere {pkg}…")
        subprocess.check_call([sys.executable, '-m', 'pip', 'install', pkg])

import geopandas as gpd

# ── Robinson-Projektion ────────────────────────────────────────────────────────
# Tabellenwerte nach Abdulkarim & Snyder (1986), 5°-Schritte von 0°–90°
_PLEN = [1.0000,0.9986,0.9954,0.9900,0.9822,0.9730,
         0.9600,0.9427,0.9216,0.8962,0.8679,0.8350,
         0.7986,0.7597,0.7186,0.6732,0.6213,0.5722,0.5322]
_PDFE = [0.0000,0.0620,0.1240,0.1860,0.2480,0.3100,
         0.3720,0.4340,0.4958,0.5571,0.6176,0.6769,
         0.7346,0.7903,0.8435,0.8936,0.9394,0.9761,1.0000]

SVG_W, SVG_H = 2000, 1000
_X_MAX = 0.8487 * math.pi   # ≈ 2.6659  (bei lon=±180, lat=0)
_Y_MAX = 1.3523              # (bei lat=±90)


def _lerp(tbl, raw_idx):
    i = min(int(raw_idx), len(tbl) - 2)
    t = raw_idx - i
    return tbl[i] + t * (tbl[i + 1] - tbl[i])


def project(lon, lat):
    """Geographische Koordinaten → SVG-Pixel (0–2000 × 0–1000)."""
    lon = max(-179.9, min(179.9, lon))
    lat = max(-89.9,  min(89.9,  lat))
    li   = abs(lat) / 5.0
    sign = 1 if lat >= 0 else -1
    plen = _lerp(_PLEN, li)
    pdfe = _lerp(_PDFE, li) * sign
    x =  0.8487 * plen * (lon * math.pi / 180)
    y =  1.3523 * pdfe
    return (x / _X_MAX + 1) / 2 * SVG_W,  (1 - (y / _Y_MAX + 1) / 2) * SVG_H


# ── Geometrie → SVG-Pfad ──────────────────────────────────────────────────────

def _ring_to_d(coords, prec):
    pts = [project(c[0], c[1]) for c in coords]
    if len(pts) < 2:
        return ''
    fmt = f"{{:.{prec}f}}"
    d = f"M{fmt.format(pts[0][0])},{fmt.format(pts[0][1])}"
    for x, y in pts[1:]:
        d += f"L{fmt.format(x)},{fmt.format(y)}"
    return d + "Z"


def geom_to_svg(geom, prec=1):
    """Shapely Polygon/MultiPolygon → SVG-Pfad-String."""
    parts = []
    polys = list(geom.geoms) if geom.geom_type == 'MultiPolygon' else [geom]
    for poly in polys:
        for ring in [poly.exterior] + list(poly.interiors):
            p = _ring_to_d(list(ring.coords), prec)
            if p:
                parts.append(p)
    return ''.join(parts)


def geom_bbox(geom):
    """Bounding Box einer Geometrie in SVG-Koordinaten."""
    xs, ys = [], []
    polys = list(geom.geoms) if geom.geom_type == 'MultiPolygon' else [geom]
    for poly in polys:
        for lon, lat in list(poly.exterior.coords):
            x, y = project(lon, lat)
            xs.append(x); ys.append(y)
    if not xs:
        return None
    return {
        'x': round(min(xs), 1), 'y': round(min(ys), 1),
        'w': round(max(xs) - min(xs), 1), 'h': round(max(ys) - min(ys), 1),
    }


# ── LOD-Konfiguration ──────────────────────────────────────────────────────────
# (Suffix, Toleranz in Grad, SVG-Dezimalstellen)
LOD = [
    ('lod0', 0.50, 1),   # Zoom 1–3:  grob   (~55 km)
    ('lod1', 0.10, 1),   # Zoom 3–6:  mittel (~11 km)
    ('lod2', 0.02, 1),   # Zoom 6+:   fein   (~ 2 km)
]

# ISO-Spalten, in Reihenfolge der Präferenz
# ISO_A2_EH enthält erweiterte Codes (z.B. XK für Kosovo)
ISO_COLS = ['ISO_A2_EH', 'ISO_A2', 'ADM0_A3', 'ISO_A3']


def get_iso(row):
    for col in ISO_COLS:
        if col in row.index:
            val = str(row[col]).strip().upper()
            if val not in ('', '-1', '-99', 'NAN', 'NONE', 'NULL'):
                return val[:3]
    return None


def load_gdf(path):
    print(f"  Lade {path} …")
    gdf = gpd.read_file(path)
    print(f"  {len(gdf)} Features")
    return gdf


# ── Hauptprogramm ─────────────────────────────────────────────────────────────

def main(args):
    if not args:
        print(__doc__)
        sys.exit(0)

    # Optionale zweite Datei für LOD2 (höhere Auflösung)
    gdf_coarse = load_gdf(args[0])
    gdf_fine   = load_gdf(args[1]) if len(args) > 1 else gdf_coarse

    out = Path('data')
    out.mkdir(exist_ok=True)

    bounds = {}

    for i, (suffix, tol, prec) in enumerate(LOD):
        # LOD2 aus der hochauflösenden Datei generieren (falls angegeben)
        gdf = gdf_fine if (i == 2 and len(args) > 1) else gdf_coarse

        print(f"\nGeneriere {suffix}  (Toleranz {tol}°, Quelle: {Path(gdf.attrs.get('_path', args[0])).name if hasattr(gdf, 'attrs') else '?'})…")
        paths = {}

        for _, row in gdf.iterrows():
            iso = get_iso(row)
            if not iso:
                continue
            geom = row.geometry
            if geom is None or geom.is_empty:
                continue
            if geom.geom_type not in ('Polygon', 'MultiPolygon'):
                continue

            simplified = geom.simplify(tol, preserve_topology=True)
            if simplified.is_empty:
                simplified = geom   # Fallback: Original verwenden

            d = geom_to_svg(simplified, prec)
            if d:
                paths[iso] = d

            # Bounding Boxes einmalig aus LOD1 berechnen
            if suffix == 'lod1' and iso not in bounds:
                b = geom_bbox(geom)
                if b:
                    bounds[iso] = b

        js_path = out / f"map-paths-{suffix}.js"
        js_path.write_text(
            f"// GeoCheat – automatisch generiert  |  LOD: {suffix}  |  Toleranz: {tol}°\n"
            f"const MAP_PATHS_{suffix.upper()} = "
            + json.dumps(paths, ensure_ascii=False, separators=(',', ':'))
            + ';\n',
            encoding='utf-8',
        )
        kb = js_path.stat().st_size // 1024
        print(f"  → {js_path}   ({len(paths)} Länder,  {kb} KB)")

    # Bounding Boxes speichern
    bb_path = out / 'map-bounds.js'
    bb_path.write_text(
        '// GeoCheat – Bounding-Boxes in SVG-Koordinaten (für Viewport-Culling)\n'
        'const MAP_BOUNDS = '
        + json.dumps(bounds, ensure_ascii=False, separators=(',', ':'))
        + ';\n',
        encoding='utf-8',
    )
    print(f"\n  → {bb_path}   ({len(bounds)} Bounding-Boxes)")
    print("\n✓ Fertig! Lade die Seite im Browser neu.")


if __name__ == '__main__':
    main(sys.argv[1:])
