// app/api/mock/organization/[orgId]/suppliers/[providerId]/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { dbManager } from '@/lib/data-repo/local-store/json-db-manager';
import { ProviderDto, UpdateProviderRequest } from '@/types/organization';

export async function GET(_request: NextRequest, { params }: { params: { orgId: string, providerId: string } }) {
  try {
    const { orgId, providerId } = await params;
    const provider = dbManager.getItemById('providers', providerId);
    if (!provider || provider.organization_id !== orgId) {
      return NextResponse.json({ message: `Supplier ${providerId} not found for organization ${orgId}.` }, { status: 404 });
    }
    return NextResponse.json(provider);
  } catch (error)  { return NextResponse.json({ message: "Failed to get organization supplier", error: error.message }, { status: 500 }); }
}

export async function PUT(_request: NextRequest, { params }: { params: { orgId: string, providerId: string } }) {
  try {
    const { orgId, providerId } = await params;
    const body = await _request.json() as UpdateProviderRequest;
    const existing = dbManager.getItemById('providers', providerId);
    if (!existing || existing.organization_id !== orgId) {
      return NextResponse.json({ message: `Supplier ${providerId} not found for organization ${orgId}.` }, { status: 404 });
    }
    const updatedProvider = dbManager.updateItem('providers', providerId, body);
    return NextResponse.json(updatedProvider, { status: 202 });
  } catch (error)  { return NextResponse.json({ message: "Failed to update organization supplier", error: error.message }, { status: 500 }); }
}

export async function DELETE(_request: NextRequest, { params }: { params: { orgId: string, providerId: string } }) {
  try {
    const { orgId, providerId } = await params;
    const existing = dbManager.getItemById('providers', providerId);
    if (!existing || existing.organization_id !== orgId) {
      return NextResponse.json({ message: `Supplier ${providerId} not found for organization ${orgId}.` }, { status: 404 });
    }
    const deleted = dbManager.deleteItem('providers', providerId);
    if (!deleted) return NextResponse.json({ message: `Supplier ${providerId} not found.` }, { status: 404 });
    return NextResponse.json({ message: "Organization supplier deleted." }, { status: 202 });
  } catch (error)  { return NextResponse.json({ message: "Failed to delete organization supplier", error: error.message }, { status: 500 }); }
}