import { NextResponse, NextRequest } from 'next/server';
import { dbManager } from '@/lib/data-repo/local-store/json-db-manager';

import { CertificationDto, CreateCertificationRequest } from '@/types/organization';

export async function GET(_request: NextRequest, { params }: { params: { orgId: string } }) {
  try {
    const { orgId } = await params;
    const allCerts = dbManager.getCollection('certifications');
    const filteredCerts = allCerts.filter(cert => cert.organization_id === orgId);
    return NextResponse.json(filteredCerts);
  } catch (error) {
    return NextResponse.json({ message: "Failed to get certifications", error: error.message }, { status: 500 });
  }
}
// app/api/mock/organization/[orgId]/certifications/create/route.ts

export async function POST(_request: NextRequest, { params }: { params: { orgId: string } }) {
  try {
    const { orgId } = await params;
    const body = await _request.json() as CreateCertificationRequest;

    if (!body.name || !body.type) {
      return NextResponse.json({ message: "Name and Type are required for certification." }, { status: 400 });
    }
    const newCertData: Omit<CertificationDto, 'certification_id' | 'created_at' | 'updated_at'> = {
      ...body,
      organization_id: orgId,
    };
    const createdCert = dbManager.addItem('certifications', newCertData);
    return NextResponse.json(createdCert, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Failed to create certification", error: error.message }, { status: 500 });
  }
}