import { IUserPreferencesRepository } from './user-preferences-repository-interface';
import { UserPreferencesDto, UpdateUserPreferencesRequest } from '@/types/user-preferences';
import { toast } from 'sonner';

const APP_URL = typeof window !== 'undefined' ? window.location.origin : (process.env.NEXTAUTH_URL || process.env.VERCEL_URL || 'http://localhost:3000');
const MOCK_API_PREFERENCES_BASE = `${APP_URL}/api/mock/user-preferences`;

export class UserPreferencesLocalRepository implements IUserPreferencesRepository {
  private async fetchMockApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${MOCK_API_PREFERENCES_BASE}${endpoint}`, {
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
      console.error(`[UserPrefsLocalRepo] Mock API Error: ${response.status}`, errorPayload);
      toast.error(errorPayload.message || `Mock API request failed: ${response.status}`);
      throw { status: response.status, message: errorPayload.message, data: errorPayload };
    }
    return responseData as T;
  }

  async getUserPreferences(userId: string): Promise<UserPreferencesDto | null> {
    return this.fetchMockApi<UserPreferencesDto | null>(`/${userId}`, { method: "GET" });
  }

  async updateUserPreferences(userId: string, data: UpdateUserPreferencesRequest): Promise<UserPreferencesDto> {
    return this.fetchMockApi<UserPreferencesDto>(`/${userId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }
}