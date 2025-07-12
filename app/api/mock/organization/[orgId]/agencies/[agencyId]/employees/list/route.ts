import { NextResponse, NextRequest } from 'next/server';
import { dbManager } from '@/lib/data-repo/local-store/json-db-manager';
import { EmployeeDto } from '@/types/organization';

export async function GET(_request: NextRequest, { params }: { params: { orgId: string, agencyId: string } }) {
  try {
    const { orgId, agencyId } = await params;
    const allEmployees = dbManager.getCollection('employees');
    const agencyEmployees = allEmployees.filter(emp => emp.organization_id === orgId && emp.agency_id === agencyId);
    return NextResponse.json(agencyEmployees);
  } catch (error)  {
    return NextResponse.json({ message: "Failed to get agency employees", error: error.message }, { status: 500 });
  }
}