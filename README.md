# GeoCheatMK2

GeoCheatMK2 ist eine statische GitHub-Pages-Webseite für GeoGuessr-relevante Länderinformationen. Die Karte wird mit MapLibre GL gerendert und nutzt eine vorbereitete GeoJSON-Weltkarte statt selbst generierter SVG-Pfade.

## Features

- Interaktive Weltkarte mit WebGL-Rendering
- Hover-Tooltip mit Flagge, Name, Verkehrsseite, Domain, Währung und Vorwahl
- Detailpanel pro Land mit ISO, Hauptstadt, Region, GeoGuessr-Coverage, Währungen, Vorwahlen und optionalem Kennzeichenbild
- Suchfunktion für Ländername, ISO, Domain, Vorwahl und Währung
- Farbmodi für Verkehrsseite, GeoGuessr-Coverage, Region/Kontinent und Währung
- Lokale JSON-Daten und lokale Assets, keine Runtime-API

## Entwicklung

```bash
npm install
npm run dev
```

Falls deine Shell `NODE_ENV=production` setzt, installiere Dev-Dependencies lokal so:

```bash
NODE_ENV=development npm install --include=dev
```

## Checks

```bash
npm run validate:data
npm run typecheck
npm run build
npm run test:smoke
```

`npm run build` erzeugt vor dem Vite-Build automatisch `public/data/countries.geojson` aus `ne_50m_admin_0_countries.geojson` und `src/data/countries.json`.

## Daten

- Länderinformationen: `src/data/countries.json`
- Kartenquelle: `ne_50m_admin_0_countries.geojson`
- Generierte MapLibre-Daten: `public/data/countries.geojson`
- Flaggen: `public/flags/`
- Kennzeichenbilder: `public/plates/`

Kennzeichenbilder sind optional. Fehlende Bilder werden in der UI als nicht hinterlegt angezeigt.

## Deployment

Die GitHub-Actions-Workflowdatei `.github/workflows/deploy.yml` baut die App und deployed `dist/` auf GitHub Pages. Vite ist für Root-Hosting mit `base: "/"` konfiguriert, also für `https://skyexit.github.io/`.
