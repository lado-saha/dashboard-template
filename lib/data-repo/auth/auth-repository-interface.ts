import {
  AuthRequest, CreateUserRequest, LoginResponse, UserDto, UserInfo,
  RoleDto, CreateRoleRequest, UpdateRoleRequest,
  PermissionDto, CreatePermissionRequest, UpdatePermissionRequest,
  RolePermissionDto, RbacResource, ApiResponseBoolean
} from '@/types/auth';

export interface IAuthRepository {
  register(data: CreateUserRequest): Promise<UserDto>;
  getAllUsers(): Promise<UserDto[]>;
  getUserByUsername(username: string): Promise<UserDto | null>;
  getUserByPhoneNumber(phoneNumber: string): Promise<UserDto | null>;
  getUserByEmail(email: string): Promise<UserDto | null>;
  login(data: AuthRequest): Promise<LoginResponse>;
  getCurrentUser(): Promise<UserInfo | null>;
  getRoles(): Promise<RoleDto[]>;
  createRole(data: CreateRoleRequest): Promise<RoleDto>;
  updateRole(roleId: string, data: UpdateRoleRequest): Promise<RoleDto>;
  deleteRole(roleId: string): Promise<void>;
  getAllPermissions(): Promise<PermissionDto[]>;
  getPermissionById(permissionId: string): Promise<PermissionDto | null>;
  // REASON: Added to fetch permissions for a specific role.
  getPermissionsForRole(roleId: string): Promise<PermissionDto[]>;
  createPermission(data: CreatePermissionRequest): Promise<PermissionDto>;
  updatePermission(permissionId: string, data: UpdatePermissionRequest): Promise<PermissionDto>;
  deletePermission(permissionId: string): Promise<void>;
  assignPermissionsToRole(roleId: string, permissionIds: string[]): Promise<RolePermissionDto[]>;
  removePermissionsFromRole(roleId: string, permissionIds: string[]): Promise<void>;
  assignPermissionToRole(roleId: string, permissionId: string): Promise<RolePermissionDto>;
  removePermissionFromRole(roleId: string, permissionId: string): Promise<void>;
  createRbacResource(data: RbacResource): Promise<ApiResponseBoolean>;
  getRolesHierarchy(): Promise<string>;
}
