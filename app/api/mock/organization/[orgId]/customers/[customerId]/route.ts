// app/api/mock/organization/[orgId]/customers/[customerId]/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { dbManager } from '@/lib/data-repo/local-store/json-db-manager';
import { CustomerOrgDto, UpdateCustomerRequest } from '@/types/organization';

export async function GET(_request: NextRequest, { params }: { params: { orgId: string, customerId: string } }) {
  try {
    const { orgId, customerId } = await params;
    const customer = dbManager.getItemById('orgCustomers', customerId);
    if (!customer || customer.organization_id !== orgId) { // Ensure it for THIS org if not agency specific
      return NextResponse.json({ message: `Customer ${customerId} not found for organization ${orgId}.` }, { status: 404 });
    }
    return NextResponse.json(customer);
  } catch (error: any)  { return NextResponse.json({ message: "Failed to get organization customer", error: error.message }, { status: 500 }); }
}

export async function PUT(_request: NextRequest, { params }: { params: { orgId: string, customerId: string } }) {
  try {
    const { orgId, customerId } = await params;
    const body = await _request.json() as UpdateCustomerRequest;
    const existing = dbManager.getItemById('orgCustomers', customerId);
    if (!existing || existing.organization_id !== orgId) {
      return NextResponse.json({ message: `Customer ${customerId} not found for organization ${orgId}.` }, { status: 404 });
    }
    const updatedCustomer = dbManager.updateItem('orgCustomers', customerId, body);
    return NextResponse.json(updatedCustomer, { status: 202 });
  } catch (error: any)  { return NextResponse.json({ message: "Failed to update organization customer", error: error.message }, { status: 500 }); }
}

export async function DELETE(_request: NextRequest, { params }: { params: { orgId: string, customerId: string } }) {
  try {
    const { orgId, customerId } = await params;
    const existing = dbManager.getItemById('orgCustomers', customerId);
    if (!existing || existing.organization_id !== orgId) {
      return NextResponse.json({ message: `Customer ${customerId} not found for organization ${orgId}.` }, { status: 404 });
    }
    const deleted = dbManager.deleteItem('orgCustomers', customerId);
    if (!deleted) return NextResponse.json({ message: `Customer ${customerId} not found.` }, { status: 404 });
    return NextResponse.json({ message: "Organization customer deleted." }, { status: 202 });
  } catch (error: any)  { return NextResponse.json({ message: "Failed to delete organization customer", error: error.message }, { status: 500 }); }
}