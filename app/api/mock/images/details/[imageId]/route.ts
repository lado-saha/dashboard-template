// app/api/mock/images/details/[imageId]/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { dbManager } from '@/lib/data-repo/local-store/json-db-manager';
import { ImageDto } from '@/types/organization';

export async function GET(_request: NextRequest, { params }: { params: { imageId: string } }) {
  try {
    const { imageId } = await params;
    const imageInfo = dbManager.getItemById('organizationImages', imageId); // Assumes 'id' is the key
    if (!imageInfo) {
      return NextResponse.json({ message: `Image with ID ${imageId} not found.` }, { status: 404 });
    }
    return NextResponse.json(imageInfo);
  } catch (error)  {
    return NextResponse.json({ message: "Failed to get image info", error: error.message }, { status: 500 });
  }
}