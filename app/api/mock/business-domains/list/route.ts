// app/api/mock/business-domains/list/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { dbManager } from '@/lib/data-repo/local-store/json-db-manager';
import { BusinessDomainDto, GetBusinessDomainRequest } from '@/types/organization';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
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
  } catch (error: any) {
    return NextResponse.json({ message: "Failed to get business domains", error: error.message }, { status: 500 });
  }
}