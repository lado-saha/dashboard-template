// For DELETE
import { NextResponse, NextRequest } from 'next/server';
import { dbManager } from '@/lib/data-repo/local-store/json-db-manager';
import { MediaDto, ServiceType, MediaType } from '@/types/media';

interface RouteParams {
    params: { service: ServiceType; type: MediaType; path: string; filename: string; }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
    const allMedia = dbManager.getCollection('media');
    const locationToDelete = `${params.path}/${params.filename}`;

    const initialLength = allMedia.length;
    const filteredMedia = allMedia.filter(m => m.location !== locationToDelete);

    if (filteredMedia.length < initialLength) {
        dbManager.saveCollection('media', filteredMedia);
        return NextResponse.json(true, { status: 200 });
    } else {
        return NextResponse.json({ message: "File not found" }, { status: 404 });
    }
}