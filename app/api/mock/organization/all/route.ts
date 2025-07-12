// app/api/mock/organization/all/route.ts
import { NextResponse } from 'next/server';
import { dbManager } from '@/lib/data-repo/local-store/json-db-manager';

export async function GET(_request: Request) {
  try {
    const orgs = dbManager.getCollection('organizationsDetails');
    return NextResponse.json(orgs);
  } catch (error) {
    return NextResponse.json({ message: "Failed to get all organizations", error: error.message }, { status: 500 });
  }
}