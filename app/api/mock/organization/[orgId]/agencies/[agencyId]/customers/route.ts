import { NextResponse, NextRequest } from 'next/server';
import { dbManager } from '@/lib/data-repo/local-store/json-db-manager';
import { CustomerDto, CreateCustomerRequest } from '@/types/organization';

export async function GET(request: NextRequest, { params }: { params: { orgId: string, agencyId: string } }) {
  try {
    const { orgId, agencyId } = await params;
    const allCustomers = dbManager.getCollection('orgCustomers');
    const agencyCustomers = allCustomers.filter(c => c.organization_id === orgId && c.agency_id === agencyId);
    return NextResponse.json(agencyCustomers);
  } catch (error: any) {
    return NextResponse.json({ message: "Failed to get agency customers", error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: { orgId: string, agencyId: string } }) {
  try {
    const { orgId, agencyId } = await params;
    const body = await request.json() as CreateCustomerRequest;

    if (!body.first_name || !body.last_name) {
      return NextResponse.json({ message: "First and last name are required." }, { status: 400 });
    }

    const newCustomerData: Omit<CustomerDto, 'customer_id' | 'created_at' | 'updated_at' | 'partner_details'> = {
      ...body,
      organization_id: orgId,
      agency_id: agencyId, // Assign the agency ID
      partner_type: "CUSTOMER",
    };
    const createdCustomer = dbManager.addItem('orgCustomers', newCustomerData);
    return NextResponse.json(createdCustomer, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: "Failed to create agency customer", error: error.message }, { status: 500 });
  }
}