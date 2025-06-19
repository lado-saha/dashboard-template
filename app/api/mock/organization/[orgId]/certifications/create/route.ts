// app/api/mock/organization/[orgId]/certifications/create/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { dbManager } from '@/lib/data-repo/local-store/json-db-manager';
import { CertificationDto, CreateCertificationRequest } from '@/types/organization';

export async function POST(request: NextRequest, { params }: { params: { orgId: string } }) {
  try {
    const { orgId } = await params;
    const body = await request.json() as CreateCertificationRequest;

    if (!body.name || !body.type) {
      return NextResponse.json({ message: "Name and Type are required for certification." }, { status: 400 });
    }
    const newCertData: Omit<CertificationDto, 'certification_id' | 'created_at' | 'updated_at'> = {
      ...body,
      organization_id: orgId,
    };
    const createdCert = dbManager.addItem('certifications', newCertData);
    return NextResponse.json(createdCert, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: "Failed to create certification", error: error.message }, { status: 500 });
  }
}