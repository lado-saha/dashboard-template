"use client"

import { UserSettings, useSettings } from "@/contexts/settings-context"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Laptop, Smartphone, Tablet } from "lucide-react"
import { useState, useCallback } from "react" // Import useCallback
import { toast } from "sonner"
import { useTheme } from "next-themes"; // Import useTheme for theme radio group

const defaultAvatars = [
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/9439775.jpg-4JVJWOjPksd3DtnBYJXoWHA5lc1DU9.jpeg",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/375238645_11475210.jpg-lU8bOe6TLt5Rv51hgjg8NT8PsDBmvN.jpeg",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/375238208_11475222.jpg-poEIzVHAGiIfMFQ7EiF8PUG1u0Zkzz.jpeg",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/dd.jpg-4MCwPC2Bec6Ume26Yo1kao3CnONxDg.jpeg",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/9334178.jpg-Y74tW6XFO68g7N36SE5MSNDNVKLQ08.jpeg",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/5295.jpg-fLw0wGGZp8wuTzU5dnyfjZDwAHN98a.jpeg",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/9720029.jpg-Yf9h2a3kT7rYyCb648iLIeHThq5wEy.jpeg",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/27470341_7294795.jpg-XE0zf7R8tk4rfA1vm4fAHeZ1QoVEOo.jpeg",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/799.jpg-0tEi4Xvg5YsFoGoQfQc698q4Dygl1S.jpeg",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/9334228.jpg-eOsHCkvVrVAwcPHKYSs5sQwVKsqWpC.jpeg",
];

export default function SettingsPage() {
  const { settings, updateSettings, updateNotificationSettings, updatePrivacySettings } = useSettings();
  const { theme, setTheme } = useTheme(); // Get theme setter from next-themes
  const [selectedAvatar, setSelectedAvatar] = useState(settings.avatar);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [enable2FA, setEnable2FA] = useState(false); // Placeholder state for 2FA switch

  // --- Event Handlers ---
  const handleSaveAccount = useCallback(() => {
    // Add validation if needed before updating
    updateSettings({
      avatar: selectedAvatar,
      fullName: settings.fullName,
      email: settings.email,
      phone: settings.phone,
      timezone: settings.timezone,
    });
    toast.success("Account settings saved successfully");
  }, [selectedAvatar, settings, updateSettings]);

  const handleSaveSecurity = useCallback(() => {
    // TODO: Implement actual security logic (API call)
    // 1. Validate passwords (match, strength)
    // 2. Send currentPassword, newPassword to backend API for verification and update
    console.log("Saving Security:", { currentPassword, newPassword, confirmPassword, enable2FA });
    if (newPassword && newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }
    // Reset fields after attempted save (or on success)
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    toast.info("Save security settings action triggered (implementation pending).");
  }, [currentPassword, newPassword, confirmPassword, enable2FA]); // Added dependencies

  const handleSavePreferences = useCallback(() => {
    // All preference updates are directly handled by onValueChange/onCheckedChange now
    // This button might just provide user feedback
    toast.success("Preferences settings saved successfully");
    // Or call updateSettings with the full preferences object if needed for a single API call
    // updateSettings({ language: settings.language, currency: settings.currency, ... });
  }, []); // No dependencies needed if updates happen onChange

  const handleSaveNotifications = useCallback(() => {
    // TODO: Potentially save quiet hours if managed by local state
    updateNotificationSettings(settings.notifications); // Context already holds the latest state
    toast.success("Notification settings saved successfully");
  }, [settings.notifications, updateNotificationSettings]); // Dependency added

  const handleSavePrivacy = useCallback(() => {
    updatePrivacySettings(settings.privacy); // Context already holds the latest state
    toast.success("Privacy settings saved successfully");
  }, [settings.privacy, updatePrivacySettings]); // Dependency added

  // Placeholder handlers for other buttons
  const handleLogoutOtherSessions = useCallback(() => {
    toast.info("Log out all other sessions action triggered (implementation pending).");
    // TODO: API call to invalidate other sessions
  }, []);

  const handleManageIntegrations = useCallback(() => {
    toast.info("Manage integrations action triggered (implementation pending).");
    // TODO: Open modal or navigate to integrations page
  }, []);

  const handleDownloadData = useCallback(() => {
    toast.info("Download your data action triggered (implementation pending).");
    // TODO: API call to request data export
  }, []);

  const handleDeleteAccount = useCallback(() => {
    if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      toast.warning("Delete account action triggered (implementation pending).");
      // TODO: API call to initiate account deletion process
    }
  }, []);

  // Handler for font size slider - updates context on commit (release)
  const handleFontSizeChange = useCallback((value: number[]) => {
    updateSettings({ fontSize: value[0] });
  }, [updateSettings]);

  // Handler for theme change - uses next-themes and updates context
  const handleThemeChange = useCallback((value: string) => {
    const newTheme = value as "light" | "dark" | "system";
    setTheme(newTheme); // Update next-themes
    updateSettings({ theme: newTheme }); // Update context
  }, [setTheme, updateSettings]);


  return (
    <div className="container mx-auto pb-10"> {/* Added padding-bottom */}
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      <Tabs defaultValue="account" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5"> {/* Responsive grid */}
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
        </TabsList>

        {/* --- Account Tab --- */}
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>Manage your account information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar Section */}
              <div className="space-y-4">
                <Label>Current Avatar</Label>
                <div className="flex items-center space-x-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={selectedAvatar} alt={settings.fullName || "User"} />
                    <AvatarFallback>
                      {settings.fullName
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("") || "U"}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <Label>Choose a new avatar</Label>
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                  {defaultAvatars.map((avatar, index) => (
                    <Avatar
                      key={index}
                      className={`h-16 w-16 sm:h-20 sm:w-20 rounded-lg cursor-pointer hover:ring-2 hover:ring-primary shrink-0 ${selectedAvatar === avatar ? "ring-2 ring-primary" : ""
                        }`}
                      onClick={() => setSelectedAvatar(avatar)}
                    >
                      <AvatarImage src={avatar} alt={`Avatar ${index + 1}`} className="object-cover" />
                      <AvatarFallback>{index + 1}</AvatarFallback>
                    </Avatar>
                  ))}
                </div>
                <div>
                  <Label htmlFor="custom-avatar">Or upload a custom avatar</Label>
                  {/* TODO: Implement file upload logic */}
                  <Input id="custom-avatar" type="file" accept="image/*" className="mt-1" />
                </div>
              </div>
              {/* User Details Inputs */}
              <div className="space-y-2">
                <Label htmlFor="full-name">Full Name</Label>
                <Input
                  id="full-name"
                  value={settings.fullName || ""} // Ensure controlled component
                  onChange={(e) => updateSettings({ fullName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={settings.email || ""}
                  onChange={(e) => updateSettings({ email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={settings.phone || ""}
                  onChange={(e) => updateSettings({ phone: e.target.value })}
                />
              </div>
              {/* Timezone Select */}
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select value={settings.timezone} onValueChange={(value) => updateSettings({ timezone: value })}>
                  <SelectTrigger id="timezone">
                    <SelectValue placeholder="Select Timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* Timezone Options */}
                    <SelectItem value="utc-12">International Date Line West (UTC-12)</SelectItem>
                    <SelectItem value="utc-11">Samoa Standard Time (UTC-11)</SelectItem>
                    <SelectItem value="utc-10">Hawaii-Aleutian Standard Time (UTC-10)</SelectItem>
                    <SelectItem value="utc-9">Alaska Standard Time (UTC-9)</SelectItem>
                    <SelectItem value="utc-8">Pacific Time (UTC-8)</SelectItem>
                    <SelectItem value="utc-7">Mountain Time (UTC-7)</SelectItem>
                    <SelectItem value="utc-6">Central Time (UTC-6)</SelectItem>
                    <SelectItem value="utc-5">Eastern Time (UTC-5)</SelectItem>
                    <SelectItem value="utc-4">Atlantic Time (UTC-4)</SelectItem>
                    <SelectItem value="utc-3">Argentina Standard Time (UTC-3)</SelectItem>
                    <SelectItem value="utc-2">South Georgia Time (UTC-2)</SelectItem>
                    <SelectItem value="utc-1">Azores Time (UTC-1)</SelectItem>
                    <SelectItem value="utc+0">Greenwich Mean Time (UTC+0)</SelectItem>
                    <SelectItem value="utc+1">Central European Time (UTC+1)</SelectItem>
                    <SelectItem value="utc+2">Eastern European Time (UTC+2)</SelectItem>
                    <SelectItem value="utc+3">Moscow Time (UTC+3)</SelectItem>
                    <SelectItem value="utc+4">Gulf Standard Time (UTC+4)</SelectItem>
                    <SelectItem value="utc+5">Pakistan Standard Time (UTC+5)</SelectItem>
                    <SelectItem value="utc+5.5">Indian Standard Time (UTC+5:30)</SelectItem>
                    <SelectItem value="utc+6">Bangladesh Standard Time (UTC+6)</SelectItem>
                    <SelectItem value="utc+7">Indochina Time (UTC+7)</SelectItem>
                    <SelectItem value="utc+8">China Standard Time (UTC+8)</SelectItem>
                    <SelectItem value="utc+9">Japan Standard Time (UTC+9)</SelectItem>
                    <SelectItem value="utc+10">Australian Eastern Standard Time (UTC+10)</SelectItem>
                    <SelectItem value="utc+11">Solomon Islands Time (UTC+11)</SelectItem>
                    <SelectItem value="utc+12">New Zealand Standard Time (UTC+12)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveAccount}>Save Account Settings</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* --- Security Tab --- */}
        <TabsContent value="security">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Password Change Card */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Manage your account's security settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Password Fields */}
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input id="current-password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input id="new-password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input id="confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                </div>
                {/* 2FA Switch */}
                <div className="flex items-center space-x-2 pt-2">
                  {/* TODO: Connect 2FA state properly (e.g., fetch initial state) */}
                  <Switch id="two-factor" checked={enable2FA} onCheckedChange={setEnable2FA} />
                  <Label htmlFor="two-factor">Enable Two-Factor Authentication</Label>
                </div>
              </CardContent>
              <CardFooter>
                {/* Fixed: Added onClick handler */}
                <Button onClick={handleSaveSecurity}>Save Security Settings</Button>
              </CardFooter>
            </Card>

            {/* Login History Card (Static Example) */}
            <Card>
              <CardHeader>
                <CardTitle>Login History</CardTitle>
                <CardDescription>Recent login activities</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { date: "2023-07-20", time: "14:30 UTC", ip: "192.168.1.1", location: "New York, USA" },
                  { date: "2023-07-19", time: "09:15 UTC", ip: "10.0.0.1", location: "London, UK" },
                ].map((login, index) => ( /* Shortened example */
                  <div key={index} className="flex justify-between items-center text-sm text-muted-foreground">
                    <span>{login.date} {login.time}</span>
                    <span>{login.ip}</span>
                    <span className="truncate ml-2">{login.location}</span>
                  </div>
                ))}
                {/* TODO: Implement dynamic loading */}
                <p className="text-xs text-muted-foreground text-center pt-2">More history available...</p>
              </CardContent>
            </Card>

            {/* Active Sessions Card (Static Example) */}
            <Card>
              <CardHeader>
                <CardTitle>Active Sessions</CardTitle>
                <CardDescription>Currently logged in devices</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { device: "Laptop", browser: "Chrome", os: "Windows 10", icon: Laptop },
                  { device: "Smartphone", browser: "Safari", os: "iOS 15", icon: Smartphone },
                ].map((session, index) => ( /* Shortened example */
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <session.icon className="h-4 w-4 text-muted-foreground" />
                      {session.device}
                    </span>
                    <span className="text-muted-foreground">{session.browser}</span>
                    <span className="text-muted-foreground truncate ml-2">{session.os}</span>
                  </div>
                ))}
                {/* TODO: Implement dynamic loading */}
              </CardContent>
              <CardFooter>
                {/* Fixed: Added onClick handler */}
                <Button variant="outline" onClick={handleLogoutOtherSessions}>Log Out All Other Sessions</Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        {/* --- Preferences Tab --- */}
        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
              <CardDescription>Customize your dashboard experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6"> {/* Increased spacing */}
              <div className="grid gap-6 md:grid-cols-2"> {/* Increased gap */}
                {/* Language Select */}
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  {/* Fixed: Use value and onValueChange */}
                  <Select value={settings.language} onValueChange={(value) => updateSettings({ language: value })}>
                    <SelectTrigger id="language">
                      <SelectValue placeholder="Select Language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="de">Deutsch</SelectItem>
                      <SelectItem value="zh">中文</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {/* Currency Select */}
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  {/* Fixed: Use value and onValueChange */}
                  <Select value={settings.currency} onValueChange={(value) => updateSettings({ currency: value })}>
                    <SelectTrigger id="currency">
                      <SelectValue placeholder="Select Currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="usd">USD ($)</SelectItem>
                      <SelectItem value="eur">EUR (€)</SelectItem>
                      <SelectItem value="gbp">GBP (£)</SelectItem>
                      <SelectItem value="jpy">JPY (¥)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {/* Date Format Select */}
                <div className="space-y-2">
                  <Label htmlFor="date-format">Date Format</Label>
                  {/* Fixed: Use value and onValueChange */}
                  <Select value={settings.dateFormat} onValueChange={(value) => updateSettings({ dateFormat: value })}>
                    <SelectTrigger id="date-format">
                      <SelectValue placeholder="Select Date Format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mm-dd-yyyy">MM-DD-YYYY</SelectItem>
                      <SelectItem value="dd-mm-yyyy">DD-MM-YYYY</SelectItem>
                      <SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {/* Font Size Slider */}
                <div className="space-y-2">
                  <Label htmlFor="font-size">Font Size ({settings.fontSize}px)</Label>
                  {/* Fixed: Use value and onValueCommit */}
                  <Slider
                    id="font-size"
                    value={[settings.fontSize]}
                    max={24} min={12} step={1}
                    onValueCommit={handleFontSizeChange} // Update on release
                  />
                </div>
              </div>
              {/* Theme Radio Group */}
              <div className="space-y-2">
                <Label>Theme</Label>
                {/* Fixed: Use value and onValueChange, integrated with next-themes */}
                <RadioGroup value={theme} onValueChange={handleThemeChange}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="light" id="theme-light" />
                    <Label htmlFor="theme-light">Light</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="dark" id="theme-dark" />
                    <Label htmlFor="theme-dark">Dark</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="system" id="theme-system" />
                    <Label htmlFor="theme-system">System</Label>
                  </div>
                </RadioGroup>
              </div>
              {/* Dashboard Layout Radio Group */}
              <div className="space-y-2">
                <Label>Dashboard Layout</Label>
                {/* Fixed: Use value and onValueChange */}
                <RadioGroup value={settings.layout} onValueChange={(value) => updateSettings({ layout: value as UserSettings["layout"] })}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="default" id="layout-default" />
                    <Label htmlFor="layout-default">Default</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="compact" id="layout-compact" />
                    <Label htmlFor="layout-compact">Compact</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="expanded" id="layout-expanded" />
                    <Label htmlFor="layout-expanded">Expanded</Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
            <CardFooter>
              {/* Fixed: Added onClick handler */}
              <Button onClick={handleSavePreferences}>Save Preferences</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* --- Notifications Tab --- */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Manage how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6"> {/* Increased spacing */}
              <div className="grid gap-6 md:grid-cols-2"> {/* Increased gap */}
                {/* Notification Channels */}
                <div className="space-y-3"> {/* Increased spacing */}
                  <Label>Notification Channels</Label>
                  <div className="flex items-center space-x-2">
                    {/* Fixed: Use onCheckedChange */}
                    <Checkbox
                      id="email-notifications"
                      checked={settings.notifications.email}
                      onCheckedChange={(checked) =>
                        updateNotificationSettings({ ...settings.notifications, email: !!checked }) // Ensure boolean
                      }
                    />
                    <Label htmlFor="email-notifications">Email Notifications</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    {/* Fixed: Use onCheckedChange */}
                    <Checkbox
                      id="push-notifications"
                      checked={settings.notifications.push}
                      onCheckedChange={(checked) =>
                        updateNotificationSettings({ ...settings.notifications, push: !!checked })
                      }
                    />
                    <Label htmlFor="push-notifications">Push Notifications (App)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    {/* Correct: Already using onCheckedChange */}
                    <Checkbox
                      id="sms-notifications"
                      checked={settings.notifications.sms}
                      onCheckedChange={(checked) => updateNotificationSettings({ ...settings.notifications, sms: !!checked })}
                    />
                    <Label htmlFor="sms-notifications">SMS Notifications</Label>
                  </div>
                </div>
                {/* Notification Types */}
                <div className="space-y-3"> {/* Increased spacing */}
                  <Label>Notification Types</Label>
                  <div className="flex items-center space-x-2">
                    {/* Fixed: Use onCheckedChange */}
                    <Checkbox
                      id="account-activity"
                      checked={settings.notifications.accountActivity}
                      onCheckedChange={(checked) =>
                        updateNotificationSettings({ ...settings.notifications, accountActivity: !!checked })
                      }
                    />
                    <Label htmlFor="account-activity">Account Activity</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    {/* Fixed: Use onCheckedChange */}
                    <Checkbox
                      id="new-features"
                      checked={settings.notifications.newFeatures}
                      onCheckedChange={(checked) =>
                        updateNotificationSettings({ ...settings.notifications, newFeatures: !!checked })
                      }
                    />
                    <Label htmlFor="new-features">New Features & Updates</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    {/* Fixed: Use onCheckedChange */}
                    <Checkbox
                      id="marketing"
                      checked={settings.notifications.marketing}
                      onCheckedChange={(checked) =>
                        updateNotificationSettings({ ...settings.notifications, marketing: !!checked })
                      }
                    />
                    <Label htmlFor="marketing">Marketing & Promotions</Label>
                  </div>
                </div>
              </div>
              {/* Notification Frequency */}
              <div className="space-y-2">
                <Label htmlFor="notification-frequency">Notification Frequency</Label>
                <Select
                  value={settings.notifications.frequency}
                  // Ensure type safety for value
                  onValueChange={(value) => updateNotificationSettings({ ...settings.notifications, frequency: value as UserSettings["notifications"]["frequency"] })}
                >
                  <SelectTrigger id="notification-frequency" className="w-full md:w-[250px]">
                    <SelectValue placeholder="Select Frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="real-time">Real-time</SelectItem>
                    <SelectItem value="daily">Daily Digest</SelectItem>
                    <SelectItem value="weekly">Weekly Summary</SelectItem>
                    <SelectItem value="never">Never</SelectItem> {/* Added option */}
                  </SelectContent>
                </Select>
              </div>
              {/* Quiet Hours */}
              <div className="space-y-2">
                <Label>Quiet Hours (Notifications Paused)</Label>
                {/* TODO: Connect these inputs to context/state and save logic */}
                <div className="flex items-center space-x-2">
                  <Input id="quiet-hours-start" type="time" defaultValue={settings.notifications.quietHoursStart} className="w-[120px]" />
                  <span>to</span>
                  <Input id="quiet-hours-end" type="time" defaultValue={settings.notifications.quietHoursEnd} className="w-[120px]" />
                </div>
                <p className="text-xs text-muted-foreground">Set a time range to pause non-critical notifications.</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveNotifications}>Save Notification Settings</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* --- Privacy Tab --- */}
        <TabsContent value="privacy">
          <Card>
            <CardHeader>
              <CardTitle>Privacy Settings</CardTitle>
              <CardDescription>Manage your privacy and data settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                {/* Data Sharing Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg font-medium">Data Sharing</CardTitle> {/* Adjusted font */}
                  </CardHeader>
                  <CardContent className="space-y-4"> {/* Added spacing */}
                    <div className="flex items-center justify-between">
                      <Label htmlFor="analytics-sharing" className="flex-1 pr-4">Share usage data for improvement</Label>
                      {/* Fixed: Use onCheckedChange */}
                      <Switch
                        id="analytics-sharing"
                        checked={settings.privacy.analyticsSharing}
                        onCheckedChange={(checked) =>
                          updatePrivacySettings({ ...settings.privacy, analyticsSharing: !!checked })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="personalized-ads" className="flex-1 pr-4">Allow personalized ads based on activity</Label>
                      {/* Fixed: Use onCheckedChange */}
                      <Switch
                        id="personalized-ads"
                        checked={settings.privacy.personalizedAds}
                        onCheckedChange={(checked) =>
                          updatePrivacySettings({ ...settings.privacy, personalizedAds: !!checked })
                        }
                      />
                    </div>
                  </CardContent>
                </Card>
                {/* Account Visibility Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg font-medium">Account Visibility</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup
                      value={settings.privacy.visibility}
                      onValueChange={(value) => updatePrivacySettings({ ...settings.privacy, visibility: value as UserSettings["privacy"]["visibility"] })}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="public" id="visibility-public" />
                        <Label htmlFor="visibility-public">Public</Label>
                      </div>
                      <p className="text-xs text-muted-foreground pl-6">Your profile might be visible to others.</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <RadioGroupItem value="private" id="visibility-private" />
                        <Label htmlFor="visibility-private">Private</Label>
                      </div>
                      <p className="text-xs text-muted-foreground pl-6">Your profile is hidden.</p>
                    </RadioGroup>
                  </CardContent>
                </Card>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {/* Data Retention Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg font-medium">Data Retention</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Label htmlFor="data-retention" className="block mb-2 text-sm">Account Data Retention Period</Label>
                    <Select
                      value={settings.privacy.dataRetention}
                      onValueChange={(value) => updatePrivacySettings({ ...settings.privacy, dataRetention: value as UserSettings["privacy"]["dataRetention"] })}
                    >
                      <SelectTrigger id="data-retention">
                        <SelectValue placeholder="Select Data Retention Period" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="6-months">6 Months</SelectItem>
                        <SelectItem value="1-year">1 Year</SelectItem>
                        <SelectItem value="2-years">2 Years</SelectItem> {/* Fixed: Removed "... other" */}
                        <SelectItem value="indefinite">Indefinite</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-2">How long we keep your data after inactivity.</p>
                  </CardContent>
                </Card>
                {/* Third-Party Integrations Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg font-medium">Third-Party Integrations</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">Connected: Google Analytics, Facebook Pixel</p> {/* Static example */}
                    {/* Fixed: Added onClick handler */}
                    <Button variant="outline" onClick={handleManageIntegrations}>Manage Integrations</Button>
                  </CardContent>
                </Card>
              </div>
              {/* Data Actions */}
              <div className="flex flex-col sm:flex-row justify-between gap-4 border-t pt-6 mt-6">
                {/* Fixed: Added onClick handlers */}
                <Button variant="outline" onClick={handleDownloadData}>Download Your Data</Button>
                <Button variant="destructive" onClick={handleDeleteAccount}>Delete My Account</Button>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSavePrivacy}>Save Privacy Settings</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}