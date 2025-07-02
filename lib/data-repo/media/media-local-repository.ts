import { IMediaRepository } from "./media-repository-interface";
import { UploadMediaResponse, MediaDto, ServiceType, MediaType } from "@/types/media";

const APP_URL = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';
const MOCK_API_MEDIA_BASE = `${APP_URL}/api/mock/media`;

export class MediaLocalRepository implements IMediaRepository {
  private async fetchMockApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    // Since multipart/form-data is complex for a simple mock fetch,
    // we'll use JSON for the mock but the interface remains the same.
    const response = await fetch(`${MOCK_API_MEDIA_BASE}${endpoint}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...options.headers },
    });
    const responseContentType = response.headers.get("content-type");
    let responseData;
    if (responseContentType && responseContentType.includes("application/json")) {
      responseData = await response.json();
    } else if (response.status !== 204) {
      responseData = { message: await response.text() || response.statusText };
    }
    if (!response.ok) {
      const errorPayload = responseData || { message: `Request to ${endpoint} failed` };
      throw { status: response.status, message: errorPayload.message, data: errorPayload };
    }
    return responseData as T;
  }

  async uploadFile(
    service: ServiceType,
    type: MediaType,
    path: string,
    resourceId: string | null,
    file: File,
    isPrimary?: boolean,
    description?: string
  ): Promise<UploadMediaResponse> {
    console.warn("Mock Upload: Not actually uploading file, returning dummy response.");

    // In a mock, we can't really upload, so we just pass metadata to a mock endpoint.
    const mockUploadPayload = {
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      isPrimary,
      description,
    };
    const endpoint = resourceId
      ? `/${service}/${type}/${path}/${resourceId}`
      : `/${service}/${type}/${path}`;

    return this.fetchMockApi<UploadMediaResponse>(endpoint, {
      method: "POST", // The mock route will handle this as a POST
      body: JSON.stringify(mockUploadPayload)
    });
  }

  async deleteFile(
    service: ServiceType,
    type: MediaType,
    path: string,
    filename: string
  ): Promise<boolean> {
    const endpoint = `/${service}/${type}/${path}/${filename}`;
    return this.fetchMockApi<boolean>(endpoint, { method: "DELETE" });
  }

  async getMediaForResource(
    service: ServiceType,
    type: MediaType,
    path: string,
    resourceId: string
  ): Promise<MediaDto[]> {
    const endpoint = `/${service}/${type}/${path}/${resourceId}`;
    return this.fetchMockApi<MediaDto[]>(endpoint, { method: "GET" });
  }
}