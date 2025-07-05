// lib/data-repo/organization/organization-remote-repository.ts
import { IOrganizationRepository } from './organization-repository-interface';
import { /* Import ALL DTOs and Request types used in the interface */
  OrganizationDto, CreateOrganizationRequest, UpdateOrganizationRequest, UpdateOrganizationStatusRequest,
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
import { yowyobOrganizationApi } from '@/lib/apiClient';

import { cleanBusinessActorDto, cleanOrganizationDto } from "@/lib/id-parser";
export class OrganizationRemoteRepository implements IOrganizationRepository {
  // Organizations
  async getMyOrganizations(): Promise<OrganizationDto[]> {
    const orgs = await yowyobOrganizationApi.getMyOrganizations();
    return orgs.map(org => cleanOrganizationDto(org)!)
  }
  async getAllOrganizations(): Promise<OrganizationDto[]> {
    const orgs = await yowyobOrganizationApi.getAllOrganizations();
    return orgs.map(org => cleanOrganizationDto(org)!)
  }
  async getOrganizationsByDomain(domainId: string): Promise<OrganizationDto[]> {
    const orgs = await yowyobOrganizationApi.getOrganizationsByDomain(domainId);
    return orgs.map(org => cleanOrganizationDto(org)!);
  }
  async getOrganizationById(orgId: string): Promise<OrganizationDto | null> {
    const org = await yowyobOrganizationApi.getOrganizationById(orgId).catch(e => (e.status === 404 ? null : Promise.reject(e)));
    return cleanOrganizationDto(org);
  }
  async createOrganization(data: CreateOrganizationRequest): Promise<OrganizationDto> { return yowyobOrganizationApi.createOrganization(data); }
  async updateOrganization(orgId: string, data: UpdateOrganizationRequest): Promise<OrganizationDto> { return yowyobOrganizationApi.updateOrganization(orgId, data); }
  async deleteOrganization(orgId: string): Promise<void> { return yowyobOrganizationApi.deleteOrganization(orgId); }
  async updateOrganizationStatus(orgId: string, data: UpdateOrganizationStatusRequest): Promise<OrganizationDto> { return yowyobOrganizationApi.updateOrganizationStatus(orgId, data); }
  async addBusinessDomainToOrg(orgId: string, businessDomainId: string): Promise<OrganizationDto> { return yowyobOrganizationApi.addBusinessDomainToOrg(orgId, businessDomainId); }
  async removeBusinessDomainFromOrg(orgId: string, businessDomainId: string): Promise<OrganizationDto> { return yowyobOrganizationApi.removeBusinessDomainFromOrg(orgId, businessDomainId); }

  // Contacts
  async getContacts(contactableType: ContactableType, contactableId: string): Promise<ContactDto[]> { return yowyobOrganizationApi.getContacts(contactableType, contactableId); }
  async getContactById(contactableType: ContactableType, contactableId: string, contactId: string): Promise<ContactDto | null> { return yowyobOrganizationApi.getContactById(contactableType, contactableId, contactId).catch(e => (e.status === 404 ? null : Promise.reject(e))); }
  async createContact(contactableType: ContactableType, contactableId: string, data: CreateContactRequest): Promise<ContactDto> { return yowyobOrganizationApi.createContact(contactableType, contactableId, data); }
  async updateContact(contactableType: ContactableType, contactableId: string, contactId: string, data: UpdateContactRequest): Promise<ContactDto> { return yowyobOrganizationApi.updateContact(contactableType, contactableId, contactId, data); }
  async deleteContactById(contactableType: ContactableType, contactableId: string, contactId: string): Promise<void> { return yowyobOrganizationApi.deleteContactById(contactableType, contactableId, contactId); }
  async markContactAsFavorite(contactableType: ContactableType, contactableId: string, contactId: string): Promise<ContactDto> { return yowyobOrganizationApi.markContactAsFavorite(contactableType, contactableId, contactId); }

  // Addresses
  async getAddresses(addressableType: AddressableType, addressableId: string): Promise<AddressDto[]> { return yowyobOrganizationApi.getAddresses(addressableType, addressableId); }
  async getAddressById(addressableType: AddressableType, addressableId: string, addressId: string): Promise<AddressDto | null> { return yowyobOrganizationApi.getAddressById(addressableType, addressableId, addressId).catch(e => (e.status === 404 ? null : Promise.reject(e))); }
  async createAddress(addressableType: AddressableType, addressableId: string, data: CreateAddressRequest): Promise<AddressDto> { return yowyobOrganizationApi.createAddress(addressableType, addressableId, data); }
  async updateAddress(addressableType: AddressableType, addressableId: string, addressId: string, data: UpdateAddressRequest): Promise<AddressDto> { return yowyobOrganizationApi.updateAddress(addressableType, addressableId, addressId, data); }
  async deleteAddressById(addressableType: AddressableType, addressableId: string, addressId: string): Promise<void> { return yowyobOrganizationApi.deleteAddressById(addressableType, addressableId, addressId); }
  async markAddressAsFavorite(addressableType: AddressableType, addressableId: string, addressId: string): Promise<AddressDto> { return yowyobOrganizationApi.markAddressAsFavorite(addressableType, addressableId, addressId); }

  // Practical Information
  async getPracticalInformation(orgId: string): Promise<PracticalInformationDto[]> { return yowyobOrganizationApi.getPracticalInformation(orgId, { organizationId: orgId }); }
  async createPracticalInformation(orgId: string, data: CreatePracticalInformationRequest): Promise<PracticalInformationDto> { return yowyobOrganizationApi.createPracticalInformation(orgId, data); }
  async getPracticalInformationById(orgId: string, infoId: string): Promise<PracticalInformationDto | null> { return yowyobOrganizationApi.getPracticalInformationById(orgId, infoId).catch(e => (e.status === 404 ? null : Promise.reject(e))); }
  async updatePracticalInformation(orgId: string, infoId: string, data: UpdatePracticalInformationRequest): Promise<PracticalInformationDto> { return yowyobOrganizationApi.updatePracticalInformation(orgId, infoId, data); }
  async deletePracticalInformation(orgId: string, infoId: string): Promise<void> { return yowyobOrganizationApi.deletePracticalInformation(orgId, infoId); }

  // Certifications
  async getCertifications(orgId: string): Promise<CertificationDto[]> { return yowyobOrganizationApi.getCertifications(orgId); }
  async createCertification(orgId: string, data: CreateCertificationRequest): Promise<CertificationDto> { return yowyobOrganizationApi.createCertification(orgId, data); }
  async getCertificationById(orgId: string, certId: string): Promise<CertificationDto | null> { return yowyobOrganizationApi.getCertificationById(orgId, certId).catch(e => (e.status === 404 ? null : Promise.reject(e))); }
  async updateCertification(orgId: string, certId: string, data: UpdateCertificationRequest): Promise<CertificationDto> { return yowyobOrganizationApi.updateCertification(orgId, certId, data); }
  async deleteCertification(orgId: string, certId: string): Promise<void> { return yowyobOrganizationApi.deleteCertification(orgId, certId); }

  // Business Domains
  async getAllBusinessDomains(params?: GetBusinessDomainRequest): Promise<BusinessDomainDto[]> { return yowyobOrganizationApi.getAllBusinessDomains(params); }
  async getBusinessDomainById(domainId: string): Promise<BusinessDomainDto | null> { return yowyobOrganizationApi.getBusinessDomainById(domainId).catch(e => (e.status === 404 ? null : Promise.reject(e))); }
  async createBusinessDomain(data: CreateBusinessDomainRequest): Promise<BusinessDomainDto> { return yowyobOrganizationApi.createBusinessDomain(data); }
  async updateBusinessDomain(domainId: string, data: UpdateBusinessDomainRequest): Promise<BusinessDomainDto> { return yowyobOrganizationApi.updateBusinessDomain(domainId, data); }
  async deleteBusinessDomain(domainId: string): Promise<void> { return yowyobOrganizationApi.deleteBusinessDomain(domainId); }

  // Agencies
  async getAgencies(orgId: string, active?: boolean): Promise<AgencyDto[]> { return yowyobOrganizationApi.getAgencies(orgId, active); }
  async createAgency(orgId: string, data: CreateAgencyRequest): Promise<AgencyDto> { return yowyobOrganizationApi.createAgency(orgId, data); }
  async getAgencyById(orgId: string, agencyId: string): Promise<AgencyDto | null> { return yowyobOrganizationApi.getAgencyById(orgId, agencyId).catch(e => (e.status === 404 ? null : Promise.reject(e))); }
  async updateAgency(orgId: string, agencyId: string, data: UpdateAgencyRequest): Promise<AgencyDto> { return yowyobOrganizationApi.updateAgency(orgId, agencyId, data); }
  async deleteAgency(orgId: string, agencyId: string): Promise<void> { return yowyobOrganizationApi.deleteAgency(orgId, agencyId); }
  async updateAgencyStatus(orgId: string, agencyId: string, data: UpdateAgencyStatusRequest): Promise<AgencyDto> { return yowyobOrganizationApi.updateAgencyStatus(orgId, agencyId, data); }

  // Employees (Organization-scoped)
  async getOrgEmployees(orgId: string): Promise<EmployeeDto[]> { return yowyobOrganizationApi.getOrgEmployees(orgId); }
  async createOrgEmployee(orgId: string, data: CreateEmployeeRequest): Promise<EmployeeResponse> { return yowyobOrganizationApi.createOrgEmployee(orgId, data); }
  async getOrgEmployeeById(orgId: string, employeeId: string): Promise<EmployeeDto | null> { return yowyobOrganizationApi.getOrgEmployeeById(orgId, employeeId).catch(e => e.status === 404 ? null : Promise.reject(e)); }
  async updateOrgEmployee(orgId: string, employeeId: string, data: UpdateEmployeeRequest): Promise<EmployeeResponse> { return yowyobOrganizationApi.updateOrgEmployee(orgId, employeeId, data); }
  async deleteOrgEmployee(orgId: string, employeeId: string): Promise<void> { return yowyobOrganizationApi.deleteOrgEmployee(orgId, employeeId); }

  // Employees (Agency-scoped)
  async getAgencyEmployees(orgId: string, agencyId: string): Promise<EmployeeDto[]> { return yowyobOrganizationApi.getAgencyEmployees(orgId, agencyId); }
  async createAgencyEmployee(orgId: string, agencyId: string, data: CreateEmployeeRequest): Promise<EmployeeResponse> { return yowyobOrganizationApi.createAgencyEmployee(orgId, agencyId, data); }
  async getAgencyEmployeeById(orgId: string, agencyId: string, employeeId: string): Promise<EmployeeDto | null> { return yowyobOrganizationApi.getAgencyEmployeeById(orgId, agencyId, employeeId).catch(e => e.status === 404 ? null : Promise.reject(e)); }
  async updateAgencyEmployee(orgId: string, agencyId: string, employeeId: string, data: UpdateEmployeeRequest): Promise<EmployeeResponse> { return yowyobOrganizationApi.updateAgencyEmployee(orgId, agencyId, employeeId, data); }
  async deleteAgencyEmployee(orgId: string, agencyId: string, employeeId: string): Promise<void> { return yowyobOrganizationApi.deleteAgencyEmployee(orgId, agencyId, employeeId); }
  async affectEmployeeToAgency(orgId: string, agencyId: string, data: AffectEmployeeRequest): Promise<EmployeeResponse> { return yowyobOrganizationApi.affectEmployeeToAgency(orgId, agencyId, data); }

  // SalesPersons - Placeholder, expand similarly to Employees
  async getOrgSalesPersons(orgId: string): Promise<SalesPersonDto[]> { const s = await yowyobOrganizationApi.getOrgSalesPersons(orgId); return s || []; }
  async createOrgSalesPerson(orgId: string, data: CreateSalesPersonRequest): Promise<SalesPersonDto> { return yowyobOrganizationApi.createOrgSalesPerson(orgId, data); }
  async getOrgSalesPersonById(orgId: string, salesPersonId: string): Promise<SalesPersonDto | null> { return yowyobOrganizationApi.getOrgSalesPersonById(orgId, salesPersonId).catch(e => (e.status === 404 ? null : Promise.reject(e))); }
  async updateOrgSalesPerson(orgId: string, salesPersonId: string, data: UpdateSalesPersonRequest): Promise<SalesPersonDto> { return yowyobOrganizationApi.updateOrgSalesPerson(orgId, salesPersonId, data); }
  async deleteOrgSalesPerson(orgId: string, salesPersonId: string): Promise<void> { return yowyobOrganizationApi.deleteOrgSalesPerson(orgId, salesPersonId); }
  async getAgencySalesPersons(orgId: string, agencyId: string): Promise<SalesPersonDto[]> { const s = await yowyobOrganizationApi.getAgencySalesPersons(orgId, agencyId); return s || []; }
  async createAgencySalesPerson(orgId: string, agencyId: string, data: CreateSalesPersonRequest): Promise<SalesPersonDto> { return yowyobOrganizationApi.createAgencySalesPerson(orgId, agencyId, data); }
  async getAgencySalesPersonById(orgId: string, agencyId: string, salesPersonId: string): Promise<SalesPersonDto | null> { return yowyobOrganizationApi.getAgencySalesPersonById(orgId, agencyId, salesPersonId).catch(e => (e.status === 404 ? null : Promise.reject(e))); }
  async updateAgencySalesPerson(orgId: string, agencyId: string, salesPersonId: string, data: UpdateSalesPersonRequest): Promise<SalesPersonDto> { return yowyobOrganizationApi.updateAgencySalesPerson(orgId, agencyId, salesPersonId, data); }
  async deleteAgencySalesPerson(orgId: string, agencyId: string, salesPersonId: string): Promise<void> { return yowyobOrganizationApi.deleteAgencySalesPerson(orgId, agencyId, salesPersonId); }

  // Customers (Organization-linked) - Placeholder
  async getOrgCustomers(orgId: string): Promise<CustomerOrgDto[]> { const c = await yowyobOrganizationApi.getOrgCustomers(orgId); return c || []; }
  async createOrgCustomer(orgId: string, data: CreateCustomerRequest): Promise<CustomerOrgDto> { return yowyobOrganizationApi.createOrgCustomer(orgId, data); }
  async getOrgCustomerById(orgId: string, customerId: string): Promise<CustomerOrgDto | null> { return yowyobOrganizationApi.getOrgCustomerById(orgId, customerId).catch(e => (e.status === 404 ? null : Promise.reject(e))); }
  async updateOrgCustomer(orgId: string, customerId: string, data: UpdateCustomerRequest): Promise<CustomerOrgDto> { return yowyobOrganizationApi.updateOrgCustomer(orgId, customerId, data); }
  async deleteOrgCustomer(orgId: string, customerId: string): Promise<void> { return yowyobOrganizationApi.deleteOrgCustomer(orgId, customerId); }
  async getAgencyCustomers(orgId: string, agencyId: string): Promise<CustomerOrgDto[]> { const c = await yowyobOrganizationApi.getAgencyCustomers(orgId, agencyId); return c || []; }
  async createAgencyCustomer(orgId: string, agencyId: string, data: CreateCustomerRequest): Promise<CustomerOrgDto> { return yowyobOrganizationApi.createAgencyCustomer(orgId, agencyId, data); }
  async getAgencyCustomerById(orgId: string, agencyId: string, customerId: string): Promise<CustomerOrgDto | null> { return yowyobOrganizationApi.getAgencyCustomerById(orgId, agencyId, customerId).catch(e => (e.status === 404 ? null : Promise.reject(e))); }
  async updateAgencyCustomer(orgId: string, agencyId: string, customerId: string, data: UpdateCustomerRequest): Promise<CustomerOrgDto> { return yowyobOrganizationApi.updateAgencyCustomer(orgId, agencyId, customerId, data); }
  async deleteAgencyCustomer(orgId: string, agencyId: string, customerId: string): Promise<void> { return yowyobOrganizationApi.deleteAgencyCustomer(orgId, agencyId, customerId); }
  async affectCustomerToAgency(orgId: string, agencyId: string, data: AffectCustomerRequest): Promise<CustomerOrgDto> { return yowyobOrganizationApi.affectCustomerToAgency(orgId, agencyId, data); }

  // Suppliers (Providers) - Placeholder
  async getOrgSuppliers(orgId: string): Promise<ProviderDto[]> { const s = await yowyobOrganizationApi.getOrgSuppliers(orgId); return s || []; }
  async createOrgSupplier(orgId: string, data: CreateProviderRequest): Promise<ProviderDto> { return yowyobOrganizationApi.createOrgSupplier(orgId, data); }
  async getOrgSupplierById(orgId: string, providerId: string): Promise<ProviderDto | null> { return yowyobOrganizationApi.getOrgSupplierById(orgId, providerId).catch(e => (e.status === 404 ? null : Promise.reject(e))); }
  async updateOrgSupplier(orgId: string, providerId: string, data: UpdateProviderRequest): Promise<ProviderDto> { return yowyobOrganizationApi.updateOrgSupplier(orgId, providerId, data); }
  async deleteOrgSupplier(orgId: string, providerId: string): Promise<void> { return yowyobOrganizationApi.deleteOrgSupplier(orgId, providerId); }
  async getAgencySuppliers(orgId: string, agencyId: string): Promise<ProviderDto[]> { const s = await yowyobOrganizationApi.getAgencySuppliers(orgId, agencyId); return s || []; }
  async createAgencySupplier(orgId: string, agencyId: string, data: CreateProviderRequest): Promise<ProviderDto> { return yowyobOrganizationApi.createAgencySupplier(orgId, agencyId, data); }
  async getAgencySupplierById(orgId: string, agencyId: string, providerId: string): Promise<ProviderDto | null> { return yowyobOrganizationApi.getAgencySupplierById(orgId, agencyId, providerId).catch(e => (e.status === 404 ? null : Promise.reject(e))); }
  async updateAgencySupplier(orgId: string, agencyId: string, providerId: string, data: UpdateProviderRequest): Promise<ProviderDto> { return yowyobOrganizationApi.updateAgencySupplier(orgId, agencyId, providerId, data); }
  async deleteAgencySupplier(orgId: string, agencyId: string, providerId: string): Promise<void> { return yowyobOrganizationApi.deleteAgencySupplier(orgId, agencyId, providerId); }
  async affectSupplierToAgency(orgId: string, agencyId: string, data: AffectProviderRequest): Promise<ProviderDto> { return yowyobOrganizationApi.affectSupplierToAgency(orgId, agencyId, data); }

  // Prospects - Placeholder
  async getOrgProspects(orgId: string): Promise<ProspectDto[]> { const p = await yowyobOrganizationApi.getOrgProspects(orgId); return p || []; }
  async createOrgProspect(orgId: string, data: CreateProspectRequest): Promise<ProspectDto> { return yowyobOrganizationApi.createOrgProspect(orgId, data); }
  async getOrgProspectById(orgId: string, prospectId: string): Promise<ProspectDto | null> { return yowyobOrganizationApi.getOrgProspectById(orgId, prospectId).catch(e => (e.status === 404 ? null : Promise.reject(e))); }
  async updateOrgProspect(orgId: string, prospectId: string, data: UpdateProspectRequest): Promise<ProspectDto> { return yowyobOrganizationApi.updateOrgProspect(orgId, prospectId, data); }
  async deleteOrgProspect(orgId: string, prospectId: string): Promise<void> { return yowyobOrganizationApi.deleteOrgProspect(orgId, prospectId); }
  async getAgencyProspects(orgId: string, agencyId: string): Promise<ProspectDto[]> { const p = await yowyobOrganizationApi.getAgencyProspects(orgId, agencyId); return p || []; }
  async createAgencyProspect(orgId: string, agencyId: string, data: CreateProspectRequest): Promise<ProspectDto> { return yowyobOrganizationApi.createAgencyProspect(orgId, agencyId, data); }
  async getAgencyProspectById(orgId: string, agencyId: string, prospectId: string): Promise<ProspectDto | null> { return yowyobOrganizationApi.getAgencyProspectById(orgId, agencyId, prospectId).catch(e => (e.status === 404 ? null : Promise.reject(e))); }
  async updateAgencyProspect(orgId: string, agencyId: string, prospectId: string, data: UpdateProspectRequest): Promise<ProspectDto> { return yowyobOrganizationApi.updateAgencyProspect(orgId, agencyId, prospectId, data); }
  async deleteAgencyProspect(orgId: string, agencyId: string, prospectId: string): Promise<void> { return yowyobOrganizationApi.deleteAgencyProspect(orgId, agencyId, prospectId); }


  // Business Actors
  async getAllBusinessActors(): Promise<BusinessActorDto[]> {
    const actors = await yowyobOrganizationApi.getAllBusinessActors();
    return actors.map(actor => cleanBusinessActorDto(actor)!);
  }
  async createBusinessActor(data: CreateBusinessActorRequest): Promise<BusinessActorDto> { return yowyobOrganizationApi.createBusinessActor(data); }
  async getBusinessActorById(baId: string): Promise<BusinessActorDto | null> {
    const actor = await yowyobOrganizationApi.getBusinessActorById(baId).catch(e => (e.status === 404 ? null : Promise.reject(e)));
    return actor ? cleanBusinessActorDto(actor) : actor;
  }
  async updateBusinessActor(baId: string, data: UpdateBusinessActorRequest): Promise<BusinessActorDto> { return yowyobOrganizationApi.updateBusinessActor(baId, data); }
  async deleteBusinessActor(baId: string): Promise<void> { return yowyobOrganizationApi.deleteBusinessActor(baId); }
  async getBusinessActorsByType(type: BusinessActorType): Promise<BusinessActorDto[]> {
    const orgs = await yowyobOrganizationApi.getBusinessActorsByType(type);
    return orgs.map(org => cleanBusinessActorDto(org)!);
  }

  // Images
  async uploadOrganizationImages(orgId: string, formData: FormData): Promise<ImageDto[]> { return yowyobOrganizationApi.uploadOrganizationImages(orgId, formData); }
  async getOrganizationImageInfo(imageId: string): Promise<ImageDto | null> { return yowyobOrganizationApi.getOrganizationImageInfo(imageId).catch(e => (e.status === 404 ? null : Promise.reject(e))); }

  // ThirdParty
  async getThirdParties(orgId: string, params: GetThirdPartyRequest): Promise<ThirdPartyDto[]> { return yowyobOrganizationApi.getThirdParties(orgId, params); }
  async createThirdParty(orgId: string, type: ThirdPartyType, data: CreateThirdPartyRequest): Promise<ThirdPartyDto> { return yowyobOrganizationApi.createThirdParty(orgId, type, data); }
  async getThirdPartyById(orgId: string, thirdPartyId: string): Promise<ThirdPartyDto | null> { return yowyobOrganizationApi.getThirdPartyById(orgId, thirdPartyId).catch(e => (e.status === 404 ? null : Promise.reject(e))); }
  async updateThirdParty(orgId: string, thirdPartyId: string, data: UpdateThirdPartyRequest): Promise<ThirdPartyDto> { return yowyobOrganizationApi.updateThirdParty(orgId, thirdPartyId, data); }
  async deleteThirdParty(orgId: string, thirdPartyId: string): Promise<void> { return yowyobOrganizationApi.deleteThirdParty(orgId, thirdPartyId); }
  async updateThirdPartyStatus(orgId: string, thirdPartyId: string, data: UpdateThirdPartyStatusRequest): Promise<ThirdPartyDto> { return yowyobOrganizationApi.updateThirdPartyStatus(orgId, thirdPartyId, data); }

  // Proposed Activities
  async getProposedActivities(orgId: string, params: { organizationId: string }): Promise<ProposedActivityDto[]> { return yowyobOrganizationApi.getProposedActivities(orgId, params); }
  async createProposedActivity(orgId: string, data: CreateProposedActivityRequest): Promise<ProposedActivityDto> { return yowyobOrganizationApi.createProposedActivity(orgId, data); }
  async getProposedActivityById(orgId: string, activityId: string): Promise<ProposedActivityDto | null> { return yowyobOrganizationApi.getProposedActivityById(orgId, activityId).catch(e => (e.status === 404 ? null : Promise.reject(e))); }
  async updateProposedActivity(orgId: string, activityId: string, data: UpdateProposedActivityRequest): Promise<ProposedActivityDto> { return yowyobOrganizationApi.updateProposedActivity(orgId, activityId, data); }
  async deleteProposedActivity(orgId: string, activityId: string): Promise<void> { return yowyobOrganizationApi.deleteProposedActivity(orgId, activityId); }

  // Applications & Keys
  async getAllApplications(): Promise<ApplicationDto[]> { return yowyobOrganizationApi.getAllApplications(); }
  async createApplication(data: CreateApplicationRequest): Promise<ApplicationDto> { return yowyobOrganizationApi.createApplication(data); }
  async getApplicationKeys(applicationId: string): Promise<ApplicationKeyDto[]> { return yowyobOrganizationApi.getApplicationKeys(applicationId); }
  async createApiKey(applicationId: string): Promise<ApplicationKeyDto> { return yowyobOrganizationApi.createApiKey(applicationId); }


}