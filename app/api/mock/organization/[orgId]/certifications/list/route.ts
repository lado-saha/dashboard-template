// app/api/mock/organization/[orgId]/certifications/list/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { dbManager } from '@/lib/data-repo/local-store/json-db-manager';
import { CertificationDto } from '@/types/organization';

export async function GET(_request: NextRequest, { params }: { params: { orgId: string } }) {
  try {
    const { orgId } = await params;
    const allCerts = dbManager.getCollection('certifications');
    const filteredCerts = allCerts.filter(cert => cert.organization_id === orgId);
    return NextResponse.json(filteredCerts);
  } catch (error)  {
    return NextResponse.json({ message: "Failed to get certifications", error: error.message }, { status: 500 });
  }
}