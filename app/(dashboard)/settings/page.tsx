"use client";

import { CombinedUserSettings, useSettings } from "@/contexts/settings-context";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
// Checkbox might not be directly used if FormFieldSwitchInternal is preferred, but good to have for flexibility
// import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  UserCircle,
  Palette,
  BellRing,
  LockKeyhole,
  Shield,
  Trash2,
  Download,
  Info,
  Star,
  Settings as SettingsIconLucide,
  Edit3,
  MapPin,
  Phone,
  FileText,
  Tag,
  CalendarDays,
  Users as UsersIcon,
  Briefcase,
  LinkIcon,
  Image as ImageIconLucide,
  Clock,
  MessageCircleIcon,
} from "lucide-react";
import { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import { Loader2 } from "lucide-react";
import { usePathname, useRouter } from "next/navigation"; // Added useRouter
import {
  UserDisplayPreferences,
  UserNotificationPreferences,
  UserPrivacyPreferences,
  UserPreferencesDto,
} from "@/types/user-preferences";
import { ImageUploader } from "@/components/ui/image-uploader";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { FormControl, FormItem } from "@/components/ui/form";
import Link from "next/link";

const defaultAvatarsStock = [
  // Renamed to avoid conflict if defaultAvatars is used elsewhere
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/9439775.jpg-4JVJWOjPksd3DtnBYJXoWHA5lc1DU9.jpeg",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/375238645_11475210.jpg-lU8bOe6TLt5Rv51hgjg8NT8PsDBmvN.jpeg",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/375238208_11475222.jpg-poEIzVHAGiIfMFQ7EiF8PUG1u0Zkzz.jpeg",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/dd.jpg-4MCwPC2Bec6Ume26Yo1kao3CnONxDg.jpeg",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/9334178.jpg-Y74tW6XFO68g7N36SE5MSNDNVKLQ08.jpeg",
];

type UserRoleForUI = "customer" | "business-actor" | "super-admin" | "unknown";

const FormFieldItem: React.FC<{
  label: string;
  id: string;
  value: string | undefined;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  readOnly?: boolean;
  placeholder?: string;
  description?: string;
  disabled?: boolean;
}> = ({
  label,
  id,
  value,
  onChange,
  type = "text",
  readOnly = false,
  placeholder,
  description,
  disabled = false,
}) => (
  <div className="space-y-1.5">
    <Label htmlFor={id}>{label}</Label>
    <Input
      id={id}
      type={type}
      value={value || ""}
      onChange={onChange}
      readOnly={readOnly}
      placeholder={placeholder}
      disabled={disabled}
    />
    {description && (
      <p className="text-xs text-muted-foreground">{description}</p>
    )}
  </div>
);

const FormFieldSelectInternal: React.FC<{
  label: string;
  value: string | undefined;
  onValueChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  id?: string;
  disabled?: boolean;
}> = ({
  label,
  value,
  onValueChange,
  options,
  placeholder,
  id,
  disabled = false,
}) => (
  <div className="space-y-1.5">
    <Label htmlFor={id}>{label}</Label>
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger id={id}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);

const FormFieldSwitchInternal: React.FC<{
  id: string;
  label: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
}> = ({
  id,
  label,
  description,
  checked,
  onCheckedChange,
  disabled = false,
}) => (
  <div
    className={cn(
      "flex items-center justify-between rounded-lg border p-3 shadow-sm bg-background/50",
      disabled && "opacity-70 cursor-not-allowed"
    )}
  >
    <div className="space-y-0.5 pr-4">
      <Label
        htmlFor={id}
        className={cn(
          "text-base font-normal",
          disabled && "cursor-not-allowed"
        )}
      >
        {label}
      </Label>
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
    </div>
    <Switch
      id={id}
      checked={checked}
      onCheckedChange={onCheckedChange}
      disabled={disabled}
    />
  </div>
);

export default function UnifiedSettingsPage() {
  const {
    settings,
    isLoadingSettings,
    updateUserProfile,
    updateDisplayPreferences,
    updateNotificationPreferences,
    updatePrivacyPreferences,
  } = useSettings();
  const { setTheme: setNextTheme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();

  const inferredRole = useMemo((): UserRoleForUI => {
    // This inference will be replaced by actual role from session when available
    if (pathname.includes("/business-actor")) return "business-actor";
    if (pathname.includes("/customer")) return "customer";
    if (pathname.includes("/super-admin")) return "super-admin";
    // A more robust way, if settings page is always /settings, might involve checking session data
    // For now, if accessed directly via /settings, it might default based on some logic or show a generic view
    return "customer"; // Fallback for direct /settings access
  }, [pathname]);

  // Local state for Account Profile form fields
  const [localFirstName, setLocalFirstName] = useState("");
  const [localLastName, setLocalLastName] = useState("");
  const [localPhone, setLocalPhone] = useState("");
  const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | null>(
    null
  );

  // Local state for Security form fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [is2FAEnabled, setIs2FAEnabled] = useState(false); // Placeholder for 2FA status

  useEffect(() => {
    if (!isLoadingSettings) {
      setLocalFirstName(settings.firstName || "");
      setLocalLastName(settings.lastName || "");
      setLocalPhone(settings.phone || "");
      setProfilePhotoPreview(settings.avatar); // settings.avatar is the profilePhotoUrl
      // Potentially set is2FAEnabled from settings if it comes from backend
    }
  }, [settings, isLoadingSettings]);

  const handleProfilePhotoSelected = (
    file: File | null,
    previewUrl: string | null
  ) => {
    setProfilePhotoFile(file);
    setProfilePhotoPreview(previewUrl);
  };

  const handleSaveAccountProfile = async () => {
    let fn = localFirstName.trim();
    let ln = localLastName.trim();
    if (!fn) {
      toast.error("First name cannot be empty.");
      return;
    }

    await updateUserProfile({
      first_name: fn,
      last_name: ln, // Send empty string if user clears it
      phone_number: localPhone.trim(),
    });

    if (
      (profilePhotoFile || profilePhotoPreview === null) &&
      profilePhotoPreview !== settings.avatar
    ) {
      let newPhotoUrl = profilePhotoPreview;
      if (profilePhotoFile) {
        toast.info("Simulating photo upload...");
        await new Promise((r) => setTimeout(r, 1000)); // Simulate upload delay
        // In a real app: const uploadedUrl = await uploadActualFile(profilePhotoFile);
        // newPhotoUrl = uploadedUrl; // Replace with actual URL
        newPhotoUrl = `/mock-profile-photos/${profilePhotoFile.name}`; // Mock URL
        console.log("Simulated upload, using mock URL:", newPhotoUrl);
      }
      await updateDisplayPreferences({ profilePhotoUrl: newPhotoUrl });
      setProfilePhotoFile(null);
    }
  };

  const handleSaveSecurity = async () => {
    if (newPassword && newPassword.length < 6) {
      toast.error("New password must be at least 6 characters.");
      return;
    }
    if (newPassword && newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }
    // TODO: API call to backend to change password (currentPassword, newPassword)
    // TODO: API call for 2FA enablement/disablement (is2FAEnabled)
    toast.info("Security settings update action triggered (backend pending).");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleDeleteAccount = () => {
    if (
      confirm(
        "DANGER: Are you absolutely sure you want to delete your account? This action is irreversible and will permanently erase all your data associated with this account."
      )
    ) {
      if (
        confirm(
          "FINAL WARNING: This cannot be undone. Proceed with account deletion?"
        )
      ) {
        toast.warning(
          "Account deletion process initiated (backend call not implemented)."
        );
        // TODO: API call to user/auth service to delete account.
        // After successful deletion, sign out and redirect to homepage.
        // signOut({ callbackUrl: '/' });
      }
    }
  };

  const showPreferencesTab =
    inferredRole === "business-actor" || inferredRole === "super-admin";

  if (isLoadingSettings && !settings.userId) {
    return (
      <div className="container mx-auto flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto pb-10">
      <div className="mb-6 flex items-center gap-3">
        <SettingsIconLucide className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">User Settings</h1>
      </div>
      <Tabs defaultValue="account" className="space-y-6">
        <TabsList
          className={cn(
            "grid w-full",
            showPreferencesTab ? "grid-cols-5" : "grid-cols-4"
          )}
        >
          <TabsTrigger value="account" className="gap-1.5">
            <UserCircle className="h-4 w-4" />
            Account
          </TabsTrigger>
          {showPreferencesTab && (
            <TabsTrigger value="preferences" className="gap-1.5">
              <Palette className="h-4 w-4" />
              Display
            </TabsTrigger>
          )}
          <TabsTrigger value="security" className="gap-1.5">
            <LockKeyhole className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-1.5">
            <BellRing className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="privacy" className="gap-1.5">
            <Shield className="h-4 w-4" />
            Privacy
          </TabsTrigger>
        </TabsList>

        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Account Profile</CardTitle>
              <CardDescription>
                Manage your personal information and profile photo.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <ImageUploader
                currentImageUrl={settings.avatar}
                onImageSelectedAction={handleProfilePhotoSelected}
                label="Profile Photo"
                fallbackName={settings.fullName}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                <FormFieldItem
                  label="First Name"
                  id="firstName"
                  value={localFirstName}
                  onChange={(e) => setLocalFirstName(e.target.value)}
                  placeholder="Your first name"
                />
                <FormFieldItem
                  label="Last Name"
                  id="lastName"
                  value={localLastName}
                  onChange={(e) => setLocalLastName(e.target.value)}
                  placeholder="Your last name"
                />
              </div>
              <FormFieldItem
                label="Username"
                id="username"
                value={settings.username}
                readOnly
                description="Your unique username (cannot be changed)."
              />
              <FormFieldItem
                label="Email"
                id="email"
                value={settings.email}
                readOnly
                description={
                  settings.emailVerified
                    ? "Email verified."
                    : "Email not verified."
                }
              />
              <FormFieldItem
                label="Phone Number"
                id="phone"
                type="tel"
                value={localPhone}
                onChange={(e) => setLocalPhone(e.target.value)}
                placeholder="+1234567890"
                description={
                  settings.phoneVerified
                    ? "Phone verified."
                    : "Phone not verified (if applicable)."
                }
              />
            </CardContent>
            <CardFooter>
              <Button
                onClick={handleSaveAccountProfile}
                disabled={isLoadingSettings}
              >
                {isLoadingSettings && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save Profile Changes
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {showPreferencesTab && (
          <TabsContent value="preferences">
            <Card>
              <CardHeader>
                <CardTitle>Display Preferences</CardTitle>
                <CardDescription>
                  Customize your dashboard appearance and experience.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormFieldSelectInternal
                  label="Language"
                  id="language"
                  value={settings.language}
                  onValueChange={(val) =>
                    updateDisplayPreferences({ language: val })
                  }
                  options={[
                    { value: "en", label: "English" },
                    { value: "fr", label: "Français" },
                    { value: "es", label: "Español" },
                  ]}
                  placeholder="Select Language"
                />
                <FormFieldSelectInternal
                  label="Theme"
                  id="theme"
                  value={settings.theme}
                  onValueChange={(val) => {
                    setNextTheme(val);
                    updateDisplayPreferences({ theme: val as any });
                  }}
                  options={[
                    { value: "light", label: "Light" },
                    { value: "dark", label: "Dark" },
                    { value: "system", label: "System Default" },
                  ]}
                  placeholder="Select Theme"
                />
                <FormFieldSelectInternal
                  label="Date Format"
                  id="dateFormat"
                  value={settings.dateFormat}
                  onValueChange={(val) =>
                    updateDisplayPreferences({ dateFormat: val as any })
                  }
                  options={[
                    { value: "mm-dd-yyyy", label: "MM-DD-YYYY" },
                    { value: "dd-mm-yyyy", label: "DD-MM-YYYY" },
                    { value: "yyyy-mm-dd", label: "YYYY-MM-DD" },
                  ]}
                  placeholder="Select Date Format"
                />
                <FormFieldSelectInternal
                  label="Timezone"
                  id="timezone"
                  value={settings.timezone}
                  onValueChange={(val) =>
                    updateDisplayPreferences({ timezone: val })
                  }
                  options={[
                    { value: "utc-8", label: "Pacific Time (UTC-8)" },
                    { value: "utc-5", label: "Eastern Time (UTC-5)" },
                    { value: "utc+0", label: "Greenwich Mean Time (UTC+0)" },
                    { value: "utc+1", label: "Central European Time (UTC+1)" },
                    { value: "utc+2", label: "Eastern European Time (UTC+2)" },
                  ]}
                  placeholder="Select Timezone"
                />
                <FormFieldSelectInternal
                  label="Currency"
                  id="currency"
                  value={settings.currency}
                  onValueChange={(val) =>
                    updateDisplayPreferences({ currency: val })
                  }
                  options={[
                    { value: "usd", label: "USD ($)" },
                    { value: "eur", label: "EUR (€)" },
                    { value: "gbp", label: "GBP (£)" },
                    { value: "jpy", label: "JPY (¥)" },
                  ]}
                  placeholder="Select Currency"
                />
                <div className="space-y-1.5">
                  <Label htmlFor="fontSize">
                    Font Size ({settings.fontSize}px)
                  </Label>
                  <Slider
                    id="fontSize"
                    value={[settings.fontSize]}
                    onValueCommit={(val) =>
                      updateDisplayPreferences({ fontSize: val[0] })
                    }
                    min={12}
                    max={20}
                    step={1}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Dashboard Layout</Label>
                  <RadioGroup
                    value={settings.layout}
                    onValueChange={(val) =>
                      updateDisplayPreferences({ layout: val as any })
                    }
                    className="flex flex-col sm:flex-row sm:space-x-4 space-y-2 sm:space-y-0"
                  >
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <RadioGroupItem value="default" id="layout-default" />
                      </FormControl>
                      <Label htmlFor="layout-default" className="font-normal">
                        Default
                      </Label>
                    </FormItem>
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <RadioGroupItem value="compact" id="layout-compact" />
                      </FormControl>
                      <Label htmlFor="layout-compact" className="font-normal">
                        Compact
                      </Label>
                    </FormItem>
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <RadioGroupItem value="expanded" id="layout-expanded" />
                      </FormControl>
                      <Label htmlFor="layout-expanded" className="font-normal">
                        Expanded
                      </Label>
                    </FormItem>
                  </RadioGroup>
                </div>
              </CardContent>
              {/* No explicit save button as preferences update on change via context */}
            </Card>
          </TabsContent>
        )}

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Manage your password and account security features.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormFieldItem
                label="Current Password"
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter your current password"
              />
              <FormFieldItem
                label="New Password"
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter a new strong password"
              />
              <FormFieldItem
                label="Confirm New Password"
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your new password"
              />
              <Button
                onClick={handleSaveSecurity}
                disabled={isLoadingSettings}
                className="mt-2"
              >
                {isLoadingSettings && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Change Password
              </Button>
              <Separator />
              <FormFieldSwitchInternal
                id="twoFactorAuth"
                label="Two-Factor Authentication (2FA)"
                description="Add an extra layer of security to your account."
                checked={is2FAEnabled}
                onCheckedChange={setIs2FAEnabled}
              />
              {/* TODO: If is2FAEnabled is true, show 2FA setup/management options */}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Choose how you receive notifications.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormFieldSwitchInternal
                id="emailNotif"
                label="Email Notifications"
                checked={settings.notifications.email}
                onCheckedChange={(val) =>
                  updateNotificationPreferences({ email: val })
                }
                description="Receive important updates via email."
              />
              <FormFieldSwitchInternal
                id="pushNotif"
                label="Push Notifications (App)"
                checked={settings.notifications.push}
                onCheckedChange={(val) =>
                  updateNotificationPreferences({ push: val })
                }
                description="Get real-time alerts in the app."
              />
              <FormFieldSwitchInternal
                id="smsNotif"
                label="SMS Notifications"
                checked={settings.notifications.sms}
                onCheckedChange={(val) =>
                  updateNotificationPreferences({ sms: val })
                }
                description="Receive critical alerts via text message."
              />
              <Separator />
              <FormFieldSwitchInternal
                id="accountActivityNotif"
                label="Account Activity"
                checked={settings.notifications.accountActivity}
                onCheckedChange={(val) =>
                  updateNotificationPreferences({ accountActivity: val })
                }
                description="Alerts for logins, password changes, etc."
              />
              <FormFieldSwitchInternal
                id="newFeaturesNotif"
                label="New Features & Updates"
                checked={settings.notifications.newFeatures}
                onCheckedChange={(val) =>
                  updateNotificationPreferences({ newFeatures: val })
                }
                description="Stay informed about new platform capabilities."
              />
              <FormFieldSwitchInternal
                id="marketingNotif"
                label="Marketing & Promotions"
                checked={settings.notifications.marketing}
                onCheckedChange={(val) =>
                  updateNotificationPreferences({ marketing: val })
                }
                description="Receive offers and promotional content."
              />
              <FormFieldSelectInternal
                label="Notification Frequency"
                id="notifFreq"
                value={settings.notifications.frequency}
                onValueChange={(val) =>
                  updateNotificationPreferences({ frequency: val as any })
                }
                options={[
                  { value: "real-time", label: "Real-time" },
                  { value: "daily", label: "Daily Digest" },
                  { value: "weekly", label: "Weekly Summary" },
                  { value: "never", label: "Never" },
                ]}
                placeholder="Select Frequency"
              />
              <div className="space-y-1.5">
                <Label>Quiet Hours (Notifications Paused)</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="quiet-hours-start"
                    type="time"
                    value={settings.notifications.quietHoursStart}
                    onChange={(e) =>
                      updateNotificationPreferences({
                        quietHoursStart: e.target.value,
                      })
                    }
                    className="w-[130px]"
                  />
                  <span>to</span>
                  <Input
                    id="quiet-hours-end"
                    type="time"
                    value={settings.notifications.quietHoursEnd}
                    onChange={(e) =>
                      updateNotificationPreferences({
                        quietHoursEnd: e.target.value,
                      })
                    }
                    className="w-[130px]"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Set a time range to pause non-critical notifications.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy">
          <Card>
            <CardHeader>
              <CardTitle>Privacy & Data</CardTitle>
              <CardDescription>
                Manage your data sharing settings and account actions.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormFieldSwitchInternal
                id="analyticsSharing"
                label="Share Usage Data"
                description="Help us improve by sharing anonymized usage analytics."
                checked={settings.privacy.analyticsSharing}
                onCheckedChange={(val) =>
                  updatePrivacyPreferences({ analyticsSharing: val })
                }
              />
              <FormFieldSwitchInternal
                id="personalizedAds"
                label="Personalized Content & Offers"
                description="Allow us to tailor content and offers based on your activity."
                checked={settings.privacy.personalizedAds}
                onCheckedChange={(val) =>
                  updatePrivacyPreferences({ personalizedAds: val })
                }
              />
              <FormFieldSelectInternal
                label="Account Visibility"
                id="visibility"
                value={settings.privacy.visibility}
                onValueChange={(val) =>
                  updatePrivacyPreferences({ visibility: val as any })
                }
                options={[
                  { value: "public", label: "Public" },
                  { value: "private", label: "Private" },
                  {
                    value: "friends-only",
                    label: "Friends Only (if applicable)",
                  },
                ]}
                placeholder="Select Account Visibility"
              />
              <FormFieldSelectInternal
                label="Data Retention Policy"
                id="dataRetention"
                value={settings.privacy.dataRetention}
                onValueChange={(val) =>
                  updatePrivacyPreferences({ dataRetention: val as any })
                }
                options={[
                  { value: "6-months", label: "6 Months" },
                  { value: "1-year", label: "1 Year" },
                  { value: "2-years", label: "2 Years" },
                  { value: "indefinite", label: "Indefinite (Until Deletion)" },
                ]}
                placeholder="Select Data Retention"
              />
              <Separator className="my-6" />
              <div className="flex flex-col sm:flex-row justify-between gap-3">
                <Button
                  variant="outline"
                  onClick={() =>
                    toast.info("Download data feature coming soon.")
                  }
                  disabled={isLoadingSettings}
                  className="w-full sm:w-auto"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Your Data
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteAccount}
                  disabled={isLoadingSettings}
                  className="w-full sm:w-auto"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete My Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageCircleIcon className="mr-2 h-5 w-5" />
              Help Center
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="outline" asChild className="w-full">
              <Link href="/help">Visit Support & FAQs</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Info className="mr-2 h-5 w-5" />
              What's New
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="outline" asChild className="w-full">
              <Link href="/whats-new">See Latest Updates</Link>
            </Button>
          </CardContent>
        </Card>
        {/* Rate App should be context-aware, e.g. only for customer or if a general app rating */}
        {(inferredRole === "customer" || inferredRole === "business-actor") && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Star className="mr-2 h-5 w-5" />
                Rate Our Platform
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                onClick={() =>
                  toast.info("Link to app store or feedback form TBD.")
                }
                className="w-full"
              >
                Leave a Rating
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
