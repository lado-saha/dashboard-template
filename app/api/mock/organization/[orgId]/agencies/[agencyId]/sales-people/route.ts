// app/api/mock/organization/[orgId]/agencies/[agencyId]/sales-people/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { dbManager } from '@/lib/data-repo/local-store/json-db-manager';
import { SalesPersonDto, CreateSalesPersonRequest } from '@/types/organization';

export async function GET(_request: NextRequest, { params }: { params: { orgId: string, agencyId: string } }) {
  try {
    const { orgId, agencyId } = await params;
    const allSalesPersons = dbManager.getCollection('salesPersons');
    const agencySalesPersons = allSalesPersons.filter(sp => sp.organization_id === orgId && sp.agency_id === agencyId);
    return NextResponse.json(agencySalesPersons);
  } catch (error)  { return NextResponse.json({ message: "Failed to get agency sales persons", error: error.message }, { status: 500 }); }
}

export async function POST(_request: NextRequest, { params }: { params: { orgId: string, agencyId: string } }) {
  try {
    const { orgId, agencyId } = await params;
    const body = await _request.json() as CreateSalesPersonRequest;
    const newSpData: Omit<SalesPersonDto, 'sales_person_id' | 'created_at' | 'updated_at' | 'partner_details'> = {
      ...body,
      organization_id: orgId,
      agency_id: agencyId,
      partner_type: "SALE"
    };
    const createdSp = dbManager.addItem('salesPersons', newSpData);
    return NextResponse.json(createdSp, { status: 201 });
  } catch (error)  { return NextResponse.json({ message: "Failed to create agency sales person", error: error.message }, { status: 500 }); }
}