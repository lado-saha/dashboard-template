// app/api/mock/business-actors/[baId]/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { dbManager } from '@/lib/data-repo/local-store/json-db-manager';
import { BusinessActorDto, UpdateBusinessActorRequest } from '@/types/organization';

export async function GET(request: NextRequest, { params }: { params: { baId: string } }) {
  try {
    const actor = dbManager.getItemById('businessActors', params.baId);
    if (!actor) return NextResponse.json({ message: `Business Actor ${params.baId} not found.` }, { status: 404 });
    return NextResponse.json(actor);
  } catch (e: any) { return NextResponse.json({ message: e.message || "Error" }, { status: 500 }); }
}
export async function PUT(request: NextRequest, { params }: { params: { baId: string } }) {
  try {
    const body = await request.json() as UpdateBusinessActorRequest;
    const updated = dbManager.updateItem('businessActors', params.baId, body);
    if (!updated) return NextResponse.json({ message: `Business Actor ${params.baId} not found.` }, { status: 404 });
    return NextResponse.json(updated, { status: 202 });
  } catch (e: any) { return NextResponse.json({ message: e.message || "Error" }, { status: 500 }); }
}
export async function DELETE(request: NextRequest, { params }: { params: { baId: string } }) {
  try {
    const deleted = dbManager.deleteItem('businessActors', params.baId);
    if (!deleted) return NextResponse.json({ message: `Business Actor ${params.baId} not found.` }, { status: 404 });
    return NextResponse.json({ message: "Deleted" }, { status: 202 });
  } catch (e: any) { return NextResponse.json({ message: e.message || "Error" }, { status: 500 }); }
}