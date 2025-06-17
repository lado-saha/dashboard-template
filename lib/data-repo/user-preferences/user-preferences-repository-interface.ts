// lib/data-repo/user-preferences/user-preferences-repository-interface.ts
import { UserPreferencesDto, UpdateUserPreferencesRequest } from '@/types/user-preferences';

export interface IUserPreferencesRepository {
  getUserPreferences(userId: string): Promise<UserPreferencesDto | null>;
  updateUserPreferences(userId: string, data: UpdateUserPreferencesRequest): Promise<UserPreferencesDto>;
  // No create, as preferences are typically created with user or on first update
  // No delete, as preferences are tied to a user
}