// app/api/mock/business-domains/create/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { dbManager } from '@/lib/data-repo/local-store/json-db-manager';
import { BusinessDomainDto, CreateBusinessDomainRequest } from '@/types/organization';

export async function POST(_request: NextRequest) {
  try {
    const body = await _request.json() as CreateBusinessDomainRequest;
    if (!body.name || !body.type || !body.type_label) {
      return NextResponse.json({ message: "Name, type, and type_label are required." }, { status: 400 });
    }
    // In a real app, check for duplicate names, etc.
    const newDomain = dbManager.addItem('businessDomains', body);
    return NextResponse.json(newDomain, { status: 201 });
  } catch (error)  {
    return NextResponse.json({ message: "Failed to create business domain", error: error.message }, { status: 500 });
  }
}