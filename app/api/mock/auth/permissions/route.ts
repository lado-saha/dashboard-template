import { NextResponse, NextRequest } from 'next/server';
import { dbManager } from '@/lib/data-repo/local-store/json-db-manager';
import { PermissionDto, CreatePermissionRequest } from '@/types/auth';

export async function GET(request: NextRequest) {
  try {
    const permissions = dbManager.getCollection('authPermissions');
    return NextResponse.json(permissions, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Failed to get permissions." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as CreatePermissionRequest;
    if (!body.name || !body.resource_id || !body.operation_id) {
      return NextResponse.json({ message: "Name, resource ID, and operation ID are required." }, { status: 400 });
    }
    const newPerm = dbManager.addItem('authPermissions', body);
    return NextResponse.json(newPerm, { status: 200 }); // Spec says 200 for create
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Failed to create permission." }, { status: 500 });
  }
}