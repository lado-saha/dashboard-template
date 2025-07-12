#!/bin/bash

# This script will create all the necessary mock API routes for Prospects.

# --- Organization-Level Prospect Routes ---

# 1. Route for GET (list) and POST (create) for organization prospects
mkdir -p app/api/mock/organization/[orgId]/prospects
code "app/api/mock/organization/[orgId]/prospects/route.ts"
cat << 'EOF' > app/api/mock/organization/[orgId]/prospects/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { dbManager } from '@/lib/data-repo/local-store/json-db-manager';
import { ProspectDto, CreateProspectRequest } from '@/types/organization';

export async function GET(request: NextRequest, { params }: { params: { orgId: string } }) {
  try {
    const { orgId } = params;
    const allProspects = dbManager.getCollection('prospects');
    const orgProspects = allProspects.filter(p => p.organization_id === orgId && !p.agency_id);
    return NextResponse.json(orgProspects);
  } catch (error: any) {
    return NextResponse.json({ message: "Failed to get organization prospects", error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: { orgId: string } }) {
  try {
    const { orgId } = params;
    const body = await request.json() as CreateProspectRequest;

    if (!body.first_name && !body.last_name) {
      return NextResponse.json({ message: "First and last name are required for a prospect." }, { status: 400 });
    }

    const newProspectData: Omit<ProspectDto, 'prospect_id' | 'created_at' | 'updated_at' | 'partner_details'> = {
      ...body,
      organization_id: orgId,
      partner_type: "PROSPECT",
    };
    const createdProspect = dbManager.addItem('prospects', newProspectData);
    return NextResponse.json(createdProspect, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: "Failed to create organization prospect", error: error.message }, { status: 500 });
  }
}
EOF

# 2. Route for GET (by ID), PUT, DELETE for a specific organization prospect
mkdir -p app/api/mock/organization/[orgId]/prospects/[prospectId]
code "app/api/mock/organization/[orgId]/prospects/[prospectId]/route.ts"
cat << 'EOF' > app/api/mock/organization/[orgId]/prospects/[prospectId]/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { dbManager } from '@/lib/data-repo/local-store/json-db-manager';
import { UpdateProspectRequest } from '@/types/organization';

export async function GET(request: NextRequest, { params }: { params: { orgId: string, prospectId: string } }) {
  try {
    const { orgId, prospectId } = params;
    const prospect = dbManager.getItemById('prospects', prospectId);
    if (!prospect || prospect.organization_id !== orgId) {
      return NextResponse.json({ message: `Prospect ${prospectId} not found for organization ${orgId}.` }, { status: 404 });
    }
    return NextResponse.json(prospect);
  } catch (error: any) { return NextResponse.json({ message: "Failed to get organization prospect", error: error.message }, { status: 500 }); }
}

export async function PUT(request: NextRequest, { params }: { params: { orgId: string, prospectId: string } }) {
  try {
    const { orgId, prospectId } = params;
    const body = await request.json() as UpdateProspectRequest;
    const existing = dbManager.getItemById('prospects', prospectId);
    if (!existing || existing.organization_id !== orgId) {
      return NextResponse.json({ message: `Prospect ${prospectId} not found for organization ${orgId}.` }, { status: 404 });
    }
    const updatedProspect = dbManager.updateItem('prospects', prospectId, body);
    return NextResponse.json(updatedProspect, { status: 202 });
  } catch (error: any) { return NextResponse.json({ message: "Failed to update organization prospect", error: error.message }, { status: 500 }); }
}

export async function DELETE(request: NextRequest, { params }: { params: { orgId: string, prospectId: string } }) {
  try {
    const { orgId, prospectId } = params;
    const existing = dbManager.getItemById('prospects', prospectId);
    if (!existing || existing.organization_id !== orgId) {
      return NextResponse.json({ message: `Prospect ${prospectId} not found for organization ${orgId}.` }, { status: 404 });
    }
    const deleted = dbManager.deleteItem('prospects', prospectId);
    if (!deleted) return NextResponse.json({ message: `Prospect ${prospectId} not found.` }, { status: 404 });
    return NextResponse.json({ message: "Organization prospect deleted." }, { status: 202 });
  } catch (error: any) { return NextResponse.json({ message: "Failed to delete organization prospect", error: error.message }, { status: 500 }); }
}
EOF


# --- Agency-Level Prospect Routes ---

# 3. Route for GET (list) and POST (create) for agency prospects
mkdir -p app/api/mock/organization/[orgId]/agencies/[agencyId]/prospects
code "app/api/mock/organization/[orgId]/agencies/[agencyId]/prospects/route.ts"
cat << 'EOF' > app/api/mock/organization/[orgId]/agencies/[agencyId]/prospects/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { dbManager } from '@/lib/data-repo/local-store/json-db-manager';
import { ProspectDto, CreateProspectRequest } from '@/types/organization';

export async function GET(request: NextRequest, { params }: { params: { orgId: string, agencyId: string } }) {
  try {
    const { orgId, agencyId } = params;
    const allProspects = dbManager.getCollection('prospects');
    const agencyProspects = allProspects.filter(p => p.organization_id === orgId && p.agency_id === agencyId);
    return NextResponse.json(agencyProspects);
  } catch (error: any) {
    return NextResponse.json({ message: "Failed to get agency prospects", error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: { orgId: string, agencyId: string } }) {
  try {
    const { orgId, agencyId } = params;
    const body = await request.json() as CreateProspectRequest;

    if (!body.first_name && !body.last_name) {
      return NextResponse.json({ message: "First and last name are required." }, { status: 400 });
    }

    const newProspectData: Omit<ProspectDto, 'prospect_id' | 'created_at' | 'updated_at' | 'partner_details'> = {
      ...body,
      organization_id: orgId,
      agency_id: agencyId,
      partner_type: "PROSPECT",
    };
    const createdProspect = dbManager.addItem('prospects', newProspectData);
    return NextResponse.json(createdProspect, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: "Failed to create agency prospect", error: error.message }, { status: 500 });
  }
}
EOF

# 4. Route for GET (by ID), PUT, DELETE for a specific agency prospect
mkdir -p app/api/mock/organization/[orgId]/agencies/[agencyId]/prospects/[prospectId]
code "app/api/mock/organization/[orgId]/agencies/[agencyId]/prospects/[prospectId]/route.ts"
cat << 'EOF' > app/api/mock/organization/[orgId]/agencies/[agencyId]/prospects/[prospectId]/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { dbManager } from '@/lib/data-repo/local-store/json-db-manager';
import { UpdateProspectRequest } from '@/types/organization';

export async function GET(request: NextRequest, { params }: { params: { orgId: string, agencyId: string, prospectId: string } }) {
  try {
    const { orgId, agencyId, prospectId } = params;
    const prospect = dbManager.getItemById('prospects', prospectId);
    if (!prospect || prospect.organization_id !== orgId || prospect.agency_id !== agencyId) {
      return NextResponse.json({ message: `Prospect ${prospectId} not found for agency ${agencyId}.` }, { status: 404 });
    }
    return NextResponse.json(prospect);
  } catch (error: any) { return NextResponse.json({ message: "Failed to get agency prospect", error: error.message }, { status: 500 }); }
}

export async function PUT(request: NextRequest, { params }: { params: { orgId: string, agencyId: string, prospectId: string } }) {
  try {
    const { orgId, agencyId, prospectId } = params;
    const body = await request.json() as UpdateProspectRequest;
    const existing = dbManager.getItemById('prospects', prospectId);
    if (!existing || existing.organization_id !== orgId || existing.agency_id !== agencyId) {
      return NextResponse.json({ message: `Prospect ${prospectId} not found for agency ${agencyId}.` }, { status: 404 });
    }
    const updatedProspect = dbManager.updateItem('prospects', prospectId, body);
    return NextResponse.json(updatedProspect, { status: 202 });
  } catch (error: any) { return NextResponse.json({ message: "Failed to update agency prospect", error: error.message }, { status: 500 }); }
}

export async function DELETE(request: NextRequest, { params }: { params: { orgId: string, agencyId: string, prospectId: string } }) {
  try {
    const { orgId, agencyId, prospectId } = params;
    const existing = dbManager.getItemById('prospects', prospectId);
    if (!existing || existing.organization_id !== orgId || existing.agency_id !== agencyId) {
      return NextResponse.json({ message: `Prospect ${prospectId} not found for agency ${agencyId}.` }, { status: 404 });
    }
    const deleted = dbManager.deleteItem('prospects', prospectId);
    if (!deleted) return NextResponse.json({ message: `Prospect ${prospectId} not found.` }, { status: 404 });
    return NextResponse.json({ message: "Agency prospect deleted." }, { status: 202 });
  } catch (error: any) { return NextResponse.json({ message: "Failed to delete agency prospect", error: error.message }, { status: 500 }); }
}
EOF

echo "✅ All mock API routes for Prospects have been created successfully."