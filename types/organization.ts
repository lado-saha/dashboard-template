// types/organization.ts

/**
 * Base interface for auditable entities, containing creation and update timestamps and user IDs.
 */
export interface Auditable {
  created_at?: string; // format: date-time
  updated_at?: string; // format: date-time
  deleted_at?: string; // format: date-time
  created_by?: string; // format: uuid
  updated_by?: string; // format: uuid
}

/**
 * Standard API response wrapper.
 */
export interface ApiResponse<T = any> {
  status?: "SUCCESS" | "FAILED" | "UNKNOWN";
  message?: string;
  data?: T;
  errors?: Record<string, string>;
  ok?: boolean;
}

// --- Contactable & Addressable Enums ---
export type ContactableType =
  | "BUSINESS_ACTOR"
  | "ORGANIZATION"
  | "AGENCY"
  | "BUSINESS_PARTNER"
  | "SALES_PERSON"
  | "PROVIDER"
  | "CUSTOMER"
  | "PROSPECT"
  | "DRIVER"
  | "DELIVERER";

export type AddressableType = ContactableType | "DELIVERY";

// --- Organization ---
export type OrganizationLegalForm =
  | "11" | "21" | "22" | "23" | "24" | "31" | "32" | "33" | "34" | "35"
  | "41" | "42" | "51" | "52" | "53" | "54" | "61" | "62" | "63" | "64"
  | "71" | "72" | "73" | "81" | "82" | "83" | "84" | "85";

export type OrganizationStatus =
  | "ACTIVE"
  | "INACTIVE"
  | "SUSPENDED"
  | "TERMINATED"
  | "PENDING_APPROVAL"
  | "UNDER_REVIEW"
  | "DISSOLVED";

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
  number_of_employees?: number; // format: int32
}

export interface UpdateOrganizationRequest {
  long_name: string;
  short_name: string;
  email: string;
  description: string; // maxLength: 500, minLength: 0
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
  number_of_employees?: number; // format: int32
}

// export interface OrganizationDto extends Auditable {
//   organization_id?: string; // format: uuid
//   business_domains?: string[]; // array of uuid, uniqueItems
//   email?: string;
//   short_name?: string;
//   long_name?: string;
//   description?: string;
//   logo_url?: string;
//   is_individual_business?: boolean;
//   legal_form?: OrganizationLegalForm;
//   is_active?: boolean;
//   website_url?: string;
//   social_network?: string;
//   business_registration_number?: string;
//   tax_number?: string;
//   capital_share?: number;
//   registration_date?: string; // format: date-time
//   ceo_name?: string;
//   year_founded?: string; // format: date-time
//   keywords?: string[]; // uniqueItems
//   status?: OrganizationStatus;
// }

export interface OrganizationDto extends Auditable {
  organization_id?: string; // format: uuid
  business_actor_id?: string; // format: uuid
  business_domains?: string[]; // array of uuid, uniqueItems
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
  registration_date?: string; // format: date-time
  ceo_name?: string;
  year_founded?: string; // format: date-time
  keywords?: string[]; // uniqueItems
  status?: OrganizationStatus;
}

export interface UpdateOrganizationStatusRequest {
  status: OrganizationStatus;
}

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

export interface UpdateContactRequest {
  first_name?: string;
  last_name?: string;
  title?: string;
  phone_number?: string;
  secondary_phone_number?: string;
  fax_number?: string;
  email?: string;
  secondary_email?: string;
}

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
  verified_at?: string; // format: date-time
}

// --- Addresses ---
export interface CreateAddressRequest {
  address_line_1?: string;
  address_line_2?: string;
  city?: string;
  state?: string;
  locality?: string;
  country_id?: string; // format: uuid
  zip_code?: string;
  neighbor_hood?: string;
  latitude?: number; // format: double
  longitude?: number; // format: double
}

export interface UpdateAddressRequest {
  address_line_1?: string;
  address_line_2?: string;
  city?: string;
  state?: string;
  locality?: string;
  country_id?: string; // format: uuid
  zip_code?: string;
  neighbor_hood?: string;
  latitude?: number; // format: double
  longitude?: number; // format: double
}

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

// --- Practical Information ---
export interface CreatePracticalInformationRequest {
  type?: string;
  value?: string;
  notes?: string;
}

export interface UpdatePracticalInformationRequest {
  type?: string;
  value?: string;
  notes?: string;
}

export interface PracticalInformationDto extends Auditable {
  organization_id?: string; // format: uuid
  information_id?: string; // format: uuid
  type?: string;
  value?: string;
  notes?: string;
}

// --- Agency ---
export interface CreateAgencyRequest {
  short_name: string;
  long_name: string;
  description?: string; // maxLength: 500
  location: string;
  business_domains: string[]; // array of uuid, uniqueItems
  transferable?: boolean;
  images?: string[]; // uniqueItems
  greeting_message?: string;
  registration_date?: string; // format: date-time
  average_revenue?: number;
  capital_share?: number;
  registration_number?: string;
  social_network?: string;
  tax_number?: string;
}

export interface UpdateAgencyRequest {
  short_name: string;
  long_name: string;
  description?: string; // maxLength: 500
  location: string;
  business_domains: string[]; // array of uuid, uniqueItems
  transferable?: boolean;
  images?: string[]; // uniqueItems
  greeting_message?: string;
  registration_date?: string; // format: date-time
  average_revenue?: number;
  capital_share?: number;
  registration_number?: string;
  social_network?: string;
  tax_number?: string;
}

export interface AgencyDto extends Auditable {
  organization_id?: string; // format: uuid
  agency_id?: string; // format: uuid
  owner_id?: string; // format: uuid
  name?: string;
  location?: string;
  description?: string;
  transferable?: boolean;
  business_domains?: string[]; // array of uuid, uniqueItems
  is_active?: boolean;
  logo?: string;
  short_name?: string;
  long_name?: string;
  is_individual_business?: boolean;
  is_headquarter?: boolean;
  images?: string[]; // uniqueItems
  greeting_message?: string;
  year_created?: string; // format: date-time
  manager_name?: string;
  registration_date?: string; // format: date-time
  average_revenue?: number;
  capital_share?: number;
  registration_number?: string;
  social_network?: string;
  tax_number?: string;
  keywords?: string[]; // uniqueItems
  is_public?: boolean;
  is_business?: boolean;
  operation_time_plan?: Record<string, string>;
  total_affiliated_customers?: number; // format: int32
}

export interface UpdateAgencyStatusRequest {
  active: boolean;
}

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
  location_id?: string; // format: uuid
  logo?: string;
  department?: string;
  employee_role?: EmployeeRole;
}

export interface UpdateEmployeeRequest {
  first_name?: string;
  last_name?: string;
  short_description?: string;
  long_description?: string;
  location_id?: string; // format: uuid
  logo?: string;
  department?: string;
  employee_role?: EmployeeRole;
}

export interface AffectEmployeeRequest {
  employee_id?: string; // format: uuid
}

// Response from Create/Update Employee endpoints
export interface EmployeeResponse extends Auditable {
  employee_id?: string; // format: uuid
  last_name?: string;
  first_name?: string;
  organization_id?: string; // format: uuid
  agency_id?: string; // format: uuid
  employee_role?: EmployeeRole;
  department?: string;
}

// DTO for listing/getting employee details
export interface EmployeeDto extends Auditable {
  organization_id?: string; // format: uuid
  agency_id?: string; // format: uuid
  first_name?: string;
  last_name?: string;
  short_description?: string;
  long_description?: string;
  location_id?: string; // format: uuid
  partner_type?: "CUSTOMER" | "SUPPLIER" | "SALE" | "PROSPECT";
  partner_details?: string;
  logo?: string;
  employee_id?: string; // format: uuid
  is_manager?: boolean;
  employee_role?: EmployeeRole;
  department?: string;
}

// --- ThirdParty ---
export type ThirdPartyType =
  | "11" | "12" | "21" | "22" | "23" | "24" | "25" | "31" | "32" | "33" | "34"
  | "41" | "42" | "43" | "51" | "52" | "61" | "62" | "63" | "71" | "72";

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
  authorized_payment_methods?: string[]; // uniqueItems
  authorized_credit_limit?: number;
  max_discount_rate?: number;
  vat_subject?: boolean;
  operations_balance?: number;
  opening_balance?: number;
  pay_term_number?: number; // format: int32
  pay_term_type?: string;
  third_party_family?: string;
  classification?: Record<string, string>;
  tax_number?: string;
  loyalty_points?: number; // format: int32
  loyalty_points_used?: number; // format: int32
  loyalty_points_expired?: number; // format: int32
}

export interface UpdateThirdPartyRequest {
  legal_form?: OrganizationLegalForm;
  unique_identification_number?: string;
  trade_registration_number?: string;
  name?: string;
  acronym?: string;
  long_name?: string;
  logo?: string;
  images?: string[];
  accounting_account_numbers?: string[];
  authorized_payment_methods?: string[]; // uniqueItems
  authorized_credit_limit?: number;
  max_discount_rate?: number;
  vat_subject?: boolean;
  operations_balance?: number;
  opening_balance?: number;
  pay_term_number?: number; // format: int32
  pay_term_type?: string;
  third_party_family?: string;
  classification?: Record<string, string>;
  tax_number?: string;
  loyalty_points?: number; // format: int32
  loyalty_points_used?: number; // format: int32
  loyalty_points_expired?: number; // format: int32
}

export interface ThirdPartyDto extends Auditable {
  organization_id?: string; // format: uuid
  id?: string; // format: uuid
  type?: ThirdPartyType;
  legal_form?: OrganizationLegalForm;
  unique_identification_number?: string;
  trade_registration_number?: string;
  name?: string;
  acronym?: string;
  long_name?: string;
  logo?: string;
  images?: string[];
  accounting_account_numbers?: string[];
  authorized_payment_methods?: string[]; // uniqueItems
  authorized_credit_limit?: number;
  max_discount_rate?: number;
  vat_subject?: boolean;
  operations_balance?: number;
  opening_balance?: number;
  pay_term_number?: number; // format: int32
  pay_term_type?: string;
  third_party_family?: string;
  classification?: Record<string, string>;
  tax_number?: string;
  loyalty_points?: number; // format: int32
  loyalty_points_used?: number; // format: int32
  loyalty_points_expired?: number; // format: int32
}

export interface UpdateThirdPartyStatusRequest {
  active: boolean;
}

export interface GetThirdPartyRequest {
  status?: boolean;
  type?: ThirdPartyType;
  page?: number; // format: int32, minimum: 1
  size?: number; // format: int32, minimum: 1
}

// --- Supplier (Provider) ---
export interface CreateProviderRequest {
  first_name?: string;
  last_name?: string;
  short_description?: string;
  long_description?: string;
  location_id?: string; // format: uuid
  logo?: string;
  contact_info?: string;
  address?: string;
  product_service_type?: string;
}

export interface UpdateProviderRequest {
  first_name?: string;
  last_name?: string;
  short_description?: string;
  long_description?: string;
  location_id?: string; // format: uuid
  logo?: string;
  contact_info?: string;
  address?: string;
  product_service_type?: string;
}

export interface AffectProviderRequest {
  provider_id?: string; // format: uuid
}

export interface ProviderDto extends Auditable {
  organization_id?: string; // format: uuid
  agency_id?: string; // format: uuid
  first_name?: string;
  last_name?: string;
  short_description?: string;
  long_description?: string;
  location_id?: string; // format: uuid
  partner_type?: "CUSTOMER" | "SUPPLIER" | "SALE" | "PROSPECT";
  partner_details?: string;
  logo?: string;
  provider_id?: string; // format: uuid
  contact_info?: string;
  address?: string;
  is_active?: boolean;
  product_service_type?: string;
}

// --- SalesPerson ---
export interface CreateSalesPersonRequest {
  name?: string;
  commission_rate?: number; // format: float
  credit?: number; // format: float
  current_balance?: number; // format: float
}

export interface UpdateSalesPersonRequest {
  first_name?: string;
  last_name?: string;
  short_description?: string;
  long_description?: string;
  location_id?: string; // format: uuid
  logo?: string;
  commission_rate?: number; // format: float
  credit?: number; // format: float
  current_balance?: number; // format: float
}

export interface SalesPersonDto extends Auditable {
  organization_id?: string; // format: uuid
  agency_id?: string; // format: uuid
  first_name?: string;
  last_name?: string;
  short_description?: string;
  long_description?: string;
  location_id?: string; // format: uuid
  partner_type?: "CUSTOMER" | "SUPPLIER" | "SALE" | "PROSPECT";
  partner_details?: string;
  logo?: string;
  sales_person_id?: string; // format: uuid
  name?: string;
  commission_rate?: number; // format: float
  credit?: number; // format: float
  current_balance?: number; // format: float
}

// --- Prospect ---
export interface CreateProspectRequest {
  first_name?: string;
  last_name?: string;
  short_description?: string;
  long_description?: string;
  location_id?: string; // format: uuid
  logo?: string;
  transaction_id?: number; // format: float
  payment_method?: string;
  amount_paid?: string;
  interest_level?: string;
}

export interface UpdateProspectRequest {
  first_name?: string;
  last_name?: string;
  short_description?: string;
  long_description?: string;
  location_id?: string; // format: uuid
  logo?: string;
  transaction_id?: number; // format: float
  payment_method?: string;
  amount_paid?: string;
  interest_level?: string;
}

export interface ProspectDto extends Auditable {
  organization_id?: string; // format: uuid
  agency_id?: string; // format: uuid
  first_name?: string;
  last_name?: string;
  short_description?: string;
  long_description?: string;
  location_id?: string; // format: uuid
  partner_type?: "CUSTOMER" | "SUPPLIER" | "SALE" | "PROSPECT";
  partner_details?: string;
  logo?: string;
  prospect_id?: string; // format: uuid
  transaction_id?: number; // format: float
  payment_method?: string;
  amount_paid?: string;
  interest_level?: string;
}

// --- Customer ---
export interface CreateCustomerRequest {
  first_name?: string;
  last_name?: string;
  short_description?: string;
  long_description?: string;
  location_id?: string; // format: uuid
  logo?: string;
  transaction_id?: number; // format: float
  payment_method?: string;
  amount_paid?: string;
}

export interface UpdateCustomerRequest {
  first_name?: string;
  last_name?: string;
  short_description?: string;
  long_description?: string;
  location_id?: string; // format: uuid
  logo?: string;
  transaction_id?: number; // format: float
  payment_method?: string;
  amount_paid?: string;
}

export interface AffectCustomerRequest {
  customer_id?: string; // format: uuid
}

export interface CustomerDto extends Auditable {
  organization_id?: string; // format: uuid
  agency_id?: string; // format: uuid
  first_name?: string;
  last_name?: string;
  short_description?: string;
  long_description?: string;
  location_id?: string; // format: uuid
  partner_type?: "CUSTOMER" | "SUPPLIER" | "SALE" | "PROSPECT";
  partner_details?: string;
  logo?: string;
  customer_id?: string; // format: uuid
  transaction_id?: number; // format: float
  payment_method?: string;
  amount_paid?: string;
}

// --- Certification ---
export interface CreateCertificationRequest {
  type?: string;
  name?: string;
  description?: string;
  obtainment_date?: string; // format: date-time
}

export interface UpdateCertificationRequest {
  type?: string;
  name?: string;
  description?: string;
  obtainment_date?: string; // format: date-time
}

export interface CertificationDto extends Auditable {
  organization_id?: string; // format: uuid
  certification_id?: string; // format: uuid
  type?: string;
  name?: string;
  description?: string;
  obtainment_date?: string; // format: date-time
}

// --- Proposed Activity ---
export interface CreateProposedActivityRequest {
  type?: string;
  name?: string;
  rate?: number;
  description?: string;
}

export interface UpdateProposedActivityRequest {
  type?: string;
  name?: string;
  rate?: number;
  description?: string;
}

export interface ProposedActivityDto extends Auditable {
  activity_id?: string; // format: uuid
  organization_id?: string; // format: uuid
  type?: string;
  name?: string;
  rate?: number;
  description?: string;
}

// --- Business Domain ---
export interface CreateBusinessDomainRequest {
  parent_domain_id?: string; // format: uuid
  name: string;
  image?: string;
  galleries?: string[];
  type: string;
  type_label: string;
  description?: string; // maxLength: 255
  metadata?: Record<string, any>;
}

export interface UpdateBusinessDomainRequest {
  parent_domain_id?: string; // format: uuid
  name: string;
  image?: string;
  galleries?: string[];
  type: string;
  type_label: string;
  description?: string; // maxLength: 255
  metadata?: Record<string, any>;
}

export interface BusinessDomainDto extends Auditable {
  id?: string; // format: uuid
  organization_id?: string; // format: uuid
  parent_domain_id?: string; // format: uuid
  name?: string;
  image?: string;
  galleries?: string[];
  type?: string;
  type_label?: string;
  description?: string;
  metadata?: Record<string, any>;
}

export interface GetBusinessDomainRequest {
  organization_id?: string; // format: uuid
  parent_domain_id?: string; // format: uuid
  name?: string;
  page?: number; // format: int32, minimum: 1
  size?: number; // format: int32, minimum: 1
}

// --- Business Actor ---
export type BusinessActorType =
  | "PROVIDER" | "CUSTOMER" | "SALESPERSON" | "CLIENT"
  | "FREELANCE_DRIVER" | "FARMER" | "AGENCY" | "VEHICLE_RENTAL" | "GUEST";

export type Gender = "MALE" | "FEMALE";

export interface CreateBusinessActorRequest {
  phone_number?: string;
  email?: string;
  avatar_picture?: string;
  profile_picture?: string;
  first_name: string;
  last_name?: string;
  is_individual?: boolean;
  birth_date?: string; // format: date-time
  gender?: Gender;
  nationality?: string;
  profession?: string;
  biography?: string;
  type?: BusinessActorType;
}

export interface UpdateBusinessActorRequest {
  phone_number?: string;
  email?: string;
  avatar_picture?: string;
  profile_picture?: string;
  first_name?: string;
  last_name?: string;
  is_individual?: boolean;
  birth_date?: string; // format: date-time
  gender?: Gender;
  nationality?: string;
  profession?: string;
  biography?: string;
  type?: BusinessActorType;
}

export interface BusinessActorDto extends Auditable {
  business_actor_id?: string; // format: uuid
  phone_number?: string;
  email?: string;
  avatar_picture?: string;
  profile_picture?: string;
  first_name?: string;
  last_name?: string;
  is_individual?: boolean;
  is_available?: boolean;
  birth_date?: string; // format: date-time
  role?: EmployeeRole;
  gender?: Gender;
  nationality?: string;
  profession?: string;
  qualifications?: string[];
  payment_methods?: string[]; // uniqueItems
  addresses?: string[]; // array of uuid, uniqueItems
  is_verified?: boolean;
  is_active?: boolean;
  biography?: string;
  type?: BusinessActorType;
}

// --- Images ---
export interface ImageDto {
  id?: string;
  name?: string;
  size?: number; // format: int64
  fileType?: string;
}

// --- Application & Keys ---
export interface CreateApplicationRequest {
  name: string;
  description?: string;
  success_url?: string; // pattern: ^(https?://).*
  cancel_url?: string; // pattern: ^(https?://).*
  failed_url?: string; // pattern: ^(https?://).*
  callback_url?: string; // pattern: ^(https?://).*
}

export interface ApplicationDto extends Auditable {
  id?: string; // format: uuid
  business_actor_id?: string; // format: uuid
  name?: string;
  description?: string;
  is_active?: boolean;
  success_url?: string;
  cancel_url?: string;
  failed_url?: string;
  callback_url?: string;
}

export interface ApplicationKeyDto extends Auditable {
  application_id?: string; // format: uuid
  public_key?: string;
  secret_key?: string;
}

// --- Enum Value Arrays for UI Controls ---

// --- Enum Value Arrays for UI Controls (as Non-Empty Tuples) ---

export const OrganizationLegalFormValues: [OrganizationLegalForm, ...OrganizationLegalForm[]] = [
  "11", "21", "22", "23", "24", "31", "32", "33", "34", "35",
  "41", "42", "51", "52", "53", "54", "61", "62", "63", "64",
  "71", "72", "73", "81", "82", "83", "84", "85"
];

export const OrganizationStatusValues: [OrganizationStatus, ...OrganizationStatus[]] = [
  "ACTIVE", "INACTIVE", "SUSPENDED", "TERMINATED",
  "PENDING_APPROVAL", "UNDER_REVIEW", "DISSOLVED"
];

export const ContactableTypeValues: [ContactableType, ...ContactableType[]] = [
  "BUSINESS_ACTOR", "ORGANIZATION", "AGENCY", "BUSINESS_PARTNER",
  "SALES_PERSON", "PROVIDER", "CUSTOMER", "PROSPECT", "DRIVER", "DELIVERER"
];

export const AddressableTypeValues: [AddressableType, ...AddressableType[]] = [
  "BUSINESS_ACTOR", "ORGANIZATION", "AGENCY", "BUSINESS_PARTNER",
  "SALES_PERSON", "PROVIDER", "CUSTOMER", "PROSPECT", "DRIVER", "DELIVERER", "DELIVERY"
];

export const EmployeeRoleValues: [EmployeeRole, ...EmployeeRole[]] = [
  "CEO", "ENGINEER", "MARKETING", "FINANCE", "HR", "SALES",
  "CUSTOMERSERVICE", "OWNER", "SALESPERSON", "CUSTOMER", "PROVIDER",
  "MANAGER", "SUPERADMIN", "ADMIN", "SUPPORT", "OTHER"
];

export const ThirdPartyTypeValues: [ThirdPartyType, ...ThirdPartyType[]] = [
  "11", "12", "21", "22", "23", "24", "25", "31", "32", "33", "34",
  "41", "42", "43", "51", "52", "61", "62", "63", "71", "72"
];

export const BusinessActorTypeValues: [BusinessActorType, ...BusinessActorType[]] = [
  "PROVIDER", "CUSTOMER", "SALESPERSON", "CLIENT", "FREELANCE_DRIVER",
  "FARMER", "AGENCY", "VEHICLE_RENTAL", "GUEST"
];

export const GenderValues: [Gender, ...Gender[]] = [
  "MALE", "FEMALE"
];