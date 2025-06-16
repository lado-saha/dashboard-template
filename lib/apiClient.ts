import { getSession } from "next-auth/react";
import { toast } from "sonner";
import {
  AuthRequest, CreateUserRequest, LoginResponse, UserDto, UserInfo,
  RoleDto, CreateRoleRequest, UpdateRoleRequest,
  PermissionDto, CreatePermissionRequest, UpdatePermissionRequest,
  RolePermissionDto, RbacResource, ApiResponseBoolean
} from "@/types/auth";
import {
  CreateOrganizationRequest, OrganizationDto, OrganizationTableRow, UpdateOrganizationRequest, UpdateOrganizationStatusRequest,
  AddressDto, ContactDto, CreateAddressRequest, UpdateAddressRequest, ContactableType, AddressableType, CreateContactRequest, UpdateContactRequest, BusinessDomainDto, GetBusinessDomainRequest
} from "@/types/organization";
import {
  CreateResourceRequest, ResourceDto, UpdateResourceRequest,
  CreateServiceRequest, ServiceDto, UpdateServiceRequest,
} from "@/types/resourceManagement";


interface ApiErrorResponse {
  timestamp?: string; status?: number; error?: string; message?: string; path?: string; errors?: Record<string, string>;
}

const YOWYOB_AUTH_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL; // Defined in .env.local
const YOWYOB_ORGANIZATION_API_BASE_URL = process.env.NEXT_PUBLIC_ORGANIZATION_SERVICE_BASE_URL;
const YOWYOB_RESOURCE_API_BASE_URL = process.env.NEXT_PUBLIC_RESOURCE_SERVICE_BASE_URL;
const YOWYOB_PRODUCT_STATE_API_BASE_URL = process.env.NEXT_PUBLIC_PRODUCT_SERVICE_BASE_URL;

const AUTH_SERVICE_CLIENT_ID = process.env.NEXT_PUBLIC_AUTH_SERVICE_CLIENT_ID;
const AUTH_SERVICE_CLIENT_SECRET = process.env.NEXT_PUBLIC_AUTH_SERVICE_CLIENT_SECRET;
let CLIENT_BASIC_AUTH_TOKEN: string | null = null;

if (AUTH_SERVICE_CLIENT_ID && AUTH_SERVICE_CLIENT_SECRET) {
  if (typeof window !== "undefined") {
    CLIENT_BASIC_AUTH_TOKEN = `Basic ${btoa(`${AUTH_SERVICE_CLIENT_ID}:${AUTH_SERVICE_CLIENT_SECRET}`)}`;
  } else {
    CLIENT_BASIC_AUTH_TOKEN = `Basic ${Buffer.from(`${AUTH_SERVICE_CLIENT_ID}:${AUTH_SERVICE_CLIENT_SECRET}`).toString('base64')}`;
  }
}

async function getUserBearerToken(): Promise<string | null> {
  const session = await getSession();
  return (session as any)?.accessToken || null;
}

interface YowyobRequestOptions extends RequestInit {
  isFormData?: boolean;
  useClientBasicAuth?: boolean;
}

export async function yowyobApiRequest<T = any>(
  serviceBaseUrl: string | undefined,
  endpoint: string,
  options: YowyobRequestOptions = {},
  isUserAuthAction: boolean = false
): Promise<T> {
  if (!serviceBaseUrl) {
    console.error("Service base URL is not configured for remote API call. Endpoint:", endpoint, "Options:", options);
    toast.error("API service is not configured properly.");
    throw new Error("Service base URL is not configured.");
  }

  let userAccessToken: string | null = null;
  if (!isUserAuthAction && !options.useClientBasicAuth) {
    userAccessToken = await getUserBearerToken();
    if (!userAccessToken && endpoint !== "/api/login" && endpoint !== "/api/register") { // Allow unauth for login/register itself
      console.warn(`No user access token for Yowyob API ${serviceBaseUrl}${endpoint}. Request might fail if auth is required.`);
    }
  }

  const headers: HeadersInit = { ...(options.isFormData ? {} : { "Content-Type": "application/json" }), ...options.headers };

  if (options.useClientBasicAuth && CLIENT_BASIC_AUTH_TOKEN) {
    (headers as Record<string, string>)["Authorization"] = CLIENT_BASIC_AUTH_TOKEN;
  } else if (userAccessToken) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${userAccessToken}`;
  } else if (options.useClientBasicAuth && !CLIENT_BASIC_AUTH_TOKEN) {
    console.error("Client basic auth requested but token is not configured for Yowyob API.");
  }

  const fullUrl = `${serviceBaseUrl}${endpoint}`;
  const config: RequestInit = { ...options, headers };

  try {
    const response = await fetch(fullUrl, config);
    if (!response.ok) {
      let errorData: ApiErrorResponse | null = null;
      let errorMessage = `Request failed: ${response.status} ${response.statusText}`;
      try {
        errorData = await response.json();
        errorMessage = errorData?.message || errorMessage;
        if (errorData?.errors) errorMessage += ` (${Object.values(errorData.errors).join(', ')})`;
      } catch (e) { /* ignore */ }
      console.error(`YOWYOB API Error: ${errorMessage} for ${fullUrl}`, { data: errorData, options: config });
      if (!(isUserAuthAction && (response.status === 401 || response.status === 403))) toast.error(errorMessage);
      const error = new Error(errorMessage) as any;
      error.status = response.status; error.data = errorData;
      throw error;
    }
    if (response.status === 204 || response.headers.get("content-length") === "0") return null as T;
    return (await response.json()) as T;
  } catch (error: any) {
    if (!error.status && !(error instanceof SyntaxError)) {
      console.error("Network or unhandled Yowyob API error:", error);
      if (!isUserAuthAction) toast.error("Network error or Yowyob server unreachable.");
    }
    throw error;
  }
}

export const yowyobAuthApi = {
  // User Management
  register: (data: CreateUserRequest) => yowyobApiRequest<UserDto>(YOWYOB_AUTH_API_BASE_URL, "/api/register", { method: "POST", body: JSON.stringify(data), useClientBasicAuth: true }, true),
  getAllUsers: () => yowyobApiRequest<UserDto[]>(YOWYOB_AUTH_API_BASE_URL, "/api/users", { method: "GET" }),
  getUserByUsername: (username: string) => yowyobApiRequest<UserDto>(YOWYOB_AUTH_API_BASE_URL, `/api/user/username/${username}`, { method: "GET" }),
  getUserByPhoneNumber: (phoneNumber: string) => yowyobApiRequest<UserDto>(YOWYOB_AUTH_API_BASE_URL, `/api/user/phone-number/${phoneNumber}`, { method: "GET" }),
  getUserByEmail: (email: string) => yowyobApiRequest<UserDto>(YOWYOB_AUTH_API_BASE_URL, `/api/user/email/${email}`, { method: "GET" }),

  // Login & Session
  login: (data: AuthRequest) => yowyobApiRequest<LoginResponse>(YOWYOB_AUTH_API_BASE_URL, "/api/login", { method: "POST", body: JSON.stringify(data), useClientBasicAuth: true }, true),
  getCurrentUser: () => yowyobApiRequest<UserInfo>(YOWYOB_AUTH_API_BASE_URL, "/api/user", { method: "GET" }),

  // Role Management
  getRoles: () => yowyobApiRequest<RoleDto[]>(YOWYOB_AUTH_API_BASE_URL, "/api/roles", { method: "GET" }),
  createRole: (data: CreateRoleRequest) => yowyobApiRequest<RoleDto>(YOWYOB_AUTH_API_BASE_URL, "/api/roles", { method: "POST", body: JSON.stringify(data) }),
  updateRole: (roleId: string, data: UpdateRoleRequest) => yowyobApiRequest<RoleDto>(YOWYOB_AUTH_API_BASE_URL, `/api/roles/${roleId}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteRole: (roleId: string) => yowyobApiRequest<void>(YOWYOB_AUTH_API_BASE_URL, `/api/roles/${roleId}`, { method: "DELETE" }),

  // Permission Management
  getAllPermissions: () => yowyobApiRequest<PermissionDto[]>(YOWYOB_AUTH_API_BASE_URL, "/api/permissions", { method: "GET" }),
  getPermissionById: (permissionId: string) => yowyobApiRequest<PermissionDto>(YOWYOB_AUTH_API_BASE_URL, `/api/permissions/${permissionId}`, { method: "GET" }),
  createPermission: (data: CreatePermissionRequest) => yowyobApiRequest<PermissionDto>(YOWYOB_AUTH_API_BASE_URL, "/api/permissions", { method: "POST", body: JSON.stringify(data) }),
  updatePermission: (permissionId: string, data: UpdatePermissionRequest) => yowyobApiRequest<PermissionDto>(YOWYOB_AUTH_API_BASE_URL, `/api/permissions/${permissionId}`, { method: "PUT", body: JSON.stringify(data) }),
  deletePermission: (permissionId: string) => yowyobApiRequest<void>(YOWYOB_AUTH_API_BASE_URL, `/api/permissions/${permissionId}`, { method: "DELETE" }),

  // Role-Permission Assignments
  assignPermissionsToRole: (roleId: string, permissionIds: string[]) => yowyobApiRequest<RolePermissionDto[]>(YOWYOB_AUTH_API_BASE_URL, `/api/roles/${roleId}/permissions`, { method: "POST", body: JSON.stringify(permissionIds) }),
  removePermissionsFromRole: (roleId: string, permissionIds: string[]) => yowyobApiRequest<void>(YOWYOB_AUTH_API_BASE_URL, `/api/roles/${roleId}/permissions`, { method: "DELETE", body: JSON.stringify(permissionIds) }),
  assignPermissionToRole: (roleId: string, permissionId: string) => yowyobApiRequest<RolePermissionDto>(YOWYOB_AUTH_API_BASE_URL, `/api/roles/${roleId}/permissions/${permissionId}`, { method: "POST" }),
  removePermissionFromRole: (roleId: string, permissionId: string) => yowyobApiRequest<void>(YOWYOB_AUTH_API_BASE_URL, `/api/roles/${roleId}/permissions/${permissionId}`, { method: "DELETE" }),

  // RBAC Resource
  createRbacResource: (data: RbacResource) => yowyobApiRequest<ApiResponseBoolean>(YOWYOB_AUTH_API_BASE_URL, "/api/resources/save", { method: "POST", body: JSON.stringify(data) }),

  // Roles Hierarchy
  getRolesHierarchy: () => yowyobApiRequest<string>(YOWYOB_AUTH_API_BASE_URL, "/api/roles/hierarchy", { method: "GET" }),
};

export const yowyobOrganizationApi = {
  getMyOrganizations: () => yowyobApiRequest<OrganizationTableRow[]>(YOWYOB_ORGANIZATION_API_BASE_URL, "/organizations/user", { method: "GET" }, false),
  getOrganizationById: (orgId: string) => yowyobApiRequest<OrganizationDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}`, { method: "GET" }, false),
  createOrganization: (data: CreateOrganizationRequest) => yowyobApiRequest<OrganizationDto>(YOWYOB_ORGANIZATION_API_BASE_URL, "/organizations", { method: "POST", body: JSON.stringify(data) }, false),
  updateOrganization: (orgId: string, data: UpdateOrganizationRequest) => yowyobApiRequest<OrganizationDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}`, { method: "PUT", body: JSON.stringify(data) }, false),
  updateOrganizationStatus: (orgId: string, data: UpdateOrganizationStatusRequest) => yowyobApiRequest<OrganizationDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/status`, { method: "PUT", body: JSON.stringify(data) }, false),
  getAddresses: (addressableType: AddressableType, addressableId: string) => yowyobApiRequest<AddressDto[]>(YOWYOB_ORGANIZATION_API_BASE_URL, `/${addressableType}/${addressableId}/addresses`, { method: "GET" }, false),
  createAddress: (addressableType: AddressableType, addressableId: string, data: CreateAddressRequest) => yowyobApiRequest<AddressDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/${addressableType}/${addressableId}/addresses`, { method: "POST", body: JSON.stringify(data) }, false),
  getContacts: (contactableType: ContactableType, contactableId: string) => yowyobApiRequest<ContactDto[]>(YOWYOB_ORGANIZATION_API_BASE_URL, `/${contactableType}/${contactableId}/contacts`, { method: "GET" }, false),
  createContact: (contactableType: ContactableType, contactableId: string, data: CreateContactRequest) => yowyobApiRequest<ContactDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/${contactableType}/${contactableId}/contacts`, { method: "POST", body: JSON.stringify(data) }, false),
  getAllBusinessDomains: (params?: GetBusinessDomainRequest) => {
    const queryParams = params ? `?${new URLSearchParams(params as any).toString()}` : "";
    return yowyobApiRequest<BusinessDomainDto[]>(YOWYOB_ORGANIZATION_API_BASE_URL, `/business-domains${queryParams}`, { method: "GET" }, false);
  },
};
export const yowyobResourceManagementApi = {
  getResources: (orgId: string) => yowyobApiRequest<ResourceDto[]>(YOWYOB_RESOURCE_API_BASE_URL, `/${orgId}/resources`, { method: "GET" }, false),
  createResource: (orgId: string, data: CreateResourceRequest) => yowyobApiRequest<ResourceDto>(YOWYOB_RESOURCE_API_BASE_URL, `/${orgId}/resources`, { method: "POST", body: JSON.stringify(data) }, false),
  getServices: (orgId: string) => yowyobApiRequest<ServiceDto[]>(YOWYOB_RESOURCE_API_BASE_URL, `/${orgId}/services`, { method: "GET" }, false),
  createService: (orgId: string, data: CreateServiceRequest) => yowyobApiRequest<ServiceDto>(YOWYOB_RESOURCE_API_BASE_URL, `/${orgId}/services`, { method: "POST", body: JSON.stringify(data) }, false),
};
export const yowyobProductStateApi = {
  updateResourceState: (resourceId: string, data: { currentState: string }) => yowyobApiRequest(YOWYOB_PRODUCT_STATE_API_BASE_URL, `/api/resource/${resourceId}`, { method: "PUT", body: JSON.stringify(data) }, false),
  updateServiceState: (serviceId: string, data: { currentState: string }) => yowyobApiRequest(YOWYOB_PRODUCT_STATE_API_BASE_URL, `/api/service/${serviceId}`, { method: "PUT", body: JSON.stringify(data) }, false),
};