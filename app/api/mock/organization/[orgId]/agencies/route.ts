// app/api/mock/organization/[orgId]/agencies/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { dbManager } from '@/lib/data-repo/local-store/json-db-manager';
import { AgencyDto, CreateAgencyRequest } from '@/types/organization';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ orgId: string }> }) {
  try {
    const { orgId } = await params;
    const { searchParams } = new URL(_request.url);
    const activeFilter = searchParams.get('active'); // boolean as string or null

    const allAgencies = dbManager.getCollection('agencies');
    let filteredAgencies = allAgencies.filter(agency => agency.organization_id === orgId);

    if (activeFilter !== null) {
      const isActive = activeFilter === 'true';
      filteredAgencies = filteredAgencies.filter(agency => agency.is_active === isActive);
    }
    return NextResponse.json(filteredAgencies);
  } catch (error)  {
    return NextResponse.json({ message: "Failed to get agencies", error: error.message }, { status: 500 });
  }
}

export async function POST(_request: NextRequest, { params }: { params: Promise<{ orgId: string }> }) {
  try {
    const { orgId } = await params;
    const body = await _request.json() as CreateAgencyRequest;

    if (!body.short_name || !body.long_name || !body.location || !body.business_domains || body.business_domains.length === 0) {
      return NextResponse.json({ message: "Short name, long name, location, and at least one business domain are required." }, { status: 400 });
    }

    const newAgencyData: Omit<AgencyDto, 'agency_id' | 'created_at' | 'updated_at' | 'is_active' | 'owner_id'> = {
      ...body,
      organization_id: orgId,
      is_headquarter: false, // Default, can be changed via update if needed
    };
    const createdAgency = dbManager.addItem('agencies', { ...newAgencyData, is_active: true }); // Default new agencies to active
    return NextResponse.json(createdAgency, { status: 201 });
  } catch (error)  {
    return NextResponse.json({ message: "Failed to create agency", error: error.message }, { status: 500 });
  }
}