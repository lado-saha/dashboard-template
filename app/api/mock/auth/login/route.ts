// app/api/mock/auth/login/route.ts
import { NextResponse } from 'next/server';
import { dbManager } from '@/lib/data-repo/local-store/json-db-manager';
import { AuthRequest, LoginResponse, UserDto, UserInfo } from '@/types/auth';
import bcrypt from 'bcryptjs';

export async function POST(_request: Request) {
  try {
    const body = await _request.json() as AuthRequest;

    if (!body.username || !body.password) {
      return NextResponse.json({ message: "Username and password are required." }, { status: 400 });
    }

    const users = dbManager.getCollection('authUsers');
    const user = users.find(u => u.username === body.username || u.email === body.username);

    if (!user || !user.password_hash || !user.is_enabled) {
      return NextResponse.json({ message: "Invalid username or password, or account disabled." }, { status: 401 });
    }

    const passwordIsValid = await bcrypt.compare(body.password, user.password_hash);

    if (!passwordIsValid) {
      return NextResponse.json({ message: "Invalid username or password." }, { status: 401 });
    }

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

    const loginResponse: LoginResponse = {
      access_token: { token: `local-mock-jwt-for-${user.username}-${Date.now()}`, type: "Bearer", expire_in: 3600000 },
      user: userInfo,
      roles: user.username === "admin" || user.username === "superadmin" ? ["SUPER_ADMIN_ROLE", "BUSINESS_ACTOR_ROLE"] : ["BUSINESS_ACTOR_ROLE", "GENERAL_USER_ROLE"],
      permissions: user.username === "admin" || user.username === "superadmin" ? ["*:*:*"] : ["org:read", "org:create"],
    };

    return NextResponse.json(loginResponse, { status: 200 });

  } catch (error: any)  {
    console.error("[MOCK API /auth/login ERROR]:", error);
    return NextResponse.json({ message: error.message || "Failed to login user." }, { status: 500 });
  }
}