// app/api/mock/organization/[orgId]/agencies/[agencyId]/customers/add/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { dbManager } from '@/lib/data-repo/local-store/json-db-manager';
import { CustomerDto, AffectCustomerRequest } from '@/types/organization';

export async function POST(_request: NextRequest, { params }: { params: { orgId: string, agencyId: string } }) {
  try {
    const { orgId, agencyId } = await params;
    const body = await _request.json() as AffectCustomerRequest;

    if (!body.customer_id) {
      return NextResponse.json({ message: "customer_id is required." }, { status: 400 });
    }

    // In a real system, this would link an existing global customer/BA to this agency.
    // For mock, we might check if a customer with this ID exists in a global customer list or BA list,
    // then create/update an entry in 'orgCustomers' linking them.

    let customer = dbManager.getItemById('orgCustomers', body.customer_id); // Check if customer record exists

    if (customer) {
      // If customer record exists, update its agency and org ID (if it was an org-level customer before)
      customer = dbManager.updateItem('orgCustomers', body.customer_id, { agency_id: agencyId, organization_id: orgId });
    } else {
      // If no such customer record, create a new one (this implies customer_id might be a User ID from auth)
      const newCustomerData: Partial<CustomerDto> = {
        customer_id: body.customer_id, // This ID likely refers to a User/BusinessActor ID
        user_id: body.customer_id, // Assuming customer_id is the user_id from auth
        organization_id: orgId,
        agency_id: agencyId,
        first_name: "Affected", // Placeholder, fetch from User/BA table
        last_name: "Customer",  // Placeholder
        partner_type: "CUSTOMER",
      };
      customer = dbManager.addItem('orgCustomers', newCustomerData as any);
    }

    if (!customer) {
      return NextResponse.json({ message: `Could not affect customer ${body.customer_id} to agency ${agencyId}.` }, { status: 500 });
    }

    return NextResponse.json(customer, { status: 201 }); // 201 Created or 200 OK
  } catch (error)  {
    return NextResponse.json({ message: "Failed to affect customer to agency", error: error.message }, { status: 500 });
  }
}