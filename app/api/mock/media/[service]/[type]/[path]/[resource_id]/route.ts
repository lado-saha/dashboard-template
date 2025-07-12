import { NextResponse, NextRequest } from 'next/server';
import { dbManager } from '@/lib/data-repo/local-store/json-db-manager';
import { MediaDto, UploadMediaResponse, ServiceType, MediaType } from '@/types/media';

interface RouteParams {
    params: { 
        service: ServiceType; 
        type: MediaType; 
        path: string; 
        resource_id: string; // This segment can be a resource_id for GET/POST or a filename for DELETE
    }
}

// GET /media/infos/{service}/{type}/{path}/{resource_id}
export async function GET(req: NextRequest, { params }: RouteParams) {
    const { resource_id, service, type, path } = params;
    try {
        const allMedia = dbManager.getCollection('media');
        const resourceMedia = allMedia.filter(m => 
            m.resource_id === resource_id &&
            m.service === service &&
            m.type === type &&
            m.location?.startsWith(path)
        );
        return NextResponse.json(resourceMedia);
    } catch (error) {
        return NextResponse.json({ message: "Failed to get media info", error: error.message }, { status: 500 });
    }
}

// POST /media/{service}/{type}/{path}/{resource_id}
export async function POST(req: NextRequest, { params }: RouteParams) {
    const { resource_id, service, type, path } = params;
    try {
        const body = await req.json(); 

        const newMedia: Omit<MediaDto, 'id' | 'created_at' | 'updated_at'> = {
            name: body.fileName,
            real_name: `mock_${Date.now()}_${body.fileName}`,
            size: body.fileSize,
            mime: body.fileType,
            extension: body.fileName.split('.').pop() || '',
            is_primary: body.isPrimary || false,
            description: body.description,
            location: `${path}/mock_${Date.now()}_${body.fileName}`,
            resource_id,
            service,
            type,
        };
        const createdMedia = dbManager.addItem('media', newMedia);
        
        const response: UploadMediaResponse = {
            id: createdMedia.id,
            resourceId: createdMedia.resource_id,
            url: `https://picsum.photos/seed/${createdMedia.id}/400/300`, 
            uri: `/media/${createdMedia.service}/${createdMedia.type}${createdMedia.location}`,
        };

        return NextResponse.json(response, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: "Failed to upload media", error: error.message }, { status: 500 });
    }
}

// DELETE /media/{service}/{type}/{path}/{filename}
// The {filename} from the API spec is mapped to the {resource_id} parameter here.
export async function DELETE(req: NextRequest, { params }: RouteParams) {
    const { service, type, path, resource_id: filename } = params; // Treat param as filename
    try {
        const allMedia = dbManager.getCollection('media');
        const locationToDelete = `${path}/${filename}`;
        
        const initialLength = allMedia.length;
        const filteredMedia = allMedia.filter(m => m.location !== locationToDelete);

        if (filteredMedia.length < initialLength) {
            dbManager.saveCollection('media', filteredMedia);
            return NextResponse.json(true, { status: 200 });
        } else {
            return NextResponse.json({ message: "File not found for deletion" }, { status: 404 });
        }
    } catch (error) {
        return NextResponse.json({ message: "Failed to delete media", error: error.message }, { status: 500 });
    }
}