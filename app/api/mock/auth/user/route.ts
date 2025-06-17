// app/api/mock/auth/user/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { dbManager } from '@/lib/data-repo/local-store/json-db-manager';
import { UserDto, UserInfo } from '@/types/auth';
import { getToken } from 'next-auth/jwt';

export async function GET(request: NextRequest) {
  try {
    const nextAuthToken = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

    if (nextAuthToken && (nextAuthToken.email || nextAuthToken.name || nextAuthToken.sub)) {
      const users = dbManager.getCollection('authUsers');
      let user: UserDto | undefined | null;

      // Prefer matching by 'id' (which is 'sub' in NextAuth token)
      if (nextAuthToken.sub) user = dbManager.getItemById('authUsers', nextAuthToken.sub as string); // getItemById will use 'id'
      if (!user && nextAuthToken.email) user = users.find(u => u.email === nextAuthToken.email);
      if (!user && nextAuthToken.name) user = users.find(u => u.username === nextAuthToken.name);

      if (user && user.is_enabled) {
        const userInfo: UserInfo = {
          id: user.id, // Use 'id' from UserDto
          username: user.username,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          email_verified: user.email_verified,
          phone_number: user.phone_number,
          phone_number_verified: user.phone_number_verified,
        };
        return NextResponse.json(userInfo, { status: 200 });
      }
    }

    return NextResponse.json({ message: "Unauthorized: No active user session found in mock." }, { status: 401 });

  } catch (error: any) {
    console.error("[MOCK API /auth/user ERROR]:", error);
    return NextResponse.json({ message: error.message || "Failed to get current user." }, { status: 500 });
  }
}