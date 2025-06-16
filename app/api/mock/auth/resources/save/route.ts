// app/api/mock/auth/resources/save/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { dbManager } from '@/lib/data-repo/local-store/json-db-manager';
import { RbacResource, ApiResponseBoolean } from '@/types/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as RbacResource;
    // For mock, we just acknowledge it. In a real system, this would define
    // resources that permissions can then be applied to.
    if (!body.name || !body.value || !body.service) {
      return NextResponse.json({ status: "FAILED", message: "Name, value, and service are required for RBAC resource." } as ApiResponseBoolean, { status: 400 });
    }
    dbManager.addItem('authRbacResources', body); // Store it
    const response: ApiResponseBoolean = { status: "SUCCESS", message: "RBAC Resource saved successfully.", data: true, ok: true };
    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    const response: ApiResponseBoolean = { status: "FAILED", message: error.message || "Failed to save RBAC resource.", data: false, ok: false };
    return NextResponse.json(response, { status: 500 });
  }
}