// app/api/mock/organization/create/route.ts
import { NextResponse } from 'next/server';
import { dbManager } from '@/lib/data-repo/local-store/json-db-manager';
import { CreateOrganizationRequest, OrganizationDto, OrganizationTableRow } from '@/types/organization';

export async function POST(request: Request) {
  try {
    const body = await request.json() as CreateOrganizationRequest;
    if (!body.long_name || !body.short_name || !body.email || !body.description || !body.legal_form || !body.business_domains) {
      return NextResponse.json({ message: "Missing required fields for organization." }, { status: 400 });
    }

    const newOrgPartial: Omit<OrganizationDto, 'organization_id' | 'created_at' | 'updated_at' | 'status' | 'is_active'> = {
      ...body,
      // Assuming some defaults for fields not in CreateOrganizationRequest but in Dto
      is_individual_business: body.legal_form === "11", // Example logic
      website_url: body.web_site_url,
    };
    const newOrg = dbManager.addItem('organizationsDetails', { ...newOrgPartial, status: 'PENDING_APPROVAL', is_active: false });

    // Also add to organizationsTableRows for listing
    const newOrgTableRow: Omit<OrganizationTableRow, 'organization_id' | 'created_at' | 'updated_at' | 'status' | 'business_actor_id'> = {
      long_name: newOrg.long_name,
      short_name: newOrg.short_name,
      email: newOrg.email,
      description: newOrg.description,
      logo_url: newOrg.logo_url,
      legal_form: newOrg.legal_form,
      // business_actor_id would come from session in real app
    };
    dbManager.addItem('organizationsTableRows', { ...newOrgTableRow, organization_id: newOrg.organization_id, status: newOrg.status });


    return NextResponse.json(newOrg, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: "Failed to create organization", error: error.message }, { status: 500 });
  }
}