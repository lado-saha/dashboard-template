// app/api/mock/organization/[orgId]/agencies/[agencyId]/employees/list/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { dbManager } from '@/lib/data-repo/local-store/json-db-manager';
import { EmployeeDto } from '@/types/organization';

export async function GET(request: NextRequest, { params }: { params: { orgId: string, agencyId: string } }) {
  try {
    const { orgId, agencyId } = params;
    const allEmployees = dbManager.getCollection('employees');
    const agencyEmployees = allEmployees.filter(emp => emp.organisation_id === orgId && emp.agency_id === agencyId);
    return NextResponse.json(agencyEmployees);
  } catch (error: any) {
    return NextResponse.json({ message: "Failed to get agency employees", error: error.message }, { status: 500 });
  }
}