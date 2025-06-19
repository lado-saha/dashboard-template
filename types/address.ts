import { Auditable } from "@/types/common";
import { AddressableType } from "@/types/organization";

// --- Addresses ---
export interface CreateAddressRequest {
  address_line_1?: string;
  address_line_2?: string;
  city?: string;
  state?: string;
  locality?: string;
  country_id?: string; // format: uuid
  zip_code?: string;
  neighbor_hood?: string;
  latitude?: number; // format: double
  longitude?: number; // format: double
}
export interface UpdateAddressRequest extends Partial<CreateAddressRequest> { }

export interface AddressDto extends Auditable {
  addressable_type?: AddressableType;
  addressable_id?: string; // format: uuid
  address_id?: string; // format: uuid
  address_line_1?: string;
  address_line_2?: string;
  city?: string;
  state?: string;
  locality?: string;
  country_id?: string; // format: uuid
  zip_code?: string;
  is_default?: boolean;
  neighbor_hood?: string;
  latitude?: number;
  longitude?: number;
}