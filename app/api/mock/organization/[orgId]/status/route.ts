// app/api/mock/organization/[orgId]/status/route.ts
import { NextResponse } from 'next/server';
import { dbManager } from '@/lib/data-repo/local-store/json-db-manager';
import { UpdateOrganizationStatusRequest, OrganizationDto, OrganizationTableRow } from '@/types/organization';

export async function PUT(request: Request, { params }: { params: { orgId: string } }) {
  try {
    const { orgId } = await params;
    const body = await request.json() as UpdateOrganizationStatusRequest;

    const updatedOrg = dbManager.updateItem('organizationsDetails', orgId, { status: body.status, is_active: body.status === "ACTIVE" });
    if (!updatedOrg) {
      return NextResponse.json({ message: `Organization with ID ${orgId} not found.` }, { status: 404 });
    }
    dbManager.updateItem('organizationsTableRows', orgId, { status: body.status });

    return NextResponse.json(updatedOrg, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: "Failed to update organization status", error: error.message }, { status: 500 });
  }
}