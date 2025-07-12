import { NextResponse, NextRequest } from 'next/server';
import { dbManager } from '@/lib/data-repo/local-store/json-db-manager';
import { ProspectDto, CreateProspectRequest } from '@/types/organization';

export async function GET(request: NextRequest, { params }: { params: { orgId: string, agencyId: string } }) {
  try {
    const { orgId, agencyId } = params;
    const allProspects = dbManager.getCollection('prospects');
    const agencyProspects = allProspects.filter(p => p.organization_id === orgId && p.agency_id === agencyId);
    return NextResponse.json(agencyProspects);
  } catch (error: any) {
    return NextResponse.json({ message: "Failed to get agency prospects", error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: { orgId: string, agencyId: string } }) {
  try {
    const { orgId, agencyId } = params;
    const body = await request.json() as CreateProspectRequest;

    if (!body.first_name && !body.last_name) {
      return NextResponse.json({ message: "First and last name are required." }, { status: 400 });
    }

    const newProspectData: Omit<ProspectDto, 'prospect_id' | 'created_at' | 'updated_at' | 'partner_details'> = {
      ...body,
      organization_id: orgId,
      agency_id: agencyId,
      partner_type: "PROSPECT",
    };
    const createdProspect = dbManager.addItem('prospects', newProspectData);
    return NextResponse.json(createdProspect, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: "Failed to create agency prospect", error: error.message }, { status: 500 });
  }
}
