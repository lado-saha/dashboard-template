import { getSession } from "next-auth/react";

import {
  AuthRequest, CreateUserRequest, LoginResponse, UserDto, UserInfo,
  RoleDto, CreateRoleRequest, UpdateRoleRequest,
  PermissionDto, CreatePermissionRequest, UpdatePermissionRequest,
  RolePermissionDto, RbacResource, ApiResponseBoolean
} from "@/types/auth";
import {
  CreateOrganizationRequest, UpdateOrganizationRequest, UpdateOrganizationStatusRequest,
  AddressDto, ContactDto, CreateAddressRequest, UpdateAddressRequest, ContactableType, AddressableType, CreateContactRequest, UpdateContactRequest, BusinessDomainDto, GetBusinessDomainRequest,
  AffectEmployeeRequest,
  AgencyDto,
  ApplicationDto,
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
import crypto from "crypto";
import { systemTokenManager } from "@/lib/auth/system-token-manager";

interface ApiErrorResponse {
  timestamp?: string; status?: number; error?: string; message?: string; path?: string; errors?: Record<string, string>;
}

const YOWYOB_AUTH_API_BASE_URL = process.env.NEXT_PUBLIC_YOWYOB_AUTH_SERVICE_BASE_URL;
const YOWYOB_ORGANIZATION_API_BASE_URL = process.env.NEXT_PUBLIC_YOWYOB_ORGANIZATION_SERVICE_BASE_URL;
const YOWYOB_MEDIA_API_BASE_URL = process.env.NEXT_PUBLIC_YOWYOB_MEDIA_SERVICE_BASE_URL;
const PROXY_PATH = "/api/proxy"; // All requests go through here
const NEXT_PUBLIC_YOWYOB_APP_PUBLIC_KEY = process.env.NEXT_PUBLIC_YOWYOB_APP_PUBLIC_KEY;

interface YowyobRequestOptions extends RequestInit {
  isFormData?: boolean;
  useClientBasicAuth?: boolean;
}

type AuthType = 'user' | 'system' | 'none';

interface YowyobRequestOptions extends RequestInit {
  isFormData?: boolean;
  authType?: AuthType;
}

async function yowyobApiRequest<T = any>(
  serviceBaseUrl: string | undefined,
  endpoint: string,
  options: YowyobRequestOptions = {}
): Promise<T> {
  const { authType = 'user', body, ...fetchOptions } = options;

  if (!serviceBaseUrl) {
    throw new Error(`Service URL is not configured for endpoint: ${endpoint}`);
  }
  const targetUrl = `${serviceBaseUrl}${endpoint}`;
  const headers = new Headers(fetchOptions.headers);

  // Layer 1: Determine the correct Bearer token (User vs. System)
  if (authType === 'user') {
    const session = await getSession();
    if (!session?.user?.accessToken) {
      throw new Error("User is not authenticated for this request.");
    }
    headers.set('Authorization', `Bearer ${session.user.accessToken}`);
  } else if (authType === 'system') {
    const systemToken = await systemTokenManager.getSystemToken();
    headers.set('Authorization', `Bearer ${systemToken}`);
  }

  // Layer 2: Add the Application Public Key for the Organization service
  if (serviceBaseUrl === YOWYOB_ORGANIZATION_API_BASE_URL) {
    if (!NEXT_PUBLIC_YOWYOB_APP_PUBLIC_KEY) {
      console.warn(`YOWYOB_APP_PUBLIC_KEY is not set. Requests to ${serviceBaseUrl} may fail.`);
    } else {
      headers.set('Public-Key', NEXT_PUBLIC_YOWYOB_APP_PUBLIC_KEY);
    }
  }

  // Set Content-Type for non-FormData requests
  if (body && !(body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const config: RequestInit = {
    ...fetchOptions,
    headers,
    body: body,
    cache: 'no-store'
  };

  const proxyUrl = `${process.env.NEXT_PUBLIC_URL}${PROXY_PATH}/request`;
  headers.set('X-Target-URL', targetUrl);

  try {
    const response = await fetch(proxyUrl, config);

    // Check if the response is not successful (status >= 400)
    if (!response.ok) {
      let errorData: ApiErrorResponse = { message: `Request failed with status ${response.status}` };

      // Try parsing the response body as JSON
      try {
        errorData = await response.json();
      } catch (e) {
        // If parsing fails, we don't need to do anything additional.
      }

      // Prepare the error message, checking if there are field-specific errors
      const errorMessage = errorData.message || (errorData.errors ? Object.values(errorData.errors).join(', ') : 'An unknown API error occurred.');

      // Log the error with detailed information
      console.error(`API Error: ${errorMessage}`, { targetUrl: proxyUrl, status: response.status, responseData: errorData });

      // Create and throw an error with additional information
      const error = new Error(errorMessage) as Error & { status?: number; data?: any };
      error.status = response.status;
      error.data = errorData;
      throw error;
    }

    // If status is 204 (No Content) or the response body is empty, return null
    if (response.status === 204 || response.headers.get("content-length") === "0") return null;

    // Parse the response body as JSON
    const data = await response.json();

    // If the response has a "status" of "FAILED", handle the specific error case
    if (data.status === "FAILED") {
      let errorMessage = data.message || "An unknown API error occurred.";

      if (data.errors && typeof data.errors === "object") {
        const errorDetails = Object.entries(data.errors)
          .map(([field, message]) => `${field}: ${message}`)
          .join(", ");
        errorMessage += ` - ${errorDetails}`;
      }

      // Create and throw the error with specific details
      const error = new Error(errorMessage) as Error & { status?: number; data?: any };
      error.status = 400; // Assuming 400 for bad request errors
      error.data = data;
      throw error;
    }

    // If there is no error and the body is successfully parsed, return the data
    return data as T;

  } catch (error) {
    // Handle unexpected errors or network issues
    if (!(error instanceof Error && 'status' in error)) {
      console.error("A network or unexpected error occurred:", error);
    }
    // Rethrow the error to be handled further up the call stack
    throw error;
  }

}


// NEW: Media Service API object
export const yowyobMediaApi = {
  uploadFile: (
    service: ServiceType,
    type: MediaType,
    path: string,
    resourceId: string | null,
    file: File,
    uploadRequest?: UploadRequest
  ) => {
    const formData = new FormData();
    formData.append("file", file);
    if (uploadRequest) {
      formData.append("request", new Blob([JSON.stringify(uploadRequest)], { type: "application/json" }));
    }

    const endpoint = resourceId
      ? `/media/${service}/${type}/${path}/${resourceId}`
      : `/media/${service}/${type}/${path}`;

    return yowyobApiRequest<UploadMediaResponse>(YOWYOB_MEDIA_API_BASE_URL, endpoint, {
      method: "POST",
      body: formData,
      isFormData: true, // This is the key change for multipart requests
    });
  },

  updateFile: (
    service: ServiceType,
    type: MediaType,
    path: string,
    filename: string,
    file: File,
    uploadRequest?: UploadRequest
  ) => {
    const formData = new FormData();
    formData.append("file", file);
    if (uploadRequest) {
      formData.append("request", new Blob([JSON.stringify(uploadRequest)], { type: "application/json" }));
    }
    const endpoint = `/media/${service}/${type}/${path}/${filename}`;
    return yowyobApiRequest<UploadMediaResponse>(YOWYOB_MEDIA_API_BASE_URL, endpoint, {
      method: "PUT",
      body: formData,
      isFormData: true,
    });
  },

  deleteFile: (
    service: ServiceType,
    type: MediaType,
    path: string,
    filename: string
  ) => {
    const endpoint = `/media/${service}/${type}/${path}/${filename}`;
    return yowyobApiRequest<boolean>(YOWYOB_MEDIA_API_BASE_URL, endpoint, {
      method: "DELETE",
    });
  },

  getMediaForResource: (
    service: ServiceType,
    type: MediaType,
    path: string,
    resourceId: string
  ) => {
    const endpoint = `/media/infos/${service}/${type}/${path}/${resourceId}`;
    return yowyobApiRequest<MediaDto[]>(YOWYOB_MEDIA_API_BASE_URL, endpoint, { method: "GET" });
  },
};


export const yowyobAuthApi = {
  register: (data: CreateUserRequest) => yowyobApiRequest<UserDto>(YOWYOB_AUTH_API_BASE_URL, "/api/register", { method: "POST", body: JSON.stringify(data), headers: { "Content-Type": "application/json" }, useClientBasicAuth: true, authType: 'system' }),
  getAllUsers: () => yowyobApiRequest<UserDto[]>(YOWYOB_AUTH_API_BASE_URL, "/api/users", { method: "GET" }),
  getUserByUsername: (username: string) => yowyobApiRequest<UserDto>(YOWYOB_AUTH_API_BASE_URL, `/api/user/username/${username}`, { method: "GET" }),
  getUserByPhoneNumber: (phoneNumber: string) => yowyobApiRequest<UserDto>(YOWYOB_AUTH_API_BASE_URL, `/api/user/phone-number/${phoneNumber}`, { method: "GET" }),
  getUserByEmail: (email: string) => yowyobApiRequest<UserDto>(YOWYOB_AUTH_API_BASE_URL, `/api/user/email/${email}`, { method: "GET" }),
  login: (data: AuthRequest) => yowyobApiRequest<LoginResponse>(YOWYOB_AUTH_API_BASE_URL, "/api/login", { method: "POST", body: JSON.stringify(data), headers: { "Content-Type": "application/json" }, useClientBasicAuth: false, authType: 'system' }),
  getCurrentUser: () => yowyobApiRequest<UserInfo>(YOWYOB_AUTH_API_BASE_URL, "/api/user", { method: "GET" }),
  getRoles: () => yowyobApiRequest<RoleDto[]>(YOWYOB_AUTH_API_BASE_URL, "/api/roles", { method: "GET" }),
  createRole: (data: CreateRoleRequest) => yowyobApiRequest<RoleDto>(YOWYOB_AUTH_API_BASE_URL, "/api/roles", { method: "POST", body: JSON.stringify(data), headers: { "Content-Type": "application/json" } }),
  updateRole: (roleId: string, data: UpdateRoleRequest) => yowyobApiRequest<RoleDto>(YOWYOB_AUTH_API_BASE_URL, `/api/roles/${roleId}`, { method: "PUT", body: JSON.stringify(data), headers: { "Content-Type": "application/json" } }),
  deleteRole: (roleId: string) => yowyobApiRequest<void>(YOWYOB_AUTH_API_BASE_URL, `/api/roles/${roleId}`, { method: "DELETE" }),
  getAllPermissions: () => yowyobApiRequest<PermissionDto[]>(YOWYOB_AUTH_API_BASE_URL, "/api/permissions", { method: "GET" }),
  getPermissionById: (permissionId: string) => yowyobApiRequest<PermissionDto>(YOWYOB_AUTH_API_BASE_URL, `/api/permissions/${permissionId}`, { method: "GET" }),
  createPermission: (data: CreatePermissionRequest) => yowyobApiRequest<PermissionDto>(YOWYOB_AUTH_API_BASE_URL, "/api/permissions", { method: "POST", body: JSON.stringify(data), headers: { "Content-Type": "application/json" } }),
  updatePermission: (permissionId: string, data: UpdatePermissionRequest) => yowyobApiRequest<PermissionDto>(YOWYOB_AUTH_API_BASE_URL, `/api/permissions/${permissionId}`, { method: "PUT", body: JSON.stringify(data), headers: { "Content-Type": "application/json" } }),
  deletePermission: (permissionId: string) => yowyobApiRequest<void>(YOWYOB_AUTH_API_BASE_URL, `/api/permissions/${permissionId}`, { method: "DELETE" }),
  assignPermissionsToRole: (roleId: string, permissionIds: string[]) => yowyobApiRequest<RolePermissionDto[]>(YOWYOB_AUTH_API_BASE_URL, `/api/roles/${roleId}/permissions`, { method: "POST", body: JSON.stringify(permissionIds), headers: { "Content-Type": "application/json" } }),
  removePermissionsFromRole: (roleId: string, permissionIds: string[]) => yowyobApiRequest<void>(YOWYOB_AUTH_API_BASE_URL, `/api/roles/${roleId}/permissions`, { method: "DELETE", body: JSON.stringify(permissionIds), headers: { "Content-Type": "application/json" } }),
  assignPermissionToRole: (roleId: string, permissionId: string) => yowyobApiRequest<RolePermissionDto>(YOWYOB_AUTH_API_BASE_URL, `/api/roles/${roleId}/permissions/${permissionId}`, { method: "POST" }),
  removePermissionFromRole: (roleId: string, permissionId: string) => yowyobApiRequest<void>(YOWYOB_AUTH_API_BASE_URL, `/api/roles/${roleId}/permissions/${permissionId}`, { method: "DELETE" }),
  createRbacResource: (data: RbacResource) => yowyobApiRequest<ApiResponseBoolean>(YOWYOB_AUTH_API_BASE_URL, "/api/resources/save", { method: "POST", body: JSON.stringify(data), headers: { "Content-Type": "application/json" } }),
  getRolesHierarchy: () => yowyobApiRequest<string>(YOWYOB_AUTH_API_BASE_URL, "/api/roles/hierarchy", { method: "GET" }),
};

export const yowyobOrganizationApi = {
  getMyOrganizations: () => yowyobApiRequest<OrganizationDto[]>(YOWYOB_ORGANIZATION_API_BASE_URL, "/organizations/user"),
  getAllOrganizations: () => yowyobApiRequest<OrganizationDto[]>(YOWYOB_ORGANIZATION_API_BASE_URL, "/organizations"),
  getOrganizationsByDomain: (domainId: string) => yowyobApiRequest<OrganizationDto[]>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/domains/${domainId}`),
  getOrganizationById: (orgId: string) => yowyobApiRequest<OrganizationDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}`),
  createOrganization: (data: CreateOrganizationRequest) => yowyobApiRequest<OrganizationDto>(YOWYOB_ORGANIZATION_API_BASE_URL, "/organizations", { method: "POST", body: JSON.stringify(data), headers: { "Content-Type": "application/json" } }),
  updateOrganization: (orgId: string, data: UpdateOrganizationRequest) => yowyobApiRequest<OrganizationDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}`, { method: "PUT", body: JSON.stringify(data), headers: { "Content-Type": "application/json" } }),
  deleteOrganization: (orgId: string) => yowyobApiRequest<void>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}`, { method: "DELETE" }),
  updateOrganizationStatus: (orgId: string, data: UpdateOrganizationStatusRequest) => yowyobApiRequest<OrganizationDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/status`, { method: "PUT", body: JSON.stringify(data), headers: { "Content-Type": "application/json" } }),
  addBusinessDomainToOrg: (orgId: string, businessDomainId: string) => yowyobApiRequest<OrganizationDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/domains/${businessDomainId}`, { method: "PUT" }),
  removeBusinessDomainFromOrg: (orgId: string, businessDomainId: string) => yowyobApiRequest<OrganizationDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/domains/${businessDomainId}`, { method: "DELETE" }),
  getContacts: (contactableType: ContactableType, contactableId: string) => yowyobApiRequest<ContactDto[]>(YOWYOB_ORGANIZATION_API_BASE_URL, `/${contactableType}/${contactableId}/contacts`),
  getContactById: (contactableType: ContactableType, contactableId: string, contactId: string) => yowyobApiRequest<ContactDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/${contactableType}/${contactableId}/contacts/${contactId}`),
  createContact: (contactableType: ContactableType, contactableId: string, data: CreateContactRequest) => yowyobApiRequest<ContactDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/${contactableType}/${contactableId}/contacts`, { method: "POST", body: JSON.stringify(data), headers: { "Content-Type": "application/json" } }),
  updateContact: (contactableType: ContactableType, contactableId: string, contactId: string, data: UpdateContactRequest) => yowyobApiRequest<ContactDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/${contactableType}/${contactableId}/contacts/${contactId}`, { method: "PUT", body: JSON.stringify(data), headers: { "Content-Type": "application/json" } }),
  deleteContactById: (contactableType: ContactableType, contactableId: string, contactId: string) => yowyobApiRequest<void>(YOWYOB_ORGANIZATION_API_BASE_URL, `/${contactableType}/${contactableId}/contacts/${contactId}`, { method: "DELETE" }),
  markContactAsFavorite: (contactableType: ContactableType, contactableId: string, contactId: string) => yowyobApiRequest<ContactDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/${contactableType}/${contactableId}/contacts/${contactId}/favorite`, { method: "GET" }),
  getAddresses: (addressableType: AddressableType, addressableId: string) => yowyobApiRequest<AddressDto[]>(YOWYOB_ORGANIZATION_API_BASE_URL, `/${addressableType}/${addressableId}/addresses`),
  getAddressById: (addressableType: AddressableType, addressableId: string, addressId: string) => yowyobApiRequest<AddressDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/${addressableType}/${addressableId}/addresses/${addressId}`),
  createAddress: (addressableType: AddressableType, addressableId: string, data: CreateAddressRequest) => yowyobApiRequest<AddressDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/${addressableType}/${addressableId}/addresses`, { method: "POST", body: JSON.stringify(data), headers: { "Content-Type": "application/json" } }),
  updateAddress: (addressableType: AddressableType, addressableId: string, addressId: string, data: UpdateAddressRequest) => yowyobApiRequest<AddressDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/${addressableType}/${addressableId}/addresses/${addressId}`, { method: "PUT", body: JSON.stringify(data), headers: { "Content-Type": "application/json" } }),
  deleteAddressById: (addressableType: AddressableType, addressableId: string, addressId: string) => yowyobApiRequest<void>(YOWYOB_ORGANIZATION_API_BASE_URL, `/${addressableType}/${addressableId}/addresses/${addressId}`, { method: "DELETE" }),
  markAddressAsFavorite: (addressableType: AddressableType, addressableId: string, addressId: string) => yowyobApiRequest<AddressDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/${addressableType}/${addressableId}/addresses/${addressId}/favorite`, { method: "GET" }),
  getPracticalInformation: (orgId: string, params?: { organizationId: string }) => yowyobApiRequest<PracticalInformationDto[]>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/practical-infos${params ? '?' + new URLSearchParams(params).toString() : ''}`),
  createPracticalInformation: (orgId: string, data: CreatePracticalInformationRequest) => yowyobApiRequest<PracticalInformationDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/practical-infos`, { method: "POST", body: JSON.stringify(data), headers: { "Content-Type": "application/json" } }),
  getPracticalInformationById: (orgId: string, infoId: string) => yowyobApiRequest<PracticalInformationDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/practical-infos/${infoId}`),
  updatePracticalInformation: (orgId: string, infoId: string, data: UpdatePracticalInformationRequest) => yowyobApiRequest<PracticalInformationDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/practical-infos/${infoId}`, { method: "PUT", body: JSON.stringify(data), headers: { "Content-Type": "application/json" } }),
  deletePracticalInformation: (orgId: string, infoId: string) => yowyobApiRequest<void>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/practical-infos/${infoId}`, { method: "DELETE" }),
  getCertifications: (orgId: string) => yowyobApiRequest<CertificationDto[]>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/certifications`),
  createCertification: (orgId: string, data: CreateCertificationRequest) => yowyobApiRequest<CertificationDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/certifications`, { method: "POST", body: JSON.stringify(data), headers: { "Content-Type": "application/json" } }),
  getCertificationById: (orgId: string, certId: string) => yowyobApiRequest<CertificationDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/certifications/${certId}`),
  updateCertification: (orgId: string, certId: string, data: UpdateCertificationRequest) => yowyobApiRequest<CertificationDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/certifications/${certId}`, { method: "PUT", body: JSON.stringify(data), headers: { "Content-Type": "application/json" } }),
  deleteCertification: (orgId: string, certId: string) => yowyobApiRequest<void>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/certifications/${certId}`, { method: "DELETE" }),
  getAllBusinessDomains: (params?: GetBusinessDomainRequest) => {
    const queryParams = params ? `?${new URLSearchParams(Object.entries(params).filter(([, v]) => v != null) as [string, string][]).toString()}` : "";
    return yowyobApiRequest<BusinessDomainDto[]>(YOWYOB_ORGANIZATION_API_BASE_URL, `/business-domains${queryParams}`);
  },
  getBusinessDomainById: (domainId: string) => yowyobApiRequest<BusinessDomainDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/business-domains/${domainId}`),
  createBusinessDomain: (data: CreateBusinessDomainRequest) => yowyobApiRequest<BusinessDomainDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/business-domains`, { method: "POST", body: JSON.stringify(data), headers: { "Content-Type": "application/json" } }),
  updateBusinessDomain: (domainId: string, data: UpdateBusinessDomainRequest) => yowyobApiRequest<BusinessDomainDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/business-domains/${domainId}`, { method: "PUT", body: JSON.stringify(data), headers: { "Content-Type": "application/json" } }),
  deleteBusinessDomain: (domainId: string) => yowyobApiRequest<void>(YOWYOB_ORGANIZATION_API_BASE_URL, `/business-domains/${domainId}`, { method: "DELETE" }),
  getAgencies: (orgId: string, active?: boolean) => {
    let endpoint = `/organizations/${orgId}/agencies`;
    if (active !== undefined) endpoint += `?active=${active}`;
    return yowyobApiRequest<AgencyDto[]>(YOWYOB_ORGANIZATION_API_BASE_URL, endpoint);
  },
  createAgency: (orgId: string, data: CreateAgencyRequest) => yowyobApiRequest<AgencyDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/agencies`, { method: "POST", body: JSON.stringify(data), headers: { "Content-Type": "application/json" } }),
  getAgencyById: (orgId: string, agencyId: string) => yowyobApiRequest<AgencyDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/agencies/${agencyId}`),
  updateAgency: (orgId: string, agencyId: string, data: UpdateAgencyRequest) => yowyobApiRequest<AgencyDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/agencies/${agencyId}`, { method: "PUT", body: JSON.stringify(data), headers: { "Content-Type": "application/json" } }),
  deleteAgency: (orgId: string, agencyId: string) => yowyobApiRequest<void>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/agencies/${agencyId}`, { method: "DELETE" }),
  updateAgencyStatus: (orgId: string, agencyId: string, data: UpdateAgencyStatusRequest) => yowyobApiRequest<AgencyDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/agencies/${agencyId}/status`, { method: "PUT", body: JSON.stringify(data), headers: { "Content-Type": "application/json" } }),
  getOrgEmployees: (orgId: string) => yowyobApiRequest<EmployeeDto[]>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/employees`),
  createOrgEmployee: (orgId: string, data: CreateEmployeeRequest) => yowyobApiRequest<EmployeeResponse>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/employees`, { method: "POST", body: JSON.stringify(data), headers: { "Content-Type": "application/json" } }),
  getOrgEmployeeById: (orgId: string, employeeId: string) => yowyobApiRequest<EmployeeDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/employees/${employeeId}`),
  updateOrgEmployee: (orgId: string, employeeId: string, data: UpdateEmployeeRequest) => yowyobApiRequest<EmployeeResponse>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/employees/${employeeId}`, { method: "PUT", body: JSON.stringify(data), headers: { "Content-Type": "application/json" } }),
  deleteOrgEmployee: (orgId: string, employeeId: string) => yowyobApiRequest<void>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/employees/${employeeId}`, { method: "DELETE" }),
  getAgencyEmployees: (orgId: string, agencyId: string) => yowyobApiRequest<EmployeeDto[]>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/agencies/${agencyId}/employees`),
  createAgencyEmployee: (orgId: string, agencyId: string, data: CreateEmployeeRequest) => yowyobApiRequest<EmployeeResponse>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/agencies/${agencyId}/employees`, { method: "POST", body: JSON.stringify(data), headers: { "Content-Type": "application/json" } }),
  getAgencyEmployeeById: (orgId: string, agencyId: string, employeeId: string) => yowyobApiRequest<EmployeeDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/agencies/${agencyId}/employees/${employeeId}`),
  updateAgencyEmployee: (orgId: string, agencyId: string, employeeId: string, data: UpdateEmployeeRequest) => yowyobApiRequest<EmployeeResponse>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/agencies/${agencyId}/employees/${employeeId}`, { method: "PUT", body: JSON.stringify(data), headers: { "Content-Type": "application/json" } }),
  deleteAgencyEmployee: (orgId: string, agencyId: string, employeeId: string) => yowyobApiRequest<void>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/agencies/${agencyId}/employees/${employeeId}`, { method: "DELETE" }),
  affectEmployeeToAgency: (orgId: string, agencyId: string, data: AffectEmployeeRequest) => yowyobApiRequest<EmployeeResponse>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/agencies/${agencyId}/employees/add`, { method: "POST", body: JSON.stringify(data), headers: { "Content-Type": "application/json" } }),
  getOrgSalesPersons: (orgId: string) => yowyobApiRequest<SalesPersonDto[]>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/sales-people`),
  createOrgSalesPerson: (orgId: string, data: CreateSalesPersonRequest) => yowyobApiRequest<SalesPersonDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/sales-people`, { method: "POST", body: JSON.stringify(data), headers: { "Content-Type": "application/json" } }),
  getOrgSalesPersonById: (orgId: string, salesPersonId: string) => yowyobApiRequest<SalesPersonDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/sales-people/${salesPersonId}`),
  updateOrgSalesPerson: (orgId: string, salesPersonId: string, data: UpdateSalesPersonRequest) => yowyobApiRequest<SalesPersonDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/sales-people/${salesPersonId}`, { method: "PUT", body: JSON.stringify(data), headers: { "Content-Type": "application/json" } }),
  deleteOrgSalesPerson: (orgId: string, salesPersonId: string) => yowyobApiRequest<void>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/sales-people/${salesPersonId}`, { method: "DELETE" }),
  getAgencySalesPersons: (orgId: string, agencyId: string) => yowyobApiRequest<SalesPersonDto[]>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/agencies/${agencyId}/sales-people`),
  createAgencySalesPerson: (orgId: string, agencyId: string, data: CreateSalesPersonRequest) => yowyobApiRequest<SalesPersonDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/agencies/${agencyId}/sales-people`, { method: "POST", body: JSON.stringify(data), headers: { "Content-Type": "application/json" } }),
  getAgencySalesPersonById: (orgId: string, agencyId: string, salesPersonId: string) => yowyobApiRequest<SalesPersonDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/agencies/${agencyId}/sales-people/${salesPersonId}`),
  updateAgencySalesPerson: (orgId: string, agencyId: string, salesPersonId: string, data: UpdateSalesPersonRequest) => yowyobApiRequest<SalesPersonDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/agencies/${agencyId}/sales-people/${salesPersonId}`, { method: "PUT", body: JSON.stringify(data), headers: { "Content-Type": "application/json" } }),
  deleteAgencySalesPerson: (orgId: string, agencyId: string, salesPersonId: string) => yowyobApiRequest<void>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/agencies/${agencyId}/sales-people/${salesPersonId}`, { method: "DELETE" }),
  getOrgCustomers: (orgId: string) => yowyobApiRequest<CustomerDto[]>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/customers`),
  createOrgCustomer: (orgId: string, data: CreateCustomerRequest) => yowyobApiRequest<CustomerDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/customers`, { method: "POST", body: JSON.stringify(data), headers: { "Content-Type": "application/json" } }),
  getOrgCustomerById: (orgId: string, customerId: string) => yowyobApiRequest<CustomerDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/customers/${customerId}`),
  updateOrgCustomer: (orgId: string, customerId: string, data: UpdateCustomerRequest) => yowyobApiRequest<CustomerDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/customers/${customerId}`, { method: "PUT", body: JSON.stringify(data), headers: { "Content-Type": "application/json" } }),
  deleteOrgCustomer: (orgId: string, customerId: string) => yowyobApiRequest<void>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/customers/${customerId}`, { method: "DELETE" }),
  getAgencyCustomers: (orgId: string, agencyId: string) => yowyobApiRequest<CustomerDto[]>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/agencies/${agencyId}/customers`),
  createAgencyCustomer: (orgId: string, agencyId: string, data: CreateCustomerRequest) => yowyobApiRequest<CustomerDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/agencies/${agencyId}/customers`, { method: "POST", body: JSON.stringify(data), headers: { "Content-Type": "application/json" } }),
  getAgencyCustomerById: (orgId: string, agencyId: string, customerId: string) => yowyobApiRequest<CustomerDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/agencies/${agencyId}/customers/${customerId}`),
  updateAgencyCustomer: (orgId: string, agencyId: string, customerId: string, data: UpdateCustomerRequest) => yowyobApiRequest<CustomerDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/agencies/${agencyId}/customers/${customerId}`, { method: "PUT", body: JSON.stringify(data), headers: { "Content-Type": "application/json" } }),
  deleteAgencyCustomer: (orgId: string, agencyId: string, customerId: string) => yowyobApiRequest<void>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/agencies/${agencyId}/customers/${customerId}`, { method: "DELETE" }),
  affectCustomerToAgency: (orgId: string, agencyId: string, data: AffectCustomerRequest) => yowyobApiRequest<CustomerDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/agencies/${agencyId}/customers/add`, { method: "POST", body: JSON.stringify(data), headers: { "Content-Type": "application/json" } }),
  getOrgSuppliers: (orgId: string) => yowyobApiRequest<ProviderDto[]>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/suppliers`),
  createOrgSupplier: (orgId: string, data: CreateProviderRequest) => yowyobApiRequest<ProviderDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/suppliers`, { method: "POST", body: JSON.stringify(data), headers: { "Content-Type": "application/json" } }),
  getOrgSupplierById: (orgId: string, providerId: string) => yowyobApiRequest<ProviderDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/suppliers/${providerId}`),
  updateOrgSupplier: (orgId: string, providerId: string, data: UpdateProviderRequest) => yowyobApiRequest<ProviderDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/suppliers/${providerId}`, { method: "PUT", body: JSON.stringify(data), headers: { "Content-Type": "application/json" } }),
  deleteOrgSupplier: (orgId: string, providerId: string) => yowyobApiRequest<void>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/suppliers/${providerId}`, { method: "DELETE" }),
  getAgencySuppliers: (orgId: string, agencyId: string) => yowyobApiRequest<ProviderDto[]>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/agencies/${agencyId}/suppliers`),
  createAgencySupplier: (orgId: string, agencyId: string, data: CreateProviderRequest) => yowyobApiRequest<ProviderDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/agencies/${agencyId}/suppliers`, { method: "POST", body: JSON.stringify(data), headers: { "Content-Type": "application/json" } }),
  getAgencySupplierById: (orgId: string, agencyId: string, providerId: string) => yowyobApiRequest<ProviderDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/agencies/${agencyId}/suppliers/${providerId}`),
  updateAgencySupplier: (orgId: string, agencyId: string, providerId: string, data: UpdateProviderRequest) => yowyobApiRequest<ProviderDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/agencies/${agencyId}/suppliers/${providerId}`, { method: "PUT", body: JSON.stringify(data), headers: { "Content-Type": "application/json" } }),
  deleteAgencySupplier: (orgId: string, agencyId: string, providerId: string) => yowyobApiRequest<void>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/agencies/${agencyId}/suppliers/${providerId}`, { method: "DELETE" }),
  affectSupplierToAgency: (orgId: string, agencyId: string, data: AffectProviderRequest) => yowyobApiRequest<ProviderDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/agencies/${agencyId}/suppliers/add`, { method: "POST", body: JSON.stringify(data), headers: { "Content-Type": "application/json" } }),
  getOrgProspects: (orgId: string) => yowyobApiRequest<ProspectDto[]>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/prospects`),
  createOrgProspect: (orgId: string, data: CreateProspectRequest) => yowyobApiRequest<ProspectDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/prospects`, { method: "POST", body: JSON.stringify(data), headers: { "Content-Type": "application/json" } }),
  getOrgProspectById: (orgId: string, prospectId: string) => yowyobApiRequest<ProspectDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/prospects/${prospectId}`),
  updateOrgProspect: (orgId: string, prospectId: string, data: UpdateProspectRequest) => yowyobApiRequest<ProspectDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/prospects/${prospectId}`, { method: "PUT", body: JSON.stringify(data), headers: { "Content-Type": "application/json" } }),
  deleteOrgProspect: (orgId: string, prospectId: string) => yowyobApiRequest<void>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/prospects/${prospectId}`, { method: "DELETE" }),
  getAgencyProspects: (orgId: string, agencyId: string) => yowyobApiRequest<ProspectDto[]>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/agencies/${agencyId}/prospects`),
  createAgencyProspect: (orgId: string, agencyId: string, data: CreateProspectRequest) => yowyobApiRequest<ProspectDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/agencies/${agencyId}/prospects`, { method: "POST", body: JSON.stringify(data), headers: { "Content-Type": "application/json" } }),
  getAgencyProspectById: (orgId: string, agencyId: string, prospectId: string) => yowyobApiRequest<ProspectDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/agencies/${agencyId}/prospects/${prospectId}`),
  updateAgencyProspect: (orgId: string, agencyId: string, prospectId: string, data: UpdateProspectRequest) => yowyobApiRequest<ProspectDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/agencies/${agencyId}/prospects/${prospectId}`, { method: "PUT", body: JSON.stringify(data), headers: { "Content-Type": "application/json" } }),
  deleteAgencyProspect: (orgId: string, agencyId: string, prospectId: string) => yowyobApiRequest<void>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/agencies/${agencyId}/prospects/${prospectId}`, { method: "DELETE" }),
  getAllBusinessActors: () => yowyobApiRequest<BusinessActorDto[]>(YOWYOB_ORGANIZATION_API_BASE_URL, "/business-actors"),
  createBusinessActor: (data: CreateBusinessActorRequest) => yowyobApiRequest<BusinessActorDto>(YOWYOB_ORGANIZATION_API_BASE_URL, "/business-actors", { method: "POST", body: JSON.stringify(data), headers: { "Content-Type": "application/json" } }),
  getBusinessActorById: (baId: string) => yowyobApiRequest<BusinessActorDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/business-actors/${baId}`),
  updateBusinessActor: (baId: string, data: UpdateBusinessActorRequest) => yowyobApiRequest<BusinessActorDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/business-actors/${baId}`, { method: "PUT", body: JSON.stringify(data), headers: { "Content-Type": "application/json" } }),
  deleteBusinessActor: (baId: string) => yowyobApiRequest<void>(YOWYOB_ORGANIZATION_API_BASE_URL, `/business-actors/${baId}`, { method: "DELETE" }),
  getBusinessActorsByType: (type: BusinessActorType) => yowyobApiRequest<BusinessActorDto[]>(YOWYOB_ORGANIZATION_API_BASE_URL, `/business-actors/types/${type}`),
  uploadOrganizationImages: (orgId: string, formData: FormData) => yowyobApiRequest<ImageDto[]>(YOWYOB_ORGANIZATION_API_BASE_URL, `/images/${orgId}/add`, { method: "PUT", body: formData, isFormData: true }),
  getOrganizationImageInfo: (imageId: string) => yowyobApiRequest<ImageDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/images/${imageId}`),
  getThirdParties: (orgId: string, params: GetThirdPartyRequest) => yowyobApiRequest<ThirdPartyDto[]>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/third-parties?${new URLSearchParams(params as Record<string, string>).toString()}`),
  createThirdParty: (orgId: string, type: ThirdPartyType, data: CreateThirdPartyRequest) => yowyobApiRequest<ThirdPartyDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/third-parties/${type}`, { method: "POST", body: JSON.stringify(data), headers: { "Content-Type": "application/json" } }),
  getThirdPartyById: (orgId: string, thirdPartyId: string) => yowyobApiRequest<ThirdPartyDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/third-parties/${thirdPartyId}`),
  updateThirdParty: (orgId: string, thirdPartyId: string, data: UpdateThirdPartyRequest) => yowyobApiRequest<ThirdPartyDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/third-parties/${thirdPartyId}`, { method: "PUT", body: JSON.stringify(data), headers: { "Content-Type": "application/json" } }),
  deleteThirdParty: (orgId: string, thirdPartyId: string) => yowyobApiRequest<void>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/third-parties/${thirdPartyId}`, { method: "DELETE" }),
  updateThirdPartyStatus: (orgId: string, thirdPartyId: string, data: UpdateThirdPartyStatusRequest) => yowyobApiRequest<ThirdPartyDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/third-parties/${thirdPartyId}/status`, { method: "PUT", body: JSON.stringify(data), headers: { "Content-Type": "application/json" } }),
  getProposedActivities: (orgId: string, params: { organizationId: string }) => yowyobApiRequest<ProposedActivityDto[]>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/proposed-activities?${new URLSearchParams(params).toString()}`),
  createProposedActivity: (orgId: string, data: CreateProposedActivityRequest) => yowyobApiRequest<ProposedActivityDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/proposed-activities`, { method: "POST", body: JSON.stringify(data), headers: { "Content-Type": "application/json" } }),
  getProposedActivityById: (orgId: string, activityId: string) => yowyobApiRequest<ProposedActivityDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/proposed-activities/${activityId}`),
  updateProposedActivity: (orgId: string, activityId: string, data: UpdateProposedActivityRequest) => yowyobApiRequest<ProposedActivityDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/proposed-activities/${activityId}`, { method: "PUT", body: JSON.stringify(data), headers: { "Content-Type": "application/json" } }),
  deleteProposedActivity: (orgId: string, activityId: string) => yowyobApiRequest<void>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/proposed-activities/${activityId}`, { method: "DELETE" }),
  getAllApplications: () => yowyobApiRequest<ApplicationDto[]>(YOWYOB_ORGANIZATION_API_BASE_URL, "/applications"),
  createApplication: (data: CreateApplicationRequest) => yowyobApiRequest<ApplicationDto>(YOWYOB_ORGANIZATION_API_BASE_URL, "/applications", { method: "POST", body: JSON.stringify(data), headers: { "Content-Type": "application/json" } }),
  getApplicationKeys: (applicationId: string) => yowyobApiRequest<ApplicationKeyDto[]>(YOWYOB_ORGANIZATION_API_BASE_URL, `/applications/${applicationId}/keys`),
  createApiKey: (applicationId: string) => yowyobApiRequest<ApplicationKeyDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/applications/${applicationId}/keys/create`, { method: "POST" }),
};