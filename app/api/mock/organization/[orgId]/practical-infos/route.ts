import { NextResponse, NextRequest } from 'next/server';
import { dbManager } from '@/lib/data-repo/local-store/json-db-manager';
import { CreatePracticalInformationRequest, PracticalInformationDto } from '@/types/organization';

export async function GET(_request: NextRequest, { params }: { params: { orgId: string } }) {
  try {
    const { orgId } = await params;
    const allInfos = dbManager.getCollection('practicalInformation');
    const orgInfos = allInfos.filter(info => info.organization_id === orgId);
    return NextResponse.json(orgInfos);
  } catch (error) {
    return NextResponse.json({ message: "Failed to get practical information list", error: error.message }, { status: 500 });
  }
}

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
  } catch (error) {
    return NextResponse.json({ message: "Failed to create practical information", error: error.message }, { status: 500 });
  }
}

