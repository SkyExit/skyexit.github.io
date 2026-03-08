# 🌍 Interaktive Weltkarte — Länderinformationen

Eine standalone Webanwendung zur Anzeige von Länderinformationen auf einer interaktiven Weltkarte.

## Ordnerstruktur

```
world-map-app/
├── index.html              ← Hauptanwendung (im Browser öffnen)
├── README.md               ← Diese Datei
├── data/
│   ├── countries.js        ← Länderdaten (Name, TLD, Verkehrsseite, etc.)
│   ├── map-paths.js        ← SVG-Pfade der Ländergrenzen
│   └── driving-sides.js    ← Verkehrsseiten-Daten (Referenz)
├── flags/                  ← Flaggen-Bilder (z.B. DE.svg, FR.png)
├── plates/                 ← Kennzeichen-Bilder (z.B. DE.png)
└── images/
    └── signs/              ← Straßenschilder und weitere Bilder
```

## Verwendung

1. Öffne `index.html` in einem modernen Browser (Chrome, Firefox, Edge)
2. **Hover** über ein Land → zeigt Name, TLD und Flagge
3. **Klick** auf ein Land → öffnet Informationsfenster
4. **Mausrad** → Zoomen
5. **Ziehen** → Karte verschieben
6. **Suchfeld** → Land nach Name suchen
7. **Verkehrsseite-Toggle** → Länder nach Links/Rechtsverkehr einfärben

## Daten anpassen

### Länderinformationen bearbeiten (`data/countries.js`)

Die Datei enthält ein JavaScript-Objekt `COUNTRIES` mit ISO-Codes als Schlüssel:

```javascript
"DE": {
  "name": "Deutschland",           // Deutscher Name
  "name_en": "Germany",            // Englischer Name
  "tld": ".de",                    // Top-Level-Domain
  "driving": "right",              // "right" oder "left"
  "capital": "Berlin",             // Hauptstadt
  "continent": "Europa",           // Kontinent
  "flag": "🇩🇪",                    // Emoji-Flagge (automatisch)
  "flag_image": "flags/DE.svg",    // Optional: Pfad zu Flaggen-Bild
  "plate_image": "plates/DE.png",  // Optional: Pfad zu Kennzeichen-Bild
  "road_sign_image": "images/signs/DE.png",  // Optional: Straßenschilder
  "additional_info": "<p>Weitere Infos als HTML...</p>",  // Optional
  "custom_images": [               // Optional: Weitere Bilder
    {"src": "images/DE_autobahn.jpg", "caption": "Deutsche Autobahn"}
  ]
}
```

### Flaggen hinzufügen

1. Speichere die Flagge als Bild im `flags/` Ordner (z.B. `flags/DE.svg`)
2. Füge den Pfad in `countries.js` hinzu: `"flag_image": "flags/DE.svg"`
3. Unterstützte Formate: SVG, PNG, JPG, WebP

### Kennzeichen hinzufügen

1. Speichere das Bild im `plates/` Ordner (z.B. `plates/DE.png`)
2. Füge den Pfad in `countries.js` hinzu: `"plate_image": "plates/DE.png"`
3. **Quelle**: [Wikimedia Commons — License plates by country](https://commons.wikimedia.org/wiki/Category:License_plates_by_country)

### Straßenschilder & weitere Bilder

1. Speichere Bilder im `images/` Ordner
2. Für Straßenschilder: `"road_sign_image": "images/signs/DE.png"`
3. Für beliebige Bilder: `"custom_images": [{"src": "images/beispiel.jpg", "caption": "Beschreibung"}]`

### HTML in Zusatzinformationen

Das Feld `additional_info` akzeptiert HTML:

```javascript
"additional_info": `
  <p>Deutschland liegt in Mitteleuropa und hat 83 Millionen Einwohner.</p>
  <p><strong>Tempolimit:</strong> Autobahn teilweise unbegrenzt</p>
  <p><strong>Notruf:</strong> 112</p>
`
```

## Kartengeometrie anpassen (`data/map-paths.js`)

Die Kartenpfade sind vereinfachte Approximationen. Für genauere Grenzen:

1. Lade eine GeoJSON-Datei herunter (z.B. von [Natural Earth](https://www.naturalearthdata.com/))
2. Konvertiere die Koordinaten mit dem Equirectangular-Verfahren:
   - `x = (lon + 180) × (2000 / 360)`
   - `y = (90 - lat) × (1000 / 180)`
3. Ersetze den entsprechenden Eintrag in `MAP_PATHS`

### Neues Land hinzufügen

1. Erstelle den SVG-Pfad in `data/map-paths.js`:
```javascript
"XX": "M100,200 L110,200 L110,210 L100,210 Z"
```
2. Füge die Infos in `data/countries.js` hinzu

## Datenquellen

| Daten | Quelle |
|-------|--------|
| Kennzeichen | [Wikimedia Commons](https://commons.wikimedia.org/wiki/Category:License_plates_by_country) |
| TLD & Flaggen | [Wikipedia — Länderspezifische TLDs](https://de.wikipedia.org/wiki/Liste_l%C3%A4nderspezifischer_Top-Level-Domains) |
| Verkehrsseite | [Länderdaten.de](https://www.laenderdaten.de/verkehr/links_oder_rechtsverkehr.aspx) |

## Hinweise

- Die Anwendung funktioniert vollständig offline (nach erstem Laden der Google Fonts)
- Für vollständig offline-Betrieb: Google Fonts herunterladen und lokal einbinden
- Alle Bilder werden relativ zum `index.html` geladen
- Getestet mit Chrome 120+, Firefox 120+, Edge 120+
