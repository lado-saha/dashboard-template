// lib/data-repo/organization/organization-local-repository.ts
import { IOrganizationRepository } from "./organization-repository-interface";
import {
  OrganizationDto,
  CreateOrganizationRequest,
  UpdateOrganizationRequest,
  UpdateOrganizationStatusRequest,
  ContactDto,
  CreateContactRequest,
  UpdateContactRequest,
  ContactableType,
  AddressDto,
  CreateAddressRequest,
  UpdateAddressRequest,
  AddressableType,
  AgencyDto,
  CreateAgencyRequest,
  UpdateAgencyRequest,
  UpdateAgencyStatusRequest,
  EmployeeDto,
  CreateEmployeeRequest,
  UpdateEmployeeRequest,
  AffectEmployeeRequest,
  EmployeeResponse,
  SalesPersonDto,
  CreateSalesPersonRequest,
  UpdateSalesPersonRequest,
  CustomerDto,
  CreateCustomerRequest,
  UpdateCustomerRequest,
  AffectCustomerRequest,
  ProviderDto,
  CreateProviderRequest,
  UpdateProviderRequest,
  AffectProviderRequest,
  ProspectDto,
  CreateProspectRequest,
  UpdateProspectRequest,
  PracticalInformationDto,
  CreatePracticalInformationRequest,
  UpdatePracticalInformationRequest,
  CertificationDto,
  CreateCertificationRequest,
  UpdateCertificationRequest,
  BusinessDomainDto,
  CreateBusinessDomainRequest,
  UpdateBusinessDomainRequest,
  GetBusinessDomainRequest,
  ImageDto,
  ThirdPartyDto,
  CreateThirdPartyRequest,
  UpdateThirdPartyRequest,
  UpdateThirdPartyStatusRequest,
  GetThirdPartyRequest,
  ThirdPartyType,
  ProposedActivityDto,
  CreateProposedActivityRequest,
  UpdateProposedActivityRequest,
  BusinessActorDto,
  CreateBusinessActorRequest,
  UpdateBusinessActorRequest,
  BusinessActorType,
  ApplicationDto,
  CreateApplicationRequest,
  ApplicationKeyDto,
} from "@/types/organization";
import { toast } from "sonner";

const APP_URL =
  typeof window !== "undefined"
    ? window.location.origin
    : process.env.NEXTAUTH_URL ||
    process.env.VERCEL_URL ||
    "http://localhost:3000";
const MOCK_API_ORG_BASE = `${APP_URL}/api/mock/organization`; // For org-specific things
const MOCK_API_GLOBAL_ORG_ENTITIES_BASE = `${APP_URL}/api/mock`; // For global entities managed by OrgService (like BusinessDomain, BusinessActor, Applications)

export class OrganizationLocalRepository implements IOrganizationRepository {


  private async fetchMockApi<T>(
    endpoint: string,
    options: RequestInit = {},
    base = MOCK_API_ORG_BASE
  ): Promise<T> {
    const response = await fetch(`${base}${endpoint}`, {
      ...options,
      headers: { "Content-Type": "application/json", ...options.headers },
    });
    const responseContentType = response.headers.get("content-type");
    let responseData;
    if (responseContentType && responseContentType.includes("application/json")) {
      responseData = await response.json();
    }
    else if (response.status !== 204)
      responseData = {
        message: (await response.text()) || response.statusText,
      };
    if (!response.ok) {
      const errorPayload = responseData || {
        message: `Request to ${endpoint} failed`,
      };
      console.error(
        `[OrgLocalRepo] Mock API Error: ${response.status}`,
        errorPayload
      );

      throw {
        status: response.status,
        message: errorPayload.message,
        data: errorPayload,
      };
    }
    return responseData as T;
  }

  // Organizations
  async getMyOrganizations(): Promise<OrganizationDto[]> {
    return this.fetchMockApi<OrganizationDto[]>("/user-orgs");
  }
  async getAllOrganizations(): Promise<OrganizationDto[]> {
    return this.fetchMockApi<OrganizationDto[]>("/all");
  }
  async getOrganizationsByDomain(
    domainId: string
  ): Promise<OrganizationDto[]> {
    return this.fetchMockApi<OrganizationDto[]>(`/domain/${domainId}`);
  }
  async getOrganizationById(orgId: string): Promise<OrganizationDto | null> {
    return this.fetchMockApi<OrganizationDto | null>(`/${orgId}`, {}, MOCK_API_ORG_BASE);
  }
  async createOrganization(
    data: CreateOrganizationRequest
  ): Promise<OrganizationDto> {
    return this.fetchMockApi<OrganizationDto>("", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }
  async updateOrganization(
    orgId: string,
    data: UpdateOrganizationRequest
  ): Promise<OrganizationDto> {
    return this.fetchMockApi<OrganizationDto>(`/${orgId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }
  async deleteOrganization(orgId: string): Promise<void> {
    return this.fetchMockApi<void>(`/${orgId}/delete`, { method: "DELETE" });
  }
  async updateOrganizationStatus(
    orgId: string,
    data: UpdateOrganizationStatusRequest
  ): Promise<OrganizationDto> {
    return this.fetchMockApi<OrganizationDto>(`/${orgId}/status`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }
  async addBusinessDomainToOrg(
    orgId: string,
    businessDomainId: string
  ): Promise<OrganizationDto> {
    return this.fetchMockApi<OrganizationDto>(
      `/${orgId}/domains/${businessDomainId}/add`,
      { method: "PUT" }
    );
  }
  async removeBusinessDomainFromOrg(
    orgId: string,
    businessDomainId: string
  ): Promise<OrganizationDto> {
    return this.fetchMockApi<OrganizationDto>(
      `/${orgId}/domains/${businessDomainId}/remove`,
      { method: "DELETE" }
    );
  }

  // Contacts
  async getContacts(
    contactableType: ContactableType,
    contactableId: string
  ): Promise<ContactDto[]> {
    return this.fetchMockApi<ContactDto[]>(
      `/${contactableType}/${contactableId}/contacts`, {}, MOCK_API_GLOBAL_ORG_ENTITIES_BASE
    );
  }
  async getContactById(
    contactableType: ContactableType,
    contactableId: string,
    contactId: string
  ): Promise<ContactDto | null> {
    return this.fetchMockApi<ContactDto | null>(
      `/${contactableType}/${contactableId}/contacts/${contactId}`, {}, MOCK_API_GLOBAL_ORG_ENTITIES_BASE
    );
  }
  async createContact(
    contactableType: ContactableType,
    contactableId: string,
    data: CreateContactRequest
  ): Promise<ContactDto> {
    return this.fetchMockApi<ContactDto>(
      `/${contactableType}/${contactableId}/contacts`,
      { method: "POST", body: JSON.stringify(data) }, MOCK_API_GLOBAL_ORG_ENTITIES_BASE
    );
  }
  async updateContact(
    contactableType: ContactableType,
    contactableId: string,
    contactId: string,
    data: UpdateContactRequest
  ): Promise<ContactDto> {
    return this.fetchMockApi<ContactDto>(
      `/${contactableType}/${contactableId}/contacts/${contactId}`,
      { method: "PUT", body: JSON.stringify(data) }, MOCK_API_GLOBAL_ORG_ENTITIES_BASE
    );
  }
  async deleteContactById(
    contactableType: ContactableType,
    contactableId: string,
    contactId: string
  ): Promise<void> {
    return this.fetchMockApi<void>(
      `/${contactableType}/${contactableId}/contacts/${contactId}`,
      { method: "DELETE" }, MOCK_API_GLOBAL_ORG_ENTITIES_BASE
    );
  }
  async markContactAsFavorite(
    contactableType: ContactableType,
    contactableId: string,
    contactId: string
  ): Promise<ContactDto> {
    return this.fetchMockApi<ContactDto>(
      `/${contactableType}/${contactableId}/contacts/${contactId}/favorite`,
      { method: "PUT" }, MOCK_API_GLOBAL_ORG_ENTITIES_BASE
    );
  }

  // Addresses
  async getAddresses(
    addressableType: AddressableType,
    addressableId: string
  ): Promise<AddressDto[]> {
    return this.fetchMockApi<AddressDto[]>(
      `/${addressableType}/${addressableId}/addresses`
      , {}, MOCK_API_GLOBAL_ORG_ENTITIES_BASE
    );
  }
  async getAddressById(
    addressableType: AddressableType,
    addressableId: string,
    addressId: string
  ): Promise<AddressDto | null> {
    return this.fetchMockApi<AddressDto | null>(
      `/${addressableType}/${addressableId}/addresses/${addressId}`, {}, MOCK_API_GLOBAL_ORG_ENTITIES_BASE
    );
  }
  async createAddress(
    addressableType: AddressableType,
    addressableId: string,
    data: CreateAddressRequest
  ): Promise<AddressDto> {
    return this.fetchMockApi<AddressDto>(
      `/${addressableType}/${addressableId}/addresses`,
      { method: "POST", body: JSON.stringify(data) }, MOCK_API_GLOBAL_ORG_ENTITIES_BASE
    );
  }
  async updateAddress(
    addressableType: AddressableType,
    addressableId: string,
    addressId: string,
    data: UpdateAddressRequest
  ): Promise<AddressDto> {
    return this.fetchMockApi<AddressDto>(
      `/${addressableType}/${addressableId}/addresses/${addressId}`,
      { method: "PUT", body: JSON.stringify(data) }, MOCK_API_GLOBAL_ORG_ENTITIES_BASE
    );
  }
  async deleteAddressById(
    addressableType: AddressableType,
    addressableId: string,
    addressId: string
  ): Promise<void> {
    return this.fetchMockApi<void>(
      `/${addressableType}/${addressableId}/addresses/${addressId}`,
      { method: "DELETE" }, MOCK_API_GLOBAL_ORG_ENTITIES_BASE
    );
  }
  async markAddressAsFavorite(
    addressableType: AddressableType,
    addressableId: string,
    addressId: string
  ): Promise<AddressDto> {
    return this.fetchMockApi<AddressDto>(
      `/${addressableType}/${addressableId}/addresses/${addressId}/favorite`,
      { method: "PUT" }, MOCK_API_GLOBAL_ORG_ENTITIES_BASE
    );
  }

  // Practical Information
  async getPracticalInformation(
    orgId: string
  ): Promise<PracticalInformationDto[]> {
    return this.fetchMockApi<PracticalInformationDto[]>(
      `/${orgId}/practical-infos`
    );
  }
  async createPracticalInformation(
    orgId: string,
    data: CreatePracticalInformationRequest
  ): Promise<PracticalInformationDto> {
    return this.fetchMockApi<PracticalInformationDto>(
      `/${orgId}/practical-infos`,
      { method: "POST", body: JSON.stringify(data) }
    );
  }
  async getPracticalInformationById(
    orgId: string,
    infoId: string
  ): Promise<PracticalInformationDto | null> {
    return this.fetchMockApi<PracticalInformationDto | null>(
      `/${orgId}/practical-infos/${infoId}`
    );
  }
  async updatePracticalInformation(
    orgId: string,
    infoId: string,
    data: UpdatePracticalInformationRequest
  ): Promise<PracticalInformationDto> {
    return this.fetchMockApi<PracticalInformationDto>(
      `/${orgId}/practical-infos/${infoId}`,
      { method: "PUT", body: JSON.stringify(data) }
    );
  }
  async deletePracticalInformation(
    orgId: string,
    infoId: string
  ): Promise<void> {
    return this.fetchMockApi<void>(
      `/${orgId}/practical-infos/${infoId}`,
      { method: "DELETE" }
    );
  }

  // Certifications
  async getCertifications(orgId: string): Promise<CertificationDto[]> {
    return this.fetchMockApi<CertificationDto[]>(
      `/${orgId}/certifications`
    );
  }
  async createCertification(
    orgId: string,
    data: CreateCertificationRequest
  ): Promise<CertificationDto> {
    return this.fetchMockApi<CertificationDto>(
      `/${orgId}/certifications`,
      { method: "POST", body: JSON.stringify(data) }
    );
  }
  async getCertificationById(
    orgId: string,
    certId: string
  ): Promise<CertificationDto | null> {
    return this.fetchMockApi<CertificationDto | null>(
      `/${orgId}/certifications/${certId}`
    );
  }
  async updateCertification(
    orgId: string,
    certId: string,
    data: UpdateCertificationRequest
  ): Promise<CertificationDto> {
    return this.fetchMockApi<CertificationDto>(
      `/${orgId}/certifications/${certId}`,
      { method: "PUT", body: JSON.stringify(data) }
    );
  }
  async deleteCertification(orgId: string, certId: string): Promise<void> {
    return this.fetchMockApi<void>(
      `/${orgId}/certifications/${certId}`,
      { method: "DELETE" }
    );
  }

  // Business Domains
  async getAllBusinessDomains(
    params?: GetBusinessDomainRequest
  ): Promise<BusinessDomainDto[]> {
    const q = params ? `?${new URLSearchParams(params as Record<string, string>)}` : "";
    return this.fetchMockApi<BusinessDomainDto[]>(
      `${q}`,
      {},
      MOCK_API_GLOBAL_ORG_ENTITIES_BASE + "/business-domains"
    );
  }
  async getBusinessDomainById(
    domainId: string
  ): Promise<BusinessDomainDto | null> {
    return this.fetchMockApi<BusinessDomainDto | null>(
      `/${domainId}`,
      {},
      MOCK_API_GLOBAL_ORG_ENTITIES_BASE + "/business-domains"
    );
  }
  async createBusinessDomain(
    data: CreateBusinessDomainRequest
  ): Promise<BusinessDomainDto> {
    return this.fetchMockApi<BusinessDomainDto>(
      "",
      { method: "POST", body: JSON.stringify(data) },
      MOCK_API_GLOBAL_ORG_ENTITIES_BASE + "/business-domains"
    );
  }
  async updateBusinessDomain(
    domainId: string,
    data: UpdateBusinessDomainRequest
  ): Promise<BusinessDomainDto> {
    return this.fetchMockApi<BusinessDomainDto>(
      `/${domainId}`,
      { method: "PUT", body: JSON.stringify(data) },
      MOCK_API_GLOBAL_ORG_ENTITIES_BASE + "/business-domains"
    );
  }
  async deleteBusinessDomain(domainId: string): Promise<void> {
    return this.fetchMockApi<void>(
      `/${domainId}`,
      { method: "DELETE" },
      MOCK_API_GLOBAL_ORG_ENTITIES_BASE + "/business-domains"
    );
  }

  // Agencies
  async getAgencies(orgId: string, active?: boolean): Promise<AgencyDto[]> {
    const q = active !== undefined ? `?active=${active}` : "";
    return this.fetchMockApi<AgencyDto[]>(`/${orgId}/agencies${q}`);
  }
  async createAgency(
    orgId: string,
    data: CreateAgencyRequest
  ): Promise<AgencyDto> {
    return this.fetchMockApi<AgencyDto>(`/${orgId}/agencies`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }
  async getAgencyById(
    orgId: string,
    agencyId: string
  ): Promise<AgencyDto | null> {
    return this.fetchMockApi<AgencyDto | null>(
      `/${orgId}/agencies/${agencyId}`
    );
  }
  async updateAgency(
    orgId: string,
    agencyId: string,
    data: UpdateAgencyRequest
  ): Promise<AgencyDto> {
    return this.fetchMockApi<AgencyDto>(
      `/${orgId}/agencies/${agencyId}`,
      { method: "PUT", body: JSON.stringify(data) }
    );
  }
  async deleteAgency(orgId: string, agencyId: string): Promise<void> {
    return this.fetchMockApi<void>(`/${orgId}/agencies/${agencyId}`, {
      method: "DELETE",
    });
  }
  async updateAgencyStatus(
    orgId: string,
    agencyId: string,
    data: UpdateAgencyStatusRequest
  ): Promise<AgencyDto> {
    return this.fetchMockApi<AgencyDto>(
      `/${orgId}/agencies/${agencyId}/status`,
      { method: "PUT", body: JSON.stringify(data) }
    );
  }

  // Employees (Org-scoped)
  async getOrgEmployees(orgId: string): Promise<EmployeeDto[]> {
    return this.fetchMockApi<EmployeeDto[]>(`/${orgId}/employees`);
  }
  async createOrgEmployee(
    orgId: string,
    data: CreateEmployeeRequest
  ): Promise<EmployeeResponse> {
    return this.fetchMockApi<EmployeeResponse>(`/${orgId}/employees`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }
  async getOrgEmployeeById(
    orgId: string,
    employeeId: string
  ): Promise<EmployeeDto | null> {
    return this.fetchMockApi<EmployeeDto | null>(
      `/${orgId}/employees/${employeeId}`
    );
  }
  async updateOrgEmployee(
    orgId: string,
    employeeId: string,
    data: UpdateEmployeeRequest
  ): Promise<EmployeeResponse> {
    return this.fetchMockApi<EmployeeResponse>(
      `/${orgId}/employees/${employeeId}`,
      { method: "PUT", body: JSON.stringify(data) }
    );
  }
  async deleteOrgEmployee(orgId: string, employeeId: string): Promise<void> {
    return this.fetchMockApi<void>(`/${orgId}/employees/${employeeId}`, {
      method: "DELETE",
    });
  }

  // Employees (Agency-scoped)
  async getAgencyEmployees(
    orgId: string,
    agencyId: string
  ): Promise<EmployeeDto[]> {
    return this.fetchMockApi<EmployeeDto[]>(
      `/${orgId}/agencies/${agencyId}/employees`,
    );
  }
  async createAgencyEmployee(
    orgId: string,
    agencyId: string,
    data: CreateEmployeeRequest
  ): Promise<EmployeeResponse> {
    return this.fetchMockApi<EmployeeResponse>(
      `/${orgId}/agencies/${agencyId}/employees`,
      { method: "POST", body: JSON.stringify(data) }
    );
  }
  async getAgencyEmployeeById(
    orgId: string,
    agencyId: string,
    employeeId: string
  ): Promise<EmployeeDto | null> {
    return this.fetchMockApi<EmployeeDto | null>(
      `/${orgId}/agencies/${agencyId}/employees/${employeeId}`
    );
  }
  async updateAgencyEmployee(
    orgId: string,
    agencyId: string,
    employeeId: string,
    data: UpdateEmployeeRequest
  ): Promise<EmployeeResponse> {
    return this.fetchMockApi<EmployeeResponse>(
      `/${orgId}/agencies/${agencyId}/employees/${employeeId}`,
      { method: "PUT", body: JSON.stringify(data) }
    );
  }
  async deleteAgencyEmployee(
    orgId: string,
    agencyId: string,
    employeeId: string
  ): Promise<void> {
    return this.fetchMockApi<void>(
      `/${orgId}/agencies/${agencyId}/employees/${employeeId}`,
      { method: "DELETE" }
    );
  }
  async affectEmployeeToAgency(
    orgId: string,
    agencyId: string,
    data: AffectEmployeeRequest
  ): Promise<EmployeeResponse> {
    return this.fetchMockApi<EmployeeResponse>(
      `/${orgId}/agencies/${agencyId}/employees/add`,
      { method: "POST", body: JSON.stringify(data) }
    );
  }

  // SalesPersons (Org-scoped)
  async getOrgSalesPersons(orgId: string): Promise<SalesPersonDto[]> {
    return this.fetchMockApi<SalesPersonDto[]>(`/${orgId}/sales-people`);
  }
  async createOrgSalesPerson(
    orgId: string,
    data: CreateSalesPersonRequest
  ): Promise<SalesPersonDto> {
    return this.fetchMockApi<SalesPersonDto>(`/${orgId}/sales-people`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }
  async getOrgSalesPersonById(
    orgId: string,
    salesPersonId: string
  ): Promise<SalesPersonDto | null> {
    return this.fetchMockApi<SalesPersonDto | null>(
      `/${orgId}/sales-people/${salesPersonId}`
    );
  }
  async updateOrgSalesPerson(
    orgId: string,
    salesPersonId: string,
    data: UpdateSalesPersonRequest
  ): Promise<SalesPersonDto> {
    return this.fetchMockApi<SalesPersonDto>(
      `/${orgId}/sales-people/${salesPersonId}`,
      { method: "PUT", body: JSON.stringify(data) }
    );
  }
  async deleteOrgSalesPerson(
    orgId: string,
    salesPersonId: string
  ): Promise<void> {
    return this.fetchMockApi<void>(
      `/${orgId}/sales-people/${salesPersonId}`,
      { method: "DELETE" }
    );
  }

  // SalesPersons (Agency-scoped)
  async getAgencySalesPersons(
    orgId: string,
    agencyId: string
  ): Promise<SalesPersonDto[]> {
    return this.fetchMockApi<SalesPersonDto[]>(
      `/${orgId}/agencies/${agencyId}/sales-people`
    );
  }
  async createAgencySalesPerson(
    orgId: string,
    agencyId: string,
    data: CreateSalesPersonRequest
  ): Promise<SalesPersonDto> {
    return this.fetchMockApi<SalesPersonDto>(
      `/${orgId}/agencies/${agencyId}/sales-people`,
      { method: "POST", body: JSON.stringify(data) }
    );
  }
  async getAgencySalesPersonById(
    orgId: string,
    agencyId: string,
    salesPersonId: string
  ): Promise<SalesPersonDto | null> {
    return this.fetchMockApi<SalesPersonDto | null>(
      `/${orgId}/agencies/${agencyId}/sales-people/${salesPersonId}`
    );
  }
  async updateAgencySalesPerson(
    orgId: string,
    agencyId: string,
    salesPersonId: string,
    data: UpdateSalesPersonRequest
  ): Promise<SalesPersonDto> {
    return this.fetchMockApi<SalesPersonDto>(
      `/${orgId}/agencies/${agencyId}/sales-people/${salesPersonId}`,
      { method: "PUT", body: JSON.stringify(data) }
    );
  }
  async deleteAgencySalesPerson(
    orgId: string,
    agencyId: string,
    salesPersonId: string
  ): Promise<void> {
    return this.fetchMockApi<void>(
      `/${orgId}/agencies/${agencyId}/sales-people/${salesPersonId}`,
      { method: "DELETE" }
    );
  }

  // Customers (Organization-linked)
  async getOrgCustomers(orgId: string): Promise<CustomerDto[]> {
    return this.fetchMockApi<CustomerDto[]>(`/${orgId}/customers`);
  }
  async createOrgCustomer(
    orgId: string,
    data: CreateCustomerRequest
  ): Promise<CustomerDto> {
    return this.fetchMockApi<CustomerDto>(`/${orgId}/customers`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }
  async getOrgCustomerById(
    orgId: string,
    customerId: string
  ): Promise<CustomerDto | null> {
    return this.fetchMockApi<CustomerDto | null>(
      `/${orgId}/customers/${customerId}`
    );
  }
  async updateOrgCustomer(
    orgId: string,
    customerId: string,
    data: UpdateCustomerRequest
  ): Promise<CustomerDto> {
    return this.fetchMockApi<CustomerDto>(
      `/${orgId}/customers/${customerId}`,
      { method: "PUT", body: JSON.stringify(data) }
    );
  }
  async deleteOrgCustomer(orgId: string, customerId: string): Promise<void> {
    return this.fetchMockApi<void>(`/${orgId}/customers/${customerId}`, {
      method: "DELETE",
    });
  }

  // Customers (Agency-scoped)
  async getAgencyCustomers(
    orgId: string,
    agencyId: string
  ): Promise<CustomerDto[]> {
    return this.fetchMockApi<CustomerDto[]>(
      `/${orgId}/agencies/${agencyId}/customers`,
    );
  }
  async createAgencyCustomer(
    orgId: string,
    agencyId: string,
    data: CreateCustomerRequest
  ): Promise<CustomerDto> {
    return this.fetchMockApi<CustomerDto>(
      `/${orgId}/agencies/${agencyId}/customers`,
      { method: "POST", body: JSON.stringify(data) }
    );
  }
  async getAgencyCustomerById(
    orgId: string,
    agencyId: string,
    customerId: string
  ): Promise<CustomerDto | null> {
    return this.fetchMockApi<CustomerDto | null>(
      `/${orgId}/agencies/${agencyId}/customers/${customerId}`
    );
  }
  async updateAgencyCustomer(
    orgId: string,
    agencyId: string,
    customerId: string,
    data: UpdateCustomerRequest
  ): Promise<CustomerDto> {
    return this.fetchMockApi<CustomerDto>(
      `/${orgId}/agencies/${agencyId}/customers/${customerId}`,
      { method: "PUT", body: JSON.stringify(data) }
    );
  }
  async deleteAgencyCustomer(
    orgId: string,
    agencyId: string,
    customerId: string
  ): Promise<void> {
    return this.fetchMockApi<void>(
      `/${orgId}/agencies/${agencyId}/customers/${customerId}`,
      { method: "DELETE" }
    );
  }
  async affectCustomerToAgency(
    orgId: string,
    agencyId: string,
    data: AffectCustomerRequest
  ): Promise<CustomerDto> {
    return this.fetchMockApi<CustomerDto>(
      `/${orgId}/agencies/${agencyId}/customers/add`,
      { method: "POST", body: JSON.stringify(data) }
    );
  }

  // Suppliers (Providers) (Org-scoped)
  async getOrgSuppliers(orgId: string): Promise<ProviderDto[]> {
    return this.fetchMockApi<ProviderDto[]>(`/${orgId}/suppliers`);
  }
  async createOrgSupplier(
    orgId: string,
    data: CreateProviderRequest
  ): Promise<ProviderDto> {
    return this.fetchMockApi<ProviderDto>(`/${orgId}/suppliers`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }
  async getOrgSupplierById(
    orgId: string,
    providerId: string
  ): Promise<ProviderDto | null> {
    return this.fetchMockApi<ProviderDto | null>(
      `/${orgId}/suppliers/${providerId}`
    );
  }
  async updateOrgSupplier(
    orgId: string,
    providerId: string,
    data: UpdateProviderRequest
  ): Promise<ProviderDto> {
    return this.fetchMockApi<ProviderDto>(
      `/${orgId}/suppliers/${providerId}`,
      { method: "PUT", body: JSON.stringify(data) }
    );
  }
  async deleteOrgSupplier(orgId: string, providerId: string): Promise<void> {
    return this.fetchMockApi<void>(`/${orgId}/suppliers/${providerId} `, {
      method: "DELETE",
    });
  }

  // Suppliers (Providers) (Agency-scoped)
  async getAgencySuppliers(
    orgId: string,
    agencyId: string
  ): Promise<ProviderDto[]> {
    return this.fetchMockApi<ProviderDto[]>(
      `/${orgId}/agencies/${agencyId}/suppliers`
    );
  }
  async createAgencySupplier(
    orgId: string,
    agencyId: string,
    data: CreateProviderRequest
  ): Promise<ProviderDto> {
    return this.fetchMockApi<ProviderDto>(
      `/${orgId}/agencies/${agencyId}/suppliers`,
      { method: "POST", body: JSON.stringify(data) }
    );
  }
  async getAgencySupplierById(
    orgId: string,
    agencyId: string,
    providerId: string
  ): Promise<ProviderDto | null> {
    return this.fetchMockApi<ProviderDto | null>(
      `/${orgId}/agencies/${agencyId}/suppliers/${providerId}`
    );
  }
  async updateAgencySupplier(
    orgId: string,
    agencyId: string,
    providerId: string,
    data: UpdateProviderRequest
  ): Promise<ProviderDto> {
    return this.fetchMockApi<ProviderDto>(
      `/${orgId}/agencies/${agencyId}/suppliers/${providerId}`,
      { method: "PUT", body: JSON.stringify(data) }
    );
  }
  async deleteAgencySupplier(
    orgId: string,
    agencyId: string,
    providerId: string
  ): Promise<void> {
    return this.fetchMockApi<void>(
      `/${orgId}/agencies/${agencyId}/suppliers/${providerId} `,
      { method: "DELETE" }
    );
  }
  async affectSupplierToAgency(
    orgId: string,
    agencyId: string,
    data: AffectProviderRequest
  ): Promise<ProviderDto> {
    return this.fetchMockApi<ProviderDto>(
      `/${orgId}/agencies/${agencyId}/suppliers/add`,
      { method: "POST", body: JSON.stringify(data) }
    );
  }

  // Prospects - (Org-scoped)
  async getOrgProspects(orgId: string): Promise<ProspectDto[]> {
    return this.fetchMockApi<ProspectDto[]>(`/${orgId}/prospects`);
  }
  async createOrgProspect(
    orgId: string,
    data: CreateProspectRequest
  ): Promise<ProspectDto> {
    return this.fetchMockApi<ProspectDto>(`/${orgId}/prospects`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }
  async getOrgProspectById(
    orgId: string,
    prospectId: string
  ): Promise<ProspectDto | null> {
    return this.fetchMockApi<ProspectDto | null>(
      `/${orgId}/prospects/${prospectId}`
    );
  }
  async updateOrgProspect(
    orgId: string,
    prospectId: string,
    data: UpdateProspectRequest
  ): Promise<ProspectDto> {
    return this.fetchMockApi<ProspectDto>(
      `/${orgId}/prospects/${prospectId}`,
      { method: "PUT", body: JSON.stringify(data) }
    );
  }
  async deleteOrgProspect(orgId: string, prospectId: string): Promise<void> {
    return this.fetchMockApi<void>(`/${orgId}/prospects/${prospectId} `, {
      method: "DELETE",
    });
  }

  // Prospects - (Agency-scoped)
  async getAgencyProspects(
    orgId: string,
    agencyId: string
  ): Promise<ProspectDto[]> {
    return this.fetchMockApi<ProspectDto[]>(
      `/${orgId}/agencies/${agencyId}/prospects`
    );
  }
  async createAgencyProspect(
    orgId: string,
    agencyId: string,
    data: CreateProspectRequest
  ): Promise<ProspectDto> {
    return this.fetchMockApi<ProspectDto>(
      `/${orgId}/agencies/${agencyId}/prospects`,
      { method: "POST", body: JSON.stringify(data) }
    );
  }
  async getAgencyProspectById(
    orgId: string,
    agencyId: string,
    prospectId: string
  ): Promise<ProspectDto | null> {
    return this.fetchMockApi<ProspectDto | null>(
      `/${orgId}/agencies/${agencyId}/prospects/${prospectId}`
    );
  }
  async updateAgencyProspect(
    orgId: string,
    agencyId: string,
    prospectId: string,
    data: UpdateProspectRequest
  ): Promise<ProspectDto> {
    return this.fetchMockApi<ProspectDto>(
      `/${orgId}/agencies/${agencyId}/prospects/${prospectId}`,
      { method: "PUT", body: JSON.stringify(data) }
    );
  }
  async deleteAgencyProspect(
    orgId: string,
    agencyId: string,
    prospectId: string
  ): Promise<void> {
    return this.fetchMockApi<void>(
      `/${orgId}/agencies/${agencyId}/prospects/${prospectId} `,
      { method: "DELETE" }
    );
  }

  // Business Actors
  async getAllBusinessActors(): Promise<BusinessActorDto[]> {
    return this.fetchMockApi<BusinessActorDto[]>("", {}, `${MOCK_API_GLOBAL_ORG_ENTITIES_BASE}/business-actors`);
  }
  async createBusinessActor(
    data: CreateBusinessActorRequest
  ): Promise<BusinessActorDto> {
    return this.fetchMockApi<BusinessActorDto>(
      "",
      { method: "POST", body: JSON.stringify(data) },
      MOCK_API_GLOBAL_ORG_ENTITIES_BASE + "/business-actors"
    );
  }
  async getBusinessActorById(baId: string): Promise<BusinessActorDto | null> {
    return this.fetchMockApi<BusinessActorDto | null>(`/${baId}`, {}, `${MOCK_API_GLOBAL_ORG_ENTITIES_BASE}/business-actors`);
  }

  async updateBusinessActor(
    baId: string,
    data: UpdateBusinessActorRequest
  ): Promise<BusinessActorDto> {
    return this.fetchMockApi<BusinessActorDto>(
      `/${baId}`,
      { method: "PUT", body: JSON.stringify(data) },
      MOCK_API_GLOBAL_ORG_ENTITIES_BASE + "/business-actors"
    );
  }
  async deleteBusinessActor(baId: string): Promise<void> {
    return this.fetchMockApi<void>(
      `/${baId} `,
      { method: "DELETE" },
      MOCK_API_GLOBAL_ORG_ENTITIES_BASE + "/business-actors"
    );
  }
  async getBusinessActorsByType(
    type: BusinessActorType
  ): Promise<BusinessActorDto[]> {
    return this.fetchMockApi<BusinessActorDto[]>(
      `/type/${type}`,
      {},
      MOCK_API_GLOBAL_ORG_ENTITIES_BASE + "/business-actors"
    );
    // const orgs = await this.fetchMockApi<OrganizationDto[]>("/all");
  }

  // Images
  async uploadOrganizationImages(
    orgId: string,
    formData: FormData
  ): Promise<ImageDto[]> {
    // For FormData with mock API routes, you typically have a specific route.
    // This simple fetch won send FormData correctly to a generic mock handler without special parsing on the route side.
    // For now, returning a placeholder:
    console.warn(
      "uploadOrganizationImages mock in local repo needs a dedicated mock API route for FormData."
    );
    const files = formData.getAll("images") as File[];
    return Promise.resolve(
      files.map((f) => ({
        id: `mock-img-${Date.now()}`,
        name: f.name,
        size: f.size,
        fileType: f.type,
      }))
    );
  }
  async getOrganizationImageInfo(imageId: string): Promise<ImageDto | null> {
    return this.fetchMockApi<ImageDto | null>(
      `/images/${imageId}`,
      {},
      MOCK_API_GLOBAL_ORG_ENTITIES_BASE
    );
  }

  // ThirdParty
  async getThirdParties(
    orgId: string,
    params: GetThirdPartyRequest
  ): Promise<ThirdPartyDto[]> {
    // This route remains the same as it doesn't conflict.
    return this.fetchMockApi<ThirdPartyDto[]>(
      `/${orgId}/third-parties?${new URLSearchParams(params as any)}`
    );
  }
  async createThirdParty(
    orgId: string,
    type: ThirdPartyType,
    data: CreateThirdPartyRequest
  ): Promise<ThirdPartyDto> {
    // [CHANGE] The route is now static, and the type is part of the body.
    const payload = { ...data, type: type };
    return this.fetchMockApi<ThirdPartyDto>(
      `/${orgId}/third-parties/create`,
      { method: "POST", body: JSON.stringify(payload) }
    );
  }
  async getThirdPartyById(
    orgId: string,
    thirdPartyId: string
  ): Promise<ThirdPartyDto | null> {
    // [CHANGE] The dynamic segment is now explicitly named.
    return this.fetchMockApi<ThirdPartyDto | null>(
      `/${orgId}/third-parties/${thirdPartyId}`
    );
  }
  async updateThirdParty(
    orgId: string,
    thirdPartyId: string,
    data: UpdateThirdPartyRequest
  ): Promise<ThirdPartyDto> {
    // [CHANGE] The dynamic segment is now explicitly named.
    return this.fetchMockApi<ThirdPartyDto>(
      `/${orgId}/third-parties/${thirdPartyId}`,
      { method: "PUT", body: JSON.stringify(data) }
    );
  }
  async deleteThirdParty(orgId: string, thirdPartyId: string): Promise<void> {
    // [CHANGE] The dynamic segment is now explicitly named.
    return this.fetchMockApi<void>(
      `/${orgId}/third-parties/${thirdPartyId}`,
      { method: "DELETE" }
    );
  }
  async updateThirdPartyStatus(
    orgId: string,
    thirdPartyId: string,
    data: UpdateThirdPartyStatusRequest
  ): Promise<ThirdPartyDto> {
    // [CHANGE] The dynamic segment is now explicitly named.
    return this.fetchMockApi<ThirdPartyDto>(
      `/${orgId}/third-parties/${thirdPartyId}/status`,
      { method: "PUT", body: JSON.stringify(data) }
    );
  }
  // Proposed Activities
  async getProposedActivities(
    orgId: string,
    params: { organizationId: string }
  ): Promise<ProposedActivityDto[]> {
    return this.fetchMockApi<ProposedActivityDto[]>(
      `/${orgId}/proposed-activities?${new URLSearchParams(
        params
      ).toString()}`
    );
  } // Ensure mock route handles query
  async createProposedActivity(
    orgId: string,
    data: CreateProposedActivityRequest
  ): Promise<ProposedActivityDto> {
    return this.fetchMockApi<ProposedActivityDto>(
      `/${orgId}/proposed-activities`,
      { method: "POST", body: JSON.stringify(data) }
    );
  }
  async getProposedActivityById(
    orgId: string,
    activityId: string
  ): Promise<ProposedActivityDto | null> {
    return this.fetchMockApi<ProposedActivityDto | null>(
      `/${orgId}/proposed-activities/${activityId}`
    );
  }
  async updateProposedActivity(
    orgId: string,
    activityId: string,
    data: UpdateProposedActivityRequest
  ): Promise<ProposedActivityDto> {
    return this.fetchMockApi<ProposedActivityDto>(
      `/${orgId}/proposed-activities/${activityId}`,
      { method: "PUT", body: JSON.stringify(data) }
    );
  }
  async deleteProposedActivity(
    orgId: string,
    activityId: string
  ): Promise<void> {
    return this.fetchMockApi<void>(
      `/${orgId}/proposed-activities/${activityId}`,
      { method: "DELETE" }
    );
  }

  // Applications & Keys
  async getAllApplications(): Promise<ApplicationDto[]> {
    return this.fetchMockApi<ApplicationDto[]>(
      ``,
      {},
      MOCK_API_GLOBAL_ORG_ENTITIES_BASE + "/applications"
    );
  }
  async createApplication(
    data: CreateApplicationRequest
  ): Promise<ApplicationDto> {
    return this.fetchMockApi<ApplicationDto>(
      ``,
      { method: "POST", body: JSON.stringify(data) },
      MOCK_API_GLOBAL_ORG_ENTITIES_BASE + "/applications"
    );
  }
  async getApplicationKeys(
    applicationId: string
  ): Promise<ApplicationKeyDto[]> {
    return this.fetchMockApi<ApplicationKeyDto[]>(
      `/${applicationId}/keys`,
      {},
      MOCK_API_GLOBAL_ORG_ENTITIES_BASE + "/applications"
    );
  }
  async createApiKey(applicationId: string): Promise<ApplicationKeyDto> {
    return this.fetchMockApi<ApplicationKeyDto>(
      `/${applicationId}/keys`,
      { method: "POST" },
      MOCK_API_GLOBAL_ORG_ENTITIES_BASE + "/applications"
    );
  }
}
