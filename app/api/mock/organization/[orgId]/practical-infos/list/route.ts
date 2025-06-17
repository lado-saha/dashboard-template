// app/api/mock/organization/[orgId]/practical-infos/list/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { dbManager } from '@/lib/data-repo/local-store/json-db-manager';
import { PracticalInformationDto } from '@/types/organization';

export async function GET(request: NextRequest, { params }: { params: { orgId: string } }) {
  try {
    const { orgId } = params;
    const { searchParams } = new URL(request.url);
    const organizationIdQueryParam = searchParams.get('organizationId'); // As per spec for GET all
    if (orgId !== organizationIdQueryParam) {
      return NextResponse.json({ message: "Path orgId and query organizationId must match for this mock." }, { status: 400 });
    }

    const allInfos = dbManager.getCollection('practicalInformation');
    const filteredInfos = allInfos.filter(info => info.organization_id === orgId);
    return NextResponse.json(filteredInfos);
  } catch (error: any) {
    return NextResponse.json({ message: "Failed to get practical information", error: error.message }, { status: 500 });
  }
}