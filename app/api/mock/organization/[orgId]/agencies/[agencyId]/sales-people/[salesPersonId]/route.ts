// app/api/mock/organization/[orgId]/agencies/[agencyId]/sales-people/[salesPersonId]/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { dbManager } from '@/lib/data-repo/local-store/json-db-manager';
import { SalesPersonDto, UpdateSalesPersonRequest } from '@/types/organization';

export async function GET(_request: NextRequest, { params }: { params: { orgId: string, agencyId: string, salesPersonId: string } }) {
  try {
    const { orgId, agencyId, salesPersonId } = await params;
    const sp = dbManager.getItemById('salesPersons', salesPersonId);
    if (!sp || sp.organization_id !== orgId || sp.agency_id !== agencyId) {
      return NextResponse.json({ message: `SalesPerson ${salesPersonId} not found for agency ${agencyId}.` }, { status: 404 });
    }
    return NextResponse.json(sp);
  } catch (error)  { return NextResponse.json({ message: "Failed to get agency sales person", error: error.message }, { status: 500 }); }
}

export async function PUT(_request: NextRequest, { params }: { params: { orgId: string, agencyId: string, salesPersonId: string } }) {
  try {
    const { orgId, agencyId, salesPersonId } = await params;
    const body = await _request.json() as UpdateSalesPersonRequest;
    const existing = dbManager.getItemById('salesPersons', salesPersonId);
    if (!existing || existing.organization_id !== orgId || existing.agency_id !== agencyId) {
      return NextResponse.json({ message: `SalesPerson ${salesPersonId} not found for agency ${agencyId}.` }, { status: 404 });
    }
    const updatedSp = dbManager.updateItem('salesPersons', salesPersonId, body);
    return NextResponse.json(updatedSp, { status: 202 });
  } catch (error)  { return NextResponse.json({ message: "Failed to update agency sales person", error: error.message }, { status: 500 }); }
}

export async function DELETE(_request: NextRequest, { params }: { params: { orgId: string, agencyId: string, salesPersonId: string } }) {
  try {
    const { orgId, agencyId, salesPersonId } = await params;
    const existing = dbManager.getItemById('salesPersons', salesPersonId);
    if (!existing || existing.organization_id !== orgId || existing.agency_id !== agencyId) {
      return NextResponse.json({ message: `SalesPerson ${salesPersonId} not found for agency ${agencyId}.` }, { status: 404 });
    }
    const deleted = dbManager.deleteItem('salesPersons', salesPersonId);
    if (!deleted) return NextResponse.json({ message: `SalesPerson ${salesPersonId} not found.` }, { status: 404 });
    return NextResponse.json({ message: "Agency sales person deleted." }, { status: 202 });
  } catch (error)  { return NextResponse.json({ message: "Failed to delete agency sales person", error: error.message }, { status: 500 }); }
}