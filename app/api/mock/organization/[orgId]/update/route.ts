// app/api/mock/organization/[orgId]/update/route.ts
import { NextResponse } from 'next/server';
import { dbManager } from '@/lib/data-repo/local-store/json-db-manager';
import { UpdateOrganizationRequest,OrganizationDto } from '@/types/organization';

export async function PUT(_request: Request, { params }: { params: { orgId: string } }) {
  try {
    const { orgId } = await params;
    const body = await _request.json() as UpdateOrganizationRequest;

    // THE FIX: Ensure we merge with existing data, not just overwrite.
    const existingOrg = dbManager.getItemById('organizationsDetails', orgId);
    if (!existingOrg) {
      return NextResponse.json({ message: `Organization with ID ${orgId} not found.` }, { status: 404 });
    }

    // Merge updates onto the existing full object
    const updatedData = { ...existingOrg, ...body };

    const updatedOrg = dbManager.updateItem('organizationsDetails', orgId, updatedData);

    return NextResponse.json(updatedOrg, { status: 202 }); // Spec says 202 Accepted for update
  } catch (error)  {
    return NextResponse.json({ message: "Failed to update organization", error: error.message }, { status: 500 });
  }
}