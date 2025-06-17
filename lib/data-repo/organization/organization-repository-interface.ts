// lib/data-repo/organization/organization-repository-interface.ts
import {
  OrganizationTableRow, OrganizationDto, CreateOrganizationRequest, UpdateOrganizationRequest, UpdateOrganizationStatusRequest,
  ContactDto, CreateContactRequest, UpdateContactRequest, ContactableType,
  AddressDto, CreateAddressRequest, UpdateAddressRequest, AddressableType,
  AgencyDto, CreateAgencyRequest, UpdateAgencyRequest, UpdateAgencyStatusRequest,
  EmployeeDto, CreateEmployeeRequest, UpdateEmployeeRequest, AffectEmployeeRequest, EmployeeResponse,
  SalesPersonDto, CreateSalesPersonRequest, UpdateSalesPersonRequest,
  CustomerOrgDto, CreateCustomerRequest, UpdateCustomerRequest, AffectCustomerRequest,
  ProviderDto, CreateProviderRequest, UpdateProviderRequest, AffectProviderRequest,
  ProspectDto, CreateProspectRequest, UpdateProspectRequest,
  PracticalInformationDto, CreatePracticalInformationRequest, UpdatePracticalInformationRequest,
  CertificationDto, CreateCertificationRequest, UpdateCertificationRequest,
  BusinessDomainDto, CreateBusinessDomainRequest, UpdateBusinessDomainRequest, GetBusinessDomainRequest,
  ImageDto,
  ThirdPartyDto, CreateThirdPartyRequest, UpdateThirdPartyRequest, UpdateThirdPartyStatusRequest, GetThirdPartyRequest, ThirdPartyType,
  ProposedActivityDto, CreateProposedActivityRequest, UpdateProposedActivityRequest,
  BusinessActorDto, CreateBusinessActorRequest, UpdateBusinessActorRequest, BusinessActorType,
  ApplicationDto, CreateApplicationRequest, ApplicationKeyDto,
} from '@/types/organization';

export interface IOrganizationRepository {
  // Organizations
  getMyOrganizations(): Promise<OrganizationTableRow[]>;
  getAllOrganizations(): Promise<OrganizationTableRow[]>;
  getOrganizationsByDomain(domainId: string): Promise<OrganizationTableRow[]>;
  getOrganizationById(orgId: string): Promise<OrganizationDto | null>;
  createOrganization(data: CreateOrganizationRequest): Promise<OrganizationDto>;
  updateOrganization(orgId: string, data: UpdateOrganizationRequest): Promise<OrganizationDto>;
  deleteOrganization(orgId: string): Promise<void>;
  updateOrganizationStatus(orgId: string, data: UpdateOrganizationStatusRequest): Promise<OrganizationDto>;
  addBusinessDomainToOrg(orgId: string, businessDomainId: string): Promise<OrganizationDto>;
  removeBusinessDomainFromOrg(orgId: string, businessDomainId: string): Promise<OrganizationDto>;

  // Contacts
  getContacts(contactableType: ContactableType, contactableId: string): Promise<ContactDto[]>;
  getContactById(contactableType: ContactableType, contactableId: string, contactId: string): Promise<ContactDto | null>;
  createContact(contactableType: ContactableType, contactableId: string, data: CreateContactRequest): Promise<ContactDto>;
  updateContact(contactableType: ContactableType, contactableId: string, contactId: string, data: UpdateContactRequest): Promise<ContactDto>;
  deleteContactById(contactableType: ContactableType, contactableId: string, contactId: string): Promise<void>;
  markContactAsFavorite(contactableType: ContactableType, contactableId: string, contactId: string): Promise<ContactDto>;

  // Addresses
  getAddresses(addressableType: AddressableType, addressableId: string): Promise<AddressDto[]>;
  getAddressById(addressableType: AddressableType, addressableId: string, addressId: string): Promise<AddressDto | null>;
  createAddress(addressableType: AddressableType, addressableId: string, data: CreateAddressRequest): Promise<AddressDto>;
  updateAddress(addressableType: AddressableType, addressableId: string, addressId: string, data: UpdateAddressRequest): Promise<AddressDto>;
  deleteAddressById(addressableType: AddressableType, addressableId: string, addressId: string): Promise<void>;
  markAddressAsFavorite(addressableType: AddressableType, addressableId: string, addressId: string): Promise<AddressDto>;

  // Practical Information
  getPracticalInformation(orgId: string): Promise<PracticalInformationDto[]>; // Adjusted params
  createPracticalInformation(orgId: string, data: CreatePracticalInformationRequest): Promise<PracticalInformationDto>;
  getPracticalInformationById(orgId: string, infoId: string): Promise<PracticalInformationDto | null>;
  updatePracticalInformation(orgId: string, infoId: string, data: UpdatePracticalInformationRequest): Promise<PracticalInformationDto>;
  deletePracticalInformation(orgId: string, infoId: string): Promise<void>;

  // Certifications
  getCertifications(orgId: string): Promise<CertificationDto[]>;
  createCertification(orgId: string, data: CreateCertificationRequest): Promise<CertificationDto>;
  getCertificationById(orgId: string, certId: string): Promise<CertificationDto | null>;
  updateCertification(orgId: string, certId: string, data: UpdateCertificationRequest): Promise<CertificationDto>;
  deleteCertification(orgId: string, certId: string): Promise<void>;

  // Business Domains
  getAllBusinessDomains(params?: GetBusinessDomainRequest): Promise<BusinessDomainDto[]>;
  getBusinessDomainById(domainId: string): Promise<BusinessDomainDto | null>;
  createBusinessDomain(data: CreateBusinessDomainRequest): Promise<BusinessDomainDto>;
  updateBusinessDomain(domainId: string, data: UpdateBusinessDomainRequest): Promise<BusinessDomainDto>;
  deleteBusinessDomain(domainId: string): Promise<void>;

  // Agencies
  getAgencies(orgId: string, active?: boolean): Promise<AgencyDto[]>;
  createAgency(orgId: string, data: CreateAgencyRequest): Promise<AgencyDto>;
  getAgencyById(orgId: string, agencyId: string): Promise<AgencyDto | null>;
  updateAgency(orgId: string, agencyId: string, data: UpdateAgencyRequest): Promise<AgencyDto>;
  deleteAgency(orgId: string, agencyId: string): Promise<void>;
  updateAgencyStatus(orgId: string, agencyId: string, data: UpdateAgencyStatusRequest): Promise<AgencyDto>;

  // Employees (Organization-scoped)
  getOrgEmployees(orgId: string): Promise<EmployeeDto[]>;
  createOrgEmployee(orgId: string, data: CreateEmployeeRequest): Promise<EmployeeResponse>;
  getOrgEmployeeById(orgId: string, employeeId: string): Promise<EmployeeDto | null>;
  updateOrgEmployee(orgId: string, employeeId: string, data: UpdateEmployeeRequest): Promise<EmployeeResponse>;
  deleteOrgEmployee(orgId: string, employeeId: string): Promise<void>;

  // Employees (Agency-scoped)
  getAgencyEmployees(orgId: string, agencyId: string): Promise<EmployeeDto[]>;
  createAgencyEmployee(orgId: string, agencyId: string, data: CreateEmployeeRequest): Promise<EmployeeResponse>;
  getAgencyEmployeeById(orgId: string, agencyId: string, employeeId: string): Promise<EmployeeDto | null>;
  updateAgencyEmployee(orgId: string, agencyId: string, employeeId: string, data: UpdateEmployeeRequest): Promise<EmployeeResponse>;
  deleteAgencyEmployee(orgId: string, agencyId: string, employeeId: string): Promise<void>;
  affectEmployeeToAgency(orgId: string, agencyId: string, data: AffectEmployeeRequest): Promise<EmployeeResponse>;

  // SalesPersons (Organization-scoped)
  getOrgSalesPersons(orgId: string): Promise<SalesPersonDto[]>;
  createOrgSalesPerson(orgId: string, data: CreateSalesPersonRequest): Promise<SalesPersonDto>;
  getOrgSalesPersonById(orgId: string, salesPersonId: string): Promise<SalesPersonDto | null>;
  updateOrgSalesPerson(orgId: string, salesPersonId: string, data: UpdateSalesPersonRequest): Promise<SalesPersonDto>;
  deleteOrgSalesPerson(orgId: string, salesPersonId: string): Promise<void>;

  // SalesPersons (Agency-scoped)
  getAgencySalesPersons(orgId: string, agencyId: string): Promise<SalesPersonDto[]>;
  createAgencySalesPerson(orgId: string, agencyId: string, data: CreateSalesPersonRequest): Promise<SalesPersonDto>;
  getAgencySalesPersonById(orgId: string, agencyId: string, salesPersonId: string): Promise<SalesPersonDto | null>;
  updateAgencySalesPerson(orgId: string, agencyId: string, salesPersonId: string, data: UpdateSalesPersonRequest): Promise<SalesPersonDto>;
  deleteAgencySalesPerson(orgId: string, agencyId: string, salesPersonId: string): Promise<void>;

  // Customers (Organization-scoped)
  getOrgCustomers(orgId: string): Promise<CustomerOrgDto[]>;
  createOrgCustomer(orgId: string, data: CreateCustomerRequest): Promise<CustomerOrgDto>;
  getOrgCustomerById(orgId: string, customerId: string): Promise<CustomerOrgDto | null>;
  updateOrgCustomer(orgId: string, customerId: string, data: UpdateCustomerRequest): Promise<CustomerOrgDto>;
  deleteOrgCustomer(orgId: string, customerId: string): Promise<void>;

  // Customers (Agency-scoped)
  getAgencyCustomers(orgId: string, agencyId: string): Promise<CustomerOrgDto[]>;
  createAgencyCustomer(orgId: string, agencyId: string, data: CreateCustomerRequest): Promise<CustomerOrgDto>;
  getAgencyCustomerById(orgId: string, agencyId: string, customerId: string): Promise<CustomerOrgDto | null>;
  updateAgencyCustomer(orgId: string, agencyId: string, customerId: string, data: UpdateCustomerRequest): Promise<CustomerOrgDto>;
  deleteAgencyCustomer(orgId: string, agencyId: string, customerId: string): Promise<void>;
  affectCustomerToAgency(orgId: string, agencyId: string, data: AffectCustomerRequest): Promise<CustomerOrgDto>;

  // Suppliers (Providers) (Organization-scoped)
  getOrgSuppliers(orgId: string): Promise<ProviderDto[]>;
  createOrgSupplier(orgId: string, data: CreateProviderRequest): Promise<ProviderDto>;
  getOrgSupplierById(orgId: string, providerId: string): Promise<ProviderDto | null>;
  updateOrgSupplier(orgId: string, providerId: string, data: UpdateProviderRequest): Promise<ProviderDto>;
  deleteOrgSupplier(orgId: string, providerId: string): Promise<void>;

  // Suppliers (Providers) (Agency-scoped)
  getAgencySuppliers(orgId: string, agencyId: string): Promise<ProviderDto[]>;
  createAgencySupplier(orgId: string, agencyId: string, data: CreateProviderRequest): Promise<ProviderDto>;
  getAgencySupplierById(orgId: string, agencyId: string, providerId: string): Promise<ProviderDto | null>;
  updateAgencySupplier(orgId: string, agencyId: string, providerId: string, data: UpdateProviderRequest): Promise<ProviderDto>;
  deleteAgencySupplier(orgId: string, agencyId: string, providerId: string): Promise<void>;
  affectSupplierToAgency(orgId: string, agencyId: string, data: AffectProviderRequest): Promise<ProviderDto>;

  // Prospects (Organization-scoped)
  getOrgProspects(orgId: string): Promise<ProspectDto[]>;
  createOrgProspect(orgId: string, data: CreateProspectRequest): Promise<ProspectDto>;
  getOrgProspectById(orgId: string, prospectId: string): Promise<ProspectDto | null>;
  updateOrgProspect(orgId: string, prospectId: string, data: UpdateProspectRequest): Promise<ProspectDto>;
  deleteOrgProspect(orgId: string, prospectId: string): Promise<void>;

  // Prospects (Agency-scoped)
  getAgencyProspects(orgId: string, agencyId: string): Promise<ProspectDto[]>;
  createAgencyProspect(orgId: string, agencyId: string, data: CreateProspectRequest): Promise<ProspectDto>;
  getAgencyProspectById(orgId: string, agencyId: string, prospectId: string): Promise<ProspectDto | null>;
  updateAgencyProspect(orgId: string, agencyId: string, prospectId: string, data: UpdateProspectRequest): Promise<ProspectDto>;
  deleteAgencyProspect(orgId: string, agencyId: string, prospectId: string): Promise<void>;

  // Business Actors (Global in this service context)
  getAllBusinessActors(): Promise<BusinessActorDto[]>;
  createBusinessActor(data: CreateBusinessActorRequest): Promise<BusinessActorDto>;
  getBusinessActorById(baId: string): Promise<BusinessActorDto | null>;
  updateBusinessActor(baId: string, data: UpdateBusinessActorRequest): Promise<BusinessActorDto>;
  deleteBusinessActor(baId: string): Promise<void>;
  getBusinessActorsByType(type: BusinessActorType): Promise<BusinessActorDto[]>;

  // Images
  uploadOrganizationImages(orgId: string, formData: FormData): Promise<ImageDto[]>;
  getOrganizationImageInfo(imageId: string): Promise<ImageDto | null>;

  // ThirdParty
  getThirdParties(orgId: string, params: GetThirdPartyRequest): Promise<ThirdPartyDto[]>;
  createThirdParty(orgId: string, type: ThirdPartyType, data: CreateThirdPartyRequest): Promise<ThirdPartyDto>;
  getThirdPartyById(orgId: string, thirdPartyId: string): Promise<ThirdPartyDto | null>;
  updateThirdParty(orgId: string, thirdPartyId: string, data: UpdateThirdPartyRequest): Promise<ThirdPartyDto>;
  deleteThirdParty(orgId: string, thirdPartyId: string): Promise<void>;
  updateThirdPartyStatus(orgId: string, thirdPartyId: string, data: UpdateThirdPartyStatusRequest): Promise<ThirdPartyDto>;

  // Proposed Activities
  getProposedActivities(orgId: string, params: { organizationId: string }): Promise<ProposedActivityDto[]>;
  createProposedActivity(orgId: string, data: CreateProposedActivityRequest): Promise<ProposedActivityDto>;
  getProposedActivityById(orgId: string, activityId: string): Promise<ProposedActivityDto | null>;
  updateProposedActivity(orgId: string, activityId: string, data: UpdateProposedActivityRequest): Promise<ProposedActivityDto>;
  deleteProposedActivity(orgId: string, activityId: string): Promise<void>;

  // Applications & Keys
  getAllApplications(): Promise<ApplicationDto[]>;
  createApplication(data: CreateApplicationRequest): Promise<ApplicationDto>;
  getApplicationKeys(applicationId: string): Promise<ApplicationKeyDto[]>;
  createApiKey(applicationId: string): Promise<ApplicationKeyDto>;
}