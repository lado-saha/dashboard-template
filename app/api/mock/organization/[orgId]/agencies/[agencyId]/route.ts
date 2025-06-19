// app/api/mock/organization/[orgId]/agencies/[agencyId]/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { dbManager } from '@/lib/data-repo/local-store/json-db-manager';
import { AgencyDto, UpdateAgencyRequest } from '@/types/organization';

export async function GET(request: NextRequest, { params }: { params: { orgId: string, agencyId: string } }) {
  try {
    const { orgId, agencyId } = await params;
    const agency = dbManager.getItemById('agencies', agencyId);
    if (!agency || agency.organization_id !== orgId) {
      return NextResponse.json({ message: `Agency with ID ${agencyId} not found for organization ${orgId}.` }, { status: 404 });
    }
    return NextResponse.json(agency);
  } catch (error: any) {
    return NextResponse.json({ message: "Failed to get agency", error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { orgId: string, agencyId: string } }) {
  try {
    const { orgId, agencyId } = await params;
    const body = await request.json() as UpdateAgencyRequest;
    const existingAgency = dbManager.getItemById('agencies', agencyId);
    if (!existingAgency || existingAgency.organization_id !== orgId) {
      return NextResponse.json({ message: `Agency with ID ${agencyId} not found for organization ${orgId}.` }, { status: 404 });
    }
    const updatedAgency = dbManager.updateItem('agencies', agencyId, body);
    return NextResponse.json(updatedAgency, { status: 202 }); // Spec: 202 Accepted
  } catch (error: any) {
    return NextResponse.json({ message: "Failed to update agency", error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { orgId: string, agencyId: string } }) {
  try {
    const { orgId, agencyId } = await params;
    const existingAgency = dbManager.getItemById('agencies', agencyId);
    if (!existingAgency || existingAgency.organization_id !== orgId) {
      return NextResponse.json({ message: `Agency with ID ${agencyId} not found for organization ${orgId}.` }, { status: 404 });
    }
    const deleted = dbManager.deleteItem('agencies', agencyId);
    if (!deleted) { // Should not happen if check above passed
      return NextResponse.json({ message: `Agency with ID ${agencyId} not found.` }, { status: 404 });
    }
    // TODO: Handle cascading deletes or disassociation of employees, customers etc. linked to this agency
    return NextResponse.json(null, { status: 204 }); // Spec: 204 No Content
  } catch (error: any) {
    return NextResponse.json({ message: "Failed to delete agency", error: error.message }, { status: 500 });
  }
}