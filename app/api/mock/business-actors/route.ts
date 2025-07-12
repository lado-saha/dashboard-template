// app/api/mock/business-actors/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { dbManager } from '@/lib/data-repo/local-store/json-db-manager';
import { BusinessActorDto, CreateBusinessActorRequest } from '@/types/organization';
import { getUserIdFromMockToken } from '@/lib/data-repo/local-store/mock-auth-utils';

export async function GET(_request: NextRequest) {
  try {
    const actors = dbManager.getCollection('businessActors');
    return NextResponse.json(actors);
  } catch (e: any) { return NextResponse.json({ message: e.message || "Error" }, { status: 500 }); }
}

export async function POST(request: NextRequest) { // [CHANGE] Use the request object
  try {
    // [THE FIX] Get the user ID from the token sent by the client
    const userId = getUserIdFromMockToken(request);
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized: No valid user token provided." }, { status: 401 });
    }

    const body = await request.json() as CreateBusinessActorRequest;
    if (!body.first_name) {
      return NextResponse.json({ message: "First name is required for Business Actor." }, { status: 400 });
    }

    // The backend assigns the ID, so we simulate that here.
    const newActorData = {
      ...body,
      business_actor_id: userId, // The BA's ID is the User's ID
      user_id: userId, // Also add user_id for any internal linking if needed
    };

    const newActor = dbManager.addItem('businessActors', newActorData);
    return NextResponse.json(newActor, { status: 201 });
  } catch (e: any) { return NextResponse.json({ message: e.message || "Error" }, { status: 500 }); }
}