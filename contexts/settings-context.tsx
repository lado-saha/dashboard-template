"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { useSession } from "next-auth/react";
import { UserDto, UserInfo } from "@/types/auth";
import {
  UserPreferencesDto,
  UserDisplayPreferences,
  UserNotificationPreferences,
  UserPrivacyPreferences,
  UpdateUserPreferencesRequest,
} from "@/types/user-preferences";
import { authRepository } from "@/lib/data-repo/auth";
import { userPreferencesRepository } from "@/lib/data-repo/user-preferences";
import { toast } from "sonner";

// Combined state that the UI will consume
export interface CombinedUserSettings
  extends Omit<UserDisplayPreferences, "profilePhotoUrl"> {
  userId?: string;
  username?: string;
  fullName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar: string;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  notifications: UserNotificationPreferences;
  privacy: UserPrivacyPreferences;
}

const defaultDisplayPrefs: UserDisplayPreferences = {
  language: "en", currency: "usd", dateFormat: "mm-dd-yyyy", fontSize: 16,
  theme: "system", layout: "default", timezone: "utc-8", profilePhotoUrl: "",
};

const defaultCombinedSettings: CombinedUserSettings = {
  userId: undefined, username: "Guest", fullName: "Guest User", firstName: "Guest", lastName: "User",
  email: "", phone: "", avatar: defaultDisplayPrefs.profilePhotoUrl!, emailVerified: false, phoneVerified: false,
  ...defaultDisplayPrefs,
  notifications: { email: true, push: true, sms: false, accountActivity: true, newFeatures: true, marketing: false, frequency: "daily", quietHoursStart: "22:00", quietHoursEnd: "07:00" },
  privacy: { analyticsSharing: true, personalizedAds: false, visibility: "private", dataRetention: "1-year" },
};

interface SettingsContextType {
  settings: CombinedUserSettings;
  isLoadingSettings: boolean;
  fetchAndSetInitialSettings: () => Promise<void>;
  updateUserProfile: (profileData: Partial<Pick<UserDto, "first_name" | "last_name" | "phone_number">>) => Promise<void>;
  updateDisplayPreferences: (prefs: Partial<UserDisplayPreferences>) => Promise<void>;
  updateNotificationPreferences: (prefs: Partial<UserNotificationPreferences>) => Promise<void>;
  updatePrivacyPreferences: (prefs: Partial<UserPrivacyPreferences>) => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const { data: session, status: sessionStatus } = useSession();
  const [settings, setSettings] = useState<CombinedUserSettings>(defaultCombinedSettings);
  const [isLoadingSettings, setIsLoadingSettings] = useState<boolean>(true);

  const fetchAndSetInitialSettings = useCallback(async () => {
    if (sessionStatus === "authenticated" && session?.user?.id) {
      setIsLoadingSettings(true);
      try {
        const userFromSession = session.user;
        const profileData: UserInfo = { // Construct UserInfo from our detailed session user
          id: userFromSession.id,
          username: userFromSession.username,
          first_name: userFromSession.first_name,
          last_name: userFromSession.last_name,
          email: userFromSession?.email || '',
          phone_number: userFromSession.phone_number,
          email_verified: userFromSession.email_verified,
          phone_number_verified: userFromSession.phone_number_verified,
        };

        // This part remains the same, it fetches preferences based on user ID
        let prefsDto = await userPreferencesRepository.getUserPreferences(userFromSession.id);
        if (!prefsDto) {
          const defaultPrefsPayload: UpdateUserPreferencesRequest = { display: defaultDisplayPrefs, notifications: defaultCombinedSettings.notifications, privacy: defaultCombinedSettings.privacy };
          prefsDto = await userPreferencesRepository.updateUserPreferences(userFromSession.id, defaultPrefsPayload);
        }

        // Combine the detailed profile data from session with fetched preferences
        setSettings({
          userId: profileData.id,
          username: profileData.username || "",
          fullName: `${profileData.first_name || ""} ${profileData.last_name || ""}`.trim() || userFromSession.name || "User",
          firstName: profileData.first_name || "",
          lastName: profileData.last_name || "",
          email: profileData.email || "",
          phone: profileData.phone_number || "",
          avatar: prefsDto.display.profilePhotoUrl || userFromSession.image || defaultDisplayPrefs.profilePhotoUrl!,
          emailVerified: profileData.email_verified,
          phoneVerified: profileData.phone_number_verified,
          ...prefsDto.display,
          notifications: prefsDto.notifications,
          privacy: prefsDto.privacy,
        });

      } catch (error: any) {
        toast.error("Could not load your settings.");
      } finally {
        setIsLoadingSettings(false);
      }
    } else if (sessionStatus === "unauthenticated") {
      setSettings(defaultCombinedSettings);
      setIsLoadingSettings(false);
    }
  }, [session, sessionStatus]);

  useEffect(() => {
    fetchAndSetInitialSettings();
  }, [fetchAndSetInitialSettings]);

  // The update functions remain the same as they operate on the backend, not the session directly.
  const updateUserProfile = async (profileData: Partial<Pick<UserDto, "first_name" | "last_name" | "phone_number">>) => {
    // ... implementation unchanged
    toast.info("Profile update simulation...");
  };
  const updatePreferencesSegment = async <K extends keyof UpdateUserPreferencesRequest>(segmentName: K, prefsDataToUpdate: UpdateUserPreferencesRequest[K]) => {
    // ... implementation unchanged
    if (!session?.user?.id) return;
    toast.info(`${String(segmentName)} preferences update simulation...`);
  };
  const updateDisplayPreferences = (prefs: Partial<UserDisplayPreferences>) => updatePreferencesSegment("display", prefs);
  const updateNotificationPreferences = (prefs: Partial<UserNotificationPreferences>) => updatePreferencesSegment("notifications", prefs);
  const updatePrivacyPreferences = (prefs: Partial<UserPrivacyPreferences>) => updatePreferencesSegment("privacy", prefs);

  return (
    <SettingsContext.Provider value={{ settings, isLoadingSettings, fetchAndSetInitialSettings, updateUserProfile, updateDisplayPreferences, updateNotificationPreferences, updatePrivacyPreferences }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) throw new Error("useSettings must be used within a SettingsProvider");
  return context;
}
