// app/api/mock/applications/[applicationId]/keys/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { dbManager } from '@/lib/data-repo/local-store/json-db-manager';
import { ApplicationKeyDto } from '@/types/organization';

export async function GET(request: NextRequest, { params }: { params: { applicationId: string } }) {
  try {
    const { applicationId } = params;
    const allKeys = dbManager.getCollection('applicationKeysData');
    const appKeys = allKeys.filter(key => key.application_id === applicationId);
    return NextResponse.json(appKeys);
  } catch (e: any) { return NextResponse.json({ message: e.message || "Error" }, { status: 500 }); }
}