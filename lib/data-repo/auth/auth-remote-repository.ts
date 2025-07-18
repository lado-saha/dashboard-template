import { IAuthRepository } from './auth-repository-interface';
import {
  AuthRequest, CreateUserRequest, LoginResponse, UserDto, UserInfo,
  RoleDto, CreateRoleRequest, UpdateRoleRequest,
  PermissionDto, CreatePermissionRequest, UpdatePermissionRequest,
  RolePermissionDto, RbacResource, ApiResponseBoolean
} from '@/types/auth';
import { yowyobAuthApi } from '@/lib/apiClient';

export class AuthRemoteRepository implements IAuthRepository {
    async register(data: CreateUserRequest): Promise<UserDto> { return yowyobAuthApi.register(data); }
    async getAllUsers(): Promise<UserDto[]> { return yowyobAuthApi.getAllUsers(); }
    async getUserByUsername(username: string): Promise<UserDto | null> { return yowyobAuthApi.getUserByUsername(username).catch(e => (e.status === 404 ? null : Promise.reject(e))); }
    async getUserByPhoneNumber(phoneNumber: string): Promise<UserDto | null> { return yowyobAuthApi.getUserByPhoneNumber(phoneNumber).catch(e => (e.status === 404 ? null : Promise.reject(e))); }
    async getUserByEmail(email: string): Promise<UserDto | null> { return yowyobAuthApi.getUserByEmail(email).catch(e => (e.status === 404 ? null : Promise.reject(e))); }
    async login(data: AuthRequest): Promise<LoginResponse> { return yowyobAuthApi.login(data); }
    async getCurrentUser(): Promise<UserInfo | null> { try { return await yowyobAuthApi.getCurrentUser(); } catch (error) { if (error.status === 401 || error.status === 403) return null; throw error; } }
    async getRoles(): Promise<RoleDto[]> { return yowyobAuthApi.getRoles(); }
    async createRole(data: CreateRoleRequest): Promise<RoleDto> { return yowyobAuthApi.createRole(data); }
    async updateRole(roleId: string, data: UpdateRoleRequest): Promise<RoleDto> { return yowyobAuthApi.updateRole(roleId, data); }
    async deleteRole(roleId: string): Promise<void> { return yowyobAuthApi.deleteRole(roleId); }
    async getAllPermissions(): Promise<PermissionDto[]> { return yowyobAuthApi.getAllPermissions(); }
    async getPermissionById(permissionId: string): Promise<PermissionDto | null> { return yowyobAuthApi.getPermissionById(permissionId).catch(e => (e.status === 404 ? null : Promise.reject(e))); }
    // REASON: Implemented to fetch permissions associated with a role. Assumes an endpoint exists.
    async getPermissionsForRole(roleId: string): Promise<PermissionDto[]> {
        // This assumes an endpoint like GET /api/roles/{roleId}/permissions exists.
        // As it's not in the yowyobAuthApi, we add a placeholder implementation.
        console.warn("getPermissionsForRole is using a placeholder remote implementation.");
        return Promise.resolve([]); // Replace with actual API call when available.
    }
    async createPermission(data: CreatePermissionRequest): Promise<PermissionDto> { return yowyobAuthApi.createPermission(data); }
    async updatePermission(permissionId: string, data: UpdatePermissionRequest): Promise<PermissionDto> { return yowyobAuthApi.updatePermission(permissionId, data); }
    async deletePermission(permissionId: string): Promise<void> { return yowyobAuthApi.deletePermission(permissionId); }
    async assignPermissionsToRole(roleId: string, permissionIds: string[]): Promise<RolePermissionDto[]> { return yowyobAuthApi.assignPermissionsToRole(roleId, permissionIds); }
    async removePermissionsFromRole(roleId: string, permissionIds: string[]): Promise<void> { return yowyobAuthApi.removePermissionsFromRole(roleId, permissionIds); }
    async assignPermissionToRole(roleId: string, permissionId: string): Promise<RolePermissionDto> { return yowyobAuthApi.assignPermissionToRole(roleId, permissionId); }
    async removePermissionFromRole(roleId: string, permissionId: string): Promise<void> { return yowyobAuthApi.removePermissionFromRole(roleId, permissionId); }
    async createRbacResource(data: RbacResource): Promise<ApiResponseBoolean> { return yowyobAuthApi.createRbacResource(data); }
    async getRolesHierarchy(): Promise<string> { return yowyobAuthApi.getRolesHierarchy(); }
}
