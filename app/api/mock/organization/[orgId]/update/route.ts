// app/api/mock/organization/[orgId]/update/route.ts
import { NextResponse } from 'next/server';
import { dbManager } from '@/lib/data-repo/local-store/json-db-manager';
import { UpdateOrganizationRequest, OrganizationDto, OrganizationTableRow } from '@/types/organization';

export async function PUT(request: Request, { params }: { params: { orgId: string } }) {
  try {
    const { orgId } = params;
    const body = await request.json() as UpdateOrganizationRequest;

    // THE FIX: Ensure we merge with existing data, not just overwrite.
    const existingOrg = dbManager.getItemById('organizationsDetails', orgId);
    if (!existingOrg) {
      return NextResponse.json({ message: `Organization with ID ${orgId} not found.` }, { status: 404 });
    }

    // Merge updates onto the existing full object
    const updatedData = { ...existingOrg, ...body };

    const updatedOrg = dbManager.updateItem('organizationsDetails', orgId, updatedData);

    // Update corresponding entry in organizationsTableRows with relevant fields
    const tableRowUpdates: Partial<OrganizationTableRow> = {
      long_name: updatedOrg?.long_name, short_name: updatedOrg?.short_name,
      email: updatedOrg?.email, description: updatedOrg?.description,
      logo_url: updatedOrg?.logo_url, legal_form: updatedOrg?.legal_form, status: updatedOrg?.status,
    }
    dbManager.updateItem('organizationsTableRows', orgId, tableRowUpdates);

    return NextResponse.json(updatedOrg, { status: 202 }); // Spec says 202 Accepted for update
  } catch (error: any) {
    return NextResponse.json({ message: "Failed to update organization", error: error.message }, { status: 500 });
  }
}