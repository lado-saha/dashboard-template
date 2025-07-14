// app/api/mock/auth/roles/[role_id]/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { dbManager } from '@/lib/data-repo/local-store/json-db-manager';
import { RoleDto, RolePermissionDto, UpdateRoleRequest } from '@/types/auth';

export async function PUT(_request: NextRequest, { params }: { params: Promise<{ role_id: string }> }) {
  try {
    const roleId = (await params).role_id;
    const body = await _request.json() as UpdateRoleRequest;

    const updatedRole = dbManager.updateItem('authRoles', roleId, body);
    if (!updatedRole) {
      return NextResponse.json({ message: `Role with ID ${roleId} not found.` }, { status: 404 });
    }
    return NextResponse.json(updatedRole, { status: 200 });
  } catch (error)  {
    return NextResponse.json({ message: error.message || "Failed to update role." }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ role_id: string }> }) {
  try {
    const roleId = (await params).role_id;
    const deleted = dbManager.deleteItem('authRoles', roleId);
    // Also remove associated role-permissions
    const rolePermissions = dbManager.getCollection('authRolePermissions');
    const updatedRolePermissions = rolePermissions.filter(rp => rp.role_id !== roleId);
    dbManager.saveCollection('authRolePermissions', updatedRolePermissions);

    if (!deleted) {
      return NextResponse.json({ message: `Role with ID ${roleId} not found.` }, { status: 404 });
    }
    return NextResponse.json({ message: "Role deleted successfully." }, { status: 200 }); // Spec says 200 OK
  } catch (error)  {
    return NextResponse.json({ message: error.message || "Failed to delete role." }, { status: 500 });
  }
}