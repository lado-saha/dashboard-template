// app/api/mock/organization/create/route.ts
import { NextResponse } from 'next/server';
import { dbManager } from '@/lib/data-repo/local-store/json-db-manager';
import { CreateOrganizationRequest,OrganizationDto } from '@/types/organization';

export async function POST(_request: Request) {
  try {
    const body = await _request.json() as CreateOrganizationRequest;
    if (!body.long_name || !body.short_name || !body.email || !body.description || !body.legal_form || !body.business_domains) {
      return NextResponse.json({ message: "Missing required fields for organization." }, { status: 400 });
    }

    // THE FIX: Create a complete DTO, merging _request body with defaults for all fields.
    const newOrgData: Omit<OrganizationDto, 'organization_id' | 'created_at' | 'updated_at' | 'status' | 'is_active'> = {
      long_name: body.long_name,
      short_name: body.short_name,
      email: body.email,
      description: body.description,
      business_domains: body.business_domains,
      logo_url: body.logo_url ?? undefined,
      legal_form: body.legal_form,
      website_url: body.web_site_url, // Add both for consistency if needed
      social_network: body.social_network,
      business_registration_number: body.business_registration_number,
      tax_number: body.tax_number,
      capital_share: body.capital_share,
      registration_date: body.registration_date,
      ceo_name: body.ceo_name,
      year_founded: body.year_founded,
      keywords: body.keywords,
      number_of_employees: body.number_of_employees,
      is_individual_business: body.legal_form === "11",
      business_actor_id: body.business_actor_id
    };

    const newOrg = dbManager.addItem('organizationsDetails', { ...newOrgData, status: 'PENDING_APPROVAL', is_active: false });

  
    return NextResponse.json(newOrg, { status: 201 });
  } catch (error: any)  {
    return NextResponse.json({ message: "Failed to create organization", error: error.message }, { status: 500 });
  }
}