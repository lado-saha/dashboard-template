// types/map.ts

// Simplified structure for Nominatim's reverse geocoding response
export interface ReverseGeocodeResponse {
  place_id: number;
  licence: string;
  osm_type: string;
  osm_id: number;
  lat: string;
  lon: string;
  display_name: string;
  address: {
    road?: string;
    suburb?: string;
    city?: string;
    municipality?: string;
    state_district?: string;
    state?: string;
    postcode?: string;
    country?: string;
    country_code?: string;
    house_number?: string;
  };
  boundingbox: string[];
}

// Simplified structure for Nominatim's forward geocoding (search) response
export interface GeocodeResponse {
  place_id: number;
  licence: string;
  osm_type: string;
  osm_id: number;
  boundingbox: string[];
  lat: string;
  lon: string;
  display_name: string;
  class: string;
  type: string;
  importance: number;
  icon?: string;
}