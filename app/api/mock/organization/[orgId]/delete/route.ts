// app/api/mock/organization/[orgId]/delete/route.ts
import { NextResponse } from 'next/server';
import { dbManager } from '@/lib/data-repo/local-store/json-db-manager';

export async function DELETE(_request: Request, { params }: { params: { orgId: string } }) {
  try {
    const { orgId } = await params;
    const deletedDetails = dbManager.deleteItem('organizationsDetails', orgId);

    if (!deletedDetails) { // If neither was found
      return NextResponse.json({ message: `Organization with ID ${orgId} not found.` }, { status: 404 });
    }
    // TODO: Cascade delete related entities (agencies, contacts, addresses, etc.)
    return NextResponse.json({ message: "Organization deleted successfully." }, { status: 202 }); // Spec says 202 Accepted
  } catch (error: any)  {
    return NextResponse.json({ message: "Failed to delete organization", error: error.message }, { status: 500 });
  }
}