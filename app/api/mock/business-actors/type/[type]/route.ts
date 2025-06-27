// app/api/mock/business-actors/type/[type]/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { dbManager } from '@/lib/data-repo/local-store/json-db-manager';
import { BusinessActorDto, BusinessActorType } from '@/types/organization';

export async function GET(_request: NextRequest, { params }: { params: { type: string } }) {
  try {
    const type = params.type as BusinessActorType;
    const allActors = dbManager.getCollection('businessActors');
    const filtered = allActors.filter(actor => actor.type === type);
    return NextResponse.json(filtered);
  } catch (e: any) { return NextResponse.json({ message: e.message || "Error" }, { status: 500 }); }
}