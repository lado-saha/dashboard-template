import { NextResponse, NextRequest } from 'next/server';
import { dbManager } from '@/lib/data-repo/local-store/json-db-manager';
import { PracticalInformationDto, UpdatePracticalInformationRequest } from '@/types/organization';

export async function GET(request: NextRequest, { params }: { params: { orgId: string, infoId: string } }) {
  try {
    const { infoId } = await params;
    const info = dbManager.getItemById('practicalInformation', infoId);
    if (!info || info.organization_id !== params.orgId) {
      return NextResponse.json({ message: `Practical information with ID ${infoId} not found for this organization.` }, { status: 404 });
    }
    return NextResponse.json(info);
  } catch (error: any) {
    return NextResponse.json({ message: "Failed to get practical information", error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { orgId: string, infoId: string } }) {
  try {
    const { orgId, infoId } = await params;
    const body = await request.json() as UpdatePracticalInformationRequest;
    const existingInfo = dbManager.getItemById('practicalInformation', infoId);
    if (!existingInfo || existingInfo.organization_id !== orgId) {
      return NextResponse.json({ message: `Practical Information with ID ${infoId} not found for this organization.` }, { status: 404 });
    }
    const updatedInfo = dbManager.updateItem('practicalInformation', infoId, body);
    return NextResponse.json(updatedInfo, { status: 202 }); // Spec: 202 Accepted
  } catch (error: any) {
    return NextResponse.json({ message: "Failed to update practical information", error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { orgId: string, infoId: string } }) {
  try {
    const { orgId, infoId } = await params;
    const existingInfo = dbManager.getItemById('practicalInformation', infoId);
    if (!existingInfo || existingInfo.organization_id !== orgId) {
      return NextResponse.json({ message: `Practical Information with ID ${infoId} not found for this organization.` }, { status: 404 });
    }
    const deleted = dbManager.deleteItem('practicalInformation', infoId);
    if (!deleted) { // Should not happen if check above passed
      return NextResponse.json({ message: `Practical information with ID ${infoId} not found.` }, { status: 404 });
    }
    return NextResponse.json({ message: "Practical information deleted." }, { status: 202 }); // Spec: 202 Accepted
  } catch (error: any) {
    return NextResponse.json({ message: "Failed to delete practical information", error: error.message }, { status: 500 });
  }
}