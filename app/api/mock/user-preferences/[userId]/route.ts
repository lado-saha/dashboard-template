// app/api/mock/user-preferences/[userId]/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { dbManager } from '@/lib/data-repo/local-store/json-db-manager';
import { UserPreferencesDto, UpdateUserPreferencesRequest, UserDisplayPreferences, UserNotificationPreferences, UserPrivacyPreferences } from '@/types/user-preferences';

const defaultDisplayPrefsForMock: UserDisplayPreferences = {
  language: 'en', currency: 'USD', dateFormat: 'mm-dd-yyyy',
  fontSize: 16, theme: 'system', layout: 'default', timezone: 'utc-8',
  profilePhotoUrl: "", // Default if not set
};
const defaultNotificationPrefsForMock: UserNotificationPreferences = {
  email: true, push: true, sms: false, accountActivity: true,
  newFeatures: true, marketing: false, frequency: 'daily',
  quietHoursStart: '22:00', quietHoursEnd: '07:00',
};
const defaultPrivacyPrefsForMock: UserPrivacyPreferences = {
  analyticsSharing: true, personalizedAds: false,
  visibility: 'private', dataRetention: '1-year',
};

function getOrCreateUserPreferences(userId: string): UserPreferencesDto {
  let prefs = dbManager.getItemById('userPreferences', userId);
  if (!prefs) {
    const defaultPreferences: UserPreferencesDto = {
      user_id: userId,
      display: { ...defaultDisplayPrefsForMock },
      notifications: { ...defaultNotificationPrefsForMock },
      privacy: { ...defaultPrivacyPrefsForMock },
      updated_at: new Date().toISOString(),
    };
    // The addItem in dbManager now uses 'user_id' as the 'id' for this collection if provided.
    // Let's ensure we are consistent. If addItem generates its own 'id', we need to query by user_id.
    // For simplicity, let's assume userPreferences items are stored with 'user_id' as their main lookup key.
    // This means getItemById and updateItem in dbManager might need adjustment for this collection.
    // OR, we store a separate 'id' and also 'user_id'. Let's stick to 'user_id' as the primary key here for this collection.

    // Modified to ensure 'user_id' is the key for this collection.
    const collection = dbManager.getCollection('userPreferences');
    const existing = collection.find(p => p.user_id === userId);
    if (existing) {
      prefs = existing;
    } else {
      const newPrefsData = {
        user_id: userId, // This is the key
        display: { ...defaultDisplayPrefsForMock },
        notifications: { ...defaultNotificationPrefsForMock },
        privacy: { ...defaultPrivacyPrefsForMock },
        updated_at: new Date().toISOString(),
      };
      collection.push(newPrefsData);
      dbManager.saveCollection('userPreferences', collection);
      prefs = newPrefsData;
    }
  }
  return prefs!;
}

export async function GET(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    const { userId } = await params;
    if (!userId) return NextResponse.json({ message: "User ID is required." }, { status: 400 });
    const preferences = getOrCreateUserPreferences(userId);
    return NextResponse.json(preferences, { status: 200 });
  } catch (error: any) {
    console.error("[MOCK API /user-preferences GET ERROR]:", error);
    return NextResponse.json({ message: error.message || "Failed to get user preferences." }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    const userId = params.userId;
    if (!userId) return NextResponse.json({ message: "User ID is required." }, { status: 400 });
    const body = await request.json() as UpdateUserPreferencesRequest;

    const collection = dbManager.getCollection('userPreferences');
    let itemIndex = collection.findIndex(p => p.user_id === userId);
    let currentPrefs: UserPreferencesDto;

    if (itemIndex > -1) {
      currentPrefs = collection[itemIndex];
    } else {
      // Create if not exists, as PUT can mean create or update
      currentPrefs = {
        user_id: userId,
        display: { ...defaultDisplayPrefsForMock },
        notifications: { ...defaultNotificationPrefsForMock },
        privacy: { ...defaultPrivacyPrefsForMock },
      };
      collection.push(currentPrefs);
      itemIndex = collection.length - 1; // It's now the last item
    }

    const updatedData: UserPreferencesDto = {
      ...currentPrefs,
      user_id: userId,
      display: { ...currentPrefs.display, ...(body.display || {}) },
      notifications: { ...currentPrefs.notifications, ...(body.notifications || {}) },
      privacy: { ...currentPrefs.privacy, ...(body.privacy || {}) },
      updated_at: new Date().toISOString(),
    };
    collection[itemIndex] = updatedData;
    dbManager.saveCollection('userPreferences', collection);

    return NextResponse.json(updatedData, { status: 200 });
  } catch (error: any) {
    console.error("[MOCK API /user-preferences PUT ERROR]:", error);
    return NextResponse.json({ message: error.message || "Failed to update user preferences." }, { status: 500 });
  }
}