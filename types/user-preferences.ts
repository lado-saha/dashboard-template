// types/user-preferences.ts

export interface UserNotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
  accountActivity: boolean;
  newFeatures: boolean;
  marketing: boolean;
  frequency: string;
  quietHoursStart?: string;
  quietHoursEnd?: string;
}

export interface UserPrivacyPreferences {
  analyticsSharing: boolean;
  personalizedAds: boolean;
  visibility:string;
  dataRetention: string;
}

export interface UserDisplayPreferences {
  language: string;
  currency: string;
  dateFormat: string;
  fontSize: number;
  theme: string;
  layout: string;
  timezone?: string;
  profilePhotoUrl?: string; // NEW: For user uploaded photo
}

export interface UserPreferencesDto {
  user_id: string;
  display: UserDisplayPreferences;
  notifications: UserNotificationPreferences;
  privacy: UserPrivacyPreferences;
  updated_at?: string;
}

export interface UpdateUserPreferencesRequest {
  display?: Partial<UserDisplayPreferences>;
  notifications?: Partial<UserNotificationPreferences>;
  privacy?: Partial<UserPrivacyPreferences>;
}