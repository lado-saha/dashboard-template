import { NextResponse, NextRequest } from 'next/server';
import { dbManager } from '@/lib/data-repo/local-store/json-db-manager';
import { UserDto } from '@/types/auth';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ email: string }> }) {
  try {
    const email = (await params).email; // Next.js decodes URL automatically
    const users = dbManager.getCollection('authUsers');
    const user = users.find(u => u.email === email);
    if (!user) {
      return NextResponse.json({ message: `User with email ${email} not found.` }, { status: 404 });
    }
    const { password_hash, ...userWithoutPassword } = user;
    return NextResponse.json(userWithoutPassword, { status: 200 });
  } catch (error)  {
    return NextResponse.json({ message: error.message || "Failed to get user by email." }, { status: 500 });
  }
}