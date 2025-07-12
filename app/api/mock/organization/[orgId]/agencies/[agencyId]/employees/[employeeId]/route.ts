// app/api/mock/organization/[orgId]/agencies/[agencyId]/employees/[employeeId]/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { dbManager } from '@/lib/data-repo/local-store/json-db-manager';
import { EmployeeDto, UpdateEmployeeRequest, EmployeeResponse } from '@/types/organization';

export async function GET(_request: NextRequest, { params }: { params: { orgId: string, agencyId: string, employeeId: string } }) {
  try {
    const { orgId, agencyId, employeeId } = await params;
    const employee = dbManager.getItemById('employees', employeeId);
    if (!employee || employee.organisation_id !== orgId || employee.agency_id !== agencyId) {
      return NextResponse.json({ message: `Employee ID ${employeeId} not found for agency ${agencyId} in org ${orgId}.` }, { status: 404 });
    }
    return NextResponse.json(employee);
  } catch (error)  {
    return NextResponse.json({ message: "Failed to get agency employee", error: error.message }, { status: 500 });
  }
}

export async function PUT(_request: NextRequest, { params }: { params: { orgId: string, agencyId: string, employeeId: string } }) {
  try {
    const { orgId, agencyId, employeeId } = await params;
    const body = await _request.json() as UpdateEmployeeRequest;
    const existing = dbManager.getItemById('employees', employeeId);
    if (!existing || existing.organisation_id !== orgId || existing.agency_id !== agencyId) {
      return NextResponse.json({ message: `Employee ID ${employeeId} not found for agency ${agencyId}.` }, { status: 404 });
    }
    const updatedEmployeeFull = dbManager.updateItem('employees', employeeId, body);
    if (!updatedEmployeeFull) {
      return NextResponse.json({ message: `Employee ID ${employeeId} update failed.` }, { status: 500 });
    }
    const response: EmployeeResponse = {
      employee_id: updatedEmployeeFull.employee_id,
      first_name: updatedEmployeeFull.first_name,
      last_name: updatedEmployeeFull.last_name,
      organisation_id: updatedEmployeeFull.organisation_id,
      agency_id: updatedEmployeeFull.agency_id,
      employee_role: updatedEmployeeFull.employee_role,
      department: updatedEmployeeFull.department,
    };
    return NextResponse.json(response, { status: 202 });
  } catch (error)  {
    return NextResponse.json({ message: "Failed to update agency employee", error: error.message }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { orgId: string, agencyId: string, employeeId: string } }) {
  try {
    const { orgId, agencyId, employeeId } = await params;
    const existing = dbManager.getItemById('employees', employeeId);
    if (!existing || existing.organisation_id !== orgId || existing.agency_id !== agencyId) {
      return NextResponse.json({ message: `Employee ID ${employeeId} not found for agency ${agencyId}.` }, { status: 404 });
    }
    const deleted = dbManager.deleteItem('employees', employeeId);
    if (!deleted) {
      return NextResponse.json({ message: `Employee ID ${employeeId} not found.` }, { status: 404 });
    }
    return NextResponse.json({ message: "Agency employee deleted." }, { status: 202 });
  } catch (error)  {
    return NextResponse.json({ message: "Failed to delete agency employee", error: error.message }, { status: 500 });
  }
}