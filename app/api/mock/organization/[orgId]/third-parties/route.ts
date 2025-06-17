// app/api/mock/organization/[orgId]/third-parties/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { dbManager } from '@/lib/data-repo/local-store/json-db-manager';
import { ThirdPartyDto, GetThirdPartyRequest, ThirdPartyType } from '@/types/organization';

export async function GET(request: NextRequest, { params }: { params: { orgId: string } }) {
  try {
    const { orgId } = params;
    const { searchParams } = new URL(request.url);
    const queryParams: GetThirdPartyRequest = {
        status: searchParams.get('status') === 'true' ? true : searchParams.get('status') === 'false' ? false : undefined,
        type: searchParams.get('type') as ThirdPartyType || undefined,
        page: searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : undefined,
        size: searchParams.get('size') ? parseInt(searchParams.get('size')!, 10) : undefined,
    };

    let thirdParties = dbManager.getCollection('thirdParties').filter(tp => tp.organization_id === orgId);

    if (queryParams.status !== undefined) {
        thirdParties = thirdParties.filter(tp => tp.is_active === queryParams.status);
    }
    if (queryParams.type) {
        thirdParties = thirdParties.filter(tp => tp.type === queryParams.type);
    }
    // Basic pagination for mock
    if (queryParams.page && queryParams.size) {
        const start = (queryParams.page - 1) * queryParams.size;
        const end = start + queryParams.size;
        thirdParties = thirdParties.slice(start, end);
    }
    return NextResponse.json(thirdParties);
  } catch (error: any) {
    return NextResponse.json({ message: "Failed to get third parties", error: error.message }, { status: 500 });
  }
}