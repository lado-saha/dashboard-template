// app/api/mock/organization/[orgId]/agencies/[agencyId]/employees/add/route.ts
// This is for the affectEmployeeToAgency endpoint
import { NextResponse, NextRequest } from 'next/server';
import { dbManager } from '@/lib/data-repo/local-store/json-db-manager';
import { EmployeeResponse, AffectEmployeeRequest, EmployeeDto } from '@/types/organization';

export async function POST(request: NextRequest, { params }: { params: { orgId: string, agencyId: string } }) {
  try {
    const { orgId, agencyId } = await params;
    const body = await request.json() as AffectEmployeeRequest;

    if (!body.employee_id) {
      return NextResponse.json({ message: "employee_id is required." }, { status: 400 });
    }

    // This mock assumes the employee_id refers to an existing global user/BA or an employee from the main org.
    // We are "affecting" or linking them to this agency.
    // In a real system, this might update an existing employee record's agency_id
    // or create a new employment record linking user to agency.

    let employee = dbManager.getItemById('employees', body.employee_id);
    if (!employee) {
      // If not found as an employee, maybe it's a BusinessActor to be made an employee
      // For simplicity, we'll assume it should exist or we create a new one.
      // This mock will simply update/create an employee record with the agency_id.
      return NextResponse.json({ message: `Employee/User with ID ${body.employee_id} not found to affect to agency.` }, { status: 404 });
    }

    // Update the employee's agency_id (if they were org-level) or just confirm the link
    const updatedEmployee = dbManager.updateItem('employees', body.employee_id, { agency_id: agencyId, organisation_id: orgId });

    if (!updatedEmployee) {
      return NextResponse.json({ message: `Could not affect employee ${body.employee_id} to agency ${agencyId}.` }, { status: 500 });
    }

    const response: EmployeeResponse = {
      employee_id: updatedEmployee.employee_id,
      first_name: updatedEmployee.first_name,
      last_name: updatedEmployee.last_name,
      organisation_id: updatedEmployee.organisation_id,
      agency_id: updatedEmployee.agency_id,
      employee_role: updatedEmployee.employee_role,
      department: updatedEmployee.department,
    };
    return NextResponse.json(response, { status: 201 }); // 201 Created or 200 OK
  } catch (error: any) {
    return NextResponse.json({ message: "Failed to affect employee to agency", error: error.message }, { status: 500 });
  }
}