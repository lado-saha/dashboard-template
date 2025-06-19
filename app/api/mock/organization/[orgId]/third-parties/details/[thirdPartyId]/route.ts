// app/api/mock/organization/[orgId]/third-parties/details/[thirdPartyId]/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { dbManager } from '@/lib/data-repo/local-store/json-db-manager';
import { ThirdPartyDto, UpdateThirdPartyRequest } from '@/types/organization';

export async function GET(request: NextRequest, { params }: { params: { orgId: string, thirdPartyId: string } }) {
  try {
    const { orgId, thirdPartyId } = await params;
    const tp = dbManager.getItemById('thirdParties', thirdPartyId);
    if (!tp || tp.organization_id !== orgId) {
      return NextResponse.json({ message: `Third party ${thirdPartyId} not found for org ${orgId}.` }, { status: 404 });
    }
    return NextResponse.json(tp);
  } catch (e: any) { return NextResponse.json({ message: e.message || "Error" }, { status: 500 }) }
}

export async function PUT(request: NextRequest, { params }: { params: { orgId: string, thirdPartyId: string } }) {
  try {
    const { orgId, thirdPartyId } = await params;
    const body = await request.json() as UpdateThirdPartyRequest;
    const existing = dbManager.getItemById('thirdParties', thirdPartyId);
    if (!existing || existing.organization_id !== orgId) {
      return NextResponse.json({ message: `Third party ${thirdPartyId} not found for org ${orgId}.` }, { status: 404 });
    }
    const updated = dbManager.updateItem('thirdParties', thirdPartyId, body);
    return NextResponse.json(updated, { status: 202 });
  } catch (e: any) { return NextResponse.json({ message: e.message || "Error" }, { status: 500 }) }
}

export async function DELETE(request: NextRequest, { params }: { params: { orgId: string, thirdPartyId: string } }) {
  try {
    const { orgId, thirdPartyId } = await params;
    const existing = dbManager.getItemById('thirdParties', thirdPartyId);
    if (!existing || existing.organization_id !== orgId) {
      return NextResponse.json({ message: `Third party ${thirdPartyId} not found for org ${orgId}.` }, { status: 404 });
    }
    const deleted = dbManager.deleteItem('thirdParties', thirdPartyId);
    if (!deleted) return NextResponse.json({ message: "Not found" }, { status: 404 });
    return NextResponse.json(null, { status: 204 }); // 204 No Content as per spec
  } catch (e: any) { return NextResponse.json({ message: e.message || "Error" }, { status: 500 }) }
}