// app/api/mock/organization/[orgId]/certifications/[certId]/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { dbManager } from '@/lib/data-repo/local-store/json-db-manager';
import { CertificationDto, UpdateCertificationRequest } from '@/types/organization';

export async function GET(_request: NextRequest, { params }: { params: { orgId: string, certId: string } }) {
  try {
    const { certId } = await params;
    const cert = dbManager.getItemById('certifications', certId);
    if (!cert || cert.organization_id !== params.orgId) {
      return NextResponse.json({ message: `Certification with ID ${certId} not found for this organization.` }, { status: 404 });
    }
    return NextResponse.json(cert);
  } catch (error: any)  {
    return NextResponse.json({ message: "Failed to get certification", error: error.message }, { status: 500 });
  }
}

export async function PUT(_request: NextRequest, { params }: { params: { orgId: string, certId: string } }) {
  try {
    const { orgId, certId } = await params;
    const body = await _request.json() as UpdateCertificationRequest;
     const existingCert = dbManager.getItemById('certifications', certId);
    if (!existingCert || existingCert.organization_id !== orgId) {
         return NextResponse.json({ message: `Certification with ID ${certId} not found for this organization.` }, { status: 404 });
    }
    const updatedCert = dbManager.updateItem('certifications', certId, body);
    return NextResponse.json(updatedCert, { status: 202 }); // Spec: 202 Accepted
  } catch (error: any)  {
    return NextResponse.json({ message: "Failed to update certification", error: error.message }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { orgId: string, certId: string } }) {
  try {
    const { orgId, certId } = await params;
    const existingCert = dbManager.getItemById('certifications', certId);
    if (!existingCert || existingCert.organization_id !== orgId) {
         return NextResponse.json({ message: `Certification with ID ${certId} not found for this organization.` }, { status: 404 });
    }
    const deleted = dbManager.deleteItem('certifications', certId);
    if (!deleted) {
      return NextResponse.json({ message: `Certification with ID ${certId} not found.` }, { status: 404 });
    }
    return NextResponse.json({ message: "Certification deleted." }, { status: 202 }); // Spec: 202 Accepted
  } catch (error: any)  {
    return NextResponse.json({ message: "Failed to delete certification", error: error.message }, { status: 500 });
  }
}