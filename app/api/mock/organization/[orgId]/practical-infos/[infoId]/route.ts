// app/api/mock/organization/[orgId]/practical-infos/[infoId]/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { dbManager } from '@/lib/data-repo/local-store/json-db-manager';
import { UpdatePracticalInformationRequest } from '@/types/organization';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ orgId: string, infoId: string }> }) {
  try {
    const { orgId, infoId } = await params;
    const info = dbManager.getItemById('practicalInformation', infoId);
    if (!info || info.organization_id !== orgId) {
      return NextResponse.json({ message: "Practical information not found for this organization." }, { status: 404 });
    }
    return NextResponse.json(info);
  } catch (error)  {
    return NextResponse.json({ message: "Failed to get practical information item", error: error.message }, { status: 500 });
  }
}

export async function PUT(_request: NextRequest, { params }: { params: Promise<{ orgId: string, infoId: string }> }) {
  try {
    const { orgId, infoId } = await params;
    const body = await _request.json() as UpdatePracticalInformationRequest;
    const existing = dbManager.getItemById('practicalInformation', infoId);
    if (!existing || existing.organization_id !== orgId) {
      return NextResponse.json({ message: "Practical information not found for update." }, { status: 404 });
    }
    const updatedInfo = dbManager.updateItem('practicalInformation', infoId, body);
    return NextResponse.json(updatedInfo, { status: 200 }); // Or 202
  } catch (error)  {
    return NextResponse.json({ message: "Failed to update practical information", error: error.message }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ orgId: string, infoId: string }> }) {
  try {
    const { orgId, infoId } = await params;
    const existing = dbManager.getItemById('practicalInformation', infoId);
    if (!existing || existing.organization_id !== orgId) {
      return NextResponse.json({ message: "Practical information not found for deletion." }, { status: 404 });
    }
    const deleted = dbManager.deleteItem('practicalInformation', infoId);
    if (!deleted) {
      return NextResponse.json({ message: "Practical information not found during deletion attempt." }, { status: 404 });
    }
    return NextResponse.json({ message: "Practical information deleted." }, { status: 202 });
  } catch (error)  {
    return NextResponse.json({ message: "Failed to delete practical information", error: error.message }, { status: 500 });
  }
}