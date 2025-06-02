// Based on your OpenAPI spec components.schemas

export interface AuthorityDto {
  name?: string;
}

export interface CreateUserRequest {
  username: string;
  email?: string; // Optional in spec, but usually good to have
  password?: string; // minLength 6
  first_name: string; // minLength 3, maxLength 50
  last_name?: string; // minLength 0, maxLength 50
  phone_number?: string;
  authorities?: AuthorityDto[]; // uniqueItems true
}

export interface UserDto {
  created_at?: string; // format: date-time
  updated_at?: string; // format: date-time
  deleted_at?: string | null; // format: date-time, nullable
  created_by?: string; // format: uuid
  updated_by?: string; // format: uuid
  id?: string; // format: uuid
  name?: string; // This seems to be a computed full name or similar
  first_name?: string;
  last_name?: string;
  email?: string;
  phone_number?: string;
  password_reset_token?: string | null;
  password_reset_expiration?: string | null; // format: date-time
  username?: string;
  email_verified?: boolean;
  phone_number_verified?: boolean;
  is_enabled?: boolean;
}

export interface AuthRequest {
  username?: string; // Username for login
  password?: string;
}

export interface AccessToken {
  token?: string;
  type?: string; // e.g., "Bearer"
  expire_in?: number; // int64, likely milliseconds or seconds
}

export interface UserInfo { // User info returned on login and /api/user
  id?: string; // format: uuid
  first_name?: string;
  last_name?: string;
  username?: string;
  email?: string;
  phone_number?: string;
  email_verified?: boolean;
  phone_number_verified?: boolean;
}

export interface LoginResponse {
  access_token?: AccessToken;
  user?: UserInfo;
  roles?: string[];
  permissions?: string[];
}

// For Role & Permission Management (for later)
export interface RoleDto {
  id?: string; // uuid
  name: string;
  description?: string;
}
export interface PermissionDto {
  id?: string; // uuid
  resource_id?: string; // uuid
  operation_id?: string; // uuid - Note: spec says 'operation', might be typo
  name?: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
  created_by?: string;
  updated_by?: string;
}