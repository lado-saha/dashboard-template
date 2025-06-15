// types/organization.ts

// --- General & Reusable ---
export interface Timestamps {
  created_at?: string; // format: date-time
  updated_at?: string; // format: date-time
  deleted_at?: string | null; // format: date-time
}

export interface Auditable extends Timestamps {
  created_by?: string; // format: uuid
  updated_by?: string; // format: uuid
}

export interface ApiResponse<T = any> { // Generic API response wrapper if used
  status?: "SUCCESS" | "FAILED" | "UNKNOWN";
  message?: string;
  data?: T;
  errors?: Record<string, string>;
  ok?: boolean;
}

// --- Organization ---
export type OrganizationLegalForm =
  | "11" | "21" | "22" | "23" | "24" | "31" | "32" | "33" | "34" | "35"
  | "41" | "42" | "51" | "52" | "53" | "54" | "61" | "62" | "63" | "64"
  | "71" | "72" | "73" | "81" | "82" | "83" | "84" | "85";

export type OrganizationStatus =
  | "ACTIVE" | "INACTIVE" | "SUSPENDED" | "TERMINATED"
  | "PENDING_APPROVAL" | "UNDER_REVIEW" | "DISSOLVED";

export interface CreateOrganizationRequest {
  long_name: string;
  short_name: string;
  email: string;
  description: string; // maxLength: 500
  business_domains: string[]; // array of uuid, uniqueItems
  logo_url?: string;
  legal_form: OrganizationLegalForm;
  web_site_url?: string;
  social_network?: string;
  business_registration_number?: string;
  tax_number?: string;
  capital_share?: number;
  registration_date?: string; // format: date-time
  ceo_name?: string;
  year_founded?: string; // format: date-time
  keywords?: string[]; // uniqueItems
  number_of_employees?: number; // int32
}

export interface UpdateOrganizationRequest extends Partial<CreateOrganizationRequest> { }

export interface OrganizationDto extends Auditable {
  organization_id?: string; // format: uuid
  business_domains?: string[]; // array of uuid, uniqueItems
  email?: string;
  short_name?: string;
  long_name?: string;
  description?: string;
  logo_url?: string;
  is_individual_business?: boolean;
  legal_form?: OrganizationLegalForm;
  is_active?: boolean;
  website_url?: string; // Note: spec has web_site_url in request, website_url in DTO
  social_network?: string;
  business_registration_number?: string;
  tax_number?: string;
  capital_share?: number;
  registration_date?: string; // format: date-time
  ceo_name?: string;
  year_founded?: string; // format: date-time
  keywords?: string[]; // uniqueItems
  status?: OrganizationStatus;
  // number_of_employees is in CreateRequest, but not in OrganizationDto per spec
}

export interface OrganizationTableRow extends Auditable { // As per GET /organizations
  organization_id?: string; // format: uuid
  business_actor_id?: string; // format: uuid
  business_domains?: string[];
  email?: string;
  short_name?: string;
  long_name?: string;
  description?: string;
  logo_url?: string;
  is_individual_business?: boolean;
  legal_form?: OrganizationLegalForm;
  is_active?: boolean;
  website_url?: string;
  social_network?: string;
  business_registration_number?: string;
  tax_number?: string;
  capital_share?: number;
  registration_date?: string;
  ceo_name?: string;
  year_founded?: string;
  keywords?: string[];
  status?: OrganizationStatus;
}

export interface UpdateOrganizationStatusRequest {
  status: OrganizationStatus;
}

// --- Contactable & Addressable Types ---
export type ContactableType =
  | "BUSINESS_ACTOR" | "ORGANIZATION" | "AGENCY" | "BUSINESS_PARTNER"
  | "SALES_PERSON" | "PROVIDER" | "CUSTOMER" | "PROSPECT" | "DRIVER" | "DELIVERER";

export type AddressableType = ContactableType | "DELIVERY";

// --- Contacts ---
export interface CreateContactRequest {
  first_name?: string;
  last_name?: string;
  title?: string;
  phone_number?: string;
  secondary_phone_number?: string;
  fax_number?: string;
  email?: string;
  secondary_email?: string;
}
export interface UpdateContactRequest extends Partial<CreateContactRequest> { }

export interface ContactDto extends Auditable {
  contact_id?: string; // format: uuid
  contactable_type?: ContactableType;
  contactable_id?: string; // format: uuid
  first_name?: string;
  last_name?: string;
  title?: string;
  is_email_verified?: boolean;
  is_phone_number_verified?: boolean;
  is_favorite?: boolean;
  phone_number?: string;
  secondary_phone_number?: string;
  fax_number?: string;
  email?: string;
  secondary_email?: string;
  verified_at?: string | null; // format: date-time
}

// --- Addresses ---
export interface CreateAddressRequest {
  address_line_1?: string;
  address_line_2?: string;
  city?: string;
  state?: string; // Often refers to province/region
  locality?: string;
  country_id?: string; // format: uuid (assuming this maps to a country entity)
  zip_code?: string;
  neighbor_hood?: string;
  latitude?: number; // format: double
  longitude?: number; // format: double
}
export interface UpdateAddressRequest extends Partial<CreateAddressRequest> { }

export interface AddressDto extends Auditable {
  addressable_type?: AddressableType;
  addressable_id?: string; // format: uuid
  address_id?: string; // format: uuid
  address_line_1?: string;
  address_line_2?: string;
  city?: string;
  state?: string;
  locality?: string;
  country_id?: string; // format: uuid
  zip_code?: string;
  is_default?: boolean;
  neighbor_hood?: string;
  latitude?: number; // format: double
  longitude?: number; // format: double
}


// --- Agency ---
export interface CreateAgencyRequest {
  short_name: string;
  long_name: string;
  description?: string; // maxLength: 500
  location: string; // This could be an address ID or a simple string; API spec implies string.
  business_domains: string[]; // array of uuid, uniqueItems
  transferable?: boolean;
  images?: string[]; // array of image URLs/IDs, uniqueItems
  greeting_message?: string;
  registration_date?: string; // format: date-time
  average_revenue?: number;
  capital_share?: number;
  registration_number?: string;
  social_network?: string;
  tax_number?: string;
}
export interface UpdateAgencyRequest extends Partial<CreateAgencyRequest> { }

export interface AgencyDto extends Auditable {
  organization_id?: string; // format: uuid
  agency_id?: string; // format: uuid
  owner_id?: string; // format: uuid
  name?: string; // Likely short_name or long_name
  location?: string;
  description?: string;
  transferable?: boolean;
  business_domains?: string[];
  is_active?: boolean;
  logo?: string; // Assuming logo_url
  short_name?: string;
  long_name?: string;
  is_individual_business?: boolean; // This seems to be an org-level field, but present in AgencyDto
  is_headquarter?: boolean;
  images?: string[];
  greeting_message?: string;
  year_created?: string; // format: date-time
  manager_name?: string;
  registration_date?: string;
  average_revenue?: number;
  capital_share?: number;
  registration_number?: string;
  social_network?: string;
  tax_number?: string;
  keywords?: string[];
  is_public?: boolean;
  is_business?: boolean;
  operation_time_plan?: Record<string, string>; // e.g. {"monday": "9am-5pm"}
  total_affiliated_customers?: number; // int32
}
export interface UpdateAgencyStatusRequest { active: boolean; }


// --- Employee ---
export type EmployeeRole =
  | "CEO" | "ENGINEER" | "MARKETING" | "FINANCE" | "HR" | "SALES"
  | "CUSTOMERSERVICE" | "OWNER" | "SALESPERSON" | "CUSTOMER" | "PROVIDER"
  | "MANAGER" | "SUPERADMIN" | "ADMIN" | "SUPPORT" | "OTHER";

export interface CreateEmployeeRequest {
  first_name?: string;
  last_name?: string;
  short_description?: string;
  long_description?: string;
  location_id?: string; // format: uuid (likely an Address ID)
  logo?: string; // URL for employee photo/avatar
  department?: string;
  employee_role?: EmployeeRole;
}
export interface UpdateEmployeeRequest extends Partial<CreateEmployeeRequest> { }
export interface AffectEmployeeRequest { employee_id?: string; /* uuid */ }

export interface EmployeeDto extends Auditable { // From EmployeeResponse in spec
  employee_id?: string; // format: uuid
  last_name?: string;
  first_name?: string;
  organisation_id?: string; // format: uuid (spec has organisation_id)
  agency_id?: string; // format: uuid
  employee_role?: EmployeeRole;
  department?: string;
  // These fields are in ProviderDto/SalesPersonDto/CustomerDto, but also in EmployeeDto in spec
  short_description?: string;
  long_description?: string;
  location_id?: string; // format: uuid
  partner_type?: "CUSTOMER" | "SUPPLIER" | "SALE" | "PROSPECT"; // from ProviderDto structure
  partner_details?: string; // from ProviderDto structure
  logo?: string;
  is_manager?: boolean; // Specifically from EmployeeDto
}
// EmployeeResponse is same structure as EmployeeDto in spec.

// --- Business Actor --- (Simplified DTO, Request from spec)
export type BusinessActorType = "PROVIDER" | "CUSTOMER" | "SALESPERSON" | "CLIENT" | "FREELANCE_DRIVER" | "FARMER" | "AGENCY" | "VEHICLE_RENTAL" | "GUEST";
export type Gender = "MALE" | "FEMALE";

export interface CreateBusinessActorRequest {
  first_name: string;
  phone_number?: string;
  email?: string;
  avatar_picture?: string;
  profile_picture?: string;
  last_name?: string;
  is_individual?: boolean;
  birth_date?: string; // date-time
  gender?: Gender;
  nationality?: string;
  profession?: string;
  biography?: string;
  type?: BusinessActorType;
}
export interface UpdateBusinessActorRequest extends Partial<CreateBusinessActorRequest> { }

export interface BusinessActorDto extends Auditable {
  business_actor_id?: string; // uuid
  phone_number?: string;
  email?: string;
  avatar_picture?: string;
  profile_picture?: string;
  first_name?: string;
  last_name?: string;
  is_individual?: boolean;
  is_available?: boolean;
  birth_date?: string; // date-time
  role?: EmployeeRole; // Reusing EmployeeRole as it's very similar
  gender?: Gender;
  nationality?: string;
  profession?: string;
  qualifications?: string[];
  payment_methods?: string[]; // unique
  addresses?: string[]; // array of uuid, unique
  is_verified?: boolean;
  is_active?: boolean;
  biography?: string;
  type?: BusinessActorType;
}

// --- Add other DTOs as needed: PracticalInformation, Certification, BusinessDomain, Image, etc. ---
export interface CreatePracticalInformationRequest {
  type?: string;
  value?: string;
  notes?: string;
}
export interface UpdatePracticalInformationRequest extends CreatePracticalInformationRequest { }
export interface PracticalInformationDto extends Auditable {
  organization_id?: string; //uuid
  information_id?: string; //uuid
  type?: string;
  value?: string;
  notes?: string;
}

export interface CreateCertificationRequest {
  type?: string;
  name?: string;
  description?: string;
  obtainment_date?: string; // date-time
}
export interface UpdateCertificationRequest extends CreateCertificationRequest { }
export interface CertificationDto extends Auditable {
  organization_id?: string; //uuid
  certification_id?: string; //uuid
  type?: string;
  name?: string;
  description?: string;
  obtainment_date?: string; // date-time
}

export interface CreateBusinessDomainRequest {
  name: string;
  type: string; // Consider an enum if known
  type_label: string;
  parent_domain_id?: string; // uuid
  image?: string;
  galleries?: string[];
  description?: string; // maxLength 255
  metadata?: Record<string, any>;
}
export interface UpdateBusinessDomainRequest extends Partial<CreateBusinessDomainRequest> { }
export interface BusinessDomainDto extends Auditable {
  id?: string; //uuid
  organization_id?: string; //uuid (present in Dto but not CreateRequest)
  parent_domain_id?: string; //uuid
  name?: string;
  image?: string;
  galleries?: string[];
  type?: string;
  type_label?: string;
  description?: string;
  metadata?: Record<string, any>;
}
export interface GetBusinessDomainRequest { // For query params of GET /business-domains
  organization_id?: string;
  parent_domain_id?: string;
  name?: string;
  page?: number; // int32, min 1
  size?: number; // int32, min 1
}


export interface ImageDto {
  id?: string;
  name?: string;
  size?: number; // int64
  fileType?: string;
}

// --- DTOs for Customer, Supplier, SalesPerson, Prospect (as 'partners' of an Org/Agency) ---
// These seem to share many fields from ProviderDto in the spec.
export interface PartnerBaseDto extends Auditable {
  organization_id?: string; // uuid
  agency_id?: string; // uuid, if applicable
  first_name?: string;
  last_name?: string;
  short_description?: string;
  long_description?: string;
  location_id?: string; // uuid (Address ID)
  partner_type?: "CUSTOMER" | "SUPPLIER" | "SALE" | "PROSPECT";
  partner_details?: string; // JSON string or specific object?
  logo?: string; // url
  is_active?: boolean; // Not in all, but good to have
}

export interface CustomerOrgDto extends PartnerBaseDto { // Customer linked to an Organization
  customer_id?: string; // uuid
  transaction_id?: number; // float
  payment_method?: string;
  amount_paid?: string; // Should this be number? Spec says string.
}
export interface CreateCustomerRequest { // For POST /organizations/{orgId}/customers
  first_name?: string;
  last_name?: string;
  short_description?: string;
  long_description?: string;
  location_id?: string; // uuid
  logo?: string;
  transaction_id?: number; // float
  payment_method?: string;
  amount_paid?: string;
}
export interface UpdateCustomerRequest extends Partial<CreateCustomerRequest> { }
export interface AffectCustomerRequest { customer_id?: string; }


export interface ProviderDto extends PartnerBaseDto { // Supplier
  provider_id?: string; // uuid
  contact_info?: string; // Merged phone/email?
  address?: string; // Simple string address, or use AddressDto?
  product_service_type?: string;
}
export interface CreateProviderRequest { // For POST /organizations/{orgId}/suppliers
  first_name?: string;
  last_name?: string;
  short_description?: string;
  long_description?: string;
  location_id?: string; // uuid
  logo?: string;
  contact_info?: string;
  address?: string;
  product_service_type?: string;
}
export interface UpdateProviderRequest extends Partial<CreateProviderRequest> { }
export interface AffectProviderRequest { provider_id?: string; }


export interface SalesPersonDto extends PartnerBaseDto {
  sales_person_id?: string; // uuid
  name?: string; // In addition to first/last name? Maybe for display.
  commission_rate?: number; // float
  credit?: number; // float
  current_balance?: number; // float
}
export interface CreateSalesPersonRequest { // For POST /organizations/{orgId}/sales-people
  name?: string; // This is in create, but not in Employee create.
  commission_rate?: number;
  credit?: number;
  current_balance?: number;
  // Fields from CreateEmployeeRequest might be needed here if a sales person is also an employee
  first_name?: string;
  last_name?: string;
  // ... other employee fields?
}
export interface UpdateSalesPersonRequest extends Partial<CreateSalesPersonRequest> { }


export interface ProspectDto extends PartnerBaseDto {
  prospect_id?: string; // uuid
  transaction_id?: number; // float
  payment_method?: string;
  amount_paid?: string; // Spec says string
  interest_level?: string;
}
export interface CreateProspectRequest { // For POST /organizations/{orgId}/prospects
  first_name?: string;
  last_name?: string;
  short_description?: string;
  long_description?: string;
  location_id?: string; // uuid
  logo?: string;
  transaction_id?: number;
  payment_method?: string;
  amount_paid?: string;
  interest_level?: string;
}
export interface UpdateProspectRequest extends Partial<CreateProspectRequest> { }

// ThirdParty DTOs - Seems like a generic way to represent partners/agencies
export type ThirdPartyType = "11" | "12" | "21" | "22" | "23" | "24" | "25" | "31" | "32" | "33" | "34" | "41" | "42" | "43" | "51" | "52" | "61" | "62" | "63" | "71" | "72";
export interface CreateThirdPartyRequest {
  legal_form?: OrganizationLegalForm;
  unique_identification_number?: string;
  trade_registration_number?: string;
  name?: string;
  acronym?: string;
  long_name?: string;
  logo?: string;
  images?: string[];
  accounting_account_numbers?: string[];
  authorized_payment_methods?: string[]; // unique
  authorized_credit_limit?: number;
  max_discount_rate?: number;
  vat_subject?: boolean;
  operations_balance?: number;
  opening_balance?: number;
  pay_term_number?: number; // int32
  pay_term_type?: string;
  third_party_family?: string;
  classification?: Record<string, string>;
  tax_number?: string;
  loyalty_points?: number; // int32
  loyalty_points_used?: number; // int32
  loyalty_points_expired?: number; // int32
}
export interface UpdateThirdPartyRequest extends Partial<CreateThirdPartyRequest> { }
export interface ThirdPartyDto extends Auditable {
  organization_id?: string; // uuid
  id?: string; // uuid (this is the third_party_id)
  type?: ThirdPartyType; // This refers to the enum like "11", "12" etc.
  // ... plus all fields from CreateThirdPartyRequest
  legal_form?: OrganizationLegalForm;
  unique_identification_number?: string;
  trade_registration_number?: string;
  name?: string;
  acronym?: string;
  long_name?: string;
  logo?: string;
  // ... and so on
}
export interface UpdateThirdPartyStatusRequest { active: boolean; }
export interface GetThirdPartyRequest { // For query params of GET /organizations/{orgId}/third-parties
  status?: boolean;
  type?: ThirdPartyType;
  page?: number; // int32, min 1
  size?: number; // int32, min 1
}

// Proposed Activity
export interface CreateProposedActivityRequest {
  type?: string;
  name?: string;
  rate?: number;
  description?: string;
}
export interface UpdateProposedActivityRequest extends CreateProposedActivityRequest { }
export interface ProposedActivityDto extends Auditable {
  activity_id?: string; // uuid
  organization_id?: string; // uuid
  type?: string;
  name?: string;
  rate?: number;
  description?: string;
}

// Application & API Keys (Mostly for Super Admin or advanced BA settings)
export interface CreateApplicationRequest {
  name: string;
  description?: string;
  success_url?: string; // pattern: ^(https?://).*
  cancel_url?: string;  // pattern: ^(https?://).*
  failed_url?: string;  // pattern: ^(https?://).*
  callback_url?: string; // pattern: ^(https?://).*
}
export interface ApplicationDto extends Auditable {
  id?: string; // uuid
  business_actor_id?: string; // uuid
  name?: string;
  description?: string;
  is_active?: boolean;
  success_url?: string;
  cancel_url?: string;
  failed_url?: string;
  callback_url?: string;
}
export interface ApplicationKeyDto extends Auditable {
  application_id?: string; // uuid
  public_key?: string;
  secret_key?: string;
}