// app/api/mock/organization/[orgId]/agencies/[agencyId]/customers/[customerId]/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { dbManager } from '@/lib/data-repo/local-store/json-db-manager';
import { CustomerOrgDto, UpdateCustomerRequest } from '@/types/organization';

export async function GET(request: NextRequest, { params }: { params: { orgId: string, agencyId: string, customerId: string } }) {
  try {
    const { orgId, agencyId, customerId } = await params;
    const customer = dbManager.getItemById('orgCustomers', customerId);
    if (!customer || customer.organization_id !== orgId || customer.agency_id !== agencyId) {
      return NextResponse.json({ message: `Customer ${customerId} not found for agency ${agencyId} in org ${orgId}.` }, { status: 404 });
    }
    return NextResponse.json(customer);
  } catch (error: any) { return NextResponse.json({ message: "Failed to get agency customer", error: error.message }, { status: 500 }); }
}

export async function PUT(request: NextRequest, { params }: { params: { orgId: string, agencyId: string, customerId: string } }) {
  try {
    const { orgId, agencyId, customerId } = await params;
    const body = await request.json() as UpdateCustomerRequest;
    const existing = dbManager.getItemById('orgCustomers', customerId);
    if (!existing || existing.organization_id !== orgId || existing.agency_id !== agencyId) {
      return NextResponse.json({ message: `Customer ${customerId} not found for agency ${agencyId}.` }, { status: 404 });
    }
    const updatedCustomer = dbManager.updateItem('orgCustomers', customerId, body);
    return NextResponse.json(updatedCustomer, { status: 202 });
  } catch (error: any) { return NextResponse.json({ message: "Failed to update agency customer", error: error.message }, { status: 500 }); }
}

export async function DELETE(request: NextRequest, { params }: { params: { orgId: string, agencyId: string, customerId: string } }) {
  try {
    const { orgId, agencyId, customerId } = await params;
    const existing = dbManager.getItemById('orgCustomers', customerId);
    if (!existing || existing.organization_id !== orgId || existing.agency_id !== agencyId) {
      return NextResponse.json({ message: `Customer ${customerId} not found for agency ${agencyId}.` }, { status: 404 });
    }
    const deleted = dbManager.deleteItem('orgCustomers', customerId);
    if (!deleted) return NextResponse.json({ message: `Customer ${customerId} not found.` }, { status: 404 });
    return NextResponse.json({ message: "Agency customer deleted." }, { status: 202 });
  } catch (error: any) { return NextResponse.json({ message: "Failed to delete agency customer", error: error.message }, { status: 500 }); }
}