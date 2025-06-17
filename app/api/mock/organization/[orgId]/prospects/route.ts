// app/api/mock/organization/[orgId]/prospects/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { dbManager } from '@/lib/data-repo/local-store/json-db-manager';
import { ProspectDto, CreateProspectRequest } from '@/types/organization';

export async function GET(request: NextRequest, { params }: { params: { orgId: string } }) {
  try {
    const { orgId } = params;
    const allProspects = dbManager.getCollection('prospects');
    const orgProspects = allProspects.filter(p => p.organization_id === orgId && !p.agency_id);
    return NextResponse.json(orgProspects);
  } catch (error: any) {
    return NextResponse.json({ message: "Failed to get organization prospects", error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: { orgId: string } }) {
  try {
    const { orgId } = params;
    const body = await request.json() as CreateProspectRequest;
    const newProspectData: Omit<ProspectDto, 'prospect_id' | 'created_at' | 'updated_at' | 'partner_details'> = {
      ...body,
      organization_id: orgId,
      partner_type: "PROSPECT",
    };
    const createdProspect = dbManager.addItem('prospects', newProspectData);
    return NextResponse.json(createdProspect, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: "Failed to create organization prospect", error: error.message }, { status: 500 });
  }
}