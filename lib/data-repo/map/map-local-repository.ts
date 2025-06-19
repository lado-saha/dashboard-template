// lib/data-repo/map/map-local-repository.ts
import { IMapRepository } from './map-repository-interface';
import { GeocodeResponse, ReverseGeocodeResponse } from '@/types/map';
import { toast } from "sonner";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const MOCK_GEO_API_BASE = `${APP_URL}/api/mock/geo`;

export class MapLocalRepository implements IMapRepository {
  private async fetchMockApi<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${MOCK_GEO_API_BASE}${endpoint}`);
    if (!response.ok) {
      const error = new Error(`Mock Geo API Error: ${response.statusText}`);
      toast.error("Mock map service failed.");
      throw error;
    }
    return response.json();
  }

  async reverseGeocode(lat: number, lon: number): Promise<ReverseGeocodeResponse | null> {
    return this.fetchMockApi<ReverseGeocodeResponse | null>(`/reverse?lat=${lat}&lon=${lon}`);
  }

  async geocodeAddress(query: string): Promise<GeocodeResponse[]> {
    return this.fetchMockApi<GeocodeResponse[]>(`/geocode?q=${encodeURIComponent(query)}`);
  }
}