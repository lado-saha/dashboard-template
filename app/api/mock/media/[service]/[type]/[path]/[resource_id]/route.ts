// For POST (upload metadata) and GET (get metadata list)
import { NextResponse, NextRequest } from 'next/server';
import { dbManager } from '@/lib/data-repo/local-store/json-db-manager';
import { MediaDto, UploadMediaResponse, ServiceType, MediaType } from '@/types/media';

interface RouteParams {
    params: { service: ServiceType; type: MediaType; path: string; resource_id: string; }
}

// GET /media/infos/{service}/{type}/{path}/{resource_id}
export async function GET(_req: NextRequest, { params }: RouteParams) {
    const allMedia = dbManager.getCollection('media');
    const resourceMedia = allMedia.filter(m => 
        m.resource_id === params.resource_id &&
        m.service === params.service &&
        m.type === params.type &&
        m.location?.startsWith(params.path)
    );
    return NextResponse.json(resourceMedia);
}

// POST /media/{service}/{type}/{path}/{resource_id}
export async function POST(req: NextRequest, { params }: RouteParams) {
    const { resource_id, service, type, path } = params;
    // In mock, we get metadata, not the actual file blob
    const body = await req.json(); 

    const newMedia: Omit<MediaDto, 'id' | 'created_at' | 'updated_at'> = {
        name: body.fileName,
        real_name: `mock_${Date.now()}_${body.fileName}`,
        size: body.fileSize,
        mime: body.fileType,
        extension: body.fileName.split('.').pop() || '',
        is_primary: body.isPrimary || false,
        description: body.description,
        location: `${path}/${`mock_${Date.now()}_${body.fileName}`}`,
        resource_id,
        service,
        type,
    };

    const createdMedia = dbManager.addItem('media', newMedia);
    
    const response: UploadMediaResponse = {
        id: createdMedia.id,
        resourceId: createdMedia.resource_id,
        // The mock URL points to a placeholder
        url: `https://picsum.photos/seed/${createdMedia.id}/400/300`, 
        uri: `/media/${createdMedia.service}/${createdMedia.type}${createdMedia.location}`,
    };

    return NextResponse.json(response, { status: 200 });
}