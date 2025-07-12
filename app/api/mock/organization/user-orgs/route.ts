import { NextResponse, NextRequest } from 'next/server';
import { dbManager } from '@/lib/data-repo/local-store/json-db-manager';
import { getUserIdFromMockToken } from '@/lib/data-repo/local-store/mock-auth-utils';

export async function GET(request: NextRequest) {
  try {
    // Get the user ID from the Authorization token, simulating the backend
    const businessActorId = await getUserIdFromMockToken(request);

    if (!businessActorId) {
      // If no token is provided, we can't know which orgs to return.
      // In a real API, this would be a 401 Unauthorized.
      return NextResponse.json({ message: "Unauthorized: No user token found." }, { status: 401 });
    }

    const allOrgs = dbManager.getCollection('organizationsDetails');

    // Filter the organizations to only include those owned by the user
    const userOrgs = allOrgs.filter(org => org.business_actor_id === businessActorId);

    return NextResponse.json(userOrgs);
  } catch (error: any) {
    return NextResponse.json({ message: "Failed to get user organizations", error: error.message }, { status: 500 });
  }
}