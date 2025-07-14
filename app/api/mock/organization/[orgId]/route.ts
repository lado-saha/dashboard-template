import { NextResponse } from 'next/server';
import { dbManager } from '@/lib/data-repo/local-store/json-db-manager';
import { UpdateOrganizationRequest } from '@/types/organization';

export async function PUT(_request: Request, { params }: { params: Promise<{ orgId: string }> }) {
  try {
    const { orgId } = await params;
    const body = await _request.json() as UpdateOrganizationRequest;
    const updatedOrg = dbManager.updateItem('organizationsDetails', orgId, body);
    if (!updatedOrg) return NextResponse.json({ message: `Organization ${orgId} not found.` }, { status: 404 });
    return NextResponse.json(updatedOrg, { status: 202 });
  } catch (error) {
    return NextResponse.json({ message: "Failed to update organization", error: error.message }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ orgId: string }> }) {
  try {
    const { orgId } = await params;
    const deleted = dbManager.deleteItem('organizationsDetails', orgId);
    if (!deleted) return NextResponse.json({ message: `Organization ${orgId} not found.` }, { status: 404 });

    // Cascade delete related entities
    const allAgencies = dbManager.getCollection('agencies');
    const remainingAgencies = allAgencies.filter(a => a.organization_id !== orgId);
    dbManager.saveCollection('agencies', remainingAgencies);
    
    const allEmployees = dbManager.getCollection('employees');
    const remainingEmployees = allEmployees.filter(e => e.organization_id !== orgId);
    dbManager.saveCollection('employees', remainingEmployees);

    return NextResponse.json({ message: "Organization deleted successfully." }, { status: 202 });
  } catch (error) {
    return NextResponse.json({ message: "Failed to delete organization", error: error.message }, { status: 500 });
  }
}

export async function GET(_request: Request, { params }: { params: Promise<{ orgId: string }> }) {
  try {
    const { orgId } = await params;
    const org = dbManager.getItemById('organizationsDetails', orgId);
    if (!org) return NextResponse.json({ message: `Organization ${orgId} not found.` }, { status: 404 });
    return NextResponse.json(org);
  } catch (error) {
    return NextResponse.json({ message: "Failed to get organization details", error: error.message }, { status: 500 });
  }
}
