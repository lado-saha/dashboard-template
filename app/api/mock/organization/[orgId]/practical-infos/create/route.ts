// app/api/mock/organization/[orgId]/practical-infos/create/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { dbManager } from '@/lib/data-repo/local-store/json-db-manager';
import { PracticalInformationDto, CreatePracticalInformationRequest } from '@/types/organization';

export async function POST(_request: NextRequest, { params }: { params: { orgId: string } }) {
  try {
    const { orgId } = await params;
    const body = await _request.json() as CreatePracticalInformationRequest;

    if (!body.type || !body.value) {
      return NextResponse.json({ message: "Type and Value are required." }, { status: 400 });
    }
    const newData: Omit<PracticalInformationDto, 'information_id' | 'created_at' | 'updated_at'> = {
      ...body,
      organization_id: orgId,
    };
    const createdInfo = dbManager.addItem('practicalInformation', newData);
    return NextResponse.json(createdInfo, { status: 201 });
  } catch (error)  {
    return NextResponse.json({ message: "Failed to create practical information", error: error.message }, { status: 500 });
  }
}