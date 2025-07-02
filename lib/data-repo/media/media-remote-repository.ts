import { IMediaRepository } from "./media-repository-interface";
import { yowyobMediaApi } from "@/lib/apiClient";
import { UploadMediaResponse, MediaDto, ServiceType, MediaType } from "@/types/media";

export class MediaRemoteRepository implements IMediaRepository {
  async uploadFile(
    service: ServiceType,
    type: MediaType,
    path: string,
    resourceId: string | null,
    file: File,
    isPrimary?: boolean,
    description?: string
  ): Promise<UploadMediaResponse> {
    const uploadRequest = {
      ...(isPrimary !== undefined && { is_primary: isPrimary }),
      ...(description && { description }),
    };
    return yowyobMediaApi.uploadFile(service, type, path, resourceId, file, uploadRequest);
  }

  async deleteFile(
    service: ServiceType,
    type: MediaType,
    path: string,
    filename: string
  ): Promise<boolean> {
    return yowyobMediaApi.deleteFile(service, type, path, filename);
  }

  async getMediaForResource(
    service: ServiceType,
    type: MediaType,
    path: string,
    resourceId: string
  ): Promise<MediaDto[]> {
    const media = await yowyobMediaApi.getMediaForResource(service, type, path, resourceId);
    return media || []; // Ensure it returns an array even if the API returns null
  }
}