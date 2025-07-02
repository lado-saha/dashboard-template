import { UploadMediaResponse, MediaDto, ServiceType, MediaType } from "@/types/media";

export interface IMediaRepository {
  uploadFile(
    service: ServiceType,
    type: MediaType,
    path: string,
    resourceId: string | null,
    file: File,
    isPrimary?: boolean,
    description?: string
  ): Promise<UploadMediaResponse>;

  deleteFile(
    service: ServiceType,
    type: MediaType,
    path: string,
    filename: string
  ): Promise<boolean>;

  getMediaForResource(
    service: ServiceType,
    type: MediaType,
    path: string,
    resourceId: string
  ): Promise<MediaDto[]>;
}