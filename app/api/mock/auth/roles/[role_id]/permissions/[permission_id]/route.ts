import { NextResponse, NextRequest } from 'next/server';
import { dbManager } from '@/lib/data-repo/local-store/json-db-manager';
import { RolePermissionDto } from '@/types/auth';

export async function POST(request: NextRequest, { params }: { params: { role_id: string; permission_id: string } }) {
  try {
    const { role_id, permission_id } = params;
    if (!role_id || !permission_id) {
      return NextResponse.json({ message: "Role ID and Permission ID are required." }, { status: 400 });
    }
    let rolePermissions = dbManager.getCollection<RolePermissionDto>('authRolePermissions');
    if (rolePermissions.find(rp => rp.role_id === role_id && rp.permission_id === permission_id)) {
      return NextResponse.json({ message: "Permission already assigned to this role." }, { status: 409 });
    }
    const newRp: RolePermissionDto = { role_id, permission_id };
    rolePermissions.push(newRp);
    dbManager.saveCollection('authRolePermissions', rolePermissions);
    return NextResponse.json(newRp, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Failed to assign permission." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { role_id: string; permission_id: string } }) {
  try {
    const { role_id, permission_id } = params;
    if (!role_id || !permission_id) {
      return NextResponse.json({ message: "Role ID and Permission ID are required." }, { status: 400 });
    }
    let rolePermissions = dbManager.getCollection<RolePermissionDto>('authRolePermissions');
    const initialCount = rolePermissions.length;
    rolePermissions = rolePermissions.filter(rp => !(rp.role_id === role_id && rp.permission_id === permission_id));

    if (rolePermissions.length < initialCount) {
      dbManager.saveCollection('authRolePermissions', rolePermissions);
      return NextResponse.json({ message: "Permission removed successfully." }, { status: 200 });
    }
    return NextResponse.json({ message: "Permission not found for this role or already removed." }, { status: 404 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Failed to remove permission." }, { status: 500 });
  }
}