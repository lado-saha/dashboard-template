#!/bin/bash

# This script will create all the necessary mock API routes for Sales People.

# --- Organization-Level Sales Person Routes ---

# 1. Route for GET (list) and POST (create) for organization sales people
mkdir -p app/api/mock/organization/[orgId]/sales-people
code "app/api/mock/organization/[orgId]/sales-people/route.ts"
cat << 'EOF' > app/api/mock/organization/[orgId]/sales-people/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { dbManager } from '@/lib/data-repo/local-store/json-db-manager';
import { SalesPersonDto, CreateSalesPersonRequest } from '@/types/organization';

export async function GET(request: NextRequest, { params }: { params: { orgId: string } }) {
  try {
    const { orgId } = params;
    const allSalesPersons = dbManager.getCollection('salesPersons');
    const orgSalesPersons = allSalesPersons.filter(sp => sp.organization_id === orgId && !sp.agency_id);
    return NextResponse.json(orgSalesPersons);
  } catch (error: any) {
    return NextResponse.json({ message: "Failed to get organization sales people", error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: { orgId: string } }) {
  try {
    const { orgId } = params;
    const body = await request.json() as CreateSalesPersonRequest;

    if (!body.name) {
      return NextResponse.json({ message: "Sales person name is required." }, { status: 400 });
    }

    const newSpData: Omit<SalesPersonDto, 'sales_person_id' | 'created_at' | 'updated_at' | 'partner_details'> = {
      ...body,
      organization_id: orgId,
      partner_type: "SALE",
    };
    const createdSp = dbManager.addItem('salesPersons', newSpData);
    return NextResponse.json(createdSp, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: "Failed to create organization sales person", error: error.message }, { status: 500 });
  }
}
EOF

# 2. Route for GET (by ID), PUT, DELETE for a specific organization sales person
mkdir -p app/api/mock/organization/[orgId]/sales-people/[salesPersonId]
code "app/api/mock/organization/[orgId]/sales-people/[salesPersonId]/route.ts"
cat << 'EOF' > app/api/mock/organization/[orgId]/sales-people/[salesPersonId]/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { dbManager } from '@/lib/data-repo/local-store/json-db-manager';
import { UpdateSalesPersonRequest } from '@/types/organization';

export async function GET(request: NextRequest, { params }: { params: { orgId: string, salesPersonId: string } }) {
  try {
    const { orgId, salesPersonId } = params;
    const sp = dbManager.getItemById('salesPersons', salesPersonId);
    if (!sp || sp.organization_id !== orgId) {
      return NextResponse.json({ message: `SalesPerson ID ${salesPersonId} not found for org ${orgId}.` }, { status: 404 });
    }
    return NextResponse.json(sp);
  } catch (error: any) { return NextResponse.json({ message: "Failed to get sales person", error: error.message }, { status: 500 }); }
}

export async function PUT(request: NextRequest, { params }: { params: { orgId: string, salesPersonId: string } }) {
  try {
    const { orgId, salesPersonId } = params;
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
    const { orgId, salesPersonId } = params;
    const existing = dbManager.getItemById('salesPersons', salesPersonId);
    if (!existing || existing.organization_id !== orgId) {
      return NextResponse.json({ message: `SalesPerson ID ${salesPersonId} not found for org ${orgId}.` }, { status: 404 });
    }
    const deleted = dbManager.deleteItem('salesPersons', salesPersonId);
    if (!deleted) return NextResponse.json({ message: "Not found" }, { status: 404 });
    return NextResponse.json({ message: "Sales person deleted." }, { status: 202 });
  } catch (error: any) { return NextResponse.json({ message: "Failed to delete sales person", error: error.message }, { status: 500 }); }
}
EOF


# --- Agency-Level Sales Person Routes ---

# 3. Route for GET (list) and POST (create) for agency sales people
mkdir -p app/api/mock/organization/[orgId]/agencies/[agencyId]/sales-people
code "app/api/mock/organization/[orgId]/agencies/[agencyId]/sales-people/route.ts"
cat << 'EOF' > app/api/mock/organization/[orgId]/agencies/[agencyId]/sales-people/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { dbManager } from '@/lib/data-repo/local-store/json-db-manager';
import { SalesPersonDto, CreateSalesPersonRequest } from '@/types/organization';

export async function GET(request: NextRequest, { params }: { params: { orgId: string, agencyId: string } }) {
  try {
    const { orgId, agencyId } = params;
    const allSalesPersons = dbManager.getCollection('salesPersons');
    const agencySalesPersons = allSalesPersons.filter(sp => sp.organization_id === orgId && sp.agency_id === agencyId);
    return NextResponse.json(agencySalesPersons);
  } catch (error: any) { return NextResponse.json({ message: "Failed to get agency sales people", error: error.message }, { status: 500 }); }
}

export async function POST(request: NextRequest, { params }: { params: { orgId: string, agencyId: string } }) {
  try {
    const { orgId, agencyId } = params;
    const body = await request.json() as CreateSalesPersonRequest;

    if (!body.name) {
      return NextResponse.json({ message: "Sales person name is required." }, { status: 400 });
    }

    const newSpData: Omit<SalesPersonDto, 'sales_person_id' | 'created_at' | 'updated_at' | 'partner_details'> = {
      ...body,
      organization_id: orgId,
      agency_id: agencyId,
      partner_type: "SALE"
    };
    const createdSp = dbManager.addItem('salesPersons', newSpData);
    return NextResponse.json(createdSp, { status: 201 });
  } catch (error: any) { return NextResponse.json({ message: "Failed to create agency sales person", error: error.message }, { status: 500 }); }
}
EOF

# 4. Route for GET (by ID), PUT, DELETE for a specific agency sales person
mkdir -p app/api/mock/organization/[orgId]/agencies/[agencyId]/sales-people/[salesPersonId]
code "app/api/mock/organization/[orgId]/agencies/[agencyId]/sales-people/[salesPersonId]/route.ts"
cat << 'EOF' > app/api/mock/organization/[orgId]/agencies/[agencyId]/sales-people/[salesPersonId]/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { dbManager } from '@/lib/data-repo/local-store/json-db-manager';
import { UpdateSalesPersonRequest } from '@/types/organization';

export async function GET(request: NextRequest, { params }: { params: { orgId: string, agencyId: string, salesPersonId: string } }) {
  try {
    const { orgId, agencyId, salesPersonId } = params;
    const sp = dbManager.getItemById('salesPersons', salesPersonId);
    if (!sp || sp.organization_id !== orgId || sp.agency_id !== agencyId) {
      return NextResponse.json({ message: `SalesPerson ${salesPersonId} not found for agency ${agencyId}.` }, { status: 404 });
    }
    return NextResponse.json(sp);
  } catch (error: any) { return NextResponse.json({ message: "Failed to get agency sales person", error: error.message }, { status: 500 }); }
}

export async function PUT(request: NextRequest, { params }: { params: { orgId: string, agencyId: string, salesPersonId: string } }) {
  try {
    const { orgId, agencyId, salesPersonId } = params;
    const body = await request.json() as UpdateSalesPersonRequest;
    const existing = dbManager.getItemById('salesPersons', salesPersonId);
    if (!existing || existing.organization_id !== orgId || existing.agency_id !== agencyId) {
      return NextResponse.json({ message: `SalesPerson ${salesPersonId} not found for agency ${agencyId}.` }, { status: 404 });
    }
    const updatedSp = dbManager.updateItem('salesPersons', salesPersonId, body);
    return NextResponse.json(updatedSp, { status: 202 });
  } catch (error: any) { return NextResponse.json({ message: "Failed to update agency sales person", error: error.message }, { status: 500 }); }
}

export async function DELETE(request: NextRequest, { params }: { params: { orgId: string, agencyId: string, salesPersonId: string } }) {
  try {
    const { orgId, agencyId, salesPersonId } = params;
    const existing = dbManager.getItemById('salesPersons', salesPersonId);
    if (!existing || existing.organization_id !== orgId || existing.agency_id !== agencyId) {
      return NextResponse.json({ message: `SalesPerson ${salesPersonId} not found for agency ${agencyId}.` }, { status: 404 });
    }
    const deleted = dbManager.deleteItem('salesPersons', salesPersonId);
    if (!deleted) return NextResponse.json({ message: `SalesPerson ${salesPersonId} not found.` }, { status: 404 });
    return NextResponse.json({ message: "Agency sales person deleted." }, { status: 202 });
  } catch (error: any) { return NextResponse.json({ message: "Failed to delete agency sales person", error: error.message }, { status: 500 }); }
}
EOF

echo "✅ All mock API routes for Sales People have been created successfully."