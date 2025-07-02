// types/auth.ts

// --- Schemas from OpenAPI ---
export interface UpdateRoleRequest {
  name: string;
  description?: string; // maxLength: 255, minLength: 0
}

export interface RoleDto {
  id?: string; // format: uuid, readOnly: true
  name: string;
  description?: string;
}

export interface UpdatePermissionRequest {
  resource_id: string; // format: uuid
  operation_id: string; // format: uuid
  name: string;
  description?: string; // maxLength: 255, minLength: 0
}

export interface PermissionDto {
  created_at?: string; // format: date-time
  updated_at?: string; // format: date-time
  deleted_at?: string | null; // format: date-time
  created_by?: string; // format: uuid
  updated_by?: string; // format: uuid
  id?: string; // format: uuid
  resource_id?: string; // format: uuid
  operation?: string; // format: uuid (OpenAPI spec says "operation_id" in request, "operation" in DTO)
  name?: string;
  description?: string;
}

export interface CreateRoleRequest {
  name: string;
  description?: string; // maxLength: 255, minLength: 0
}

export interface RolePermissionDto {
  role_id?: string; // format: uuid
  permission_id?: string; // format: uuid
}

export interface RbacResource { // For /api/resources/save
  name?: string;
  value?: string;
  service?: string;
  description?: string;
  roles?: string[];
  permissions?: string[];
  publicAccess?: boolean;
}

export interface ApiResponseBoolean { // For /api/resources/save response
  status?: "SUCCESS" | "FAILED" | "UNKNOWN";
  message?: string;
  data?: boolean;
  errors?: Record<string, string>;
  ok?: boolean;
}

export interface AuthorityDto {
  name?: string;
}

export interface CreateUserRequest {
  username: string;
  email?: string;
  password?: string; // minLength: 6
  first_name: string; // minLength: 3, maxLength: 50
  last_name?: string; // minLength: 0, maxLength: 50
  phone_number?: string;
  authorities?: AuthorityDto[]; // uniqueItems: true
}

export interface UserDto { // Response for /api/register and items in /api/users
  created_at?: string; // format: date-time
  updated_at?: string; // format: date-time
  deleted_at?: string | null; // format: date-time
  created_by?: string; // format: uuid
  updated_by?: string; // format: uuid
  id?: string; // format: uuid
  name?: string; // Seems like a computed full name
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
  password_hash?: string; // Internal representation for mock, not in API DTO
}

export interface CreatePermissionRequest {
  resource_id: string; // format: uuid
  operation_id: string; // format: uuid
  name: string;
  description?: string; // maxLength: 255, minLength: 0
}

export interface AuthRequest {
  username: string;
  password: string;
}

export interface AccessToken {
  token?: string;
  type?: string; // e.g., "Bearer"
  expire_in?: number; // int64 (milliseconds or seconds)
}

export interface UserInfo { // Response for /api/user and user part of LoginResponse
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