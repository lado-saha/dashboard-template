// app/api/mock/organization/[orgId]/agencies/[agencyId]/status/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { dbManager } from '@/lib/data-repo/local-store/json-db-manager';
import { AgencyDto, UpdateAgencyStatusRequest } from '@/types/organization';

export async function PUT(_request: NextRequest, { params }: { params: Promise<{ orgId: string, agencyId: string }> }) {
  try {
    const { orgId, agencyId } = await params;
    const body = await _request.json() as UpdateAgencyStatusRequest;

    if (typeof body.active !== 'boolean') {
        return NextResponse.json({ message: "Field 'active' (boolean) is required." }, { status: 400 });
    }
    const existingAgency = dbManager.getItemById('agencies', agencyId);
    if (!existingAgency || existingAgency.organization_id !== orgId) {
      return NextResponse.json({ message: `Agency with ID ${agencyId} not found for organization ${orgId}.` }, { status: 404 });
    }
    const updatedAgency = dbManager.updateItem('agencies', agencyId, { is_active: body.active });
    return NextResponse.json(updatedAgency, { status: 202 }); // Spec: 202 Accepted
  } catch (error)  {
    return NextResponse.json({ message: "Failed to update agency status", error: error.message }, { status: 500 });
  }
}