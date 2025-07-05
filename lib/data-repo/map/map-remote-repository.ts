// lib/data-repo/map/map-remote-repository.ts
import { IMapRepository } from './map-repository-interface';
import { GeocodeResponse, ReverseGeocodeResponse } from '@/types/map';
import { toast } from 'sonner';

const NOMINATIM_BASE_URL = "https://nominatim.openstreetmap.org";

export class MapRemoteRepository implements IMapRepository {

  private async fetchNominatim<T>(endpoint: string): Promise<T> {
    try {
      // IMPORTANT: Nominatim requires a valid User-Agent header for identification.
      const response = await fetch(`${NOMINATIM_BASE_URL}${endpoint}`, {
        headers: {
          "User-Agent": "Yowyob Dashboard Project - Development (contact@yowyob.com)",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Nominatim API error: ${response.status} - ${errorText}`);
      }
      return await response.json() as T;
    } catch (error: any) {
      console.error("Nominatim API request failed:", error);
      // toast.error("Could not reach map service. Please check your connection.");
      throw error;
    }
  }

  async reverseGeocode(lat: number, lon: number): Promise<ReverseGeocodeResponse | null> {
    const endpoint = `/reverse?format=json&lat=${lat}&lon=${lon}`;
    return this.fetchNominatim<ReverseGeocodeResponse>(endpoint);
  }

  async geocodeAddress(query: string): Promise<GeocodeResponse[]> {
    const endpoint = `/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=5`;
    return this.fetchNominatim<GeocodeResponse[]>(endpoint);
  }
}