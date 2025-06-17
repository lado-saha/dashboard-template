// app/api/mock/organization/[orgId]/sales-people/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { dbManager } from '@/lib/data-repo/local-store/json-db-manager';
import { SalesPersonDto, CreateSalesPersonRequest } from '@/types/organization';

export async function GET(request: NextRequest, { params }: { params: { orgId: string } }) {
  try {
    const { orgId } = params;
    const allSalesPersons = dbManager.getCollection('salesPersons');
    const orgSalesPersons = allSalesPersons.filter(sp => sp.organization_id === orgId && !sp.agency_id); // No agency_id for org-level
    return NextResponse.json(orgSalesPersons);
  } catch (error: any) {
    return NextResponse.json({ message: "Failed to get org sales persons", error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: { orgId: string } }) {
  try {
    const { orgId } = params;
    const body = await request.json() as CreateSalesPersonRequest;
    // Add validation for CreateSalesPersonRequest
    const newSpData: Omit<SalesPersonDto, 'sales_person_id' | 'created_at' | 'updated_at' | 'partner_details'> = {
      ...body,
      organization_id: orgId,
      partner_type: "SALE"
    };
    const createdSp = dbManager.addItem('salesPersons', newSpData);
    return NextResponse.json(createdSp, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: "Failed to create org sales person", error: error.message }, { status: 500 });
  }
}