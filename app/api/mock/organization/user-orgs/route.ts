// app/api/mock/organization/user-orgs/route.ts
import { NextResponse } from 'next/server';
import { dbManager } from '@/lib/data-repo/local-store/json-db-manager';
import { OrganizationTableRow } from '@/types/organization';
// import { getToken } from 'next-auth/jwt'; // For future use if we link orgs to users

export async function GET(request: Request) {
  // For mock, assume all orgs in organizationsTableRows are for "current user"
  // In a real app, you'd filter by authenticated user ID.
  try {
    const orgs = dbManager.getCollection('organizationsTableRows');
    return NextResponse.json(orgs);
  } catch (error: any) {
    return NextResponse.json({ message: "Failed to get user organizations", error: error.message }, { status: 500 });
  }
}