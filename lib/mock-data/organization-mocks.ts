import {
  OrganizationTableRow,
  OrganizationDto,
  AddressDto,
  ContactDto,
  AgencyDto,
  EmployeeDto,
  SalesPersonDto,
  CustomerOrgDto,
  ProviderDto,
  ProspectDto,
  PracticalInformationDto,
  CertificationDto,
  BusinessDomainDto,
  ImageDto,
  ContactableType,
  AddressableType,
  OrganizationStatus,
  OrganizationLegalForm,
  EmployeeRole
} from '@/lib/types/organization'; // Assuming all types are correctly defined here

const placeholderImageUrl = "/placeholder.svg";

export const mockUserOrganizations: OrganizationTableRow[] = [
  {
    organization_id: "org-a1b2c3d4-main",
    business_actor_id: "ba-uuid-123",
    short_name: "Innovate Sol.",
    long_name: "Innovate Solutions Global LLC",
    email: "contact@innovate.com",
    logo_url: placeholderImageUrl,
    status: "ACTIVE",
    description: "Leading provider of innovative tech solutions.",
    legal_form: "31", // Private Limited Company
    created_at: new Date(Date.now() - 100 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    organization_id: "org-e5f6g7h8-side",
    business_actor_id: "ba-uuid-123",
    short_name: "GreenFuture",
    long_name: "GreenTech Future Inc.",
    email: "info@greentech.io",
    logo_url: placeholderImageUrl,
    status: "PENDING_APPROVAL",
    description: "Pioneering sustainable technology for a greener tomorrow.",
    legal_form: "32", // Public Limited Company
    created_at: new Date(Date.now() - 50 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
];

export const mockOrganizationDetails: Record<string, OrganizationDto> = {
  "org-a1b2c3d4-main": {
    ...mockUserOrganizations[0], // Base data from table row
    business_domains: ["domain-uuid-1", "domain-uuid-5"],
    is_individual_business: false,
    is_active: true,
    website_url: "https://innovate.com",
    social_network: "https://linkedin.com/company/innovate",
    business_registration_number: "BRN123456",
    tax_number: "TAXIDINNOVATE",
    capital_share: 1000000,
    registration_date: new Date(Date.now() - 100 * 86400000).toISOString(),
    ceo_name: "Alice Wonderland",
    year_founded: new Date(new Date().setFullYear(new Date().getFullYear() - 5)).toISOString(),
    keywords: ["innovation", "technology", "saas", "enterprise"],
    // number_of_employees field seems to be missing from OrganizationDto in spec, but present in CreateReq
    // Cast as any for mock if needed or add to DTO
  },
  "org-e5f6g7h8-side": {
    ...mockUserOrganizations[1],
    business_domains: ["domain-uuid-2", "domain-uuid-1"],
    is_individual_business: false,
    is_active: false, // Matches PENDING_APPROVAL status
    website_url: "https://greentech.io",
    social_network: "https://twitter.com/greentechfuture",
    business_registration_number: "BRN789012",
    tax_number: "TAXIDGREEN",
    capital_share: 500000,
    registration_date: new Date(Date.now() - 50 * 86400000).toISOString(),
    ceo_name: "Bob Planter",
    year_founded: new Date(new Date().setFullYear(new Date().getFullYear() - 2)).toISOString(),
    keywords: ["sustainability", "green tech", "eco-friendly"],
  },
};

export const mockOrgAddresses: Record<string, AddressDto[]> = {
  "org-a1b2c3d4-main": [
    { address_id: "addr-org1-1", addressable_id: "org-a1b2c3d4-main", addressable_type: "ORGANIZATION", address_line_1: "1 Tech Park", city: "Silicon Valley", state: "CA", zip_code: "94025", country_id: "country-us-uuid", is_default: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { address_id: "addr-org1-2", addressable_id: "org-a1b2c3d4-main", addressable_type: "ORGANIZATION", address_line_1: "Innovation Hub, 2nd Floor", city: "Austin", state: "TX", zip_code: "73301", country_id: "country-us-uuid", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  ],
  "org-e5f6g7h8-side": [
    { address_id: "addr-org2-1", addressable_id: "org-e5f6g7h8-side", addressable_type: "ORGANIZATION", address_line_1: "Eco Center, 100 Leaf St", city: "Greenville", state: "FL", zip_code: "32034", country_id: "country-us-uuid", is_default: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  ],
};

export const mockOrgContacts: Record<string, ContactDto[]> = {
  "org-a1b2c3d4-main": [
    { contact_id: "contact-org1-1", contactable_id: "org-a1b2c3d4-main", contactable_type: "ORGANIZATION", first_name: "Support", last_name: "Team", title: "General Support", email: "support@innovate.com", phone_number: "800-555-0100", is_favorite: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { contact_id: "contact-org1-2", contactable_id: "org-a1b2c3d4-main", contactable_type: "ORGANIZATION", first_name: "Sales", last_name: "Enquiries", title: "Sales Department", email: "sales@innovate.com", phone_number: "800-555-0101", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  ],
  "org-e5f6g7h8-side": [
    { contact_id: "contact-org2-1", contactable_id: "org-e5f6g7h8-side", contactable_type: "ORGANIZATION", first_name: "Info", last_name: "Desk", title: "Public Relations", email: "info@greentech.io", phone_number: "888-ECO-TECH", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  ],
};

// Mock for GET /business-domains (used in OrganizationForm)
export const mockAvailableBusinessDomains: BusinessDomainDto[] = [
  { id: "domain-uuid-1", name: "Technology & Software Development", type_label: "IT & Tech", type: "TECH_SOFTWARE", description: "Developing cutting-edge software solutions." },
  { id: "domain-uuid-2", name: "Healthcare & Medical Services", type_label: "Healthcare", type: "HEALTH_MEDICAL", description: "Providing medical and wellness services." },
  { id: "domain-uuid-3", name: "Retail & E-commerce Platforms", type_label: "Commerce", type: "RETAIL_ECOMM", description: "Online and offline retail operations." },
  { id: "domain-uuid-4", name: "Financial & Banking Services", type_label: "Finance", type: "FIN_BANKING", description: "Financial consulting and banking products." },
  { id: "domain-uuid-5", name: "Management & Business Consulting", type_label: "Consulting", type: "BIZ_CONSULT", description: "Strategic business advisory services." },
  { id: "domain-uuid-6", name: "Education & E-Learning", type_label: "Education", type: "EDU_ELEARN", description: "Educational programs and online learning." },
];

// Add more mock data for Agencies, Employees, etc., as needed.
// For example:
export const mockOrgAgencies: Record<string, AgencyDto[]> = {
  "org-a1b2c3d4-main": [
    { agency_id: "agency-111", organization_id: "org-a1b2c3d4-main", short_name: "Innovate West", long_name: "Innovate Solutions West Coast", location: "San Francisco, CA", is_active: true, description: "Serving our West Coast clients.", business_domains: ["domain-uuid-1"] },
    { agency_id: "agency-222", organization_id: "org-a1b2c3d4-main", short_name: "Innovate East", long_name: "Innovate Solutions East Coast", location: "New York, NY", is_active: true, description: "Catering to the East Coast market.", business_domains: ["domain-uuid-1", "domain-uuid-4"] },
  ],
};

export const mockAgencyEmployees: Record<string, EmployeeDto[]> = {
  "agency-111": [ // Employees for agency "Innovate West"
    { employee_id: "emp-awa-1", first_name: "Charlie", last_name: "Davis", employee_role: "MANAGER", department: "Regional Management", agency_id: "agency-111", organisation_id: "org-a1b2c3d4-main" },
    { employee_id: "emp-awa-2", first_name: "Dana", last_name: "Miller", employee_role: "SALES", department: "Client Acquisition", agency_id: "agency-111", organisation_id: "org-a1b2c3d4-main" },
  ]
};