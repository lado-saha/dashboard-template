// app/api/mock/organization/[orgId]/prospects/[prospectId]/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { dbManager } from '@/lib/data-repo/local-store/json-db-manager';
import { ProspectDto, UpdateProspectRequest } from '@/types/organization';

export async function GET(_request: NextRequest, { params }: { params: { orgId: string, prospectId: string } }) {
  try {
    const { orgId, prospectId } = await params;
    const prospect = dbManager.getItemById('prospects', prospectId);
    if (!prospect || prospect.organization_id !== orgId) {
      return NextResponse.json({ message: `Prospect ${prospectId} not found for organization ${orgId}.` }, { status: 404 });
    }
    return NextResponse.json(prospect);
  } catch (error: any)  { return NextResponse.json({ message: "Failed to get organization prospect", error: error.message }, { status: 500 }); }
}

export async function PUT(_request: NextRequest, { params }: { params: { orgId: string, prospectId: string } }) {
  try {
    const { orgId, prospectId } = await params;
    const body = await _request.json() as UpdateProspectRequest;
    const existing = dbManager.getItemById('prospects', prospectId);
    if (!existing || existing.organization_id !== orgId) {
      return NextResponse.json({ message: `Prospect ${prospectId} not found for organization ${orgId}.` }, { status: 404 });
    }
    const updatedProspect = dbManager.updateItem('prospects', prospectId, body);
    return NextResponse.json(updatedProspect, { status: 202 });
  } catch (error: any)  { return NextResponse.json({ message: "Failed to update organization prospect", error: error.message }, { status: 500 }); }
}

export async function DELETE(_request: NextRequest, { params }: { params: { orgId: string, prospectId: string } }) {
  try {
    const { orgId, prospectId } = await params;
    const existing = dbManager.getItemById('prospects', prospectId);
    if (!existing || existing.organization_id !== orgId) {
      return NextResponse.json({ message: `Prospect ${prospectId} not found for organization ${orgId}.` }, { status: 404 });
    }
    const deleted = dbManager.deleteItem('prospects', prospectId);
    if (!deleted) return NextResponse.json({ message: `Prospect ${prospectId} not found.` }, { status: 404 });
    return NextResponse.json({ message: "Organization prospect deleted." }, { status: 202 });
  } catch (error: any)  { return NextResponse.json({ message: "Failed to delete organization prospect", error: error.message }, { status: 500 }); }
}