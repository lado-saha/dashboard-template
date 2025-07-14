import { NextResponse, NextRequest } from 'next/server';
import { dbManager } from '@/lib/data-repo/local-store/json-db-manager';
import { ThirdPartyDto, CreateThirdPartyRequest, ThirdPartyType } from '@/types/organization';

// This route now handles the creation for ANY third-party type.
// The real API uses /.../{type}, but this is the standard workaround for the mock server.
export async function POST(request: NextRequest, { params }: { params: Promise<{ orgId: string }> }) {
  try {
    const { orgId } = await params;
    // The request body MUST now include the 'type'
    const body = await request.json() as (CreateThirdPartyRequest & { type: ThirdPartyType });

    if (!body.name || !body.type) {
        return NextResponse.json({ message: "Third party name and type are required." }, { status: 400 });
    }
    const newThirdPartyData: Omit<ThirdPartyDto, 'id' | 'created_at' | 'updated_at'> = {
        ...body,
        organization_id: orgId,
        type: body.type, // Get type from the body
        
    };
    const createdThirdParty = dbManager.addItem('thirdParties', newThirdPartyData);
    return NextResponse.json(createdThirdParty, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: "Failed to create third party", error: error.message }, { status: 500 });
  }
}
