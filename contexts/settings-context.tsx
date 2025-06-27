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
  // Omit profilePhotoUrl as avatar will be the accessor
  userId?: string;
  username?: string;
  fullName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar: string; // This will now map to display.profilePhotoUrl or a default
  emailVerified?: boolean;
  phoneVerified?: boolean;
  notifications: UserNotificationPreferences;
  privacy: UserPrivacyPreferences;
}

const defaultDisplayPrefs: UserDisplayPreferences = {
  language: "en",
  currency: "usd",
  dateFormat: "mm-dd-yyyy",
  fontSize: 16,
  theme: "system",
  layout: "default",
  timezone: "utc-8",
  profilePhotoUrl: "", // Default profile photo
};

const defaultCombinedSettings: CombinedUserSettings = {
  userId: undefined,
  username: "Guest",
  fullName: "Guest User",
  firstName: "Guest",
  lastName: "User",
  email: "",
  phone: "",
  avatar: defaultDisplayPrefs.profilePhotoUrl!, // Sourced from defaultDisplayPrefs
  emailVerified: false,
  phoneVerified: false,
  ...defaultDisplayPrefs, // Spread default display preferences
  notifications: {
    email: true,
    push: true,
    sms: false,
    accountActivity: true,
    newFeatures: true,
    marketing: false,
    frequency: "daily",
    quietHoursStart: "22:00",
    quietHoursEnd: "07:00",
  },
  privacy: {
    analyticsSharing: true,
    personalizedAds: false,
    visibility: "private",
    dataRetention: "1-year",
  },
};

interface SettingsContextType {
  settings: CombinedUserSettings;
  isLoadingSettings: boolean;
  fetchAndSetInitialSettings: () => Promise<void>;
  updateUserProfile: (
    profileData: Partial<
      Pick<UserDto, "first_name" | "last_name" | "phone_number">
    >
  ) => Promise<void>; // Avatar removed from here
  updateDisplayPreferences: (
    prefs: Partial<UserDisplayPreferences>
  ) => Promise<void>;
  updateNotificationPreferences: (
    prefs: Partial<UserNotificationPreferences>
  ) => Promise<void>;
  updatePrivacyPreferences: (
    prefs: Partial<UserPrivacyPreferences>
  ) => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined
);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const { data: session, status: sessionStatus } = useSession();
  const [settings, setSettings] = useState<CombinedUserSettings>(
    defaultCombinedSettings
  );
  const [isLoadingSettings, setIsLoadingSettings] = useState<boolean>(true);
  const [currentUserProfile, setCurrentUserProfile] = useState<
    UserInfo | UserDto | null
  >(null);

  const fetchAndSetInitialSettings = useCallback(async () => {
    if (sessionStatus === "authenticated" && session?.user?.id) {
      setIsLoadingSettings(true);
      try {
        const userFromSession = session.user;
        if (!userFromSession.id) throw new Error("User ID missing in session.");

        const profileData: UserInfo = {
          id: userFromSession.id,
          username: userFromSession.username,
          first_name: userFromSession.first_name,
          last_name: userFromSession.last_name,
          email: userFromSession.email || undefined,
          phone_number: userFromSession.phone_number,
          email_verified: userFromSession.email_verified,
          phone_number_verified: userFromSession.phone_number_verified,
        };
        setCurrentUserProfile(profileData);

        let prefsDto = await userPreferencesRepository.getUserPreferences(
          userFromSession.id
        );
        if (!prefsDto) {
          const defaultPrefsPayload: UpdateUserPreferencesRequest = {
            display: defaultDisplayPrefs,
            notifications: defaultCombinedSettings.notifications,
            privacy: defaultCombinedSettings.privacy,
          };
          prefsDto = await userPreferencesRepository.updateUserPreferences(
            userFromSession.id,
            defaultPrefsPayload
          );
        }

        setSettings({
          userId: profileData.id,
          username: profileData.username || "",
          fullName:
            userFromSession.name ||
            `${profileData.first_name || ""} ${
              profileData.last_name || ""
            }`.trim() ||
            "User",
          firstName: profileData.first_name || "",
          lastName: profileData.last_name || "",
          email: profileData.email || "",
          phone: profileData.phone_number || "",
          avatar:
            prefsDto.display.profilePhotoUrl ||
            userFromSession.image ||
            defaultDisplayPrefs.profilePhotoUrl!,
          emailVerified: profileData.email_verified,
          phoneVerified: profileData.phone_number_verified,
          ...prefsDto.display,
          notifications: prefsDto.notifications,
          privacy: prefsDto.privacy,
        });
      } catch (error: any) {
        console.error("Failed to fetch initial settings:", error);
        toast.error("Could not load your settings.");
        setSettings((prev) => ({
          ...defaultCombinedSettings,
          userId: session?.user?.id,
          email: session?.user?.email || "",
          fullName: session?.user?.name || "User",
          avatar: session?.user?.image || defaultCombinedSettings.avatar,
        }));
      } finally {
        setIsLoadingSettings(false);
      }
    } else if (sessionStatus === "unauthenticated") {
      setSettings(defaultCombinedSettings);
      setCurrentUserProfile(null);
      setIsLoadingSettings(false);
    }
  }, [session, sessionStatus]);

  useEffect(() => {
    fetchAndSetInitialSettings();
  }, [fetchAndSetInitialSettings]);

  const updateUserProfile = async (
    profileData: Partial<
      Pick<UserDto, "first_name" | "last_name" | "phone_number">
    >
  ) => {
    if (!currentUserProfile || !currentUserProfile.id) {
      toast.error("User not loaded.");
      return;
    }
    setIsLoadingSettings(true);
    try {
      console.log(
        "Simulating profile update (no avatar change here):",
        profileData
      );
      await new Promise((r) => setTimeout(r, 500));
      const updatedProfile = {
        ...currentUserProfile,
        ...profileData,
        updated_at: new Date().toISOString(),
      } as UserDto;
      setCurrentUserProfile(updatedProfile);
      setSettings((prev) => ({
        ...prev,
        firstName: updatedProfile.first_name || prev.firstName,
        lastName: updatedProfile.last_name || prev.lastName,
        fullName:
          `${updatedProfile.first_name || ""} ${
            updatedProfile.last_name || ""
          }`.trim() || prev.fullName,
        phone: updatedProfile.phone_number || prev.phone,
      }));
      toast.success("Profile updated successfully!");
    } catch (error: any)  {
      toast.error(error.message || "Failed to update profile.");
    } finally {
      setIsLoadingSettings(false);
    }
  };

  const updatePreferencesSegment = async <
    K extends keyof UpdateUserPreferencesRequest
  >(
    segmentName: K,
    prefsDataToUpdate: UpdateUserPreferencesRequest[K]
  ) => {
    if (!session?.user?.id) {
      toast.error("User not loaded.");
      return;
    }
    setIsLoadingSettings(true);
    const updatePayload: UpdateUserPreferencesRequest = {
      [segmentName]: prefsDataToUpdate,
    };
    try {
      const updatedFullPrefsDto =
        await userPreferencesRepository.updateUserPreferences(
          session.user.id,
          updatePayload
        );
      setSettings((prev) => {
        const newSegmentData = updatedFullPrefsDto[segmentName];
        let newAvatar = prev.avatar;
        if (
          segmentName === "display" &&
          (newSegmentData as UserDisplayPreferences)?.profilePhotoUrl !==
            undefined
        ) {
          newAvatar =
            (newSegmentData as UserDisplayPreferences).profilePhotoUrl ||
            defaultDisplayPrefs.profilePhotoUrl!;
        }
        return {
          ...prev,
          avatar: newAvatar, // Update avatar if display prefs changed it
          ...(segmentName === "display" &&
            newSegmentData && {
              ...(newSegmentData as UserDisplayPreferences),
            }),
          ...(segmentName === "notifications" &&
            newSegmentData && {
              notifications: newSegmentData as UserNotificationPreferences,
            }),
          ...(segmentName === "privacy" &&
            newSegmentData && {
              privacy: newSegmentData as UserPrivacyPreferences,
            }),
        };
      });
      toast.success(
        `${
          String(segmentName).charAt(0).toUpperCase() +
          String(segmentName).slice(1)
        } preferences updated!`
      );
    } catch (error: any)  {
      toast.error(
        error.message || `Failed to update ${String(segmentName)} preferences.`
      );
    } finally {
      setIsLoadingSettings(false);
    }
  };

  const updateDisplayPreferences = (prefs: Partial<UserDisplayPreferences>) =>
    updatePreferencesSegment("display", prefs);
  const updateNotificationPreferences = (
    prefs: Partial<UserNotificationPreferences>
  ) => updatePreferencesSegment("notifications", prefs);
  const updatePrivacyPreferences = (prefs: Partial<UserPrivacyPreferences>) =>
    updatePreferencesSegment("privacy", prefs);

  return (
    <SettingsContext.Provider
      value={{
        settings,
        isLoadingSettings,
        fetchAndSetInitialSettings,
        updateUserProfile,
        updateDisplayPreferences,
        updateNotificationPreferences,
        updatePrivacyPreferences,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined)
    throw new Error("useSettings must be used within a SettingsProvider");
  return context;
}
