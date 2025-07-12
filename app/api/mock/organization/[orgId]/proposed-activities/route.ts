import { NextResponse, NextRequest } from 'next/server';
import { dbManager } from '@/lib/data-repo/local-store/json-db-manager';
import { CreateProposedActivityRequest } from '@/types/organization';

export async function GET(request: NextRequest, { params }: { params: { orgId: string } }) {
  try {
    const { orgId } = await params;
    const allActivities = dbManager.getCollection('proposedActivities');
    const orgActivities = allActivities.filter(act => act.organization_id === orgId);
    return NextResponse.json(orgActivities);
  } catch (error: any) {
    return NextResponse.json({ message: "Failed to get proposed activities", error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: { orgId: string } }) {
  try {
    const { orgId } = await params;
    const body = await request.json() as CreateProposedActivityRequest;
    if (!body.name || !body.type) {
        return NextResponse.json({ message: "Name and type are required." }, { status: 400 });
    }
    const newActivityData = {
        ...body,
        organization_id: orgId,
    };
    const createdActivity = dbManager.addItem('proposedActivities', newActivityData);
    return NextResponse.json(createdActivity, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: "Failed to create proposed activity", error: error.message }, { status: 500 });
  }
}
