import { getSession } from "next-auth/react";
import { toast } from "sonner";
import { AuthRequest, CreateUserRequest, LoginResponse, UserDto, UserInfo } from "@/lib/types/auth";
import {
  CreateOrganizationRequest, OrganizationDto, OrganizationTableRow, UpdateOrganizationRequest, UpdateOrganizationStatusRequest,
  AddressDto, ContactDto, CreateAddressRequest, UpdateAddressRequest, ContactableType, AddressableType, CreateContactRequest, UpdateContactRequest, BusinessDomainDto, GetBusinessDomainRequest,
  // Add other DTOs from types/organization.ts as you implement their API calls
} from "@/lib/types/organization";
import {
  CreateResourceRequest, ResourceDto, UpdateResourceRequest,
  CreateServiceRequest, ServiceDto, UpdateServiceRequest,
  // Add other DTOs from types/resourceManagement.ts as you implement their API calls
} from "@/lib/types/resourceManagement";

// Import Mock Data
import {
  mockUserOrganizations,
  mockOrganizationDetails,
  mockOrgAddresses,
  mockOrgContacts,
  mockAvailableBusinessDomains,
  // Import other mock data arrays as you create them
} from "@/lib/mock-data/organization-mocks";


interface ApiErrorResponse {
  timestamp?: string; status?: number; error?: string; message?: string; path?: string; errors?: Record<string, string>;
}

// --- Base URLs ---
const AUTH_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/auth-service";
const ORGANIZATION_API_BASE_URL = process.env.NEXT_PUBLIC_ORGANIZATION_SERVICE_BASE_URL || "http://localhost:8080/organization-service";
const RESOURCE_API_BASE_URL = process.env.NEXT_PUBLIC_RESOURCE_SERVICE_BASE_URL || "http://localhost:8080/resource-service";
const PRODUCT_STATE_API_BASE_URL = process.env.NEXT_PUBLIC_PRODUCT_SERVICE_BASE_URL || "http://localhost:8080/product-management-service"; // Original Product Mgmt for states

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

async function getAuthToken(): Promise<string | null> {
  const session = await getSession();
  return (session as any)?.accessToken || null;
}

interface RequestOptions extends RequestInit {
  isFormData?: boolean;
  useClientBasicAuth?: boolean;
  // customBaseUrl is now handled by the 'service' parameter in combinedApiRequest
}

// --- MOCK API REQUEST LOGIC ---
const USE_MOCK_API = true; // Global toggle for using mock API

async function mockApiRequest<T = any>(
  endpoint: string,
  options: RequestOptions = {},
  isUserAuthAction: boolean = false, // Kept for consistency, though less critical for pure mock
  service: 'auth' | 'organization' | 'resource' | 'product_state'
): Promise<T> {
  const method = options.method || "GET";
  const body = options.body ? JSON.parse(options.body as string) : null;
  console.log(`MOCK API Request to ${service} service: ${method} ${endpoint}`, body);
  await new Promise(resolve => setTimeout(resolve, Math.random() * 300 + 100)); // Shorter mock delay

  if (service === 'auth') {
    if (endpoint === "/api/register" && method === "POST") {
      const data = body as CreateUserRequest;
      const newUser: UserDto = { id: `user-mock-${Date.now()}`, username: data.username, first_name: data.first_name, last_name: data.last_name, email: data.email, is_enabled: true, email_verified: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
      return newUser as T;
    }
    if (endpoint === "/api/login" && method === "POST") {
      const data = body as AuthRequest;
      // Simple mock login, doesn't actually check password for this mock
      if (data.username) {
        const response: LoginResponse = {
          access_token: { token: `mock-jwt-${data.username}-${Date.now()}`, type: "Bearer", expire_in: 3600000 },
          user: { id: `user-mock-${data.username}`, username: data.username, first_name: data.username?.split('@')[0] || "Mock", last_name: "User", email: `${data.username}`, email_verified: true },
          roles: ["BUSINESS_ACTOR_ROLE", "GENERAL_USER_ROLE"],
          permissions: ["org:read", "org:create", "product:read", "product:manage"]
        };
        return response as T;
      }
      const error = new Error("Mock: Invalid username or password") as any; error.status = 401; throw error;
    }
    if (endpoint === "/api/user" && method === "GET") {
      const session = await getSession(); // Check if there's a mock session
      if (session && (session.user as any)?.username) {
        const extendedUser = session.user as UserInfo; // Or your ExtendedUser type from NextAuth
        return {
          id: (extendedUser as any).id || "mock-current-user-id",
          username: extendedUser.username,
          first_name: extendedUser.first_name,
          last_name: extendedUser.last_name,
          email: extendedUser.email,
          email_verified: true,
        } as T;
      }
      const error = new Error("Mock: Not authenticated") as any; error.status = 401; throw error;
    }
  }

  if (service === 'organization') {
    if (endpoint === "/organizations/user" && method === "GET") return mockUserOrganizations as T;
    if (endpoint.startsWith("/organizations/") && !endpoint.includes("/status") && !endpoint.includes("/contacts") && !endpoint.includes("/addresses") && !endpoint.includes("/domains") && method === "GET") {
      const orgId = endpoint.substring("/organizations/".length);
      const orgDetail = mockOrganizationDetails[orgId];
      if (orgDetail) return orgDetail as T;
      const error = new Error("Organization not found in mock") as any; error.status = 404; throw error;
    }
    if (endpoint === "/organizations" && method === "POST") {
      const data = body as CreateOrganizationRequest;
      const newOrgId = `org-mock-${Date.now()}`;
      const newOrg: OrganizationDto = { ...data, organization_id: newOrgId, status: "PENDING_APPROVAL", is_active: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
      mockUserOrganizations.push(newOrg as OrganizationTableRow);
      mockOrganizationDetails[newOrgId] = newOrg;
      return newOrg as T;
    }
    if (endpoint.startsWith("/organizations/") && !endpoint.includes("/status") && method === "PUT") {
      const orgId = endpoint.substring("/organizations/".length);
      const data = body as UpdateOrganizationRequest;
      if (mockOrganizationDetails[orgId]) {
        mockOrganizationDetails[orgId] = { ...mockOrganizationDetails[orgId], ...data, updated_at: new Date().toISOString() };
        const orgIndex = mockUserOrganizations.findIndex(o => o.organization_id === orgId);
        if (orgIndex > -1) mockUserOrganizations[orgIndex] = { ...mockUserOrganizations[orgIndex], ...data, short_name: data.short_name || mockUserOrganizations[orgIndex].short_name, long_name: data.long_name || mockUserOrganizations[orgIndex].long_name }
        return mockOrganizationDetails[orgId] as T;
      }
      const error = new Error("Mock: Organization not found for update") as any; error.status = 404; throw error;
    }
    if (endpoint.startsWith("/organizations/") && endpoint.endsWith("/status") && method === "PUT") {
      const orgId = endpoint.substring("/organizations/".length).replace("/status", "");
      const data = body as UpdateOrganizationStatusRequest;
      if (mockOrganizationDetails[orgId]) {
        mockOrganizationDetails[orgId].status = data.status;
        mockOrganizationDetails[orgId].is_active = data.status === "ACTIVE";
        mockOrganizationDetails[orgId].updated_at = new Date().toISOString();
        const orgIndex = mockUserOrganizations.findIndex(o => o.organization_id === orgId);
        if (orgIndex > -1) mockUserOrganizations[orgIndex].status = data.status;
        return mockOrganizationDetails[orgId] as T;
      }
      const error = new Error("Mock: Organization not found for status update") as any; error.status = 404; throw error;
    }
    if (endpoint.match(/\/(ORGANIZATION|AGENCY)\/([^/]+)\/addresses$/) && method === "GET") {
      const parts = endpoint.match(/\/(ORGANIZATION|AGENCY)\/([^/]+)\/addresses$/);
      const addressableId = parts![2]; // orgId or agencyId
      return (mockOrgAddresses[addressableId] || []) as T;
    }
    if (endpoint.match(/\/(ORGANIZATION|AGENCY)\/([^/]+)\/contacts$/) && method === "GET") {
      const parts = endpoint.match(/\/(ORGANIZATION|AGENCY)\/([^/]+)\/contacts$/);
      const contactableId = parts![2];
      return (mockOrgContacts[contactableId] || []) as T;
    }
    if (endpoint === "/business-domains" && method === "GET") {
      return mockAvailableBusinessDomains as T;
    }
    // Add more mock handlers for organization service here
  }

  if (service === 'resource') {
    // Add mock handlers for resource management service here
    if (endpoint.match(/\/(.+)\/resources$/) && method === "GET") { // e.g. /org-id/resources
      return [] as T; // Return empty array for now
    }
    if (endpoint.match(/\/(.+)\/services$/) && method === "GET") { // e.g. /org-id/services
      return [] as T;
    }
  }

  if (service === 'product_state') {
    // Add mock handlers for product state management service here
  }

  console.warn(`MOCK API: Unhandled endpoint ${service} ${method} ${endpoint}`);
  if (method !== "GET") return { success: true, message: `Mocked ${method} to ${endpoint}` } as T;
  return {} as T; // Default empty for unmocked GET
}

// --- REAL API REQUEST LOGIC (from previous version) ---
async function realApiRequest<T = any>(
  endpoint: string,
  options: RequestOptions = {},
  isUserAuthAction: boolean = false,
  service: 'auth' | 'organization' | 'resource' | 'product_state'
): Promise<T> {
  let userAccessToken: string | null = null;
  if (!isUserAuthAction && !options.useClientBasicAuth) {
    userAccessToken = await getAuthToken();
  }

  const headers: HeadersInit = { ...(options.isFormData ? {} : { "Content-Type": "application/json" }), ...options.headers };

  if (options.useClientBasicAuth && CLIENT_BASIC_AUTH_TOKEN) {
    (headers as Record<string, string>)["Authorization"] = CLIENT_BASIC_AUTH_TOKEN;
  } else if (userAccessToken) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${userAccessToken}`;
  } else if (options.useClientBasicAuth && !CLIENT_BASIC_AUTH_TOKEN) {
    console.error("Client basic auth requested but token not configured.");
    // Potentially throw an error or handle this as a critical configuration issue.
    // For now, the request will proceed without Authorization if this condition is met.
  }

  let baseUrl = "";
  switch (service) {
    case 'auth': baseUrl = AUTH_API_BASE_URL; break;
    case 'organization': baseUrl = ORGANIZATION_API_BASE_URL; break;
    case 'resource': baseUrl = RESOURCE_API_BASE_URL; break;
    case 'product_state': baseUrl = PRODUCT_STATE_API_BASE_URL; break;
    default: throw new Error("Invalid service specified for API request.");
  }
  // options.customBaseUrl is removed as 'service' parameter now dictates the base URL.

  const fullUrl = `${baseUrl}${endpoint}`;
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
      } catch (e) { /* ignore if response is not JSON */ }
      console.error(`API Error: ${errorMessage} for ${fullUrl}`, { data: errorData, options: config });
      if (!(isUserAuthAction && (response.status === 401 || response.status === 403))) {
        toast.error(errorMessage);
      }
      const error = new Error(errorMessage) as any;
      error.status = response.status; error.data = errorData;
      throw error;
    }
    if (response.status === 204 || response.headers.get("content-length") === "0") return null as T;
    return (await response.json()) as T;
  } catch (error: any) {
    if (!error.status && !(error instanceof SyntaxError)) { // Avoid logging SyntaxError from failed .json() parse twice
      console.error("Network or unhandled API error:", error);
      if (!isUserAuthAction) { // Avoid double toasting if NextAuth handles it for login/register
        toast.error("Network error or server unreachable.");
      }
    }
    throw error;
  }
}

// Combined request function
const combinedApiRequest = USE_MOCK_API ? mockApiRequest : realApiRequest;

// --- EXPORTED API OBJECTS ---
export const authApi = {
  register: (data: CreateUserRequest) => combinedApiRequest<UserDto>("/api/register", { method: "POST", body: JSON.stringify(data), useClientBasicAuth: true }, true, 'auth'),
  login: (data: AuthRequest) => combinedApiRequest<LoginResponse>("/api/login", { method: "POST", body: JSON.stringify(data), useClientBasicAuth: true }, true, 'auth'),
  getCurrentUser: () => combinedApiRequest<UserInfo>("/api/user", { method: "GET" }, false, 'auth'),
};

export const organizationApi = {
  getMyOrganizations: () => combinedApiRequest<OrganizationTableRow[]>("/organizations/user", { method: "GET" }, false, 'organization'),
  getOrganizationById: (orgId: string) => combinedApiRequest<OrganizationDto>(`/organizations/${orgId}`, { method: "GET" }, false, 'organization'),
  createOrganization: (data: CreateOrganizationRequest) => combinedApiRequest<OrganizationDto>("/organizations", { method: "POST", body: JSON.stringify(data) }, false, 'organization'),
  updateOrganization: (orgId: string, data: UpdateOrganizationRequest) => combinedApiRequest<OrganizationDto>(`/organizations/${orgId}`, { method: "PUT", body: JSON.stringify(data) }, false, 'organization'),
  updateOrganizationStatus: (orgId: string, data: UpdateOrganizationStatusRequest) => combinedApiRequest<OrganizationDto>(`/organizations/${orgId}/status`, { method: "PUT", body: JSON.stringify(data) }, false, 'organization'),
  getAddresses: (addressableType: AddressableType, addressableId: string) => combinedApiRequest<AddressDto[]>(`/${addressableType}/${addressableId}/addresses`, { method: "GET" }, false, 'organization'),
  createAddress: (addressableType: AddressableType, addressableId: string, data: CreateAddressRequest) => combinedApiRequest<AddressDto>(`/${addressableType}/${addressableId}/addresses`, { method: "POST", body: JSON.stringify(data) }, false, 'organization'),
  getContacts: (contactableType: ContactableType, contactableId: string) => combinedApiRequest<ContactDto[]>(`/${contactableType}/${contactableId}/contacts`, { method: "GET" }, false, 'organization'),
  createContact: (contactableType: ContactableType, contactableId: string, data: CreateContactRequest) => combinedApiRequest<ContactDto>(`/${contactableType}/${contactableId}/contacts`, { method: "POST", body: JSON.stringify(data) }, false, 'organization'),
  getAllBusinessDomains: (params?: GetBusinessDomainRequest) => {
    // For GET requests with query params, they need to be stringified if using fetch directly.
    // Or, use URLSearchParams. For mock, we can ignore params for now.
    const queryParams = params ? `?${new URLSearchParams(params as any).toString()}` : "";
    return combinedApiRequest<BusinessDomainDto[]>(`/business-domains${queryParams}`, { method: "GET" }, false, 'organization');
  },
  // ... Add other organizationApi functions here, calling combinedApiRequest with service: 'organization'
};

export const resourceManagementApi = {
  getResources: (orgId: string) => combinedApiRequest<ResourceDto[]>(`/${orgId}/resources`, { method: "GET" }, false, 'resource'),
  createResource: (orgId: string, data: CreateResourceRequest) => combinedApiRequest<ResourceDto>(`/${orgId}/resources`, { method: "POST", body: JSON.stringify(data) }, false, 'resource'),
  getServices: (orgId: string) => combinedApiRequest<ServiceDto[]>(`/${orgId}/services`, { method: "GET" }, false, 'resource'),
  createService: (orgId: string, data: CreateServiceRequest) => combinedApiRequest<ServiceDto>(`/${orgId}/services`, { method: "POST", body: JSON.stringify(data) }, false, 'resource'),
  // ... Add other resourceManagementApi functions here, calling combinedApiRequest with service: 'resource'
};

export const productStateApi = {
  updateResourceState: (resourceId: string, data: { currentState: string }) => combinedApiRequest(`/api/resource/${resourceId}`, { method: "PUT", body: JSON.stringify(data) }, false, 'product_state'),
  updateServiceState: (serviceId: string, data: { currentState: string }) => combinedApiRequest(`/api/service/${serviceId}`, { method: "PUT", body: JSON.stringify(data) }, false, 'product_state'),
};