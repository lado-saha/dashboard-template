import { NextResponse, NextRequest } from 'next/server';
import { dbManager } from '@/lib/data-repo/local-store/json-db-manager';
import { UpdateSalesPersonRequest } from '@/types/organization';

export async function GET(request: NextRequest, { params }: { params: { orgId: string, salesPersonId: string } }) {
  try {
    const { orgId, salesPersonId } = await params;
    const sp = dbManager.getItemById('salesPersons', salesPersonId);
    if (!sp || sp.organization_id !== orgId) {
      return NextResponse.json({ message: `SalesPerson ID ${salesPersonId} not found for org ${orgId}.` }, { status: 404 });
    }
    return NextResponse.json(sp);
  } catch (error: any) { return NextResponse.json({ message: "Failed to get sales person", error: error.message }, { status: 500 }); }
}

export async function PUT(request: NextRequest, { params }: { params: { orgId: string, salesPersonId: string } }) {
  try {
    const { orgId, salesPersonId } = await params;
    const body = await request.json() as UpdateSalesPersonRequest;
    const existing = dbManager.getItemById('salesPersons', salesPersonId);
    if (!existing || existing.organization_id !== orgId) {
      return NextResponse.json({ message: `SalesPerson ID ${salesPersonId} not found for org ${orgId}.` }, { status: 404 });
    }
    const updatedSp = dbManager.updateItem('salesPersons', salesPersonId, body);
    return NextResponse.json(updatedSp, { status: 202 });
  } catch (error: any) { return NextResponse.json({ message: "Failed to update sales person", error: error.message }, { status: 500 }); }
}

export async function DELETE(request: NextRequest, { params }: { params: { orgId: string, salesPersonId: string } }) {
  try {
    const { orgId, salesPersonId } = await params;
    const existing = dbManager.getItemById('salesPersons', salesPersonId);
    if (!existing || existing.organization_id !== orgId) {
      return NextResponse.json({ message: `SalesPerson ID ${salesPersonId} not found for org ${orgId}.` }, { status: 404 });
    }
    const deleted = dbManager.deleteItem('salesPersons', salesPersonId);
    if (!deleted) return NextResponse.json({ message: "Not found" }, { status: 404 });
    return NextResponse.json({ message: "Sales person deleted." }, { status: 202 });
  } catch (error: any) { return NextResponse.json({ message: "Failed to delete sales person", error: error.message }, { status: 500 }); }
}
