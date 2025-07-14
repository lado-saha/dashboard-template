import { NextResponse, NextRequest } from 'next/server';
import { dbManager } from '@/lib/data-repo/local-store/json-db-manager';
import { UserDto } from '@/types/auth';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ username: string }> }) {
  try {
    const username = (await params).username;
    const users = dbManager.getCollection('authUsers');
    const user = users.find(u => u.username === username);
    if (!user) {
      return NextResponse.json({ message: `User with username ${username} not found.` }, { status: 404 });
    }
    const { password_hash, ...userWithoutPassword } = user;
    return NextResponse.json(userWithoutPassword, { status: 200 });
  } catch (error)  {
    return NextResponse.json({ message: error.message || "Failed to get user by username." }, { status: 500 });
  }
}