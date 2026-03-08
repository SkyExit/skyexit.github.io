// Country information database
// Edit this file to add/modify country information
// Fields:
//   name: German name
//   name_en: English name
//   tld: Top-level domain
//   driving: 'left' or 'right' (driving side)
//   capital: Capital city
//   continent: Continent
//   flag: (auto-generated emoji, can be overridden with image path)
//   flag_image: Optional path to flag image file, e.g. 'flags/DE.svg'
//   plate_image: Optional path to license plate image, e.g. 'plates/DE.png'
//   road_sign_image: Optional path to road sign image, e.g. 'images/signs/DE.png'
//   additional_info: Optional HTML string with extra information
//   custom_images: Optional array of {src: 'path', caption: 'text'} for info panel
//
// To add a new country:
// 1. Add its entry below with the ISO 3166-1 alpha-2 code as key
// 2. Add its map path in map-paths.js
// 3. Optionally add flag/plate images in the respective folders

const COUNTRIES = {
  "DE": {
    "name": "Deutschland",
    "name_en": "Germany",
    "tld": ".de",
    "driving": "right",
    "capital": "Berlin",
    "continent": "Europa",
    "flag": "🇩🇪",
    "additional_info": "<p><strong>Tempolimit:</strong> Auf der Autobahn teilweise unbegrenzt (Richtgeschwindigkeit 130 km/h), innerorts 50 km/h, außerorts 100 km/h.</p><p><strong>Notruf:</strong> 112 (Feuerwehr/Rettungsdienst), 110 (Polizei)</p><p><strong>Maut:</strong> Keine PKW-Maut auf Autobahnen.</p><p><strong>Promillegrenze:</strong> 0,5 ‰ (Fahranfänger: 0,0 ‰)</p>"
  },
  "FR": {
    "name": "Frankreich",
    "name_en": "France",
    "tld": ".fr",
    "driving": "right",
    "capital": "Paris",
    "continent": "Europa",
    "flag": "🇫🇷"
  },
  "GB": {
    "name": "Vereinigtes Königreich",
    "name_en": "United Kingdom",
    "tld": ".uk",
    "driving": "left",
    "capital": "London",
    "continent": "Europa",
    "flag": "🇬🇧",
    "additional_info": "<p><strong>Tempolimit:</strong> Motorway 70 mph (112 km/h), außerorts 60 mph, innerorts 30 mph.</p><p><strong>Notruf:</strong> 999 oder 112</p><p><strong>Maut:</strong> Congestion Charge in London (Stadtmaut).</p><p><strong>Besonderheit:</strong> Linksverkehr! Kreisverkehre werden im Uhrzeigersinn befahren.</p>"
  },
  "IT": {
    "name": "Italien",
    "name_en": "Italy",
    "tld": ".it",
    "driving": "right",
    "capital": "Rom",
    "continent": "Europa",
    "flag": "🇮🇹"
  },
  "ES": {
    "name": "Spanien",
    "name_en": "Spain",
    "tld": ".es",
    "driving": "right",
    "capital": "Madrid",
    "continent": "Europa",
    "flag": "🇪🇸"
  },
  "PT": {
    "name": "Portugal",
    "name_en": "Portugal",
    "tld": ".pt",
    "driving": "right",
    "capital": "Lissabon",
    "continent": "Europa",
    "flag": "🇵🇹"
  },
  "NL": {
    "name": "Niederlande",
    "name_en": "Netherlands",
    "tld": ".nl",
    "driving": "right",
    "capital": "Amsterdam",
    "continent": "Europa",
    "flag": "🇳🇱"
  },
  "BE": {
    "name": "Belgien",
    "name_en": "Belgium",
    "tld": ".be",
    "driving": "right",
    "capital": "Brüssel",
    "continent": "Europa",
    "flag": "🇧🇪"
  },
  "LU": {
    "name": "Luxemburg",
    "name_en": "Luxembourg",
    "tld": ".lu",
    "driving": "right",
    "capital": "Luxemburg",
    "continent": "Europa",
    "flag": "🇱🇺"
  },
  "CH": {
    "name": "Schweiz",
    "name_en": "Switzerland",
    "tld": ".ch",
    "driving": "right",
    "capital": "Bern",
    "continent": "Europa",
    "flag": "🇨🇭"
  },
  "AT": {
    "name": "Österreich",
    "name_en": "Austria",
    "tld": ".at",
    "driving": "right",
    "capital": "Wien",
    "continent": "Europa",
    "flag": "🇦🇹"
  },
  "PL": {
    "name": "Polen",
    "name_en": "Poland",
    "tld": ".pl",
    "driving": "right",
    "capital": "Warschau",
    "continent": "Europa",
    "flag": "🇵🇱"
  },
  "CZ": {
    "name": "Tschechien",
    "name_en": "Czechia",
    "tld": ".cz",
    "driving": "right",
    "capital": "Prag",
    "continent": "Europa",
    "flag": "🇨🇿"
  },
  "SK": {
    "name": "Slowakei",
    "name_en": "Slovakia",
    "tld": ".sk",
    "driving": "right",
    "capital": "Bratislava",
    "continent": "Europa",
    "flag": "🇸🇰"
  },
  "HU": {
    "name": "Ungarn",
    "name_en": "Hungary",
    "tld": ".hu",
    "driving": "right",
    "capital": "Budapest",
    "continent": "Europa",
    "flag": "🇭🇺"
  },
  "RO": {
    "name": "Rumänien",
    "name_en": "Romania",
    "tld": ".ro",
    "driving": "right",
    "capital": "Bukarest",
    "continent": "Europa",
    "flag": "🇷🇴"
  },
  "BG": {
    "name": "Bulgarien",
    "name_en": "Bulgaria",
    "tld": ".bg",
    "driving": "right",
    "capital": "Sofia",
    "continent": "Europa",
    "flag": "🇧🇬"
  },
  "GR": {
    "name": "Griechenland",
    "name_en": "Greece",
    "tld": ".gr",
    "driving": "right",
    "capital": "Athen",
    "continent": "Europa",
    "flag": "🇬🇷"
  },
  "HR": {
    "name": "Kroatien",
    "name_en": "Croatia",
    "tld": ".hr",
    "driving": "right",
    "capital": "Zagreb",
    "continent": "Europa",
    "flag": "🇭🇷"
  },
  "RS": {
    "name": "Serbien",
    "name_en": "Serbia",
    "tld": ".rs",
    "driving": "right",
    "capital": "Belgrad",
    "continent": "Europa",
    "flag": "🇷🇸"
  },
  "BA": {
    "name": "Bosnien und Herzegowina",
    "name_en": "Bosnia and Herzegovina",
    "tld": ".ba",
    "driving": "right",
    "capital": "Sarajevo",
    "continent": "Europa",
    "flag": "🇧🇦"
  },
  "AL": {
    "name": "Albanien",
    "name_en": "Albania",
    "tld": ".al",
    "driving": "right",
    "capital": "Tirana",
    "continent": "Europa",
    "flag": "🇦🇱"
  },
  "MK": {
    "name": "Nordmazedonien",
    "name_en": "North Macedonia",
    "tld": ".mk",
    "driving": "right",
    "capital": "Skopje",
    "continent": "Europa",
    "flag": "🇲🇰"
  },
  "ME": {
    "name": "Montenegro",
    "name_en": "Montenegro",
    "tld": ".me",
    "driving": "right",
    "capital": "Podgorica",
    "continent": "Europa",
    "flag": "🇲🇪"
  },
  "SI": {
    "name": "Slowenien",
    "name_en": "Slovenia",
    "tld": ".si",
    "driving": "right",
    "capital": "Ljubljana",
    "continent": "Europa",
    "flag": "🇸🇮"
  },
  "DK": {
    "name": "Dänemark",
    "name_en": "Denmark",
    "tld": ".dk",
    "driving": "right",
    "capital": "Kopenhagen",
    "continent": "Europa",
    "flag": "🇩🇰"
  },
  "NO": {
    "name": "Norwegen",
    "name_en": "Norway",
    "tld": ".no",
    "driving": "right",
    "capital": "Oslo",
    "continent": "Europa",
    "flag": "🇳🇴"
  },
  "SE": {
    "name": "Schweden",
    "name_en": "Sweden",
    "tld": ".se",
    "driving": "right",
    "capital": "Stockholm",
    "continent": "Europa",
    "flag": "🇸🇪"
  },
  "FI": {
    "name": "Finnland",
    "name_en": "Finland",
    "tld": ".fi",
    "driving": "right",
    "capital": "Helsinki",
    "continent": "Europa",
    "flag": "🇫🇮"
  },
  "EE": {
    "name": "Estland",
    "name_en": "Estonia",
    "tld": ".ee",
    "driving": "right",
    "capital": "Tallinn",
    "continent": "Europa",
    "flag": "🇪🇪"
  },
  "LV": {
    "name": "Lettland",
    "name_en": "Latvia",
    "tld": ".lv",
    "driving": "right",
    "capital": "Riga",
    "continent": "Europa",
    "flag": "🇱🇻"
  },
  "LT": {
    "name": "Litauen",
    "name_en": "Lithuania",
    "tld": ".lt",
    "driving": "right",
    "capital": "Vilnius",
    "continent": "Europa",
    "flag": "🇱🇹"
  },
  "UA": {
    "name": "Ukraine",
    "name_en": "Ukraine",
    "tld": ".ua",
    "driving": "right",
    "capital": "Kiew",
    "continent": "Europa",
    "flag": "🇺🇦"
  },
  "BY": {
    "name": "Belarus",
    "name_en": "Belarus",
    "tld": ".by",
    "driving": "right",
    "capital": "Minsk",
    "continent": "Europa",
    "flag": "🇧🇾"
  },
  "MD": {
    "name": "Moldau",
    "name_en": "Moldova",
    "tld": ".md",
    "driving": "right",
    "capital": "Chișinău",
    "continent": "Europa",
    "flag": "🇲🇩"
  },
  "RU": {
    "name": "Russland",
    "name_en": "Russia",
    "tld": ".ru",
    "driving": "right",
    "capital": "Moskau",
    "continent": "Europa/Asien",
    "flag": "🇷🇺"
  },
  "IS": {
    "name": "Island",
    "name_en": "Iceland",
    "tld": ".is",
    "driving": "right",
    "capital": "Reykjavik",
    "continent": "Europa",
    "flag": "🇮🇸"
  },
  "IE": {
    "name": "Irland",
    "name_en": "Ireland",
    "tld": ".ie",
    "driving": "left",
    "capital": "Dublin",
    "continent": "Europa",
    "flag": "🇮🇪"
  },
  "TR": {
    "name": "Türkei",
    "name_en": "Turkey",
    "tld": ".tr",
    "driving": "right",
    "capital": "Ankara",
    "continent": "Europa/Asien",
    "flag": "🇹🇷"
  },
  "MA": {
    "name": "Marokko",
    "name_en": "Morocco",
    "tld": ".ma",
    "driving": "right",
    "capital": "Rabat",
    "continent": "Afrika",
    "flag": "🇲🇦"
  },
  "DZ": {
    "name": "Algerien",
    "name_en": "Algeria",
    "tld": ".dz",
    "driving": "right",
    "capital": "Algier",
    "continent": "Afrika",
    "flag": "🇩🇿"
  },
  "TN": {
    "name": "Tunesien",
    "name_en": "Tunisia",
    "tld": ".tn",
    "driving": "right",
    "capital": "Tunis",
    "continent": "Afrika",
    "flag": "🇹🇳"
  },
  "LY": {
    "name": "Libyen",
    "name_en": "Libya",
    "tld": ".ly",
    "driving": "right",
    "capital": "Tripolis",
    "continent": "Afrika",
    "flag": "🇱🇾"
  },
  "EG": {
    "name": "Ägypten",
    "name_en": "Egypt",
    "tld": ".eg",
    "driving": "right",
    "capital": "Kairo",
    "continent": "Afrika",
    "flag": "🇪🇬"
  },
  "MR": {
    "name": "Mauretanien",
    "name_en": "Mauritania",
    "tld": ".mr",
    "driving": "right",
    "capital": "Nouakchott",
    "continent": "Afrika",
    "flag": "🇲🇷"
  },
  "ML": {
    "name": "Mali",
    "name_en": "Mali",
    "tld": ".ml",
    "driving": "right",
    "capital": "Bamako",
    "continent": "Afrika",
    "flag": "🇲🇱"
  },
  "NE": {
    "name": "Niger",
    "name_en": "Niger",
    "tld": ".ne",
    "driving": "right",
    "capital": "Niamey",
    "continent": "Afrika",
    "flag": "🇳🇪"
  },
  "TD": {
    "name": "Tschad",
    "name_en": "Chad",
    "tld": ".td",
    "driving": "right",
    "capital": "N'Djamena",
    "continent": "Afrika",
    "flag": "🇹🇩"
  },
  "SD": {
    "name": "Sudan",
    "name_en": "Sudan",
    "tld": ".sd",
    "driving": "right",
    "capital": "Khartum",
    "continent": "Afrika",
    "flag": "🇸🇩"
  },
  "NG": {
    "name": "Nigeria",
    "name_en": "Nigeria",
    "tld": ".ng",
    "driving": "right",
    "capital": "Abuja",
    "continent": "Afrika",
    "flag": "🇳🇬"
  },
  "CM": {
    "name": "Kamerun",
    "name_en": "Cameroon",
    "tld": ".cm",
    "driving": "right",
    "capital": "Yaoundé",
    "continent": "Afrika",
    "flag": "🇨🇲"
  },
  "ET": {
    "name": "Äthiopien",
    "name_en": "Ethiopia",
    "tld": ".et",
    "driving": "right",
    "capital": "Addis Abeba",
    "continent": "Afrika",
    "flag": "🇪🇹"
  },
  "KE": {
    "name": "Kenia",
    "name_en": "Kenya",
    "tld": ".ke",
    "driving": "left",
    "capital": "Nairobi",
    "continent": "Afrika",
    "flag": "🇰🇪"
  },
  "TZ": {
    "name": "Tansania",
    "name_en": "Tanzania",
    "tld": ".tz",
    "driving": "left",
    "capital": "Dodoma",
    "continent": "Afrika",
    "flag": "🇹🇿"
  },
  "CD": {
    "name": "Demokratische Republik Kongo",
    "name_en": "DR Congo",
    "tld": ".cd",
    "driving": "right",
    "capital": "Kinshasa",
    "continent": "Afrika",
    "flag": "🇨🇩"
  },
  "CG": {
    "name": "Republik Kongo",
    "name_en": "Republic of the Congo",
    "tld": ".cg",
    "driving": "right",
    "capital": "Brazzaville",
    "continent": "Afrika",
    "flag": "🇨🇬"
  },
  "AO": {
    "name": "Angola",
    "name_en": "Angola",
    "tld": ".ao",
    "driving": "right",
    "capital": "Luanda",
    "continent": "Afrika",
    "flag": "🇦🇴"
  },
  "ZA": {
    "name": "Südafrika",
    "name_en": "South Africa",
    "tld": ".za",
    "driving": "left",
    "capital": "Pretoria",
    "continent": "Afrika",
    "flag": "🇿🇦"
  },
  "MZ": {
    "name": "Mosambik",
    "name_en": "Mozambique",
    "tld": ".mz",
    "driving": "left",
    "capital": "Maputo",
    "continent": "Afrika",
    "flag": "🇲🇿"
  },
  "ZW": {
    "name": "Simbabwe",
    "name_en": "Zimbabwe",
    "tld": ".zw",
    "driving": "left",
    "capital": "Harare",
    "continent": "Afrika",
    "flag": "🇿🇼"
  },
  "NA": {
    "name": "Namibia",
    "name_en": "Namibia",
    "tld": ".na",
    "driving": "left",
    "capital": "Windhoek",
    "continent": "Afrika",
    "flag": "🇳🇦"
  },
  "BW": {
    "name": "Botswana",
    "name_en": "Botswana",
    "tld": ".bw",
    "driving": "left",
    "capital": "Gaborone",
    "continent": "Afrika",
    "flag": "🇧🇼"
  },
  "MG": {
    "name": "Madagaskar",
    "name_en": "Madagascar",
    "tld": ".mg",
    "driving": "right",
    "capital": "Antananarivo",
    "continent": "Afrika",
    "flag": "🇲🇬"
  },
  "SA": {
    "name": "Saudi-Arabien",
    "name_en": "Saudi Arabia",
    "tld": ".sa",
    "driving": "right",
    "capital": "Riad",
    "continent": "Asien",
    "flag": "🇸🇦"
  },
  "IQ": {
    "name": "Irak",
    "name_en": "Iraq",
    "tld": ".iq",
    "driving": "right",
    "capital": "Bagdad",
    "continent": "Asien",
    "flag": "🇮🇶"
  },
  "IR": {
    "name": "Iran",
    "name_en": "Iran",
    "tld": ".ir",
    "driving": "right",
    "capital": "Teheran",
    "continent": "Asien",
    "flag": "🇮🇷"
  },
  "AF": {
    "name": "Afghanistan",
    "name_en": "Afghanistan",
    "tld": ".af",
    "driving": "right",
    "capital": "Kabul",
    "continent": "Asien",
    "flag": "🇦🇫"
  },
  "PK": {
    "name": "Pakistan",
    "name_en": "Pakistan",
    "tld": ".pk",
    "driving": "left",
    "capital": "Islamabad",
    "continent": "Asien",
    "flag": "🇵🇰"
  },
  "SY": {
    "name": "Syrien",
    "name_en": "Syria",
    "tld": ".sy",
    "driving": "right",
    "capital": "Damaskus",
    "continent": "Asien",
    "flag": "🇸🇾"
  },
  "JO": {
    "name": "Jordanien",
    "name_en": "Jordan",
    "tld": ".jo",
    "driving": "right",
    "capital": "Amman",
    "continent": "Asien",
    "flag": "🇯🇴"
  },
  "IL": {
    "name": "Israel",
    "name_en": "Israel",
    "tld": ".il",
    "driving": "right",
    "capital": "Jerusalem",
    "continent": "Asien",
    "flag": "🇮🇱"
  },
  "AE": {
    "name": "Vereinigte Arabische Emirate",
    "name_en": "United Arab Emirates",
    "tld": ".ae",
    "driving": "right",
    "capital": "Abu Dhabi",
    "continent": "Asien",
    "flag": "🇦🇪"
  },
  "OM": {
    "name": "Oman",
    "name_en": "Oman",
    "tld": ".om",
    "driving": "right",
    "capital": "Maskat",
    "continent": "Asien",
    "flag": "🇴🇲"
  },
  "YE": {
    "name": "Jemen",
    "name_en": "Yemen",
    "tld": ".ye",
    "driving": "right",
    "capital": "Sanaa",
    "continent": "Asien",
    "flag": "🇾🇪"
  },
  "IN": {
    "name": "Indien",
    "name_en": "India",
    "tld": ".in",
    "driving": "left",
    "capital": "Neu-Delhi",
    "continent": "Asien",
    "flag": "🇮🇳",
    "additional_info": "<p><strong>Tempolimit:</strong> Highway 80-100 km/h, innerorts 50 km/h.</p><p><strong>Notruf:</strong> 112</p><p><strong>Besonderheit:</strong> Linksverkehr. Hupen ist weit verbreitet und oft sogar empfohlen.</p>"
  },
  "CN": {
    "name": "China",
    "name_en": "China",
    "tld": ".cn",
    "driving": "right",
    "capital": "Peking",
    "continent": "Asien",
    "flag": "🇨🇳"
  },
  "MN": {
    "name": "Mongolei",
    "name_en": "Mongolia",
    "tld": ".mn",
    "driving": "right",
    "capital": "Ulaanbaatar",
    "continent": "Asien",
    "flag": "🇲🇳"
  },
  "KZ": {
    "name": "Kasachstan",
    "name_en": "Kazakhstan",
    "tld": ".kz",
    "driving": "right",
    "capital": "Astana",
    "continent": "Asien",
    "flag": "🇰🇿"
  },
  "UZ": {
    "name": "Usbekistan",
    "name_en": "Uzbekistan",
    "tld": ".uz",
    "driving": "right",
    "capital": "Taschkent",
    "continent": "Asien",
    "flag": "🇺🇿"
  },
  "TM": {
    "name": "Turkmenistan",
    "name_en": "Turkmenistan",
    "tld": ".tm",
    "driving": "right",
    "capital": "Aşgabat",
    "continent": "Asien",
    "flag": "🇹🇲"
  },
  "KG": {
    "name": "Kirgisistan",
    "name_en": "Kyrgyzstan",
    "tld": ".kg",
    "driving": "right",
    "capital": "Bischkek",
    "continent": "Asien",
    "flag": "🇰🇬"
  },
  "TJ": {
    "name": "Tadschikistan",
    "name_en": "Tajikistan",
    "tld": ".tj",
    "driving": "right",
    "capital": "Duschanbe",
    "continent": "Asien",
    "flag": "🇹🇯"
  },
  "JP": {
    "name": "Japan",
    "name_en": "Japan",
    "tld": ".jp",
    "driving": "left",
    "capital": "Tokio",
    "continent": "Asien",
    "flag": "🇯🇵",
    "additional_info": "<p><strong>Tempolimit:</strong> Autobahn 100 km/h, Landstraße 60 km/h, innerorts 30-40 km/h.</p><p><strong>Notruf:</strong> 110 (Polizei), 119 (Feuerwehr/Rettung)</p><p><strong>Besonderheit:</strong> Linksverkehr. Internationaler Führerschein erforderlich.</p><p><strong>Maut:</strong> Hohe Autobahngebühren (Expressways).</p>"
  },
  "KR": {
    "name": "Südkorea",
    "name_en": "South Korea",
    "tld": ".kr",
    "driving": "right",
    "capital": "Seoul",
    "continent": "Asien",
    "flag": "🇰🇷"
  },
  "KP": {
    "name": "Nordkorea",
    "name_en": "North Korea",
    "tld": ".kp",
    "driving": "right",
    "capital": "Pjöngjang",
    "continent": "Asien",
    "flag": "🇰🇵"
  },
  "TH": {
    "name": "Thailand",
    "name_en": "Thailand",
    "tld": ".th",
    "driving": "left",
    "capital": "Bangkok",
    "continent": "Asien",
    "flag": "🇹🇭",
    "additional_info": "<p><strong>Tempolimit:</strong> Autobahn 120 km/h, Landstraße 90 km/h, innerorts 50 km/h.</p><p><strong>Notruf:</strong> 191 (Polizei), 1669 (Rettung)</p><p><strong>Besonderheit:</strong> Linksverkehr. Internationaler Führerschein empfohlen.</p>"
  },
  "VN": {
    "name": "Vietnam",
    "name_en": "Vietnam",
    "tld": ".vn",
    "driving": "right",
    "capital": "Hanoi",
    "continent": "Asien",
    "flag": "🇻🇳"
  },
  "MM": {
    "name": "Myanmar",
    "name_en": "Myanmar",
    "tld": ".mm",
    "driving": "right",
    "capital": "Naypyidaw",
    "continent": "Asien",
    "flag": "🇲🇲"
  },
  "LA": {
    "name": "Laos",
    "name_en": "Laos",
    "tld": ".la",
    "driving": "right",
    "capital": "Vientiane",
    "continent": "Asien",
    "flag": "🇱🇦"
  },
  "KH": {
    "name": "Kambodscha",
    "name_en": "Cambodia",
    "tld": ".kh",
    "driving": "right",
    "capital": "Phnom Penh",
    "continent": "Asien",
    "flag": "🇰🇭"
  },
  "MY": {
    "name": "Malaysia",
    "name_en": "Malaysia",
    "tld": ".my",
    "driving": "left",
    "capital": "Kuala Lumpur",
    "continent": "Asien",
    "flag": "🇲🇾"
  },
  "ID": {
    "name": "Indonesien",
    "name_en": "Indonesia",
    "tld": ".id",
    "driving": "left",
    "capital": "Jakarta",
    "continent": "Asien",
    "flag": "🇮🇩"
  },
  "PH": {
    "name": "Philippinen",
    "name_en": "Philippines",
    "tld": ".ph",
    "driving": "right",
    "capital": "Manila",
    "continent": "Asien",
    "flag": "🇵🇭"
  },
  "BD": {
    "name": "Bangladesch",
    "name_en": "Bangladesh",
    "tld": ".bd",
    "driving": "left",
    "capital": "Dhaka",
    "continent": "Asien",
    "flag": "🇧🇩"
  },
  "NP": {
    "name": "Nepal",
    "name_en": "Nepal",
    "tld": ".np",
    "driving": "left",
    "capital": "Kathmandu",
    "continent": "Asien",
    "flag": "🇳🇵"
  },
  "CA": {
    "name": "Kanada",
    "name_en": "Canada",
    "tld": ".ca",
    "driving": "right",
    "capital": "Ottawa",
    "continent": "Nordamerika",
    "flag": "🇨🇦"
  },
  "US": {
    "name": "Vereinigte Staaten",
    "name_en": "United States",
    "tld": ".us",
    "driving": "right",
    "capital": "Washington, D.C.",
    "continent": "Nordamerika",
    "flag": "🇺🇸",
    "additional_info": "<p><strong>Tempolimit:</strong> Variiert je nach Bundesstaat, Interstate meist 65-75 mph (105-120 km/h).</p><p><strong>Notruf:</strong> 911</p><p><strong>Besonderheit:</strong> Rechts abbiegen bei Rot erlaubt (außer wenn beschildert). Stop-Schilder an fast allen Kreuzungen.</p><p><strong>Promillegrenze:</strong> 0,8 ‰ (0,0 ‰ unter 21 Jahre)</p>"
  },
  "MX": {
    "name": "Mexiko",
    "name_en": "Mexico",
    "tld": ".mx",
    "driving": "right",
    "capital": "Mexiko-Stadt",
    "continent": "Nordamerika",
    "flag": "🇲🇽"
  },
  "GT": {
    "name": "Guatemala",
    "name_en": "Guatemala",
    "tld": ".gt",
    "driving": "right",
    "capital": "Guatemala-Stadt",
    "continent": "Nordamerika",
    "flag": "🇬🇹"
  },
  "BZ": {
    "name": "Belize",
    "name_en": "Belize",
    "tld": ".bz",
    "driving": "right",
    "capital": "Belmopan",
    "continent": "Nordamerika",
    "flag": "🇧🇿"
  },
  "HN": {
    "name": "Honduras",
    "name_en": "Honduras",
    "tld": ".hn",
    "driving": "right",
    "capital": "Tegucigalpa",
    "continent": "Nordamerika",
    "flag": "🇭🇳"
  },
  "SV": {
    "name": "El Salvador",
    "name_en": "El Salvador",
    "tld": ".sv",
    "driving": "right",
    "capital": "San Salvador",
    "continent": "Nordamerika",
    "flag": "🇸🇻"
  },
  "NI": {
    "name": "Nicaragua",
    "name_en": "Nicaragua",
    "tld": ".ni",
    "driving": "right",
    "capital": "Managua",
    "continent": "Nordamerika",
    "flag": "🇳🇮"
  },
  "CR": {
    "name": "Costa Rica",
    "name_en": "Costa Rica",
    "tld": ".cr",
    "driving": "right",
    "capital": "San José",
    "continent": "Nordamerika",
    "flag": "🇨🇷"
  },
  "PA": {
    "name": "Panama",
    "name_en": "Panama",
    "tld": ".pa",
    "driving": "right",
    "capital": "Panama-Stadt",
    "continent": "Nordamerika",
    "flag": "🇵🇦"
  },
  "CU": {
    "name": "Kuba",
    "name_en": "Cuba",
    "tld": ".cu",
    "driving": "right",
    "capital": "Havanna",
    "continent": "Nordamerika",
    "flag": "🇨🇺"
  },
  "CO": {
    "name": "Kolumbien",
    "name_en": "Colombia",
    "tld": ".co",
    "driving": "right",
    "capital": "Bogotá",
    "continent": "Südamerika",
    "flag": "🇨🇴"
  },
  "VE": {
    "name": "Venezuela",
    "name_en": "Venezuela",
    "tld": ".ve",
    "driving": "right",
    "capital": "Caracas",
    "continent": "Südamerika",
    "flag": "🇻🇪"
  },
  "GY": {
    "name": "Guyana",
    "name_en": "Guyana",
    "tld": ".gy",
    "driving": "left",
    "capital": "Georgetown",
    "continent": "Südamerika",
    "flag": "🇬🇾"
  },
  "SR": {
    "name": "Suriname",
    "name_en": "Suriname",
    "tld": ".sr",
    "driving": "left",
    "capital": "Paramaribo",
    "continent": "Südamerika",
    "flag": "🇸🇷"
  },
  "EC": {
    "name": "Ecuador",
    "name_en": "Ecuador",
    "tld": ".ec",
    "driving": "right",
    "capital": "Quito",
    "continent": "Südamerika",
    "flag": "🇪🇨"
  },
  "PE": {
    "name": "Peru",
    "name_en": "Peru",
    "tld": ".pe",
    "driving": "right",
    "capital": "Lima",
    "continent": "Südamerika",
    "flag": "🇵🇪"
  },
  "BR": {
    "name": "Brasilien",
    "name_en": "Brazil",
    "tld": ".br",
    "driving": "right",
    "capital": "Brasília",
    "continent": "Südamerika",
    "flag": "🇧🇷"
  },
  "BO": {
    "name": "Bolivien",
    "name_en": "Bolivia",
    "tld": ".bo",
    "driving": "right",
    "capital": "Sucre",
    "continent": "Südamerika",
    "flag": "🇧🇴"
  },
  "PY": {
    "name": "Paraguay",
    "name_en": "Paraguay",
    "tld": ".py",
    "driving": "right",
    "capital": "Asunción",
    "continent": "Südamerika",
    "flag": "🇵🇾"
  },
  "AR": {
    "name": "Argentinien",
    "name_en": "Argentina",
    "tld": ".ar",
    "driving": "right",
    "capital": "Buenos Aires",
    "continent": "Südamerika",
    "flag": "🇦🇷"
  },
  "CL": {
    "name": "Chile",
    "name_en": "Chile",
    "tld": ".cl",
    "driving": "right",
    "capital": "Santiago",
    "continent": "Südamerika",
    "flag": "🇨🇱"
  },
  "UY": {
    "name": "Uruguay",
    "name_en": "Uruguay",
    "tld": ".uy",
    "driving": "right",
    "capital": "Montevideo",
    "continent": "Südamerika",
    "flag": "🇺🇾"
  },
  "AU": {
    "name": "Australien",
    "name_en": "Australia",
    "tld": ".au",
    "driving": "left",
    "capital": "Canberra",
    "continent": "Ozeanien",
    "flag": "🇦🇺",
    "additional_info": "<p><strong>Tempolimit:</strong> Highway 100-110 km/h, innerorts 50 km/h.</p><p><strong>Notruf:</strong> 000 oder 112</p><p><strong>Besonderheit:</strong> Linksverkehr. Vorsicht vor Wildtieren (Kängurus) auf Landstraßen.</p><p><strong>Maut:</strong> Elektronische Maut in Großstädten (Sydney, Melbourne).</p>"
  },
  "NZ": {
    "name": "Neuseeland",
    "name_en": "New Zealand",
    "tld": ".nz",
    "driving": "left",
    "capital": "Wellington",
    "continent": "Ozeanien",
    "flag": "🇳🇿"
  },
  "PG": {
    "name": "Papua-Neuguinea",
    "name_en": "Papua New Guinea",
    "tld": ".pg",
    "driving": "left",
    "capital": "Port Moresby",
    "continent": "Ozeanien",
    "flag": "🇵🇬"
  }
};
