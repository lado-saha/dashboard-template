// app/api/mock/organization/user-orgs/route.ts
import { NextResponse } from 'next/server';
import { dbManager } from '@/lib/data-repo/local-store/json-db-manager';
import { OrganizationDto } from '@/types/organization';
// import { getToken } from 'next-auth/jwt'; // For future use if we link orgs to users

export async function GET(_request: Request) {
  // In a real app, you filter by authenticated user ID.
  try {
    const orgs = dbManager.getCollection('organizationsDetails');
    return NextResponse.json(orgs);
  } catch (error)  {
    return NextResponse.json({ message: "Failed to get user organizations", error: error.message }, { status: 500 });
  }
}