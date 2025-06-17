// app/api/mock/organization/[orgId]/employees/create/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { dbManager } from '@/lib/data-repo/local-store/json-db-manager';
import { EmployeeResponse, CreateEmployeeRequest, EmployeeDto } from '@/types/organization';

export async function POST(request: NextRequest, { params }: { params: { orgId: string } }) {
  try {
    const { orgId } = params;
    const body = await request.json() as CreateEmployeeRequest;

    // Add validation for required fields in CreateEmployeeRequest
    if (!body.first_name || !body.last_name || !body.employee_role) {
        return NextResponse.json({ message: "First name, last name, and role are required for an employee." }, { status: 400 });
    }

    const newEmployeeData: Omit<EmployeeDto, 'employee_id' | 'created_at' | 'updated_at' | 'user_id' | 'partner_type' | 'partner_details' | 'is_manager'> = {
      ...body,
      organisation_id: orgId,
      // agency_id will be null/undefined for org-level employees
    };
    const createdEmployeeFull = dbManager.addItem('employees', newEmployeeData);
    
    // Construct EmployeeResponse based on spec
    const response: EmployeeResponse = {
        employee_id: createdEmployeeFull.employee_id,
        first_name: createdEmployeeFull.first_name,
        last_name: createdEmployeeFull.last_name,
        organisation_id: createdEmployeeFull.organisation_id,
        agency_id: createdEmployeeFull.agency_id,
        employee_role: createdEmployeeFull.employee_role,
        department: createdEmployeeFull.department,
        created_at: createdEmployeeFull.created_at,
        updated_at: createdEmployeeFull.updated_at,
    };
    return NextResponse.json(response, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: "Failed to create organization employee", error: error.message }, { status: 500 });
  }
}