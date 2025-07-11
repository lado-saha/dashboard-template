// app/api/mock/organization/[orgId]/suppliers/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { dbManager } from '@/lib/data-repo/local-store/json-db-manager';
import { ProviderDto, CreateProviderRequest } from '@/types/organization';

export async function GET(_request: NextRequest, { params }: { params: { orgId: string } }) {
  try {
    const { orgId } = await params;
    const allProviders = dbManager.getCollection('providers');
    const orgProviders = allProviders.filter(p => p.organization_id === orgId && !p.agency_id);
    return NextResponse.json(orgProviders);
  } catch (error)  {
    return NextResponse.json({ message: "Failed to get organization suppliers", error: error.message }, { status: 500 });
  }
}

export async function POST(_request: NextRequest, { params }: { params: { orgId: string } }) {
  try {
    const { orgId } = await params;
    const body = await _request.json() as CreateProviderRequest;
    const newProviderData: Omit<ProviderDto, 'provider_id' | 'created_at' | 'updated_at' | 'partner_details'> = {
      ...body,
      organization_id: orgId,
      partner_type: "SUPPLIER",
      is_active: true,
    };
    const createdProvider = dbManager.addItem('providers', newProviderData);
    return NextResponse.json(createdProvider, { status: 201 });
  } catch (error)  {
    return NextResponse.json({ message: "Failed to create organization supplier", error: error.message }, { status: 500 });
  }
}