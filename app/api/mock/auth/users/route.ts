// app/api/mock/auth/users/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { dbManager } from '@/lib/data-repo/local-store/json-db-manager';
import { UserDto } from '@/types/auth';

export async function GET(_request: NextRequest) {
  try {
    const allUsers = dbManager.getCollection('authUsers');
    // Corrected mapping to exclude password hash
    const users = allUsers.map(user => {
      const { password_hash, ...userWithoutPassword } = user; // Exclude password hash
      return userWithoutPassword;
    });
    return NextResponse.json(users, { status: 200 });
  } catch (error: any)  {
    return NextResponse.json({ message: error.message || "Failed to get users." }, { status: 500 });
  }
}