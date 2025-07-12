
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
  } catch (error) {
    return NextResponse.json({ message: "Failed to create business domain", error: error.message }, { status: 500 });
  }
}

import { GetBusinessDomainRequest } from '@/types/organization';

export async function GET(_request: NextRequest) {
  try {
    const { searchParams } = new URL(_request.url);
    const params: GetBusinessDomainRequest = {
      organization_id: searchParams.get('organization_id') || undefined,
      parent_domain_id: searchParams.get('parent_domain_id') || undefined,
      name: searchParams.get('name') || undefined,
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : undefined,
      size: searchParams.get('size') ? parseInt(searchParams.get('size')!, 10) : undefined,
    };

    let domains = dbManager.getCollection('businessDomains');

    // Apply filters if provided (simple mock filtering)
    if (params.organization_id) domains = domains.filter(d => d.organization_id === params.organization_id);
    if (params.parent_domain_id) domains = domains.filter(d => d.parent_domain_id === params.parent_domain_id);
    if (params.name) domains = domains.filter(d => d.name?.toLowerCase().includes(params.name!.toLowerCase()));

    // Mock pagination (basic)
    if (params.page && params.size) {
      const start = (params.page - 1) * params.size;
      const end = start + params.size;
      domains = domains.slice(start, end);
    }
    return NextResponse.json(domains);
  } catch (error) {
    return NextResponse.json({ message: "Failed to get business domains", error: error.message }, { status: 500 });
  }
}