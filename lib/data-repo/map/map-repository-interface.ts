// lib/data-repo/map/map-repository-interface.ts
import { GeocodeResponse, ReverseGeocodeResponse } from '@/types/map';

export interface IMapRepository {
  /**
   * Converts a latitude and longitude into a structured address.
   */
  reverseGeocode(lat: number, lon: number): Promise<ReverseGeocodeResponse | null>;

  /**
   * Converts a search string into a list of possible locations with coordinates.
   */
  geocodeAddress(query: string): Promise<GeocodeResponse[]>;
}