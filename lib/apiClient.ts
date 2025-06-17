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
  CustomerOrgDto,
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
  UpdateThirdPartyStatusRequest
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
  // Organizations
  getMyOrganizations: () => yowyobApiRequest<OrganizationTableRow[]>(YOWYOB_ORGANIZATION_API_BASE_URL, "/organizations/user"),
  getAllOrganizations: () => yowyobApiRequest<OrganizationTableRow[]>(YOWYOB_ORGANIZATION_API_BASE_URL, "/organizations"),
  getOrganizationsByDomain: (domainId: string) => yowyobApiRequest<OrganizationTableRow[]>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/domains/${domainId}`),
  getOrganizationById: (orgId: string) => yowyobApiRequest<OrganizationDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}`),
  createOrganization: (data: CreateOrganizationRequest) => yowyobApiRequest<OrganizationDto>(YOWYOB_ORGANIZATION_API_BASE_URL, "/organizations", { method: "POST", body: JSON.stringify(data) }),
  updateOrganization: (orgId: string, data: UpdateOrganizationRequest) => yowyobApiRequest<OrganizationDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteOrganization: (orgId: string) => yowyobApiRequest<void>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}`, { method: "DELETE" }),
  updateOrganizationStatus: (orgId: string, data: UpdateOrganizationStatusRequest) => yowyobApiRequest<OrganizationDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/status`, { method: "PUT", body: JSON.stringify(data) }),
  addBusinessDomainToOrg: (orgId: string, businessDomainId: string) => yowyobApiRequest<OrganizationDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/domains/${businessDomainId}`, { method: "PUT" }),
  removeBusinessDomainFromOrg: (orgId: string, businessDomainId: string) => yowyobApiRequest<OrganizationDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/domains/${businessDomainId}`, { method: "DELETE" }),

  // Contacts
  getContacts: (contactableType: ContactableType, contactableId: string) => yowyobApiRequest<ContactDto[]>(YOWYOB_ORGANIZATION_API_BASE_URL, `/${contactableType}/${contactableId}/contacts`),
  getContactById: (contactableType: ContactableType, contactableId: string, contactId: string) => yowyobApiRequest<ContactDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/${contactableType}/${contactableId}/contacts/${contactId}`), // Assuming path param, adjust if query
  createContact: (contactableType: ContactableType, contactableId: string, data: CreateContactRequest) => yowyobApiRequest<ContactDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/${contactableType}/${contactableId}/contacts`, { method: "POST", body: JSON.stringify(data) }),
  updateContact: (contactableType: ContactableType, contactableId: string, contactId: string, data: UpdateContactRequest) => yowyobApiRequest<ContactDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/${contactableType}/${contactableId}/contacts/${contactId}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteContactById: (contactableType: ContactableType, contactableId: string, contactId: string) => yowyobApiRequest<void>(YOWYOB_ORGANIZATION_API_BASE_URL, `/${contactableType}/${contactableId}/contacts/${contactId}`, { method: "DELETE" }),
  markContactAsFavorite: (contactableType: ContactableType, contactableId: string, contactId: string) => yowyobApiRequest<ContactDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/${contactableType}/${contactableId}/contacts/${contactId}/favorite`, { method: "GET" }), // Spec says GET

  // Addresses
  getAddresses: (addressableType: AddressableType, addressableId: string) => yowyobApiRequest<AddressDto[]>(YOWYOB_ORGANIZATION_API_BASE_URL, `/${addressableType}/${addressableId}/addresses`),
  getAddressById: (addressableType: AddressableType, addressableId: string, addressId: string) => yowyobApiRequest<AddressDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/${addressableType}/${addressableId}/addresses/${addressId}`), // Assuming path param
  createAddress: (addressableType: AddressableType, addressableId: string, data: CreateAddressRequest) => yowyobApiRequest<AddressDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/${addressableType}/${addressableId}/addresses`, { method: "POST", body: JSON.stringify(data) }),
  updateAddress: (addressableType: AddressableType, addressableId: string, addressId: string, data: UpdateAddressRequest) => yowyobApiRequest<AddressDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/${addressableType}/${addressableId}/addresses/${addressId}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteAddressById: (addressableType: AddressableType, addressableId: string, addressId: string) => yowyobApiRequest<void>(YOWYOB_ORGANIZATION_API_BASE_URL, `/${addressableType}/${addressableId}/addresses/${addressId}`, { method: "DELETE" }),
  markAddressAsFavorite: (addressableType: AddressableType, addressableId: string, addressId: string) => yowyobApiRequest<AddressDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/${addressableType}/${addressableId}/addresses/${addressId}/favorite`, { method: "GET" }),

  // Practical Information
  getPracticalInformation: (orgId: string, params?: { organizationId: string }) => yowyobApiRequest<PracticalInformationDto[]>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/practical-infos${params ? '?' + new URLSearchParams(params).toString() : ''}`),
  createPracticalInformation: (orgId: string, data: CreatePracticalInformationRequest) => yowyobApiRequest<PracticalInformationDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/practical-infos`, { method: "POST", body: JSON.stringify(data) }),
  getPracticalInformationById: (orgId: string, infoId: string) => yowyobApiRequest<PracticalInformationDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/practical-infos/${infoId}`),
  updatePracticalInformation: (orgId: string, infoId: string, data: UpdatePracticalInformationRequest) => yowyobApiRequest<PracticalInformationDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/practical-infos/${infoId}`, { method: "PUT", body: JSON.stringify(data) }),
  deletePracticalInformation: (orgId: string, infoId: string) => yowyobApiRequest<void>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/practical-infos/${infoId}`, { method: "DELETE" }),

  // Certifications
  getCertifications: (orgId: string) => yowyobApiRequest<CertificationDto[]>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/certifications`),
  createCertification: (orgId: string, data: CreateCertificationRequest) => yowyobApiRequest<CertificationDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/certifications`, { method: "POST", body: JSON.stringify(data) }),
  getCertificationById: (orgId: string, certId: string) => yowyobApiRequest<CertificationDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/certifications/${certId}`),
  updateCertification: (orgId: string, certId: string, data: UpdateCertificationRequest) => yowyobApiRequest<CertificationDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/certifications/${certId}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteCertification: (orgId: string, certId: string) => yowyobApiRequest<void>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/certifications/${certId}`, { method: "DELETE" }),

  // Business Domains
  getAllBusinessDomains: (params?: GetBusinessDomainRequest) => {
    const queryParams = params ? `?${new URLSearchParams(Object.entries(params).filter(([_, v]) => v != null) as [string, string][]).toString()}` : "";
    return yowyobApiRequest<BusinessDomainDto[]>(YOWYOB_ORGANIZATION_API_BASE_URL, `/business-domains${queryParams}`);
  },
  getBusinessDomainById: (domainId: string) => yowyobApiRequest<BusinessDomainDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/business-domains/${domainId}`),
  createBusinessDomain: (data: CreateBusinessDomainRequest) => yowyobApiRequest<BusinessDomainDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/business-domains`, { method: "POST", body: JSON.stringify(data) }),
  updateBusinessDomain: (domainId: string, data: UpdateBusinessDomainRequest) => yowyobApiRequest<BusinessDomainDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/business-domains/${domainId}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteBusinessDomain: (domainId: string) => yowyobApiRequest<void>(YOWYOB_ORGANIZATION_API_BASE_URL, `/business-domains/${domainId}`, { method: "DELETE" }),

  // Agencies
  getAgencies: (orgId: string, active?: boolean) => {
    let endpoint = `/organizations/${orgId}/agencies`;
    if (active !== undefined) endpoint += `?active=${active}`;
    return yowyobApiRequest<AgencyDto[]>(YOWYOB_ORGANIZATION_API_BASE_URL, endpoint);
  },
  createAgency: (orgId: string, data: CreateAgencyRequest) => yowyobApiRequest<AgencyDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/agencies`, { method: "POST", body: JSON.stringify(data) }),
  getAgencyById: (orgId: string, agencyId: string) => yowyobApiRequest<AgencyDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/agencies/${agencyId}`),
  updateAgency: (orgId: string, agencyId: string, data: UpdateAgencyRequest) => yowyobApiRequest<AgencyDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/agencies/${agencyId}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteAgency: (orgId: string, agencyId: string) => yowyobApiRequest<void>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/agencies/${agencyId}`, { method: "DELETE" }),
  updateAgencyStatus: (orgId: string, agencyId: string, data: UpdateAgencyStatusRequest) => yowyobApiRequest<AgencyDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/agencies/${agencyId}/status`, { method: "PUT", body: JSON.stringify(data) }),

  // Employees (Organization-scoped)
  getOrgEmployees: (orgId: string) => yowyobApiRequest<EmployeeDto[]>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/employees`),
  createOrgEmployee: (orgId: string, data: CreateEmployeeRequest) => yowyobApiRequest<EmployeeResponse>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/employees`, { method: "POST", body: JSON.stringify(data) }),
  getOrgEmployeeById: (orgId: string, employeeId: string) => yowyobApiRequest<EmployeeDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/employees/${employeeId}`),
  updateOrgEmployee: (orgId: string, employeeId: string, data: UpdateEmployeeRequest) => yowyobApiRequest<EmployeeResponse>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/employees/${employeeId}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteOrgEmployee: (orgId: string, employeeId: string) => yowyobApiRequest<void>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/employees/${employeeId}`, { method: "DELETE" }),

  // Employees (Agency-scoped)
  getAgencyEmployees: (orgId: string, agencyId: string) => yowyobApiRequest<EmployeeDto[]>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/agencies/${agencyId}/employees`),
  createAgencyEmployee: (orgId: string, agencyId: string, data: CreateEmployeeRequest) => yowyobApiRequest<EmployeeResponse>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/agencies/${agencyId}/employees`, { method: "POST", body: JSON.stringify(data) }),
  getAgencyEmployeeById: (orgId: string, agencyId: string, employeeId: string) => yowyobApiRequest<EmployeeDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/agencies/${agencyId}/employees/${employeeId}`),
  updateAgencyEmployee: (orgId: string, agencyId: string, employeeId: string, data: UpdateEmployeeRequest) => yowyobApiRequest<EmployeeResponse>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/agencies/${agencyId}/employees/${employeeId}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteAgencyEmployee: (orgId: string, agencyId: string, employeeId: string) => yowyobApiRequest<void>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/agencies/${agencyId}/employees/${employeeId}`, { method: "DELETE" }),
  affectEmployeeToAgency: (orgId: string, agencyId: string, data: AffectEmployeeRequest) => yowyobApiRequest<EmployeeResponse>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/agencies/${agencyId}/employees/add`, { method: "POST", body: JSON.stringify(data) }),

  // SalesPersons (Organization-scoped)
  getOrgSalesPersons: (orgId: string) => yowyobApiRequest<SalesPersonDto[]>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/sales-people`),
  createOrgSalesPerson: (orgId: string, data: CreateSalesPersonRequest) => yowyobApiRequest<SalesPersonDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/sales-people`, { method: "POST", body: JSON.stringify(data) }),
  getOrgSalesPersonById: (orgId: string, salesPersonId: string) => yowyobApiRequest<SalesPersonDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/sales-people/${salesPersonId}`),
  updateOrgSalesPerson: (orgId: string, salesPersonId: string, data: UpdateSalesPersonRequest) => yowyobApiRequest<SalesPersonDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/sales-people/${salesPersonId}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteOrgSalesPerson: (orgId: string, salesPersonId: string) => yowyobApiRequest<void>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/sales-people/${salesPersonId}`, { method: "DELETE" }),

  // SalesPersons (Agency-scoped)
  getAgencySalesPersons: (orgId: string, agencyId: string) => yowyobApiRequest<SalesPersonDto[]>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/agencies/${agencyId}/sales-people`),
  createAgencySalesPerson: (orgId: string, agencyId: string, data: CreateSalesPersonRequest) => yowyobApiRequest<SalesPersonDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/agencies/${agencyId}/sales-people`, { method: "POST", body: JSON.stringify(data) }),
  getAgencySalesPersonById: (orgId: string, agencyId: string, salesPersonId: string) => yowyobApiRequest<SalesPersonDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/agencies/${agencyId}/sales-people/${salesPersonId}`),
  updateAgencySalesPerson: (orgId: string, agencyId: string, salesPersonId: string, data: UpdateSalesPersonRequest) => yowyobApiRequest<SalesPersonDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/agencies/${agencyId}/sales-people/${salesPersonId}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteAgencySalesPerson: (orgId: string, agencyId: string, salesPersonId: string) => yowyobApiRequest<void>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/agencies/${agencyId}/sales-people/${salesPersonId}`, { method: "DELETE" }),

  // Customers (Organization-linked)
  getOrgCustomers: (orgId: string) => yowyobApiRequest<CustomerOrgDto[]>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/customers`),
  createOrgCustomer: (orgId: string, data: CreateCustomerRequest) => yowyobApiRequest<CustomerOrgDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/customers`, { method: "POST", body: JSON.stringify(data) }),
  getOrgCustomerById: (orgId: string, customerId: string) => yowyobApiRequest<CustomerOrgDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/customers/${customerId}`),
  updateOrgCustomer: (orgId: string, customerId: string, data: UpdateCustomerRequest) => yowyobApiRequest<CustomerOrgDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/customers/${customerId}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteOrgCustomer: (orgId: string, customerId: string) => yowyobApiRequest<void>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/customers/${customerId}`, { method: "DELETE" }),

  // Customers (Agency-scoped)
  getAgencyCustomers: (orgId: string, agencyId: string) => yowyobApiRequest<CustomerOrgDto[]>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/agencies/${agencyId}/customers`),
  createAgencyCustomer: (orgId: string, agencyId: string, data: CreateCustomerRequest) => yowyobApiRequest<CustomerOrgDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/agencies/${agencyId}/customers`, { method: "POST", body: JSON.stringify(data) }),
  getAgencyCustomerById: (orgId: string, agencyId: string, customerId: string) => yowyobApiRequest<CustomerOrgDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/agencies/${agencyId}/customers/${customerId}`),
  updateAgencyCustomer: (orgId: string, agencyId: string, customerId: string, data: UpdateCustomerRequest) => yowyobApiRequest<CustomerOrgDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/agencies/${agencyId}/customers/${customerId}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteAgencyCustomer: (orgId: string, agencyId: string, customerId: string) => yowyobApiRequest<void>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/agencies/${agencyId}/customers/${customerId}`, { method: "DELETE" }),
  affectCustomerToAgency: (orgId: string, agencyId: string, data: AffectCustomerRequest) => yowyobApiRequest<CustomerOrgDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/agencies/${agencyId}/customers/add`, { method: "POST", body: JSON.stringify(data) }),

  // Suppliers (Providers) (Organization-scoped)
  getOrgSuppliers: (orgId: string) => yowyobApiRequest<ProviderDto[]>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/suppliers`),
  createOrgSupplier: (orgId: string, data: CreateProviderRequest) => yowyobApiRequest<ProviderDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/suppliers`, { method: "POST", body: JSON.stringify(data) }),
  getOrgSupplierById: (orgId: string, providerId: string) => yowyobApiRequest<ProviderDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/suppliers/${providerId}`),
  updateOrgSupplier: (orgId: string, providerId: string, data: UpdateProviderRequest) => yowyobApiRequest<ProviderDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/suppliers/${providerId}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteOrgSupplier: (orgId: string, providerId: string) => yowyobApiRequest<void>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/suppliers/${providerId}`, { method: "DELETE" }),

  // Suppliers (Providers) (Agency-scoped)
  getAgencySuppliers: (orgId: string, agencyId: string) => yowyobApiRequest<ProviderDto[]>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/agencies/${agencyId}/suppliers`),
  createAgencySupplier: (orgId: string, agencyId: string, data: CreateProviderRequest) => yowyobApiRequest<ProviderDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/agencies/${agencyId}/suppliers`, { method: "POST", body: JSON.stringify(data) }),
  getAgencySupplierById: (orgId: string, agencyId: string, providerId: string) => yowyobApiRequest<ProviderDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/agencies/${agencyId}/suppliers/${providerId}`),
  updateAgencySupplier: (orgId: string, agencyId: string, providerId: string, data: UpdateProviderRequest) => yowyobApiRequest<ProviderDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/agencies/${agencyId}/suppliers/${providerId}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteAgencySupplier: (orgId: string, agencyId: string, providerId: string) => yowyobApiRequest<void>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/agencies/${agencyId}/suppliers/${providerId}`, { method: "DELETE" }),
  affectSupplierToAgency: (orgId: string, agencyId: string, data: AffectProviderRequest) => yowyobApiRequest<ProviderDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/agencies/${agencyId}/suppliers/add`, { method: "POST", body: JSON.stringify(data) }),

  // Prospects (Org-scoped)
  getOrgProspects: (orgId: string) => yowyobApiRequest<ProspectDto[]>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/prospects`),
  createOrgProspect: (orgId: string, data: CreateProspectRequest) => yowyobApiRequest<ProspectDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/prospects`, { method: "POST", body: JSON.stringify(data) }),
  getOrgProspectById: (orgId: string, prospectId: string) => yowyobApiRequest<ProspectDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/prospects/${prospectId}`),
  updateOrgProspect: (orgId: string, prospectId: string, data: UpdateProspectRequest) => yowyobApiRequest<ProspectDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/prospects/${prospectId}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteOrgProspect: (orgId: string, prospectId: string) => yowyobApiRequest<void>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/prospects/${prospectId}`, { method: "DELETE" }),

  // Prospects (Agency-scoped)
  getAgencyProspects: (orgId: string, agencyId: string) => yowyobApiRequest<ProspectDto[]>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/agencies/${agencyId}/prospects`),
  createAgencyProspect: (orgId: string, agencyId: string, data: CreateProspectRequest) => yowyobApiRequest<ProspectDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/agencies/${agencyId}/prospects`, { method: "POST", body: JSON.stringify(data) }),
  getAgencyProspectById: (orgId: string, agencyId: string, prospectId: string) => yowyobApiRequest<ProspectDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/agencies/${agencyId}/prospects/${prospectId}`),
  updateAgencyProspect: (orgId: string, agencyId: string, prospectId: string, data: UpdateProspectRequest) => yowyobApiRequest<ProspectDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/agencies/${agencyId}/prospects/${prospectId}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteAgencyProspect: (orgId: string, agencyId: string, prospectId: string) => yowyobApiRequest<void>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/agencies/${agencyId}/prospects/${prospectId}`, { method: "DELETE" }),

  // Business Actors
  getAllBusinessActors: () => yowyobApiRequest<BusinessActorDto[]>(YOWYOB_ORGANIZATION_API_BASE_URL, "/business-actors"),
  createBusinessActor: (data: CreateBusinessActorRequest) => yowyobApiRequest<BusinessActorDto>(YOWYOB_ORGANIZATION_API_BASE_URL, "/business-actors", { method: "POST", body: JSON.stringify(data) }),
  getBusinessActorById: (baId: string) => yowyobApiRequest<BusinessActorDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/business-actors/${baId}`),
  updateBusinessActor: (baId: string, data: UpdateBusinessActorRequest) => yowyobApiRequest<BusinessActorDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/business-actors/${baId}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteBusinessActor: (baId: string) => yowyobApiRequest<void>(YOWYOB_ORGANIZATION_API_BASE_URL, `/business-actors/${baId}`, { method: "DELETE" }),
  getBusinessActorsByType: (type: BusinessActorType) => yowyobApiRequest<BusinessActorDto[]>(YOWYOB_ORGANIZATION_API_BASE_URL, `/business-actors/types/${type}`),

  // Images
  uploadOrganizationImages: (orgId: string, formData: FormData) => yowyobApiRequest<ImageDto[]>(YOWYOB_ORGANIZATION_API_BASE_URL, `/images/${orgId}/add`, { method: "PUT", body: formData, isFormData: true }),
  getOrganizationImageInfo: (imageId: string) => yowyobApiRequest<ImageDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/images/${imageId}`),

  // ThirdParty
  getThirdParties: (orgId: string, params: GetThirdPartyRequest) => yowyobApiRequest<ThirdPartyDto[]>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/third-parties?${new URLSearchParams(params as any).toString()}`),
  createThirdParty: (orgId: string, type: ThirdPartyType, data: CreateThirdPartyRequest) => yowyobApiRequest<ThirdPartyDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/third-parties/${type}`, { method: "POST", body: JSON.stringify(data) }),
  getThirdPartyById: (orgId: string, thirdPartyId: string) => yowyobApiRequest<ThirdPartyDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/third-parties/${thirdPartyId}`),
  updateThirdParty: (orgId: string, thirdPartyId: string, data: UpdateThirdPartyRequest) => yowyobApiRequest<ThirdPartyDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/third-parties/${thirdPartyId}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteThirdParty: (orgId: string, thirdPartyId: string) => yowyobApiRequest<void>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/third-parties/${thirdPartyId}`, { method: "DELETE" }), // Spec says 204
  updateThirdPartyStatus: (orgId: string, thirdPartyId: string, data: UpdateThirdPartyStatusRequest) => yowyobApiRequest<ThirdPartyDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/third-parties/${thirdPartyId}/status`, { method: "PUT", body: JSON.stringify(data) }),

  // Proposed Activities
  getProposedActivities: (orgId: string, params: { organizationId: string }) => yowyobApiRequest<ProposedActivityDto[]>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/proposed-activities?${new URLSearchParams(params).toString()}`),
  createProposedActivity: (orgId: string, data: CreateProposedActivityRequest) => yowyobApiRequest<ProposedActivityDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/proposed-activities`, { method: "POST", body: JSON.stringify(data) }),
  getProposedActivityById: (orgId: string, activityId: string) => yowyobApiRequest<ProposedActivityDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/proposed-activities/${activityId}`),
  updateProposedActivity: (orgId: string, activityId: string, data: UpdateProposedActivityRequest) => yowyobApiRequest<ProposedActivityDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/proposed-activities/${activityId}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteProposedActivity: (orgId: string, activityId: string) => yowyobApiRequest<void>(YOWYOB_ORGANIZATION_API_BASE_URL, `/organizations/${orgId}/proposed-activities/${activityId}`, { method: "DELETE" }),

  // Applications & Keys
  getAllApplications: () => yowyobApiRequest<ApplicationDto[]>(YOWYOB_ORGANIZATION_API_BASE_URL, "/applications"),
  createApplication: (data: CreateApplicationRequest) => yowyobApiRequest<ApplicationDto>(YOWYOB_ORGANIZATION_API_BASE_URL, "/applications", { method: "POST", body: JSON.stringify(data) }),
  getApplicationKeys: (applicationId: string) => yowyobApiRequest<ApplicationKeyDto[]>(YOWYOB_ORGANIZATION_API_BASE_URL, `/applications/${applicationId}/keys`),
  createApiKey: (applicationId: string) => yowyobApiRequest<ApplicationKeyDto>(YOWYOB_ORGANIZATION_API_BASE_URL, `/applications/${applicationId}/keys/create`, { method: "POST" }),
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