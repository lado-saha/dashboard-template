// app/api/mock/auth/register/route.ts
import { NextResponse } from 'next/server';
import { dbManager } from '@/lib/data-repo/local-store/json-db-manager';
import { CreateUserRequest, UserDto } from '@/types/auth';
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

export async function POST(request: Request) {
  try {
    const body = await request.json() as CreateUserRequest;

    if (!body.username || !body.password || !body.first_name) {
      return NextResponse.json({ message: "Username, password, and first name are required." }, { status: 400 });
    }
    if (body.password.length < 6) {
      return NextResponse.json({ message: "Password must be at least 6 characters." }, { status: 400 });
    }

    const users = dbManager.getCollection('authUsers');

    if (users.find(u => u.username === body.username)) {
      return NextResponse.json({ message: "Username already exists." }, { status: 409 });
    }
    if (body.email && users.find(u => u.email === body.email)) {
      return NextResponse.json({ message: "Email already exists." }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(body.password, SALT_ROUNDS);

    // The dbManager.addItem will generate the 'id' field
    const newUserPartial: Omit<UserDto, 'id' | 'created_at' | 'updated_at'> = {
      username: body.username,
      email: body.email,
      password_hash: hashedPassword,
      first_name: body.first_name,
      last_name: body.last_name,
      phone_number: body.phone_number,
      is_enabled: true,
      email_verified: true,
      phone_number_verified: !!body.phone_number,
    };

    const createdUser = dbManager.addItem('authUsers', newUserPartial);

    // Return UserDto fields, excluding password_hash
    const { password_hash, ...userDtoFields } = createdUser;

    return NextResponse.json(userDtoFields, { status: 201 });

  } catch (error: any) {
    console.error("[MOCK API /auth/register ERROR]:", error);
    return NextResponse.json({ message: error.message || "Failed to register user." }, { status: 500 });
  }
}