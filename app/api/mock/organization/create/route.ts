import { NextResponse, NextRequest } from 'next/server'; // [ADD] NextRequest
import { dbManager } from '@/lib/data-repo/local-store/json-db-manager';
import { CreateOrganizationRequest, OrganizationDto, } from '@/types/organization';
import { getUserIdFromMockToken } from '@/lib/data-repo/local-store/mock-auth-utils'; // [ADD]

export async function POST(request: NextRequest) { // [CHANGE] Use the request object
  try {
    // [THE FIX] Get the business actor ID (which is the user ID) from the token
    const businessActorId = getUserIdFromMockToken(request);
    if (!businessActorId) {
      return NextResponse.json({ message: "Unauthorized: No valid user token provided." }, { status: 401 });
    }

    const body = await request.json() as CreateOrganizationRequest;
    if (!body.long_name || !body.short_name || !body.email || !body.description || !body.legal_form || !body.business_domains) {
      return NextResponse.json({ message: "Missing required fields for organization." }, { status: 400 });
    }

    const newOrgData: Omit<OrganizationDto, 'organization_id' | 'created_at' | 'updated_at' | 'status' | 'is_active'> = {
      // ... all fields from body
      long_name: body.long_name,
      short_name: body.short_name,
      email: body.email,
      description: body.description,
      business_domains: body.business_domains,
      logo_url: body.logo_url,
      legal_form: body.legal_form,
      website_url: body.web_site_url,
      social_network: body.social_network,
      business_registration_number: body.business_registration_number,
      tax_number: body.tax_number,
      capital_share: body.capital_share,
      registration_date: body.registration_date,
      ceo_name: body.ceo_name,
      year_founded: body.year_founded,
      keywords: body.keywords,
      // number_of_employees: body.number_of_employees,
      is_individual_business: body.legal_form === "11",
      // [THE FIX] Assign the ID from the token
      business_actor_id: businessActorId,
    };

    const newOrg = dbManager.addItem('organizationsDetails', { ...newOrgData, status: 'PENDING_APPROVAL', is_active: false });
    return NextResponse.json(newOrg, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Failed to create organization", error: error.message }, { status: 500 });
  }
}