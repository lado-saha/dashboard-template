import { NextResponse, NextRequest } from 'next/server';
import { dbManager } from '@/lib/data-repo/local-store/json-db-manager';
import { UpdateThirdPartyStatusRequest } from '@/types/organization';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ orgId: string, thirdPartyId: string }> }) {
  try {
    const { orgId, thirdPartyId } = await params;
    const body = await request.json() as UpdateThirdPartyStatusRequest;
    if (typeof body.active !== 'boolean') {
      return NextResponse.json({ message: "Field 'active' (boolean) is required." }, { status: 400 });
    }
    const existing = dbManager.getItemById('thirdParties', thirdPartyId);
    if (!existing || existing.organization_id !== orgId) {
      return NextResponse.json({ message: `Third party ${thirdPartyId} not found for org ${orgId}.` }, { status: 404 });
    }
    const updated = dbManager.updateItem('thirdParties', thirdPartyId, {});
    return NextResponse.json(updated, { status: 202 });
  } catch (e: any) { return NextResponse.json({ message: e.message || "Error" }, { status: 500 }) }
}
