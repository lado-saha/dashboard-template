// app/api/mock/organization/[orgId]/employees/list/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { dbManager } from '@/lib/data-repo/local-store/json-db-manager';
import { EmployeeDto } from '@/types/organization';

export async function GET(_request: NextRequest, { params }: { params: { orgId: string } }) {
  try {
    const { orgId } = await params;
    const allEmployees = dbManager.getCollection('employees');
    // Filter for employees directly under the organization (agency_id is null or matches orgId if that&apos;t the convention)
    const orgEmployees = allEmployees.filter(emp => emp.organisation_id === orgId && (!emp.agency_id || emp.agency_id === orgId));
    return NextResponse.json(orgEmployees);
  } catch (error: any)  {
    return NextResponse.json({ message: "Failed to get organization employees", error: error.message }, { status: 500 });
  }
}