// lib/data-repo/auth/auth-repository-interface.ts
import {
  AuthRequest, CreateUserRequest, LoginResponse, UserDto, UserInfo,
  RoleDto, CreateRoleRequest, UpdateRoleRequest,
  PermissionDto, CreatePermissionRequest, UpdatePermissionRequest,
  RolePermissionDto, RbacResource, ApiResponseBoolean
} from '@/types/auth';

export interface IAuthRepository {
  // User Management
  register(data: CreateUserRequest): Promise<UserDto>;
  getAllUsers(): Promise<UserDto[]>;
  getUserByUsername(username: string): Promise<UserDto | null>;
  getUserByPhoneNumber(phoneNumber: string): Promise<UserDto | null>;
  getUserByEmail(email: string): Promise<UserDto | null>;
  // (Update/Delete user methods might be via user's own profile or admin panel elsewhere)

  // Login & Session
  login(data: AuthRequest): Promise<LoginResponse>;
  getCurrentUser(): Promise<UserInfo | null>; // To get info about the currently authenticated user

  // Role Management
  getRoles(): Promise<RoleDto[]>;
  createRole(data: CreateRoleRequest): Promise<RoleDto>;
  updateRole(roleId: string, data: UpdateRoleRequest): Promise<RoleDto>;
  deleteRole(roleId: string): Promise<void>; // 200 OK, no body

  // Permission Management
  getAllPermissions(): Promise<PermissionDto[]>;
  getPermissionById(permissionId: string): Promise<PermissionDto | null>;
  createPermission(data: CreatePermissionRequest): Promise<PermissionDto>;
  updatePermission(permissionId: string, data: UpdatePermissionRequest): Promise<PermissionDto>;
  deletePermission(permissionId: string): Promise<void>; // 200 OK, no body

  // Role-Permission Assignments
  assignPermissionsToRole(roleId: string, permissionIds: string[]): Promise<RolePermissionDto[]>;
  removePermissionsFromRole(roleId: string, permissionIds: string[]): Promise<void>;
  assignPermissionToRole(roleId: string, permissionId: string): Promise<RolePermissionDto>;
  removePermissionFromRole(roleId: string, permissionId: string): Promise<void>;

  // RBAC Resource (Conceptual - for RBAC setup)
  createRbacResource(data: RbacResource): Promise<ApiResponseBoolean>;

  // Roles Hierarchy
  getRolesHierarchy(): Promise<string>; // Returns a string representation
}