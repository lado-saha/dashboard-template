import { NextResponse, NextRequest } from 'next/server';
import { dbManager } from '@/lib/data-repo/local-store/json-db-manager';
import { RolePermissionDto } from '@/types/auth';

export async function POST(_request: NextRequest, { params }: { params: Promise<{ role_id: string }> }) {
  try {
    const roleId = (await params).role_id;
    const permissionIds = await _request.json() as string[];
    if (!roleId || !Array.isArray(permissionIds)) {
      return NextResponse.json({ message: "Role ID and an array of permission IDs are required." }, { status: 400 });
    }

    const rolePermissions = dbManager.getCollection('authRolePermissions');
    const added: RolePermissionDto[] = [];
    permissionIds.forEach(permissionId => {
      if (!rolePermissions.find(rp => rp.role_id === roleId && rp.permission_id === permissionId)) {
        const newRp: RolePermissionDto = { role_id: roleId, permission_id: permissionId };
        // dbManager.addItem would create new objects, direct push for this structure
        rolePermissions.push(newRp);
        added.push(newRp);
      }
    });
    dbManager.saveCollection('authRolePermissions', rolePermissions);
    return NextResponse.json(added, { status: 200 });
  } catch (error)  {
    return NextResponse.json({ message: error.message || "Failed to assign permissions." }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ role_id: string }> }) {
  try {
    const roleId = (await params).role_id;
    const permissionIdsToRemove = await _request.json() as string[];
    if (!roleId || !Array.isArray(permissionIdsToRemove)) {
      return NextResponse.json({ message: "Role ID and an array of permission IDs are required." }, { status: 400 });
    }

    let rolePermissions = dbManager.getCollection('authRolePermissions');
    const initialCount = rolePermissions.length;
    rolePermissions = rolePermissions.filter(rp => !(rp.role_id === roleId && permissionIdsToRemove.includes(rp.permission_id!)));
    dbManager.saveCollection('authRolePermissions', rolePermissions);

    if (rolePermissions.length < initialCount) {
      return NextResponse.json({ message: "Permissions removed successfully." }, { status: 200 });
    }
    return NextResponse.json({ message: "No matching permissions found to remove or already removed." }, { status: 200 }); // Or 404 if none were found
  } catch (error)  {
    return NextResponse.json({ message: error.message || "Failed to remove permissions." }, { status: 500 });
  }
}