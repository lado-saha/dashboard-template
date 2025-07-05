// types/organization.ts

import { Auditable } from "@/types/common";

// --- General & Reusable ---
// As defined in the Organization Service spec
export interface ApiResponse<T = any> {
  status?: "SUCCESS" | "FAILED" | "UNKNOWN";
  message?: string;
  data?: T;
  errors?: Record<string, string>;
  ok?: boolean;
}


// --- Contactable & Addressable Enums ---
export type ContactableType =
  | "BUSINESS_ACTOR" | "ORGANIZATION" | "AGENCY" | "BUSINESS_PARTNER"
  | "SALES_PERSON" | "PROVIDER" | "CUSTOMER" | "PROSPECT" | "DRIVER" | "DELIVERER";

export type AddressableType = ContactableType | "DELIVERY";


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

  business_actor_id?: string;
}

export interface UpdateOrganizationRequest extends Partial<Omit<CreateOrganizationRequest, 'email'>> {
  // Email might not be updatable or has specific rules
  email?: string; // Retaining email here as per spec
}

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
  number_of_employees?: number; // Added for consistency if available



  business_actor_id?: string; // Who created/owns it
  // --- State Initialization ---
}

// export interface OrganizationDto extends Auditable { // As per GET /organizations
//   organization_id?: string;
//   business_actor_id?: string; // Who created/owns it
//   business_domains?: string[];
//   email?: string;
//   short_name?: string;
//   long_name?: string;
//   description?: string;
//   logo_url?: string;
//   is_individual_business?: boolean;
//   legal_form?: OrganizationLegalForm;
//   is_active?: boolean; // Usually derived from status
//   website_url?: string;
//   social_network?: string;
//   business_registration_number?: string;
//   tax_number?: string;
//   capital_share?: number;
//   registration_date?: string;
//   ceo_name?: string;
//   year_founded?: string;
//   keywords?: string[];
//   status?: OrganizationStatus;
//   number_of_employees?: number;
// }

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
  state?: string;
  locality?: string;
  country_id?: string; // format: uuid
  zip_code?: string;
  neighbor_hood?: string;
  latitude?: number; // format: double
  longitude?: number; // format: double
  default?: boolean; // Whether this is the default address for the entity
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
  latitude?: number;
  longitude?: number;
}

// --- Practical Information ---
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

// --- Agency ---
export interface CreateAgencyRequest {
  short_name: string;
  long_name: string;
  description?: string; // maxLength: 500
  location: string;
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
  owner_id?: string; // format: uuid (Who owns/manages this agency if BA structure is flat)
  name?: string; // This could be short_name or long_name
  location?: string;
  description?: string;
  transferable?: boolean;
  business_domains?: string[];
  is_active?: boolean;
  logo?: string; // logo_url
  short_name?: string;
  long_name?: string;
  is_individual_business?: boolean; // Seems org-level, repeated here
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
  is_business?: boolean; // What diff from is_individual_business?
  operation_time_plan?: Record<string, string>; // e.g. {"monday": "9am-5pm"}
  total_affiliated_customers?: number; // int32
}
export interface UpdateAgencyStatusRequest { active: boolean; }

// --- Employee ---
export type EmployeeRole =
  | "CEO" | "ENGINEER" | "MARKETING" | "FINANCE" | "HR" | "SALES"
  | "CUSTOMERSERVICE" | "OWNER" | "SALESPERSON" | "CUSTOMER" | "PROVIDER"
  | "MANAGER" | "SUPERADMIN" | "ADMIN" | "SUPPORT" | "OTHER";

export const EmployeeRoleValues: [EmployeeRole, ...EmployeeRole[]] = [
  "CEO",
  "ENGINEER",
  "MARKETING",
  "FINANCE",
  "HR",
  "SALES",
  "CUSTOMERSERVICE",
  "OWNER",
  "SALESPERSON",
  "CUSTOMER",
  "PROVIDER",
  "MANAGER",
  "SUPERADMIN",
  "ADMIN",
  "SUPPORT",
  "OTHER",
];

export interface CreateEmployeeRequest {
  first_name?: string;
  last_name?: string;
  short_description?: string; // Role/Title
  long_description?: string;  // Responsibilities
  location_id?: string;       // uuid (Address ID for work location)
  logo?: string;              // Photo URL
  department?: string;
  employee_role?: EmployeeRole;
}
export interface UpdateEmployeeRequest extends Partial<CreateEmployeeRequest> { }
export interface AffectEmployeeRequest { employee_id: string; /* uuid */ }

// This is the response from Create/Update Employee endpoints
export interface EmployeeResponse extends Auditable {
  employee_id?: string; // format: uuid
  last_name?: string;
  first_name?: string;
  organisation_id?: string; // format: uuid
  agency_id?: string; // format: uuid
  employee_role?: EmployeeRole;
  department?: string;
}

// This is the DTO for listing/getting employee details, potentially more comprehensive
export interface EmployeeDto extends Auditable {
  employee_id?: string;
  user_id?: string; // Link to the User from Auth service / BusinessActor
  organisation_id?: string;
  agency_id?: string;
  first_name?: string;
  last_name?: string;
  employee_role?: EmployeeRole;
  department?: string;
  short_description?: string; // e.g., "Senior Developer"
  long_description?: string;  // e.g., "Responsible for backend services..."
  location_id?: string;       // Office Address ID
  logo?: string;              // Employee professional photo
  is_manager?: boolean;
  contact_info?: string; // Could be an email or phone from ContactDto
  address?: string; // Simple address string, or link to AddressDto
  is_active?: boolean; // To indicate if the employment is active
}

// --- Business Actor (as per Organization Service Spec) ---
export type BusinessActorType = "PROVIDER" | "CUSTOMER" | "SALESPERSON" | "CLIENT" | "FREELANCE_DRIVER" | "FARMER" | "AGENCY" | "VEHICLE_RENTAL" | "GUEST";
export const BusinessActorTypeValues: [BusinessActorType, ...BusinessActorType[]] = ["PROVIDER", "CUSTOMER", "SALESPERSON", "CLIENT", "FREELANCE_DRIVER", "FARMER", "AGENCY", "VEHICLE_RENTAL", "GUEST"];
export type Gender = "MALE" | "FEMALE";
export const GenderValues: [Gender, ...Gender[]] = ["MALE", "FEMALE"];

export interface CreateBusinessActorRequest { // Used for POST /business-actors
  first_name: string;
  user_id: string;
  phone_number?: string;
  email?: string;
  avatar_picture?: string; // URL
  profile_picture?: string; // URL
  last_name?: string;
  is_individual?: boolean;
  birth_date?: string; // date-time
  gender?: Gender;
  nationality?: string;
  profession?: string;
  biography?: string;
  type?: BusinessActorType; // Role within this service context
}
export interface UpdateBusinessActorRequest extends Partial<Omit<CreateBusinessActorRequest, 'user_id'>> { }

export interface BusinessActorDto extends Auditable {
  business_actor_id?: string; // uuid
  user_id?: string; // The linked User.id from Auth Service
  phone_number?: string;
  email?: string;
  avatar_picture?: string;
  profile_picture?: string;
  first_name?: string;
  last_name?: string;
  is_individual?: boolean;
  is_available?: boolean;
  birth_date?: string | null; // date-time
  role?: EmployeeRole; // This 'role' seems specific to their function within an org, maps to EmployeeRole values
  gender?: Gender;
  nationality?: string;
  profession?: string;
  qualifications?: string[];
  payment_methods?: string[]; // unique
  addresses?: string[]; // array of address uuids
  is_verified?: boolean;
  is_active?: boolean;
  biography?: string;
  type?: BusinessActorType; // The type of business actor they are (Provider, Customer, etc.)
}

// --- ThirdParty (Potentially represents external partners or could be an abstraction for Agency/Supplier) ---
export type ThirdPartyType = "11" | "12" | "21" | "22" | "23" | "24" | "25" | "31" | "32" | "33" | "34" | "41" | "42" | "43" | "51" | "52" | "61" | "62" | "63" | "71" | "72";
export interface CreateThirdPartyRequest {
  // type is a path param for create
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
  pay_term_type?: string; // e.g., "DAYS", "MONTHS"
  third_party_family?: string; // e.g., "Key Partner", "Regular Supplier"
  classification?: Record<string, string>; // Custom key-value pairs
  tax_number?: string;
  loyalty_points?: number; // int32
  loyalty_points_used?: number; // int32
  loyalty_points_expired?: number; // int32
}
export interface UpdateThirdPartyRequest extends Partial<CreateThirdPartyRequest> { }
export interface ThirdPartyDto extends Auditable {
  organization_id?: string; // uuid
  id?: string; // uuid (this is the third_party_id)
  type?: ThirdPartyType;
  // ... includes all fields from CreateThirdPartyRequest
  legal_form?: OrganizationLegalForm;
  unique_identification_number?: string;
  trade_registration_number?: string;
  name?: string;
  acronym?: string;
  long_name?: string;
  logo?: string;
  images?: string[];
  accounting_account_numbers?: string[];
  authorized_payment_methods?: string[];
  authorized_credit_limit?: number;
  max_discount_rate?: number;
  vat_subject?: boolean;
  operations_balance?: number;
  opening_balance?: number;
  pay_term_number?: number;
  pay_term_type?: string;
  third_party_family?: string;
  classification?: Record<string, string>;
  tax_number?: string;
  loyalty_points?: number;
  loyalty_points_used?: number;
  loyalty_points_expired?: number;
  is_active?: boolean; // Added for consistency, often present
}
export interface UpdateThirdPartyStatusRequest { active: boolean; }
export interface GetThirdPartyRequest { // For query params of GET /organizations/{orgId}/third-parties
  status?: boolean; // is_active
  type?: ThirdPartyType;
  page?: number; // int32, min 1
  size?: number; // int32, min 1
}


// --- Supplier (Provider) ---
export interface CreateProviderRequest {
  first_name?: string; // If individual supplier
  last_name?: string;  // If individual supplier
  name?: string;       // If company supplier (use this or first/last)
  short_description?: string;
  long_description?: string;
  location_id?: string; // format: uuid (Address ID)
  logo?: string; // URL
  contact_info?: string; // Could be primary email or phone
  address?: string; // Simple text address, or use structured Address management
  product_service_type?: string; // e.g., "Raw Materials", "Software Services"
  // user_id_to_link?: string // If linking an existing User/BA as a provider
}
export interface UpdateProviderRequest extends Partial<CreateProviderRequest> { }
export interface AffectProviderRequest { provider_id: string; /* uuid of existing BusinessActor/ThirdParty to link as provider */ }

export interface ProviderDto extends Auditable {
  organization_id?: string; // uuid
  agency_id?: string; // uuid, if agency-specific provider
  provider_id?: string; // uuid, this is the ID of the Provider record itself
  // Fields representing the provider entity (could be an individual or a company)
  first_name?: string;
  last_name?: string;
  name?: string; // Combined or company name
  short_description?: string;
  long_description?: string;
  location_id?: string; // uuid
  logo?: string;
  contact_info?: string;
  address?: string;
  is_active?: boolean;
  product_service_type?: string;
  partner_type?: "SUPPLIER"; // Fixed for ProviderDto
  partner_details?: string; // JSON string for extra details
}


// --- SalesPerson ---
export interface CreateSalesPersonRequest { // For direct creation within org/agency
  first_name?: string;
  last_name?: string;
  // 'name' field in spec for create seems redundant if first/last used
  short_description?: string; // e.g., "Key Account Manager"
  logo?: string; // Photo URL
  commission_rate?: number; // float
  credit?: number; // float
  current_balance?: number; // float
  // user_id_to_link?: string; // To link to an existing User/BA
}
export interface UpdateSalesPersonRequest extends Partial<CreateSalesPersonRequest> { }

export interface SalesPersonDto extends Auditable {
  organization_id?: string; // uuid
  agency_id?: string; // uuid
  sales_person_id?: string; // uuid, ID of this SalesPerson record
  user_id?: string;
  first_name?: string;
  last_name?: string;
  name?: string; // Combined name
  short_description?: string;
  long_description?: string;
  location_id?: string; // uuid
  logo?: string;
  commission_rate?: number;
  credit?: number;
  current_balance?: number;
  partner_type?: "SALE"; // Fixed for SalesPersonDto
  partner_details?: string;
}


// --- Prospect ---
export interface CreateProspectRequest {
  first_name?: string;
  last_name?: string;
  name?: string; // Company Name if not individual
  short_description?: string;
  long_description?: string;
  location_id?: string; // uuid
  logo?: string;
  transaction_id?: number; // float (perhaps related to a deal ID)
  payment_method?: string; // Potential payment method
  amount_paid?: string; // Potential initial amount or deal size (spec says string)
  interest_level?: string; // e.g., "High", "Medium", "Low"
}
export interface UpdateProspectRequest extends Partial<CreateProspectRequest> { }

export interface ProspectDto extends Auditable {
  organization_id?: string; // uuid
  agency_id?: string; // uuid
  prospect_id?: string; // uuid
  first_name?: string;
  last_name?: string;
  name?: string; // Combined or Company Name
  short_description?: string;
  long_description?: string;
  location_id?: string; // uuid
  logo?: string;
  transaction_id?: number;
  payment_method?: string;
  amount_paid?: string; // Spec says string
  interest_level?: string;
  partner_type?: "PROSPECT"; // Fixed for ProspectDto
  partner_details?: string;
}

// --- Customer (Organization-linked, distinct from global User/Customer from Auth Service) ---
export interface CreateCustomerRequest { // For POST /organizations/{orgId}/customers
  first_name?: string;
  last_name?: string;
  name?: string; // Company name if customer is a business
  short_description?: string;
  long_description?: string;
  location_id?: string; // uuid
  logo?: string;
  transaction_id?: number; // float, maybe related to first transaction
  payment_method?: string;
  amount_paid?: string; // Spec says string
  // user_id_to_link?: string; // To link to an existing User/BA
}
export interface UpdateCustomerRequest extends Partial<CreateCustomerRequest> { }
export interface AffectCustomerRequest { customer_id: string; /* uuid of existing BA/ThirdParty to link as customer */ }

export interface CustomerOrgDto extends Auditable { // Customer linked to an Org/Agency
  organization_id?: string; // uuid
  agency_id?: string; // uuid
  customer_id?: string; // uuid, ID of this Customer record within the org context
  user_id?: string; // Link to global User from Auth Service / BusinessActor
  first_name?: string;
  last_name?: string;
  name?: string; // Combined or company name
  short_description?: string;
  long_description?: string;
  location_id?: string; // uuid
  logo?: string;
  transaction_id?: number;
  payment_method?: string;
  amount_paid?: string;
  partner_type?: "CUSTOMER"; // Fixed
  partner_details?: string;
}


// --- Certification ---
export interface CreateCertificationRequest {
  type?: string; // e.g., "ISO 9001", "Organic Certified"
  name?: string; // Official name of the certification
  description?: string;
  obtainment_date?: string; // date-time
  // issuing_body?: string; // Might be useful
  // valid_until?: string; // date-time
}
export interface UpdateCertificationRequest extends CreateCertificationRequest { }
export interface CertificationDto extends Auditable {
  organization_id?: string; //uuid
  certification_id?: string; //uuid
  type?: string;
  name?: string;
  description?: string;
  obtainment_date?: string | null; // date-time
}


// --- Business Domain ---
export interface CreateBusinessDomainRequest {
  name: string;
  type: string; // A code for the domain type e.g. "TECH"
  type_label: string; // Human-readable label e.g. "Technology"
  parent_domain_id?: string | null; // uuid
  image?: string; // URL
  galleries?: string[]; // Array of image URLs
  description?: string; // maxLength 255
  metadata?: Record<string, any>; // For custom fields
}
export interface UpdateBusinessDomainRequest extends Partial<CreateBusinessDomainRequest> { }
export interface BusinessDomainDto extends Auditable {
  id?: string; //uuid
  organization_id?: string; //uuid (indicates if it custom to an org, or global if null)
  parent_domain_id?: string | null; //uuid
  name?: string;
  image?: string;
  galleries?: string[];
  type?: string;
  type_label?: string;
  description?: string;
  metadata?: Record<string, any>;
}
export interface GetBusinessDomainRequest { // Query params for GET /business-domains
  organization_id?: string; // Filter by org if they can create custom domains
  parent_domain_id?: string;
  name?: string; // Search by name
  page?: number;
  size?: number;
}


// --- Images (for Organization) ---
// PUT /images/{idOrganisation}/add takes FormData with 'images' (array of binary)
// Response is ImageDto[]
export interface ImageDto {
  id?: string; // ID of the stored image
  name?: string; // Original filename
  size?: number; // int64
  fileType?: string; // MIME type
  // url?: string; // Usually the backend would return a URL to access the image
}

// --- Proposed Activity ---
export interface CreateProposedActivityRequest {
  type?: string; // e.g., "Consultation", "Workshop"
  name?: string;
  rate?: number; // e.g., hourly rate, fixed price
  description?: string;
}
export interface UpdateProposedActivityRequest extends CreateProposedActivityRequest { }
export interface ProposedActivityDto extends Auditable {
  activity_id?: string; //uuid
  organization_id?: string; //uuid
  type?: string;
  name?: string;
  rate?: number;
  description?: string;
}

// --- Application & Keys (Primarily SuperAdmin or advanced BA) ---
export interface CreateApplicationRequest {
  name: string;
  description?: string;
  success_url?: string; // pattern: ^(https?://).*
  cancel_url?: string;
  failed_url?: string;
  callback_url?: string;
}
export interface ApplicationDto extends Auditable {
  id?: string; // uuid
  business_actor_id?: string; // uuid (who owns this app registration)
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
  secret_key?: string; // Usually only shown on creation
}