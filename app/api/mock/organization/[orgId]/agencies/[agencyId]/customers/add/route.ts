import { NextResponse, NextRequest } from 'next/server';
import { dbManager } from '@/lib/data-repo/local-store/json-db-manager';
import { AffectCustomerRequest } from '@/types/organization';

export async function POST(request: NextRequest, { params }: { params: { orgId: string, agencyId: string } }) {
  try {
    const { orgId, agencyId } = await params;
    const body = await request.json() as AffectCustomerRequest;

    if (!body.customer_id) {
      return NextResponse.json({ message: "customer_id is required." }, { status: 400 });
    }

    // Find the existing customer record
    const customer = dbManager.getItemById('orgCustomers', body.customer_id);

    if (!customer || customer.organization_id !== orgId) {
      return NextResponse.json({ message: `Customer with ID ${body.customer_id} not found in this organization.` }, { status: 404 });
    }

    // "Affect" the customer by assigning the agency_id
    const updatedCustomer = dbManager.updateItem('orgCustomers', body.customer_id, { agency_id: agencyId });

    if (!updatedCustomer) {
      return NextResponse.json({ message: `Could not affect customer ${body.customer_id} to agency ${agencyId}.` }, { status: 500 });
    }

    return NextResponse.json(updatedCustomer, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: "Failed to affect customer to agency", error: error.message }, { status: 500 });
  }
}