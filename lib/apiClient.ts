/**
 * @file This file centralizes all API client logic for interacting with Yowyob microservices.
 * It includes a robust request handler (`yowyobApiRequest`) that manages different
 * authentication strategies as specified by the Yowyob API documentation.
 */

import { getSession } from "next-auth/react";
import { systemTokenManager } from "@/lib/auth/system-token-manager";

// Type imports from across the application
import {
  AuthRequest, CreateUserRequest, LoginResponse, UserDto, UserInfo,
  RoleDto, CreateRoleRequest, UpdateRoleRequest,
  PermissionDto, CreatePermissionRequest, UpdatePermissionRequest,
  RolePermissionDto, RbacResource, ApiResponseBoolean
} from "@/types/auth";
import {
  CreateOrganizationRequest, UpdateOrganizationRequest, UpdateOrganizationStatusRequest, AddressDto, ContactDto, CreateAddressRequest, UpdateAddressRequest, ContactableType, AddressableType, CreateContactRequest, UpdateContactRequest, BusinessDomainDto, GetBusinessDomainRequest, AffectEmployeeRequest, AgencyDto, ApplicationDto,
  ApplicationKeyDto,
  BusinessActorDto,
  BusinessActorType,
  CertificationDto,
  CreateAgencyRequest,
  CreateApplicationRequest,
  CreateBusinessActorRequest,
  CreateBusinessDomainRequest,
  CreateCertificationRequest,
  CreateEmployeeRequest,
  CreatePracticalInformationRequest,
  CreateProviderRequest,
  EmployeeDto,
  ImageDto,
  PracticalInformationDto,
  ProviderDto,
  UpdateAgencyRequest,
  UpdateAgencyStatusRequest,
  UpdateBusinessActorRequest,
  UpdateBusinessDomainRequest,
  UpdateCertificationRequest,
  UpdateEmployeeRequest,
  UpdatePracticalInformationRequest,
  EmployeeResponse,
  AffectCustomerRequest,
  AffectProviderRequest,
  CreateCustomerRequest,
  CreateProposedActivityRequest,
  CreateProspectRequest,
  CreateSalesPersonRequest,
  CreateThirdPartyRequest,
  CustomerDto,
  GetThirdPartyRequest,
  ProposedActivityDto,
  ProspectDto,
  SalesPersonDto,
  ThirdPartyDto,
  ThirdPartyType,
  UpdateCustomerRequest,
  UpdateProposedActivityRequest,
  UpdateProspectRequest,
  UpdateProviderRequest,
  UpdateSalesPersonRequest,
  UpdateThirdPartyRequest,
  UpdateThirdPartyStatusRequest,
  OrganizationDto
} from "@/types/organization";
import { MediaDto, MediaType, ServiceType, UploadMediaResponse, UploadRequest } from "@/types/media";

// --- API Configuration Constants ---

const YOWYOB_AUTH_API_BASE_URL = process.env.NEXT_PUBLIC_YOWYOB_AUTH_SERVICE_BASE_URL;
const YOWYOB_ORGANIZATION_API_BASE_URL = process.env.NEXT_PUBLIC_YOWYOB_ORGANIZATION_SERVICE_BASE_URL;
const YOWYOB_MEDIA_API_BASE_URL = process.env.NEXT_PUBLIC_YOWYOB_MEDIA_SERVICE_BASE_URL;

/** The Public Key for the calling application, required specifically for the Organization service. */
const YOWYOB_ORGANIZATION_PUBLIC_KEY = process.env.NEXT_PUBLIC_YOWYOB_APP_PUBLIC_KEY;

/** The local proxy endpoint that forwards requests to the target microservices. */
const PROXY_PATH = "/api/proxy";

// --- Type Definitions ---

interface ApiErrorResponse {
  timestamp?: string; status?: number; error?: string; message?: string; path?: string; errors?: Record<string, string>;
}

/** Defines the authentication strategy for an API request. */
type AuthType =
  | 'user'      // Authenticates with the logged-in user's JWT Bearer token.
  | 'system'    // Authenticates with a short-lived system-level OAuth2 token. Used for pre-login actions.
  | 'none';     // No authentication headers are sent.

interface YowyobRequestOptions extends RequestInit {
  /** Flag to indicate if the request body is FormData. */
  isFormData?: boolean;
  /** The authentication strategy to use. Defaults to 'user'. */
  authType?: AuthType;
}

// =========================================================================
//  CORE API REQUEST HANDLER
// =========================================================================
/**
 * A generic and robust function to handle all API requests to Yowyob microservices.
 * It manages authentication, proxying, and error handling in a centralized way.
 *
 * @template T The expected type of the successful response data.
 * @param {string | undefined} serviceBaseUrl The base URL of the target microservice.
 * @param {string} endpoint The specific API endpoint to call.
 * @param {YowyobRequestOptions} options Configuration for the fetch request, including auth type.
 * @returns {Promise<T>} A promise that resolves with the response data.
 */
async function yowyobApiRequest<T = any>(
  serviceBaseUrl: string | undefined,
  endpoint: string,
  options: YowyobRequestOptions = {}
): Promise<T> {
  // Default to 'user' authentication as most frontend actions are performed by a logged-in user.
  const { authType = 'user', body, ...fetchOptions } = options;

  if (!serviceBaseUrl) {
    throw new Error(`Service URL is not configured for endpoint: ${endpoint}`);
  }

  const targetUrl = `${serviceBaseUrl}${endpoint}`;
  const headers = new Headers(fetchOptions.headers);

  // --- Authentication Layer 1: Set Authorization Header ---
  // Sets the appropriate Bearer token based on the specified authType.
  if (authType === 'user') {
    const session = await getSession();
    if (!session?.user?.accessToken) {
      throw new Error("User authentication required, but the user is not logged in.");
    }
    headers.set('Authorization', `Bearer ${session.user.accessToken}`);
  } else if (authType === 'system') {
    // Used for pre-login/pre-auth actions like registration and login.
    const systemToken = await systemTokenManager.getSystemToken();
    headers.set('Authorization', `Bearer ${systemToken}`);
  }
  // For authType: 'none', no Authorization header is added.

  // --- Authentication Layer 2: Set Service-Specific Headers ---
  // As per documentation, only the Organization service requires an additional Public-Key.
  if (serviceBaseUrl === YOWYOB_ORGANIZATION_API_BASE_URL) {
    if (!YOWYOB_ORGANIZATION_PUBLIC_KEY) {
      console.warn(`YOWYOB_ORGANIZATION_PUBLIC_KEY is not set. Requests to the organization service will fail.`);
    } else {
      headers.set('Public-Key', YOWYOB_ORGANIZATION_PUBLIC_KEY);
    }
  }

  // Automatically set Content-Type for JSON bodies.
  if (body && !(body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  // --- Proxy Configuration ---
  // All requests are routed through a local Next.js API route to hide backend URLs and handle CORS.
  const proxyUrl = `${process.env.NEXT_PUBLIC_URL}${PROXY_PATH}/request`;
  const dynamicHeaders = Object.fromEntries(headers.entries());

  const finalHeaders = {
    'X-Target-URL': targetUrl, // The proxy uses this header to know where to forward the request.
    'Accept': '*/*',
    ...dynamicHeaders
  };

  const config: RequestInit = {
    ...fetchOptions,
    body: body,
    headers: finalHeaders,
    cache: 'no-store',
  };

  try {
    const response = await fetch(proxyUrl, config);

    // --- Robust Error Handling ---
    if (!response.ok) {
      let errorData: ApiErrorResponse = { message: `Request failed with status ${response.status}` };
      const contentType = response.headers.get("content-type");

      // Safely parse error response, checking content type first.
      if (contentType && contentType.includes("application/json")) {
        try {
          errorData = await response.json();
        } catch (jsonError) {
          errorData.message = `API returned status ${response.status}, but the error response body was not valid JSON.`;
        }
      } else {
        const textError = await response.text();
        errorData.message = textError || `Request failed with status ${response.status}`;
      }

      const errorMessage = errorData.message || (errorData.errors ? Object.values(errorData.errors).join(', ') : 'An unknown API error occurred.');
      console.error(`API Error: ${errorMessage}`, { targetUrl, status: response.status, responseData: errorData });

      const error = new Error(errorMessage) as Error & { status?: number; data?: any };
      error.status = response.status;
      error.data = errorData;
      throw error;
    }

    // Handle successful but empty responses (e.g., HTTP 204 No Content).
    if (response.status === 204 || response.headers.get("content-length") === "0") {
      return null as T;
    }

    const data = await response.json();

    // Handle cases where the API returns a 200 OK but with a failed status in the body.
    if (data.status === "FAILED") {
      let errorMessage = data.message || "An unknown API error occurred.";
      if (data.errors && typeof data.errors === "object") {
        const errorDetails = Object.entries(data.errors).map(([field, message]) => `${field}: ${message}`).join(", ");
        errorMessage += ` - ${errorDetails}`;
      }
      const error = new Error(errorMessage) as Error & { status?: number; data?: any };
      error.status = 400; // Treat as a client error.
      error.data = data;
      throw error;
    }
    return data as T;
  } catch (error) {
    if (!(error instanceof Error && 'status' in error)) {
      console.error("A network or unexpected error occurred:", error);
    }
    throw error;
  }
}

// =========================================================================
//  AUTH SERVICE API CLIENT
// =========================================================================
export const yowyobAuthApi = {
  /** Registers a new user. Requires system-level auth as no user is logged in yet. */
  register: (data: CreateUserRequest) => yowyobApiRequest<UserDto>(YOWYOB_AUTH_API_BASE_URL, "/api/register", { method: "POST", body: JSON.stringify(data), authType: 'system' }),

  /** Logs in a user. Requires system-level auth to get a user-specific JWT. */
  login: (data: AuthRequest) => yowyobApiRequest<LoginResponse>(YOWYOB_AUTH_API_BASE_URL, "/api/login", { method: "POST", body: JSON.stringify(data), authType: 'system' }),

  /** Fetches information about the currently authenticated user. */
  getCurrentUser: () => yowyobApiRequest<UserInfo>(YOWYOB_AUTH_API_BASE_URL, "/api/user", { method: "GET", authType: 'user' }),

  /** The following are actions performed by an authenticated (likely admin) user. */
  getAllUsers: () => yowyobApiRequest<UserDto[]>(YOWYOB_AUTH_API_BASE_URL, "/api/users", { method: "GET", authType: 'user' }),
  getUserByUsername: (username: string) => yowyobApiRequest<UserDto>(YOWYOB_AUTH_API_BASE_URL, `/api/user/username/${username}`, { method: "GET", authType: 'user' }),
  getUserByPhoneNumber: (phoneNumber: string) => yowyobApiRequest<UserDto>(YOWYOB_AUTH_API_BASE_URL, `/api/user/phone-number/${phoneNumber}`, { method: "GET", authType: 'user' }),
  getUserByEmail: (email: string) => yowyobApiRequest<UserDto>(YOWYOB_AUTH_API_BASE_URL, `/api/user/email/${email}`, { method: "GET", authType: 'user' }),
  getRoles: () => yowyobApiRequest<RoleDto[]>(YOWYOB_AUTH_API_BASE_URL, "/api/roles", { method: "GET", authType: 'user' }),
  createRole: (data: CreateRoleRequest) => yowyobApiRequest<RoleDto>(YOWYOB_AUTH_API_BASE_URL, "/api/roles", { method: "POST", body: JSON.stringify(data), authType: 'user' }),
  updateRole: (roleId: string, data: UpdateRoleRequest) => yowyobApiRequest<RoleDto>(YOWYOB_AUTH_API_BASE_URL, `/api/roles/${roleId}`, { method: "PUT", body: JSON.stringify(data), authType: 'user' }),
  deleteRole: (roleId: string) => yowyobApiRequest<void>(YOWYOB_AUTH_API_BASE_URL, `/api/roles/${roleId}`, { method: "DELETE", authType: 'user' }),
  getAllPermissions: () => yowyobApiRequest<PermissionDto[]>(YOWYOB_AUTH_API_BASE_URL, "/api/permissions", { method: "GET", authType: 'user' }),
  getPermissionById: (permissionId: string) => yowyobApiRequest<PermissionDto>(YOWYOB_AUTH_API_BASE_URL, `/api/permissions/${permissionId}`, { method: "GET", authType: 'user' }),
  createPermission: (data: CreatePermissionRequest) => yowyobApiRequest<PermissionDto>(YOWYOB_AUTH_API_BASE_URL, "/api/permissions", { method: "POST", body: JSON.stringify(data), authType: 'user' }),
  updatePermission: (permissionId: string, data: UpdatePermissionRequest) => yowyobApiRequest<PermissionDto>(YOWYOB_AUTH_API_BASE_URL, `/api/permissions/${permissionId}`, { method: "PUT", body: JSON.stringify(data), authType: 'user' }),
  deletePermission: (permissionId: string) => yowyobApiRequest<void>(YOWYOB_AUTH_API_BASE_URL, `/api/permissions/${permissionId}`, { method: "DELETE", authType: 'user' }),
  assignPermissionsToRole: (roleId: string, permissionIds: string[]) => yowyobApiRequest<RolePermissionDto[]>(YOWYOB_AUTH_API_BASE_URL, `/api/roles/${roleId}/permissions`, { method: "POST", body: JSON.stringify(permissionIds), authType: 'user' }),
  removePermissionsFromRole: (roleId: string, permissionIds: string[]) => yowyobApiRequest<void>(YOWYOB_AUTH_API_BASE_URL, `/api/roles/${roleId}/permissions`, { method: "DELETE", body: JSON.stringify(permissionIds), authType: 'user' }),
  assignPermissionToRole: (roleId: string, permissionId: string) => yowyobApiRequest<RolePermissionDto>(YOWYOB_AUTH_API_BASE_URL, `/api/roles/${roleId}/permissions/${permissionId}`, { method: "POST", authType: 'user' }),
  removePermissionFromRole: (roleId: string, permissionId: string) => yowyobApiRequest<void>(YOWYOB_AUTH_API_BASE_URL, `/api/roles/${roleId}/permissions/${permissionId}`, { method: "DELETE", authType: 'user' }),
  createRbacResource: (data: RbacResource) => yowyobApiRequest<ApiResponseBoolean>(YOWYOB_AUTH_API_BASE_URL, "/api/resources/save", { method: "POST", body: JSON.stringify(data), authType: 'user' }),
  getRolesHierarchy: () => yowyobApiRequest<string>(YOWYOB_AUTH_API_BASE_URL, "/api/roles/hierarchy", { method: "GET", authType: 'user' }),
};

// =========================================================================
//  MEDIA SERVICE API CLIENT
// =========================================================================
/**
 * Media service operations are performed on behalf of a user, requiring user authentication.
 */
export const yowyobMediaApi = {
  uploadFile: (service: ServiceType, type: MediaType, path: string, resourceId: string | null, file: File, uploadRequest?: UploadRequest) => {
    const formData = new FormData();
    formData.append("file", file);
    if (uploadRequest) {
      formData.append("request", new Blob([JSON.stringify(uploadRequest)], { type: "application/json" }));
    }
    const endpoint = resourceId ? `/media/${service}/${type}/${path}/${resourceId}` : `/media/${service}/${type}/${path}`;
    // Uses FormData for multipart file upload and authenticates as the user.
    return yowyobApiRequest<UploadMediaResponse>(YOWYOB_MEDIA_API_BASE_URL, endpoint, { method: "POST", body: formData, isFormData: true, authType: 'user' });
  },
  updateFile: (service: ServiceType, type: MediaType, path: string, filename: string, file: File, uploadRequest?: UploadRequest) => {
    const formData = new FormData();
    formData.append("file", file);
    if (uploadRequest) {
      formData.append("request", new Blob([JSON.stringify(uploadRequest)], { type: "application/json" }));
    }
    const endpoint = `/media/${service}/${type}/${path}/${filename}`;
    return yowyobApiRequest<UploadMediaResponse>(YOWYOB_MEDIA_API_BASE_URL, endpoint, { method: "PUT", body: formData, isFormData: true, authType: 'user' });
  },
  deleteFile: (service: ServiceType, type: MediaType, path: string, filename: string) => {
    const endpoint = `/media/${service}/${type}/${path}/${filename}`;
    return yowyobApiRequest<boolean>(YOWYOB_MEDIA_API_BASE_URL, endpoint, { method: "DELETE", authType: 'user' });
  },
  getMediaForResource: (service: ServiceType, type: MediaType, path: string, resourceId: string) => {
    const endpoint = `/media/infos/${service}/${type}/${path}/${resourceId}`;
    return yowyobApiRequest<MediaDto[]>(YOWYOB_MEDIA_API_BASE_URL, endpoint, { method: "GET", authType: 'user' });
  },
};

// =========================================================================
//  ORGANIZATION SERVICE API CLIENT
// =========================================================================
/**
 * All calls to the Organization Service require dual authentication:
 * 1. The user's JWT Bearer token (`authType: 'user'`).
 * 2. The application's `Public-Key` header.
 * The `yowyobApiRequest` function handles adding both of these automatically for this service.
 */
export const yowyobOrganizationApi = {
  // --- Organization Endpoints ---
  getMyOrganizations: () => yowyobApiRequest<OrganizationDto[]>(YOWYOB_ORGANIZATION_API_BASE_URL, "/organizations/user", { method: "GET", authType: 'user' }),
  getAllOrganizations: () => yowyobApiRequest<OrganizationDto[]>(YOWYOB_ORGANIZATION_API_BASE_URL, "/organizations", { method: "GET", authType: 'user' }),
  getOrganizationsByDomain: (domainId: string) => yowyobApiRequest<OrganizationDto[]>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/domains/${domainId}`, { method: "GET", authType: 'user' }),
  getOrganizationById: (orgId: string) => yowyobApiRequest<OrganizationDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}`, { method: "GET", authType: 'user' }),
  createOrganization: (data: CreateOrganizationRequest) => yowyobApiRequest<OrganizationDto>(YOWYOB_ORGANIZATION_API_BASE_URL, "/organizations", { method: "POST", body: JSON.stringify(data), authType: 'user' }),
  updateOrganization: (orgId: string, data: UpdateOrganizationRequest) => yowyobApiRequest<OrganizationDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}`, { method: "PUT", body: JSON.stringify(data), authType: 'user' }),
  deleteOrganization: (orgId: string) => yowyobApiRequest<void>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}`, { method: "DELETE", authType: 'user' }),
  updateOrganizationStatus: (orgId: string, data: UpdateOrganizationStatusRequest) => yowyobApiRequest<OrganizationDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/status`, { method: "PUT", body: JSON.stringify(data), authType: 'user' }),
  addBusinessDomainToOrg: (orgId: string, businessDomainId: string) => yowyobApiRequest<OrganizationDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/domains/${businessDomainId}`, { method: "PUT", authType: 'user' }),
  removeBusinessDomainFromOrg: (orgId: string, businessDomainId: string) => yowyobApiRequest<OrganizationDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/domains/${businessDomainId}`, { method: "DELETE", authType: 'user' }),

  // --- Contact & Address Endpoints ---
  getContacts: (contactableType: ContactableType, contactableId: string) => yowyobApiRequest<ContactDto[]>(YOWYOB_ORGANIZATION_API_BASE_URL, `/${contactableType}/${contactableId}/contacts`, { method: "GET", authType: 'user' }),
  getContactById: (contactableType: ContactableType, contactableId: string, contactId: string) => yowyobApiRequest<ContactDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/${contactableType}/${contactableId}/contacts/${contactId}`, { method: "GET", authType: 'user' }),
  createContact: (contactableType: ContactableType, contactableId: string, data: CreateContactRequest) => yowyobApiRequest<ContactDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/${contactableType}/${contactableId}/contacts`, { method: "POST", body: JSON.stringify(data), authType: 'user' }),
  updateContact: (contactableType: ContactableType, contactableId: string, contactId: string, data: UpdateContactRequest) => yowyobApiRequest<ContactDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/${contactableType}/${contactableId}/contacts/${contactId}`, { method: "PUT", body: JSON.stringify(data), authType: 'user' }),
  deleteContactById: (contactableType: ContactableType, contactableId: string, contactId: string) => yowyobApiRequest<void>(YOWYOB_ORGANIZATION_API_BASE_URL, `/${contactableType}/${contactableId}/contacts/${contactId}`, { method: "DELETE", authType: 'user' }),
  markContactAsFavorite: (contactableType: ContactableType, contactableId: string, contactId: string) => yowyobApiRequest<ContactDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/${contactableType}/${contactableId}/contacts/${contactId}/favorite`, { method: "PUT", authType: 'user' }),
  getAddresses: (addressableType: AddressableType, addressableId: string) => yowyobApiRequest<AddressDto[]>(YOWYOB_ORGANIZATION_API_BASE_URL, `/${addressableType}/${addressableId}/addresses`, { method: "GET", authType: 'user' }),
  getAddressById: (addressableType: AddressableType, addressableId: string, addressId: string) => yowyobApiRequest<AddressDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/${addressableType}/${addressableId}/addresses/${addressId}`, { method: "GET", authType: 'user' }),
  createAddress: (addressableType: AddressableType, addressableId: string, data: CreateAddressRequest) => yowyobApiRequest<AddressDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/${addressableType}/${addressableId}/addresses`, { method: "POST", body: JSON.stringify(data), authType: 'user' }),
  updateAddress: (addressableType: AddressableType, addressableId: string, addressId: string, data: UpdateAddressRequest) => yowyobApiRequest<AddressDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/${addressableType}/${addressableId}/addresses/${addressId}`, { method: "PUT", body: JSON.stringify(data), authType: 'user' }),
  deleteAddressById: (addressableType: AddressableType, addressableId: string, addressId: string) => yowyobApiRequest<void>(YOWYOB_ORGANIZATION_API_BASE_URL, `/${addressableType}/${addressableId}/addresses/${addressId}`, { method: "DELETE", authType: 'user' }),
  markAddressAsFavorite: (addressableType: AddressableType, addressableId: string, addressId: string) => yowyobApiRequest<AddressDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/${addressableType}/${addressableId}/addresses/${addressId}/favorite`, { method: "PUT", authType: 'user' }),

  // --- Practical Information Endpoints ---
  getPracticalInformation: (orgId: string, params?: { organizationId: string }) => yowyobApiRequest<PracticalInformationDto[]>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations${orgId}/practical-infos`, { method: "GET", authType: 'user' }),
  createPracticalInformation: (orgId: string, data: CreatePracticalInformationRequest) => yowyobApiRequest<PracticalInformationDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations${orgId}/practical-infos`, { method: "POST", body: JSON.stringify(data), authType: 'user' }),
  getPracticalInformationById: (orgId: string, infoId: string) => yowyobApiRequest<PracticalInformationDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations${orgId}/practical-infos/${infoId}`, { method: "GET", authType: 'user' }),
  updatePracticalInformation: (orgId: string, infoId: string, data: UpdatePracticalInformationRequest) => yowyobApiRequest<PracticalInformationDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations${orgId}/practical-infos/${infoId}`, { method: "PUT", body: JSON.stringify(data), authType: 'user' }),
  deletePracticalInformation: (orgId: string, infoId: string) => yowyobApiRequest<void>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations${orgId}/practical-infos/${infoId}`, { method: "DELETE", authType: 'user' }),

  // --- Certification Endpoints ---
  getCertifications: (orgId: string) => yowyobApiRequest<CertificationDto[]>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/certifications`, { method: "GET", authType: 'user' }),
  createCertification: (orgId: string, data: CreateCertificationRequest) => yowyobApiRequest<CertificationDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/certifications`, { method: "POST", body: JSON.stringify(data), authType: 'user' }),
  getCertificationById: (orgId: string, certId: string) => yowyobApiRequest<CertificationDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/certifications/${certId}`, { method: "GET", authType: 'user' }),
  updateCertification: (orgId: string, certId: string, data: UpdateCertificationRequest) => yowyobApiRequest<CertificationDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/certifications/${certId}`, { method: "PUT", body: JSON.stringify(data), authType: 'user' }),
  deleteCertification: (orgId: string, certId: string) => yowyobApiRequest<void>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/certifications/${certId}`, { method: "DELETE", authType: 'user' }),

  // --- Business Domain Endpoints ---
  getAllBusinessDomains: (params?: GetBusinessDomainRequest) => {
    const queryParams = params ? `?${new URLSearchParams(Object.entries(params).filter(([, v]) => v != null) as [string, string][]).toString()}` : "";
    return yowyobApiRequest<BusinessDomainDto[]>(YOWYOB_ORGANIZATION_API_BASE_URL, `/business-domains${queryParams}`, { method: "GET", authType: 'user' });
  },
  getBusinessDomainById: (domainId: string) => yowyobApiRequest<BusinessDomainDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/business-domains/${domainId}`, { method: "GET", authType: 'user' }),
  createBusinessDomain: (data: CreateBusinessDomainRequest) => yowyobApiRequest<BusinessDomainDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/business-domains`, { method: "POST", body: JSON.stringify(data), authType: 'user' }),
  updateBusinessDomain: (domainId: string, data: UpdateBusinessDomainRequest) => yowyobApiRequest<BusinessDomainDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/business-domains/${domainId}`, { method: "PUT", body: JSON.stringify(data), authType: 'user' }),
  deleteBusinessDomain: (domainId: string) => yowyobApiRequest<void>(YOWYOB_ORGANIZATION_API_BASE_URL, `/business-domains/${domainId}`, { method: "DELETE", authType: 'user' }),

  // --- Agency Endpoints ---
  getAgencies: (orgId: string, active?: boolean) => {
    // TODO: Illegal pattern
    const endpoint = `/organizations/${orgId}/agencies`;
    // if (active !== undefined) endpoint += `?active=${active}`;
    return yowyobApiRequest<AgencyDto[]>(YOWYOB_ORGANIZATION_API_BASE_URL, endpoint, { method: "GET", authType: 'user' });
  },
  createAgency: (orgId: string, data: CreateAgencyRequest) => yowyobApiRequest<AgencyDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/agencies`, { method: "POST", body: JSON.stringify(data), authType: 'user' }),
  getAgencyById: (orgId: string, agencyId: string) => yowyobApiRequest<AgencyDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/agencies/${agencyId}`, { method: "GET", authType: 'user' }),
  updateAgency: (orgId: string, agencyId: string, data: UpdateAgencyRequest) => yowyobApiRequest<AgencyDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/agencies/${agencyId}`, { method: "PUT", body: JSON.stringify(data), authType: 'user' }),
  deleteAgency: (orgId: string, agencyId: string) => yowyobApiRequest<void>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/agencies/${agencyId}`, { method: "DELETE", authType: 'user' }),
  updateAgencyStatus: (orgId: string, agencyId: string, data: UpdateAgencyStatusRequest) => yowyobApiRequest<AgencyDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/agencies/${agencyId}/status`, { method: "PUT", body: JSON.stringify(data), authType: 'user' }),

  // --- Employee Endpoints ---
  getOrgEmployees: (orgId: string) => yowyobApiRequest<EmployeeDto[]>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/employees`, { method: "GET", authType: 'user' }),
  createOrgEmployee: (orgId: string, data: CreateEmployeeRequest) => yowyobApiRequest<EmployeeResponse>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/employees`, { method: "POST", body: JSON.stringify(data), authType: 'user' }),
  getOrgEmployeeById: (orgId: string, employeeId: string) => yowyobApiRequest<EmployeeDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/employees/${employeeId}`, { method: "GET", authType: 'user' }),
  updateOrgEmployee: (orgId: string, employeeId: string, data: UpdateEmployeeRequest) => yowyobApiRequest<EmployeeResponse>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/employees/${employeeId}`, { method: "PUT", body: JSON.stringify(data), authType: 'user' }),
  deleteOrgEmployee: (orgId: string, employeeId: string) => yowyobApiRequest<void>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/employees/${employeeId}`, { method: "DELETE", authType: 'user' }),
  getAgencyEmployees: (orgId: string, agencyId: string) => yowyobApiRequest<EmployeeDto[]>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/agencies/${agencyId}/employees`, { method: "GET", authType: 'user' }),
  createAgencyEmployee: (orgId: string, agencyId: string, data: CreateEmployeeRequest) => yowyobApiRequest<EmployeeResponse>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/agencies/${agencyId}/employees`, { method: "POST", body: JSON.stringify(data), authType: 'user' }),
  getAgencyEmployeeById: (orgId: string, agencyId: string, employeeId: string) => yowyobApiRequest<EmployeeDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/agencies/${agencyId}/employees/${employeeId}`, { method: "GET", authType: 'user' }),
  updateAgencyEmployee: (orgId: string, agencyId: string, employeeId: string, data: UpdateEmployeeRequest) => yowyobApiRequest<EmployeeResponse>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/agencies/${agencyId}/employees/${employeeId}`, { method: "PUT", body: JSON.stringify(data), authType: 'user' }),
  deleteAgencyEmployee: (orgId: string, agencyId: string, employeeId: string) => yowyobApiRequest<void>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/agencies/${agencyId}/employees/${employeeId}`, { method: "DELETE", authType: 'user' }),
  affectEmployeeToAgency: (orgId: string, agencyId: string, data: AffectEmployeeRequest) => yowyobApiRequest<EmployeeResponse>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/agencies/${agencyId}/employees/add`, { method: "POST", body: JSON.stringify(data), authType: 'user' }),

  // --- SalesPerson Endpoints ---
  getOrgSalesPersons: (orgId: string) => yowyobApiRequest<SalesPersonDto[]>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/sales-people`, { method: "GET", authType: 'user' }),
  createOrgSalesPerson: (orgId: string, data: CreateSalesPersonRequest) => yowyobApiRequest<SalesPersonDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/sales-people`, { method: "POST", body: JSON.stringify(data), authType: 'user' }),
  getOrgSalesPersonById: (orgId: string, salesPersonId: string) => yowyobApiRequest<SalesPersonDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/sales-people/${salesPersonId}`, { method: "GET", authType: 'user' }),
  updateOrgSalesPerson: (orgId: string, salesPersonId: string, data: UpdateSalesPersonRequest) => yowyobApiRequest<SalesPersonDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/sales-people/${salesPersonId}`, { method: "PUT", body: JSON.stringify(data), authType: 'user' }),
  deleteOrgSalesPerson: (orgId: string, salesPersonId: string) => yowyobApiRequest<void>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/sales-people/${salesPersonId}`, { method: "DELETE", authType: 'user' }),
  getAgencySalesPersons: (orgId: string, agencyId: string) => yowyobApiRequest<SalesPersonDto[]>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/agencies/${agencyId}/sales-people`, { method: "GET", authType: 'user' }),
  createAgencySalesPerson: (orgId: string, agencyId: string, data: CreateSalesPersonRequest) => yowyobApiRequest<SalesPersonDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/agencies/${agencyId}/sales-people`, { method: "POST", body: JSON.stringify(data), authType: 'user' }),
  getAgencySalesPersonById: (orgId: string, agencyId: string, salesPersonId: string) => yowyobApiRequest<SalesPersonDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/agencies/${agencyId}/sales-people/${salesPersonId}`, { method: "GET", authType: 'user' }),
  updateAgencySalesPerson: (orgId: string, agencyId: string, salesPersonId: string, data: UpdateSalesPersonRequest) => yowyobApiRequest<SalesPersonDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/agencies/${agencyId}/sales-people/${salesPersonId}`, { method: "PUT", body: JSON.stringify(data), authType: 'user' }),
  deleteAgencySalesPerson: (orgId: string, agencyId: string, salesPersonId: string) => yowyobApiRequest<void>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/agencies/${agencyId}/sales-people/${salesPersonId}`, { method: "DELETE", authType: 'user' }),

  // --- Customer Endpoints ---
  getOrgCustomers: (orgId: string) => yowyobApiRequest<CustomerDto[]>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/customers`, { method: "GET", authType: 'user' }),
  createOrgCustomer: (orgId: string, data: CreateCustomerRequest) => yowyobApiRequest<CustomerDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/customers`, { method: "POST", body: JSON.stringify(data), authType: 'user' }),
  getOrgCustomerById: (orgId: string, customerId: string) => yowyobApiRequest<CustomerDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/customers/${customerId}`, { method: "GET", authType: 'user' }),
  updateOrgCustomer: (orgId: string, customerId: string, data: UpdateCustomerRequest) => yowyobApiRequest<CustomerDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/customers/${customerId}`, { method: "PUT", body: JSON.stringify(data), authType: 'user' }),
  deleteOrgCustomer: (orgId: string, customerId: string) => yowyobApiRequest<void>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/customers/${customerId}`, { method: "DELETE", authType: 'user' }),
  getAgencyCustomers: (orgId: string, agencyId: string) => yowyobApiRequest<CustomerDto[]>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/agencies/${agencyId}/customers`, { method: "GET", authType: 'user' }),
  createAgencyCustomer: (orgId: string, agencyId: string, data: CreateCustomerRequest) => yowyobApiRequest<CustomerDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/agencies/${agencyId}/customers`, { method: "POST", body: JSON.stringify(data), authType: 'user' }),
  getAgencyCustomerById: (orgId: string, agencyId: string, customerId: string) => yowyobApiRequest<CustomerDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/agencies/${agencyId}/customers/${customerId}`, { method: "GET", authType: 'user' }),
  updateAgencyCustomer: (orgId: string, agencyId: string, customerId: string, data: UpdateCustomerRequest) => yowyobApiRequest<CustomerDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/agencies/${agencyId}/customers/${customerId}`, { method: "PUT", body: JSON.stringify(data), authType: 'user' }),
  deleteAgencyCustomer: (orgId: string, agencyId: string, customerId: string) => yowyobApiRequest<void>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/agencies/${agencyId}/customers/${customerId}`, { method: "DELETE", authType: 'user' }),
  affectCustomerToAgency: (orgId: string, agencyId: string, data: AffectCustomerRequest) => yowyobApiRequest<CustomerDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/agencies/${agencyId}/customers/add`, { method: "POST", body: JSON.stringify(data), authType: 'user' }),

  // --- Supplier (Provider) Endpoints ---
  getOrgSuppliers: (orgId: string) => yowyobApiRequest<ProviderDto[]>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/suppliers`, { method: "GET", authType: 'user' }),
  createOrgSupplier: (orgId: string, data: CreateProviderRequest) => yowyobApiRequest<ProviderDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/suppliers`, { method: "POST", body: JSON.stringify(data), authType: 'user' }),
  getOrgSupplierById: (orgId: string, providerId: string) => yowyobApiRequest<ProviderDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/suppliers/${providerId}`, { method: "GET", authType: 'user' }),
  updateOrgSupplier: (orgId: string, providerId: string, data: UpdateProviderRequest) => yowyobApiRequest<ProviderDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/suppliers/${providerId}`, { method: "PUT", body: JSON.stringify(data), authType: 'user' }),
  deleteOrgSupplier: (orgId: string, providerId: string) => yowyobApiRequest<void>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/suppliers/${providerId}`, { method: "DELETE", authType: 'user' }),
  getAgencySuppliers: (orgId: string, agencyId: string) => yowyobApiRequest<ProviderDto[]>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/agencies/${agencyId}/suppliers`, { method: "GET", authType: 'user' }),
  createAgencySupplier: (orgId: string, agencyId: string, data: CreateProviderRequest) => yowyobApiRequest<ProviderDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/agencies/${agencyId}/suppliers`, { method: "POST", body: JSON.stringify(data), authType: 'user' }),
  getAgencySupplierById: (orgId: string, agencyId: string, providerId: string) => yowyobApiRequest<ProviderDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/agencies/${agencyId}/suppliers/${providerId}`, { method: "GET", authType: 'user' }),
  updateAgencySupplier: (orgId: string, agencyId: string, providerId: string, data: UpdateProviderRequest) => yowyobApiRequest<ProviderDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/agencies/${agencyId}/suppliers/${providerId}`, { method: "PUT", body: JSON.stringify(data), authType: 'user' }),
  deleteAgencySupplier: (orgId: string, agencyId: string, providerId: string) => yowyobApiRequest<void>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/agencies/${agencyId}/suppliers/${providerId}`, { method: "DELETE", authType: 'user' }),
  affectSupplierToAgency: (orgId: string, agencyId: string, data: AffectProviderRequest) => yowyobApiRequest<ProviderDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/agencies/${agencyId}/suppliers/add`, { method: "POST", body: JSON.stringify(data), authType: 'user' }),

  // --- Prospect Endpoints ---
  getOrgProspects: (orgId: string) => yowyobApiRequest<ProspectDto[]>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/prospects`, { method: "GET", authType: 'user' }),
  createOrgProspect: (orgId: string, data: CreateProspectRequest) => yowyobApiRequest<ProspectDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/prospects`, { method: "POST", body: JSON.stringify(data), authType: 'user' }),
  getOrgProspectById: (orgId: string, prospectId: string) => yowyobApiRequest<ProspectDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/prospects/${prospectId}`, { method: "GET", authType: 'user' }),
  updateOrgProspect: (orgId: string, prospectId: string, data: UpdateProspectRequest) => yowyobApiRequest<ProspectDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/prospects/${prospectId}`, { method: "PUT", body: JSON.stringify(data), authType: 'user' }),
  deleteOrgProspect: (orgId: string, prospectId: string) => yowyobApiRequest<void>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/prospects/${prospectId}`, { method: "DELETE", authType: 'user' }),
  getAgencyProspects: (orgId: string, agencyId: string) => yowyobApiRequest<ProspectDto[]>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/agencies/${agencyId}/prospects`, { method: "GET", authType: 'user' }),
  createAgencyProspect: (orgId: string, agencyId: string, data: CreateProspectRequest) => yowyobApiRequest<ProspectDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/agencies/${agencyId}/prospects`, { method: "POST", body: JSON.stringify(data), authType: 'user' }),
  getAgencyProspectById: (orgId: string, agencyId: string, prospectId: string) => yowyobApiRequest<ProspectDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/agencies/${agencyId}/prospects/${prospectId}`, { method: "GET", authType: 'user' }),
  updateAgencyProspect: (orgId: string, agencyId: string, prospectId: string, data: UpdateProspectRequest) => yowyobApiRequest<ProspectDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/agencies/${agencyId}/prospects/${prospectId}`, { method: "PUT", body: JSON.stringify(data), authType: 'user' }),
  deleteAgencyProspect: (orgId: string, agencyId: string, prospectId: string) => yowyobApiRequest<void>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/agencies/${agencyId}/prospects/${prospectId}`, { method: "DELETE", authType: 'user' }),

  // --- Business Actor Endpoints ---
  getAllBusinessActors: () => yowyobApiRequest<BusinessActorDto[]>(YOWYOB_ORGANIZATION_API_BASE_URL, "/business-actors", { method: "GET", authType: 'user' }),
  createBusinessActor: (data: CreateBusinessActorRequest) => yowyobApiRequest<BusinessActorDto>(YOWYOB_ORGANIZATION_API_BASE_URL, "/business-actors", { method: "POST", body: JSON.stringify(data), authType: 'user' }),
  getBusinessActorById: (baId: string) => yowyobApiRequest<BusinessActorDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/business-actors/${baId}`, { method: "GET", authType: 'user' }),
  updateBusinessActor: (baId: string, data: UpdateBusinessActorRequest) => yowyobApiRequest<BusinessActorDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/business-actors/${baId}`, { method: "PUT", body: JSON.stringify(data), authType: 'user' }),
  deleteBusinessActor: (baId: string) => yowyobApiRequest<void>(YOWYOB_ORGANIZATION_API_BASE_URL, `/business-actors/${baId}`, { method: "DELETE", authType: 'user' }),
  getBusinessActorsByType: (type: BusinessActorType) => yowyobApiRequest<BusinessActorDto[]>(YOWYOB_ORGANIZATION_API_BASE_URL, `/business-actors/types/${type}`, { method: "GET", authType: 'user' }),

  // --- Image Endpoints ---
  uploadOrganizationImages: (orgId: string, formData: FormData) => yowyobApiRequest<ImageDto[]>(YOWYOB_ORGANIZATION_API_BASE_URL, `/images/${orgId}/add`, { method: "PUT", body: formData, isFormData: true, authType: 'user' }),
  getOrganizationImageInfo: (imageId: string) => yowyobApiRequest<ImageDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/images/${imageId}`, { method: "GET", authType: 'user' }),

  // --- Third Party Endpoints ---
  getThirdParties: (orgId: string, params: GetThirdPartyRequest) => yowyobApiRequest<ThirdPartyDto[]>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/third-parties?${new URLSearchParams(params as Record<string, string>).toString()}`, { method: "GET", authType: 'user' }),
  createThirdParty: (orgId: string, type: ThirdPartyType, data: CreateThirdPartyRequest) => yowyobApiRequest<ThirdPartyDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/third-parties/${type}`, { method: "POST", body: JSON.stringify(data), authType: 'user' }),
  getThirdPartyById: (orgId: string, thirdPartyId: string) => yowyobApiRequest<ThirdPartyDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/third-parties/${thirdPartyId}`, { method: "GET", authType: 'user' }),
  updateThirdParty: (orgId: string, thirdPartyId: string, data: UpdateThirdPartyRequest) => yowyobApiRequest<ThirdPartyDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/third-parties/${thirdPartyId}`, { method: "PUT", body: JSON.stringify(data), authType: 'user' }),
  deleteThirdParty: (orgId: string, thirdPartyId: string) => yowyobApiRequest<void>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/third-parties/${thirdPartyId}`, { method: "DELETE", authType: 'user' }),
  updateThirdPartyStatus: (orgId: string, thirdPartyId: string, data: UpdateThirdPartyStatusRequest) => yowyobApiRequest<ThirdPartyDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/third-parties/${thirdPartyId}/status`, { method: "PUT", body: JSON.stringify(data), authType: 'user' }),

  // --- Proposed Activity Endpoints ---
  getProposedActivities: (orgId: string, params: { organizationId: string }) => yowyobApiRequest<ProposedActivityDto[]>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/proposed-activities?${new URLSearchParams(params).toString()}`, { method: "GET", authType: 'user' }),
  createProposedActivity: (orgId: string, data: CreateProposedActivityRequest) => yowyobApiRequest<ProposedActivityDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/proposed-activities`, { method: "POST", body: JSON.stringify(data), authType: 'user' }),
  getProposedActivityById: (orgId: string, activityId: string) => yowyobApiRequest<ProposedActivityDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/proposed-activities/${activityId}`, { method: "GET", authType: 'user' }),
  updateProposedActivity: (orgId: string, activityId: string, data: UpdateProposedActivityRequest) => yowyobApiRequest<ProposedActivityDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/proposed-activities/${activityId}`, { method: "PUT", body: JSON.stringify(data), authType: 'user' }),
  deleteProposedActivity: (orgId: string, activityId: string) => yowyobApiRequest<void>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/proposed-activities/${activityId}`, { method: "DELETE", authType: 'user' }),

  // --- Application Endpoints ---
  getAllApplications: () => yowyobApiRequest<ApplicationDto[]>(YOWYOB_ORGANIZATION_API_BASE_URL, "/applications", { method: "GET", authType: 'user' }),
  createApplication: (data: CreateApplicationRequest) => yowyobApiRequest<ApplicationDto>(YOWYOB_ORGANIZATION_API_BASE_URL, "/applications", { method: "POST", body: JSON.stringify(data), authType: 'user' }),
  getApplicationKeys: (applicationId: string) => yowyobApiRequest<ApplicationKeyDto[]>(YOWYOB_ORGANIZATION_API_BASE_URL, `/applications/${applicationId}/keys`, { method: "GET", authType: 'user' }),
  createApiKey: (applicationId: string) => yowyobApiRequest<ApplicationKeyDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/applications/${applicationId}/keys/create`, { method: "POST", authType: 'user' }),
};