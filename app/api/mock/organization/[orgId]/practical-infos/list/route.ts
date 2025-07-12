// app/api/mock/organization/[orgId]/practical-infos/list/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { dbManager } from '@/lib/data-repo/local-store/json-db-manager';
import { PracticalInformationDto } from '@/types/organization';

export async function GET(_request: NextRequest, { params }: { params: { orgId: string } }) {
  try {
    const { orgId } = await params;
    const allInfos = dbManager.getCollection('practicalInformation');
    const orgInfos = allInfos.filter(info => info.organization_id === orgId);
    return NextResponse.json(orgInfos);
  } catch (error)  {
    return NextResponse.json({ message: "Failed to get practical information list", error: error.message }, { status: 500 });
  }
}