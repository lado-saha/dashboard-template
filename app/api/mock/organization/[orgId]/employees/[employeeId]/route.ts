// app/api/mock/organization/[orgId]/employees/[employeeId]/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { dbManager } from '@/lib/data-repo/local-store/json-db-manager';
import { EmployeeDto, UpdateEmployeeRequest, EmployeeResponse } from '@/types/organization';

export async function GET(_request: NextRequest, { params }: { params: { orgId: string, employeeId: string } }) {
  try {
    const { orgId, employeeId } = await params;
    const employee = dbManager.getItemById('employees', employeeId);
    if (!employee || employee.organization_id !== orgId) { // Also check orgId match
      return NextResponse.json({ message: `Employee with ID ${employeeId} not found for organization ${orgId}.` }, { status: 404 });
    }
    return NextResponse.json(employee);
  } catch (error)  {
    return NextResponse.json({ message: "Failed to get employee", error: error.message }, { status: 500 });
  }
}

export async function PUT(_request: NextRequest, { params }: { params: { orgId: string, employeeId: string } }) {
  try {
    const { orgId, employeeId } = await params;
    const body = await _request.json() as UpdateEmployeeRequest;
    const existingEmployee = dbManager.getItemById('employees', employeeId);
    if (!existingEmployee || existingEmployee.organization_id !== orgId) {
      return NextResponse.json({ message: `Employee with ID ${employeeId} not found for organization ${orgId}.` }, { status: 404 });
    }
    const updatedEmployeeFull = dbManager.updateItem('employees', employeeId, body);
     if (!updatedEmployeeFull) { // Should not happen if existingEmployee was found
      return NextResponse.json({ message: `Employee with ID ${employeeId} update failed.` }, { status: 500 });
    }
    const response: EmployeeResponse = {
        employee_id: updatedEmployeeFull.employee_id,
        first_name: updatedEmployeeFull.first_name,
        last_name: updatedEmployeeFull.last_name,
        organization_id: updatedEmployeeFull.organization_id,
        agency_id: updatedEmployeeFull.agency_id,
        employee_role: updatedEmployeeFull.employee_role,
        department: updatedEmployeeFull.department,
        created_at: updatedEmployeeFull.created_at,
        updated_at: updatedEmployeeFull.updated_at,
    };
    return NextResponse.json(response, { status: 202 }); // Spec: 202 Accepted
  } catch (error)  {
    return NextResponse.json({ message: "Failed to update employee", error: error.message }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { orgId: string, employeeId: string } }) {
  try {
    const { orgId, employeeId } = await params;
    const existingEmployee = dbManager.getItemById('employees', employeeId);
    if (!existingEmployee || existingEmployee.organization_id !== orgId) {
      return NextResponse.json({ message: `Employee with ID ${employeeId} not found for organization ${orgId}.` }, { status: 404 });
    }
    const deleted = dbManager.deleteItem('employees', employeeId);
    if (!deleted) {
      return NextResponse.json({ message: `Employee with ID ${employeeId} not found.` }, { status: 404 });
    }
    return NextResponse.json({ message: "Employee deleted successfully." }, { status: 202 }); // Spec: 202 Accepted
  } catch (error)  {
    return NextResponse.json({ message: "Failed to delete employee", error: error.message }, { status: 500 });
  }
}