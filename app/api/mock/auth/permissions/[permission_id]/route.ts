import { NextResponse, NextRequest } from 'next/server';
import { dbManager } from '@/lib/data-repo/local-store/json-db-manager';
import { UpdatePermissionRequest } from '@/types/auth';

export async function GET(_request: NextRequest, { params }: { params: { permission_id: string } }) {
  try {
    const permissionId = params.permission_id;
    const permission = dbManager.getItemById('authPermissions', permissionId);
    if (!permission) {
      return NextResponse.json({ message: `Permission with ID ${permissionId} not found.` }, { status: 404 });
    }
    return NextResponse.json(permission, { status: 200 });
  } catch (error: any)  {
    return NextResponse.json({ message: error.message || "Failed to get permission." }, { status: 500 });
  }
}

export async function PUT(_request: NextRequest, { params }: { params: { permission_id: string } }) {
  try {
    const permissionId = params.permission_id;
    const body = await _request.json() as UpdatePermissionRequest;
    const updatedPermission = dbManager.updateItem('authPermissions', permissionId, body);
    if (!updatedPermission) {
      return NextResponse.json({ message: `Permission with ID ${permissionId} not found.` }, { status: 404 });
    }
    return NextResponse.json(updatedPermission, { status: 200 });
  } catch (error: any)  {
    return NextResponse.json({ message: error.message || "Failed to update permission." }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { permission_id: string } }) {
  try {
    const permissionId = params.permission_id;
    const deleted = dbManager.deleteItem('authPermissions', permissionId);
    // Also remove associated role-permissions
    const rolePermissions = dbManager.getCollection('authRolePermissions');
    const updatedRolePermissions = rolePermissions.filter(rp => rp.permission_id !== permissionId);
    dbManager.saveCollection('authRolePermissions', updatedRolePermissions);
    if (!deleted) {
      return NextResponse.json({ message: `Permission with ID ${permissionId} not found.` }, { status: 404 });
    }
    return NextResponse.json({ message: "Permission deleted successfully." }, { status: 200 });
  } catch (error: any)  {
    return NextResponse.json({ message: error.message || "Failed to delete permission." }, { status: 500 });
  }
}