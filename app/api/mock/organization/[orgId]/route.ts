import { NextResponse } from 'next/server';
import { dbManager } from '@/lib/data-repo/local-store/json-db-manager';
import { UpdateOrganizationRequest, OrganizationDto } from '@/types/organization';

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
  } catch (error) {
    return NextResponse.json({ message: "Failed to update organization", error: error.message }, { status: 500 });
  }
}


export async function DELETE(_request: Request, { params }: { params: { orgId: string } }) {
  try {
    const { orgId } = await params;
    const deletedDetails = dbManager.deleteItem('organizationsDetails', orgId);

    if (!deletedDetails) { // If neither was found
      return NextResponse.json({ message: `Organization with ID ${orgId} not found.` }, { status: 404 });
    }
    // TODO: Cascade delete related entities (agencies, contacts, addresses, etc.)
    return NextResponse.json({ message: "Organization deleted successfully." }, { status: 202 }); // Spec says 202 Accepted
  } catch (error) {
    return NextResponse.json({ message: "Failed to delete organization", error: error.message }, { status: 500 });
  }
}


export async function GET(_request: Request, { params }: { params: { orgId: string } }) {
  try {
    const { orgId } = await params;
    // For details, we use the 'organizationsDetails' collection
    const org = dbManager.getItemById('organizationsDetails', orgId);
    if (!org) {
      return NextResponse.json({ message: `Organization with ID ${orgId} not found.` }, { status: 404 });
    }
    return NextResponse.json(org);
  } catch (error) {
    return NextResponse.json({ message: "Failed to get organization details", error: error.message }, { status: 500 });
  }
}