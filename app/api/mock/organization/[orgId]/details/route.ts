// app/api/mock/organization/[orgId]/details/route.ts
import { NextResponse } from 'next/server';
import { dbManager } from '@/lib/data-repo/local-store/json-db-manager';
import { OrganizationDto } from '@/types/organization';

export async function GET(_request: Request, { params }: { params: { orgId: string } }) {
  try {
    const { orgId } = await params;
    // For details, we use the 'organizationsDetails' collection
    const org = dbManager.getItemById('organizationsDetails', orgId);
    if (!org) {
      return NextResponse.json({ message: `Organization with ID ${orgId} not found.` }, { status: 404 });
    }
    return NextResponse.json(org);
  } catch (error)  {
    return NextResponse.json({ message: "Failed to get organization details", error: error.message }, { status: 500 });
  }
}