export type DrivingSide = 'left' | 'right' | 'mixed' | 'unknown';
export type GeoGuessrCoverage = 'official' | 'unofficial' | 'none' | 'unknown';
export type ColorMode = 'driving' | 'coverage' | 'continent' | 'currency';

export interface CountryAssetImage {
  src: string;
  caption?: string;
}

export interface CountryInfo {
  iso2: string;
  iso3: string;
  names: {
    de: string;
    en: string;
  };
  tld: string[];
  drivingSide: DrivingSide;
  capital: string;
  continent: string;
  region: string;
  currencies: Array<{
    code: string;
    name: string;
    symbol: string;
  }>;
  callingCodes: string[];
  geoguessrCoverage: GeoGuessrCoverage;
  flagEmoji: string;
  assets: {
    flag: string;
    licensePlate: string;
    roadSign: string;
    customImages: CountryAssetImage[];
  };
  notes: string[];
}

export interface CountryMapProperties {
  mapId: string;
  iso2: string;
  iso3: string;
  nameDe: string;
  nameEn: string;
  drivingSide: DrivingSide;
  geoguessrCoverage: GeoGuessrCoverage;
  continent: string;
  region: string;
  currency: string;
  labelLng: number;
  labelLat: number;
  dataStatus: 'ready' | 'unknown';
}
