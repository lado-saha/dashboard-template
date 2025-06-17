// app/api/mock/applications/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { dbManager } from '@/lib/data-repo/local-store/json-db-manager';
import { ApplicationDto, CreateApplicationRequest } from '@/types/organization';

export async function GET(request: NextRequest) {
  try {
    const apps = dbManager.getCollection('applicationsData');
    return NextResponse.json(apps);
  } catch (e: any) { return NextResponse.json({ message: e.message || "Error" }, { status: 500 }); }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as CreateApplicationRequest;
    if (!body.name) return NextResponse.json({ message: "App name required" }, { status: 400 });
    const newApp = dbManager.addItem('applicationsData', body);
    return NextResponse.json(newApp, { status: 200 }); // Spec says 200 OK
  } catch (e: any) { return NextResponse.json({ message: e.message || "Error" }, { status: 500 }); }
}