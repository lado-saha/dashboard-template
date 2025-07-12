import { NextResponse, NextRequest } from 'next/server';
import { dbManager } from '@/lib/data-repo/local-store/json-db-manager';
import { AffectProviderRequest } from '@/types/organization';

export async function POST(request: NextRequest, { params }: { params: { orgId: string, agencyId: string } }) {
  try {
    const { orgId, agencyId } = await params;
    const body = await request.json() as AffectProviderRequest;

    if (!body.provider_id) {
      return NextResponse.json({ message: "provider_id is required." }, { status: 400 });
    }

    const provider = dbManager.getItemById('providers', body.provider_id);

    if (!provider || provider.organization_id !== orgId) {
      return NextResponse.json({ message: `Supplier with ID ${body.provider_id} not found in this organization.` }, { status: 404 });
    }

    const updatedProvider = dbManager.updateItem('providers', body.provider_id, { agency_id: agencyId });

    if (!updatedProvider) {
      return NextResponse.json({ message: `Could not affect supplier ${body.provider_id} to agency ${agencyId}.` }, { status: 500 });
    }

    return NextResponse.json(updatedProvider, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: "Failed to affect supplier to agency", error: error.message }, { status: 500 });
  }
}
