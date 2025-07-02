// lib/data-repo/auth/auth-local-repository.ts
import { IAuthRepository } from './auth-repository-interface';
import {
  AuthRequest, CreateUserRequest, LoginResponse, UserDto, UserInfo,
  RoleDto, CreateRoleRequest, UpdateRoleRequest,
  PermissionDto, CreatePermissionRequest, UpdatePermissionRequest,
  RolePermissionDto, RbacResource, ApiResponseBoolean
} from '@/types/auth';
import { toast } from 'sonner';

const APP_URL = typeof window !== 'undefined' ? window.location.origin : (process.env.NEXTAUTH_URL || process.env.VERCEL_URL || 'http://localhost:3000');
const MOCK_API_AUTH_BASE = `${APP_URL}/api/mock/auth`;

export class AuthLocalRepository implements IAuthRepository {
  private async fetchMockApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${MOCK_API_AUTH_BASE}${endpoint}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...options.headers },
    });
    const responseContentType = response.headers.get("content-type");
    let responseData;
    if (responseContentType && responseContentType.includes("application/json")) {
      responseData = await response.json();
    } else if (response.status !== 204) {
      responseData = { message: await response.text() || response.statusText };
    }
    if (!response.ok) {
      const errorPayload = responseData || { message: `Request to ${endpoint} failed` };
      console.error(`[AuthLocalRepo] Mock API Error: ${response.status}`, errorPayload);
      // toast.error(errorPayload.message || `Mock API request failed: ${response.status}`);
      throw { status: response.status, message: errorPayload.message, data: errorPayload };
    }
    return responseData as T;
  }

  // User Management
  async register(data: CreateUserRequest): Promise<UserDto> {
    return this.fetchMockApi<UserDto>("/register", { method: "POST", body: JSON.stringify(data) });
  }
  async getAllUsers(): Promise<UserDto[]> {
    return this.fetchMockApi<UserDto[]>("/users", { method: "GET" });
  }
  async getUserByUsername(username: string): Promise<UserDto | null> {
    return this.fetchMockApi<UserDto | null>(`/users/username/${username}`, { method: "GET" });
  }
  async getUserByPhoneNumber(phoneNumber: string): Promise<UserDto | null> {
    return this.fetchMockApi<UserDto | null>(`/users/phone/${phoneNumber}`, { method: "GET" });
  }
  async getUserByEmail(email: string): Promise<UserDto | null> {
    return this.fetchMockApi<UserDto | null>(`/users/email/${email}`, { method: "GET" });
  }

  // Login & Session
  async login(data: AuthRequest): Promise<LoginResponse> {
    return this.fetchMockApi<LoginResponse>("/login", { method: "POST", body: JSON.stringify(data) });
  }
  async getCurrentUser(): Promise<UserInfo | null> {
    return this.fetchMockApi<UserInfo | null>("/user", { method: "GET" });
  }

  // Role Management
  async getRoles(): Promise<RoleDto[]> {
    return this.fetchMockApi<RoleDto[]>("/roles", { method: "GET" });
  }
  async createRole(data: CreateRoleRequest): Promise<RoleDto> {
    return this.fetchMockApi<RoleDto>("/roles", { method: "POST", body: JSON.stringify(data) });
  }
  async updateRole(roleId: string, data: UpdateRoleRequest): Promise<RoleDto> {
    return this.fetchMockApi<RoleDto>(`/roles/${roleId}`, { method: "PUT", body: JSON.stringify(data) });
  }
  async deleteRole(roleId: string): Promise<void> {
    return this.fetchMockApi<void>(`/roles/${roleId}`, { method: "DELETE" });
  }

  // Permission Management
  async getAllPermissions(): Promise<PermissionDto[]> {
    return this.fetchMockApi<PermissionDto[]>("/permissions", { method: "GET" });
  }
  async getPermissionById(permissionId: string): Promise<PermissionDto | null> {
    return this.fetchMockApi<PermissionDto | null>(`/permissions/${permissionId}`, { method: "GET" });
  }
  async createPermission(data: CreatePermissionRequest): Promise<PermissionDto> {
    return this.fetchMockApi<PermissionDto>("/permissions", { method: "POST", body: JSON.stringify(data) });
  }
  async updatePermission(permissionId: string, data: UpdatePermissionRequest): Promise<PermissionDto> {
    return this.fetchMockApi<PermissionDto>(`/permissions/${permissionId}`, { method: "PUT", body: JSON.stringify(data) });
  }
  async deletePermission(permissionId: string): Promise<void> {
    return this.fetchMockApi<void>(`/permissions/${permissionId}`, { method: "DELETE" });
  }

  // Role-Permission Assignments
  async assignPermissionsToRole(roleId: string, permissionIds: string[]): Promise<RolePermissionDto[]> {
    return this.fetchMockApi<RolePermissionDto[]>(`/roles/${roleId}/permissions`, { method: "POST", body: JSON.stringify(permissionIds) });
  }
  async removePermissionsFromRole(roleId: string, permissionIds: string[]): Promise<void> {
    return this.fetchMockApi<void>(`/roles/${roleId}/permissions`, { method: "DELETE", body: JSON.stringify(permissionIds) });
  }
  async assignPermissionToRole(roleId: string, permissionId: string): Promise<RolePermissionDto> {
    return this.fetchMockApi<RolePermissionDto>(`/roles/${roleId}/permissions/${permissionId}`, { method: "POST" });
  }
  async removePermissionFromRole(roleId: string, permissionId: string): Promise<void> {
    return this.fetchMockApi<void>(`/roles/${roleId}/permissions/${permissionId}`, { method: "DELETE" });
  }

  // RBAC Resource
  async createRbacResource(data: RbacResource): Promise<ApiResponseBoolean> {
    return this.fetchMockApi<ApiResponseBoolean>("/resources/save", { method: "POST", body: JSON.stringify(data) });
  }

  // Roles Hierarchy
  async getRolesHierarchy(): Promise<string> {
    return this.fetchMockApi<string>("/roles/hierarchy", { method: "GET" });
  }
}