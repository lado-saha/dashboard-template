// app/api/mock/organization/domain/[domainId]/route.ts
import { NextResponse } from 'next/server';
import { dbManager } from '@/lib/data-repo/local-store/json-db-manager';

export async function GET(_request: Request, { params }: { params: Promise<{ domainId: string }> }) {
  try {
    const { domainId } = await params;
    const allOrgs = dbManager.getCollection('organizationsDetails');
    const orgsInDomain = allOrgs.filter(org => org.business_domains?.includes(domainId));
    return NextResponse.json(orgsInDomain);
  } catch (error)  {
    return NextResponse.json({ message: "Failed to get organizations by domain", error: error.message }, { status: 500 });
  }
}