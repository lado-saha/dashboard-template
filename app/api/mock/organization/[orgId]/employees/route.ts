import { NextResponse, NextRequest } from 'next/server';
import { dbManager } from '@/lib/data-repo/local-store/json-db-manager';
import { CreateEmployeeRequest, EmployeeDto, EmployeeResponse } from '@/types/organization';

export async function GET(_request: NextRequest, { params }: { params: { orgId: string } }) {
  try {
    const { orgId } = await params;
    const allEmployees = dbManager.getCollection('employees');
    // Filter for employees directly under the organization (agency_id is null or matches orgId if that the convention)
    const orgEmployees = allEmployees.filter(emp => emp.organization_id === orgId);
    return NextResponse.json(orgEmployees);
  } catch (error) {
    return NextResponse.json({ message: "Failed to get organization employees", error: error.message }, { status: 500 });
  }
}

export async function POST(_request: NextRequest, { params }: { params: { orgId: string } }) {
  try {
    const { orgId } = await params;
    const body = await _request.json() as CreateEmployeeRequest;

    // Add validation for required fields in CreateEmployeeRequest
    if (!body.first_name || !body.last_name || !body.employee_role) {
      return NextResponse.json({ message: "First name, last name, and role are required for an employee." }, { status: 400 });
    }

    const newEmployeeData: Omit<EmployeeDto, 'employee_id' | 'created_at' | 'updated_at' | 'user_id' | 'partner_type' | 'partner_details' | 'is_manager'> = {
      ...body,
      organization_id: orgId,
      // agency_id will be null/undefined for org-level employees
    };
    const createdEmployeeFull = dbManager.addItem('employees', newEmployeeData);

    // Construct EmployeeResponse based on spec
    const response: EmployeeResponse = {
      employee_id: createdEmployeeFull.employee_id,
      first_name: createdEmployeeFull.first_name,
      last_name: createdEmployeeFull.last_name,
      organization_id: createdEmployeeFull.organization_id,
      agency_id: createdEmployeeFull.agency_id,
      employee_role: createdEmployeeFull.employee_role,
      department: createdEmployeeFull.department,
      created_at: createdEmployeeFull.created_at,
      updated_at: createdEmployeeFull.updated_at,
    };
    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Failed to create organization employee", error: error.message }, { status: 500 });
  }
}