// app/api/mock/auth/roles/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { dbManager } from '@/lib/data-repo/local-store/json-db-manager';
import { RoleDto, CreateRoleRequest } from '@/types/auth';

export async function GET(_request: NextRequest) {
  try {
    const roles = dbManager.getCollection('authRoles'); // Assuming 'authRoles' collection in dbManager
    return NextResponse.json(roles, { status: 200 });
  } catch (error)  {
    console.error("[MOCK API /auth/roles GET ERROR]:", error);
    return NextResponse.json({ message: error.message || "Failed to get roles." }, { status: 500 });
  }
}

export async function POST(_request: NextRequest) {
  try {
    const body = await _request.json() as CreateRoleRequest;
    if (!body.name) {
      return NextResponse.json({ message: "Role name is required." }, { status: 400 });
    }

    const roles = dbManager.getCollection('authRoles');
    if (roles.find(r => r.name === body.name)) {
      return NextResponse.json({ message: "Role with this name already exists." }, { status: 409 });
    }

    const newRolePartial: Omit<RoleDto, 'id' | 'created_at' | 'updated_at'> = {
      name: body.name,
      description: body.description,
    };
    // dbManager.addItem should handle id, created_at, updated_at
    const createdRole = dbManager.addItem('authRoles', newRolePartial);

    return NextResponse.json(createdRole, { status: 201 });

  } catch (error)  {
    console.error("[MOCK API /auth/roles POST ERROR]:", error);
    return NextResponse.json({ message: error.message || "Failed to create role." }, { status: 500 });
  }
}