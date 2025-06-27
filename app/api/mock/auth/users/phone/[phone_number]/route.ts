// app/api/mock/auth/users/phone/[phone_number]/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { dbManager } from '@/lib/data-repo/local-store/json-db-manager';
import { UserDto } from '@/types/auth';

export async function GET(_request: NextRequest, { params }: { params: { phone_number: string } }) {
  try {
    const phoneNumber = params.phone_number;
    const users = dbManager.getCollection('authUsers');
    const user = users.find(u => u.phone_number === phoneNumber);
    if (!user) {
      return NextResponse.json({ message: `User with phone number ${phoneNumber} not found.` }, { status: 404 });
    }
    const { password_hash, ...userWithoutPassword } = user;
    return NextResponse.json(userWithoutPassword, { status: 200 });
  } catch (error: any)  {
    return NextResponse.json({ message: error.message || "Failed to get user by phone number." }, { status: 500 });
  }
}