// types/media.ts

export type ServiceType =
  | "auth" | "business-actor" | "product" | "resource"
  | "organization" | "snappy" | "review" | "point-of-interest" | "location" | "unknown";

export type MediaType = "pdf" | "file" | "audio" | "video" | "image" | "unknown";

export interface UploadRequest {
  is_primary?: boolean;
  description?: string;
}

export interface UploadMediaResponse {
  id?: string; // format: uuid
  resourceId?: string; // format: uuid
  uri?: string;
  url?: string;
}

export interface MediaDto {
  created_at?: string; // format: date-time
  updated_at?: string; // format: date-time
  deleted_at?: string | null; // format: date-time
  created_by?: string; // format: uuid
  updated_by?: string; // format: uuid
  name?: string;
  real_name?: string;
  size?: number; // format: int64
  mime?: string;
  extension?: string;
  is_primary?: boolean;
  type?: MediaType;
  description?: string;
  location?: string;
  headers?: Record<string, string>;
  id?: string; // format: uuid
  resource_id?: string; // format: uuid
  service?: ServiceType;
}