// app/api/mock/organization/[orgId]/proposed-activities/[activityId]/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { dbManager } from '@/lib/data-repo/local-store/json-db-manager';
import { ProposedActivityDto, UpdateProposedActivityRequest } from '@/types/organization';

export async function GET(_request: NextRequest, { params }: { params: { orgId: string, activityId: string } }) {
  try {
    const { orgId, activityId } = await params;
    const activity = dbManager.getItemById('proposedActivities', activityId);
    if (!activity || activity.organization_id !== orgId) {
      return NextResponse.json({ message: `Activity ${activityId} not found for org ${orgId}.` }, { status: 404 });
    }
    return NextResponse.json(activity);
  } catch (e:any) { return NextResponse.json({ message: e.message || "Error"}, {status: 500})}
}

export async function PUT(_request: NextRequest, { params }: { params: { orgId: string, activityId: string } }) {
  try {
    const { orgId, activityId } = await params;
    const body = await _request.json() as UpdateProposedActivityRequest;
    const existing = dbManager.getItemById('proposedActivities', activityId);
     if (!existing || existing.organization_id !== orgId) {
      return NextResponse.json({ message: `Activity ${activityId} not found for org ${orgId}.` }, { status: 404 });
    }
    const updated = dbManager.updateItem('proposedActivities', activityId, body);
    return NextResponse.json(updated, { status: 202 });
  } catch (e:any) { return NextResponse.json({ message: e.message || "Error"}, {status: 500})}
}

export async function DELETE(_request: NextRequest, { params }: { params: { orgId: string, activityId: string } }) {
 try {
    const { orgId, activityId } = await params;
    const existing = dbManager.getItemById('proposedActivities', activityId);
     if (!existing || existing.organization_id !== orgId) {
      return NextResponse.json({ message: `Activity ${activityId} not found for org ${orgId}.` }, { status: 404 });
    }
    const deleted = dbManager.deleteItem('proposedActivities', activityId);
    if(!deleted) return NextResponse.json({ message: "Not found"}, {status: 404});
    return NextResponse.json({ message: "Activity deleted." }, { status: 202 });
  } catch (e:any) { return NextResponse.json({ message: e.message || "Error"}, {status: 500})}
}