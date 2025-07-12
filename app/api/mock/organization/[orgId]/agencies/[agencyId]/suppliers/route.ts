import { NextResponse, NextRequest } from 'next/server';
import { dbManager } from '@/lib/data-repo/local-store/json-db-manager';
import { ProviderDto, CreateProviderRequest } from '@/types/organization';

export async function GET(request: NextRequest, { params }: { params: { orgId: string, agencyId: string } }) {
  try {
    const { orgId, agencyId } = params;
    const allProviders = dbManager.getCollection('providers');
    const agencyProviders = allProviders.filter(p => p.organization_id === orgId && p.agency_id === agencyId);
    return NextResponse.json(agencyProviders);
  } catch (error: any) {
    return NextResponse.json({ message: "Failed to get agency suppliers", error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: { orgId: string, agencyId: string } }) {
  try {
    const { orgId, agencyId } = params;
    const body = await request.json() as CreateProviderRequest;

    if (!body.first_name && !body.last_name) {
      return NextResponse.json({ message: "First and last name are required." }, { status: 400 });
    }

    const newProviderData: Omit<ProviderDto, 'provider_id' | 'created_at' | 'updated_at' | 'partner_details'> = {
      ...body,
      organization_id: orgId,
      agency_id: agencyId,
      partner_type: "SUPPLIER",
      is_active: true,
    };
    const createdProvider = dbManager.addItem('providers', newProviderData);
    return NextResponse.json(createdProvider, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: "Failed to create agency supplier", error: error.message }, { status: 500 });
  }
}
