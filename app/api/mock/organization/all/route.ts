// app/api/mock/organization/all/route.ts
import { NextResponse } from 'next/server';
import { dbManager } from '@/lib/data-repo/local-store/json-db-manager';

export async function GET(request: Request) {
  try {
    const orgs = dbManager.getCollection('organizationsTableRows');
    return NextResponse.json(orgs);
  } catch (error: any) {
    return NextResponse.json({ message: "Failed to get all organizations", error: error.message }, { status: 500 });
  }
}