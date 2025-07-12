// app/api/mock/organization/[orgId]/customers/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { dbManager } from '@/lib/data-repo/local-store/json-db-manager';
import { CustomerDto, CreateCustomerRequest } from '@/types/organization';

export async function GET(_request: NextRequest, { params }: { params: { orgId: string } }) {
  try {
    const { orgId } = await params;
    const allCustomers = dbManager.getCollection('orgCustomers');
    // Filter for customers directly under the organization (no agency_id or agency_id matches orgId if that the convention)
    const orgCustomers = allCustomers.filter(c => c.organization_id === orgId && (!c.agency_id || c.agency_id === orgId));
    return NextResponse.json(orgCustomers);
  } catch (error)  {
    return NextResponse.json({ message: "Failed to get organization customers", error: error.message }, { status: 500 });
  }
}

export async function POST(_request: NextRequest, { params }: { params: { orgId: string } }) {
  try {
    const { orgId } = await params;
    const body = await _request.json() as CreateCustomerRequest;
    // Add validation as needed
    const newCustomerData: Omit<CustomerDto, 'customer_id' | 'created_at' | 'updated_at' | 'partner_details'> = {
      ...body,
      organization_id: orgId,
      partner_type: "CUSTOMER",
    };
    const createdCustomer = dbManager.addItem('orgCustomers', newCustomerData);
    return NextResponse.json(createdCustomer, { status: 201 });
  } catch (error)  {
    return NextResponse.json({ message: "Failed to create organization customer", error: error.message }, { status: 500 });
  }
}