export interface Timestamps {
  created_at?: string; // format: date-time
  updated_at?: string; // format: date-time
  deleted_at?: string | null; // format: date-time
}

export interface Auditable extends Timestamps {
  created_by?: string; // format: uuid
  updated_by?: string; // format: uuid
}

export type ViewMode = "list" | "grid";

