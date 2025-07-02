// types/user-preferences.ts

export interface UserNotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
  accountActivity: boolean;
  newFeatures: boolean;
  marketing: boolean;
  frequency: "real-time" | "daily" | "weekly" | "never";
  quietHoursStart?: string;
  quietHoursEnd?: string;
}

export interface UserPrivacyPreferences {
  analyticsSharing: boolean;
  personalizedAds: boolean;
  visibility: "public" | "private" | "friends-only";
  dataRetention: "6-months" | "1-year" | "2-years" | "indefinite";
}

export interface UserDisplayPreferences {
  language: string;
  currency: string;
  dateFormat: "mm-dd-yyyy" | "dd-mm-yyyy" | "yyyy-mm-dd";
  fontSize: number;
  theme: "light" | "dark" | "system";
  layout: "default" | "compact" | "expanded";
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