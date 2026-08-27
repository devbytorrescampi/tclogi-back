import { Injectable } from '@nestjs/common';

export interface GeocodeResult {
  displayName: string;
  latitude: number;
  longitude: number;
}

// Thin proxy over OpenStreetMap's Nominatim search API. Done server-side
// because Nominatim's usage policy requires a descriptive User-Agent header,
// which browsers refuse to let client-side fetch/XHR set.
@Injectable()
export class GeocodeService {
  async search(query: string): Promise<GeocodeResult[]> {
    if (!query || query.trim().length < 3) return [];

    const url = new URL('https://nominatim.openstreetmap.org/search');
    url.searchParams.set('q', query);
    url.searchParams.set('format', 'jsonv2');
    url.searchParams.set('limit', '5');

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'TCLogi/1.0 (logistics warehouse address lookup)',
        'Accept-Language': 'es',
      },
    });

    if (!response.ok) return [];

    const results = (await response.json()) as Array<{
      display_name: string;
      lat: string;
      lon: string;
    }>;

    return results.map((r) => ({
      displayName: r.display_name,
      latitude: parseFloat(r.lat),
      longitude: parseFloat(r.lon),
    }));
  }

  async reverse(lat: number, lon: number): Promise<{ displayName: string } | null> {
    const url = new URL('https://nominatim.openstreetmap.org/reverse');
    url.searchParams.set('lat', String(lat));
    url.searchParams.set('lon', String(lon));
    url.searchParams.set('format', 'jsonv2');

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'TCLogi/1.0 (logistics warehouse address lookup)',
        'Accept-Language': 'es',
      },
    });

    if (!response.ok) return null;

    const result = (await response.json()) as { display_name?: string };
    return result.display_name ? { displayName: result.display_name } : null;
  }
}
