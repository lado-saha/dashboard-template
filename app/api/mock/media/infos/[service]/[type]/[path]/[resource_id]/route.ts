// For GET (get metadata list for a resource)
import { NextResponse, NextRequest } from 'next/server';
import { dbManager } from '@/lib/data-repo/local-store/json-db-manager';
import { ServiceType, MediaType } from '@/types/media';

interface RouteParams {
    params: Promise<{ service: ServiceType; type: MediaType; path: string; resource_id: string; }>
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
    try {
        const allMedia = dbManager.getCollection('media');
        const resourceMedia = allMedia.filter(async m =>
            m.resource_id === (await params).resource_id &&
            m.service === (await params).service &&
            m.type === (await params).type
        );
        return NextResponse.json(resourceMedia);
    } catch (error) {
        return NextResponse.json({ message: "Failed to get media info", error: error.message }, { status: 500 });
    }
}