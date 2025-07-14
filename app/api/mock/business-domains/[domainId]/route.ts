// app/api/mock/business-domains/[domainId]/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { dbManager } from '@/lib/data-repo/local-store/json-db-manager';
import { BusinessDomainDto, UpdateBusinessDomainRequest } from '@/types/organization';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ domainId: string }> }) {
  try {
    const { domainId } = await params;
    const domain = dbManager.getItemById('businessDomains', domainId);
    if (!domain) {
      return NextResponse.json({ message: `Business domain with ID ${domainId} not found.` }, { status: 404 });
    }
    return NextResponse.json(domain);
  } catch (error)  {
    return NextResponse.json({ message: "Failed to get business domain", error: error.message }, { status: 500 });
  }
}

export async function PUT(_request: NextRequest, { params }: { params: Promise<{ domainId: string }> }) {
  try {
    const { domainId } = await params;
    const body = await _request.json() as UpdateBusinessDomainRequest;
    const updatedDomain = dbManager.updateItem('businessDomains', domainId, body);
    if (!updatedDomain) {
      return NextResponse.json({ message: `Business domain with ID ${domainId} not found.` }, { status: 404 });
    }
    return NextResponse.json(updatedDomain, { status: 202 }); // Spec: 202 Accepted
  } catch (error)  {
    return NextResponse.json({ message: "Failed to update business domain", error: error.message }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ domainId: string }> }) {
  try {
    const { domainId } = await params;
    // Check if any organization uses this domain before deleting (optional for mock)
    const deleted = dbManager.deleteItem('businessDomains', domainId);
    if (!deleted) {
      return NextResponse.json({ message: `Business domain with ID ${domainId} not found.` }, { status: 404 });
    }
    return NextResponse.json({ message: "Business domain deleted." }, { status: 202 }); // Spec: 202 Accepted
  } catch (error)  {
    return NextResponse.json({ message: "Failed to delete business domain", error: error.message }, { status: 500 });
  }
}