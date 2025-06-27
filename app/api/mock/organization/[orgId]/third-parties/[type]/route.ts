// app/api/mock/organization/[orgId]/third-parties/[type]/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { dbManager } from '@/lib/data-repo/local-store/json-db-manager';
import { ThirdPartyDto, CreateThirdPartyRequest, ThirdPartyType } from '@/types/organization';

export async function POST(_request: NextRequest, { params }: { params: { orgId: string, type: string } }) {
  try {
    const { orgId, type } = await params;
    const body = await _request.json() as CreateThirdPartyRequest;

    if (!body.name) {
        return NextResponse.json({ message: "Third party name is required." }, { status: 400 });
    }
    const newThirdPartyData: Omit<ThirdPartyDto, 'id' | 'created_at' | 'updated_at'> = {
        ...body,
        organization_id: orgId,
        type: type as ThirdPartyType, // from path
        is_active: true, // Default
    };
    const createdThirdParty = dbManager.addItem('thirdParties', newThirdPartyData);
    return NextResponse.json(createdThirdParty, { status: 201 });
  } catch (error: any)  {
    return NextResponse.json({ message: "Failed to create third party", error: error.message }, { status: 500 });
  }
}