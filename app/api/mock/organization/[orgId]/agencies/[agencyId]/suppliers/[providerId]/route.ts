import { NextResponse, NextRequest } from 'next/server';
import { dbManager } from '@/lib/data-repo/local-store/json-db-manager';
import { UpdateProviderRequest } from '@/types/organization';

export async function GET(request: NextRequest, { params }: { params: { orgId: string, agencyId: string, providerId: string } }) {
  try {
    const { orgId, agencyId, providerId } = params;
    const provider = dbManager.getItemById('providers', providerId);
    if (!provider || provider.organization_id !== orgId || provider.agency_id !== agencyId) {
      return NextResponse.json({ message: `Supplier ${providerId} not found for agency ${agencyId}.` }, { status: 404 });
    }
    return NextResponse.json(provider);
  } catch (error: any) { return NextResponse.json({ message: "Failed to get agency supplier", error: error.message }, { status: 500 }); }
}

export async function PUT(request: NextRequest, { params }: { params: { orgId: string, agencyId: string, providerId: string } }) {
  try {
    const { orgId, agencyId, providerId } = params;
    const body = await request.json() as UpdateProviderRequest;
    const existing = dbManager.getItemById('providers', providerId);
    if (!existing || existing.organization_id !== orgId || existing.agency_id !== agencyId) {
      return NextResponse.json({ message: `Supplier ${providerId} not found for agency ${agencyId}.` }, { status: 404 });
    }
    const updatedProvider = dbManager.updateItem('providers', providerId, body);
    return NextResponse.json(updatedProvider, { status: 202 });
  } catch (error: any) { return NextResponse.json({ message: "Failed to update agency supplier", error: error.message }, { status: 500 }); }
}

export async function DELETE(request: NextRequest, { params }: { params: { orgId: string, agencyId: string, providerId: string } }) {
  try {
    const { orgId, agencyId, providerId } = params;
    const existing = dbManager.getItemById('providers', providerId);
    if (!existing || existing.organization_id !== orgId || existing.agency_id !== agencyId) {
      return NextResponse.json({ message: `Supplier ${providerId} not found for agency ${agencyId}.` }, { status: 404 });
    }
    const deleted = dbManager.deleteItem('providers', providerId);
    if (!deleted) return NextResponse.json({ message: `Supplier ${providerId} not found.` }, { status: 404 });
    return NextResponse.json({ message: "Agency supplier deleted." }, { status: 202 });
  } catch (error: any) { return NextResponse.json({ message: "Failed to delete agency supplier", error: error.message }, { status: 500 }); }
}
