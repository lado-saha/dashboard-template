// app/api/mock/business-actors/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { dbManager } from '@/lib/data-repo/local-store/json-db-manager';
import { BusinessActorDto, CreateBusinessActorRequest } from '@/types/organization';

export async function GET(request: NextRequest) {
  try {
    const actors = dbManager.getCollection('businessActors');
    return NextResponse.json(actors);
  } catch (e: any) { return NextResponse.json({ message: e.message || "Error" }, { status: 500 }); }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as CreateBusinessActorRequest;
    if (!body.first_name) {
      return NextResponse.json({ message: "First name is required for Business Actor." }, { status: 400 });
    }
    const newActor = dbManager.addItem('businessActors', body);
    return NextResponse.json(newActor, { status: 201 });
  } catch (e: any) { return NextResponse.json({ message: e.message || "Error" }, { status: 500 }); }
}