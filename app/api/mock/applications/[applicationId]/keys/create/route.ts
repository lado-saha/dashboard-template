// app/api/mock/applications/[applicationId]/keys/create/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { dbManager } from '@/lib/data-repo/local-store/json-db-manager';
import { ApplicationKeyDto } from '@/types/organization';

export async function POST(_request: NextRequest, { params }: { params: { applicationId: string } }) {
  try {
    const { applicationId } = await params;
    // Check if application exists
    const app = dbManager.getItemById('applicationsData', applicationId);
    if (!app) return NextResponse.json({ message: "Application not found" }, { status: 404 });

    const newKey: Omit<ApplicationKeyDto, 'created_at' | 'updated_at' | 'public_key' | 'secret_key'> & { public_key?: string, secret_key?: string } = {
      application_id: applicationId,
      // Generate mock keys
      public_key: `mock_pub_key_${Date.now()}`,
      secret_key: `mock_sec_key_${Date.now()}_${Math.random().toString(36).substring(2)}`,
    };
    const createdKey = dbManager.addItem('applicationKeysData', newKey);
    return NextResponse.json(createdKey, { status: 200 }); // Spec says 200 OK
  } catch (e: any) { return NextResponse.json({ message: e.message || "Error" }, { status: 500 }); }
}