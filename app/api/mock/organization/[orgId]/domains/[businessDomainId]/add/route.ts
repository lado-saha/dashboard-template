import { NextResponse, NextRequest } from 'next/server';
import { dbManager } from '@/lib/data-repo/local-store/json-db-manager';
import { OrganizationDto } from '@/types/organization';

export async function PUT(_request: NextRequest, { params }: { params: { orgId: string, businessDomainId: string } }) {
  try {
    const { orgId, businessDomainId } = await params;
    const org = dbManager.getItemById('organizationsDetails', orgId);

    if (!org) {
      return NextResponse.json({ message: `Organization with ID ${orgId} not found.` }, { status: 404 });
    }
    // Ensure business_domains array exists
    if (!org.business_domains) {
      org.business_domains = [];
    }
    if (!org.business_domains.includes(businessDomainId)) {
      org.business_domains.push(businessDomainId);
      dbManager.updateItem('organizationsDetails', orgId, { business_domains: org.business_domains });
    }
    return NextResponse.json(org, { status: 202 }); // 202 Accepted as per spec
  } catch (error)  {
    return NextResponse.json({ message: error.message || "Failed to add business domain." }, { status: 500 });
  }
}