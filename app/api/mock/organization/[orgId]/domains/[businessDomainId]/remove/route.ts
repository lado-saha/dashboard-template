// app/api/mock/organization/[orgId]/domains/[businessDomainId]/remove/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { dbManager } from '@/lib/data-repo/local-store/json-db-manager';

export async function DELETE(_request: NextRequest, { params }: { params: { orgId: string, businessDomainId: string } }) {
  try {
    const { orgId, businessDomainId } = await params;
    const org = dbManager.getItemById('organizationsDetails', orgId);

    if (!org || !org.business_domains) {
      return NextResponse.json({ message: `Organization with ID ${orgId} or its domains not found.` }, { status: 404 });
    }
    const initialLength = org.business_domains.length;
    org.business_domains = org.business_domains.filter(id => id !== businessDomainId);

    if (org.business_domains.length < initialLength) {
      dbManager.updateItem('organizationsDetails', orgId, { business_domains: org.business_domains });
    }
    return NextResponse.json(org, { status: 202 }); // 202 Accepted
  } catch (error)  {
    return NextResponse.json({ message: error.message || "Failed to remove business domain." }, { status: 500 });
  }
}