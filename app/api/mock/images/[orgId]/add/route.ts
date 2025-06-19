// app/api/mock/images/[orgId]/add/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { dbManager } from '@/lib/data-repo/local-store/json-db-manager';
import { ImageDto } from '@/types/organization';

export async function PUT(request: NextRequest, { params }: { params: { orgId: string } }) {
  try {
    const { orgId } = await params;
    // Actual FormData parsing is complex in Next.js Edge/Node runtime for API routes.
    // This mock will just assume success and return some dummy ImageDto objects.
    // In a real scenario, you'd parse formData, save files, and generate URLs.
    console.warn("Mock image upload for org:", orgId, "- returning dummy data.");

    const dummyImages: ImageDto[] = [
      { id: `img-mock-${Date.now()}-1`, name: "uploaded_image1.jpg", size: 102400, fileType: "image/jpeg" },
      { id: `img-mock-${Date.now()}-2`, name: "another_one.png", size: 204800, fileType: "image/png" },
    ];
    // You might want to associate these with the orgId in your organizationImages.json
    const orgImages = dbManager.getCollection('organizationImages');
    dummyImages.forEach(img => orgImages.push({ ...img, organization_id: orgId } as any)); // Add org_id if your ImageDto has it
    dbManager.saveCollection('organizationImages', orgImages);

    return NextResponse.json(dummyImages, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Failed to upload images." }, { status: 500 });
  }
}