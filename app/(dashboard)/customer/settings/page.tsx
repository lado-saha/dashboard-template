// NOTE: This might be very similar to the BA settings, but could be simplified.
// Reusing the BA settings component structure is a good starting point.
// You might hide tabs not relevant to the customer.

"use client"

import { useSettings } from "@/contexts/settings-context"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
// Import other necessary components from BA settings if needed (Select, Checkbox, etc.)
import { toast } from "sonner"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useState } from "react"

// Assuming defaultAvatars is accessible or defined here as well

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
]


export default function CustomerSettingsPage() {
  // Using the same shared settings context
  const { settings, updateSettings, updateNotificationSettings, updatePrivacySettings } = useSettings()
  const [selectedAvatar, setSelectedAvatar] = useState(settings.avatar)

  const handleSaveAccount = () => {
    updateSettings({
      avatar: selectedAvatar,
      fullName: settings.fullName,
      email: settings.email,
      phone: settings.phone,
      // Timezone might be less relevant for customer? Keep or remove.
      // timezone: settings.timezone,
    })
    toast.success("Account settings saved successfully")
  }

  const handleSaveSecurity = () => {
    // TODO: Implement actual password change and 2FA logic via API call
    toast.info("Security settings update not implemented yet.");
  }

  const handleSaveNotifications = () => {
    updateNotificationSettings(settings.notifications)
    toast.success("Notification settings saved successfully")
  }

  const handleSavePrivacy = () => {
    updatePrivacySettings(settings.privacy)
    toast.success("Privacy settings saved successfully")
  }

  const handleDeleteAccount = () => {
    // TODO: Implement account deletion flow
    if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      toast.warning("Account deletion not implemented yet.");
      // Call API endpoint for deletion here
    }
  }


  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      {/* Simplified Tabs for Customer */}
      <Tabs defaultValue="account" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4"> {/* Adjust grid cols */}
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
          {/* Removed 'Preferences' tab as example simplification */}
        </TabsList>

        {/* Account Tab (Similar to BA, maybe simplified) */}
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>Manage your account information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar Selection (reuse BA logic) */}
              <div className="space-y-4">
                <Label>Current Avatar</Label>
                <div className="flex items-center space-x-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={selectedAvatar || settings.avatar} alt={settings.fullName} />
                    <AvatarFallback>
                      {settings.fullName?.split(" ").map((n) => n[0]).join("") || 'C'}
                    </AvatarFallback>
                  </Avatar>
                </div>
                {/* Consider simplifying avatar choice for customer */}
                <Label>Choose a new avatar (Optional)</Label>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {defaultAvatars.slice(0, 5).map((avatar, index) => ( // Show fewer options maybe
                    <Avatar
                      key={index}
                      className={`h-16 w-16 rounded-lg cursor-pointer hover:ring-2 hover:ring-primary shrink-0 ${selectedAvatar === avatar ? "ring-2 ring-primary" : ""
                        }`}
                      onClick={() => setSelectedAvatar(avatar)}
                    >
                      <AvatarImage src={avatar} alt={`Avatar ${index + 1}`} className="object-cover" />
                      <AvatarFallback>{index + 1}</AvatarFallback>
                    </Avatar>
                  ))}
                </div>
              </div>
              {/* Basic Info Inputs */}
              <div className="space-y-2">
                <Label htmlFor="full-name">Full Name</Label>
                <Input
                  id="full-name"
                  value={settings.fullName}
                  onChange={(e) => updateSettings({ fullName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={settings.email}
                  onChange={(e) => updateSettings({ email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={settings.phone}
                  onChange={(e) => updateSettings({ phone: e.target.value })}
                />
              </div>
              {/* Other profile fields like Contact details, DPA, Newsletter can go here */}
              <div className="flex items-center space-x-2 pt-4">
                <Switch id="newsletter" /> {/* TODO: Connect state */}
                <Label htmlFor="newsletter">Subscribe to Newsletter</Label>
              </div>
              <div className="pt-4">
                <Button variant="link" className="p-0 h-auto">View Data Processing Agreement</Button> {/* TODO: Link to DPA */}
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveAccount}>Save Account Settings</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Security Tab (Similar to BA) */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Manage your password and authentication</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Password Change */}
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input id="current-password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input id="new-password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input id="confirm-password" type="password" />
              </div>
              <Button onClick={handleSaveSecurity} className="mt-2">Change Password</Button>
              <div className="border-t pt-4 mt-4"></div>
              {/* 2FA */}
              <div className="flex items-center space-x-2">
                <Switch id="two-factor" /> {/* TODO: Connect state & setup flow */}
                <Label htmlFor="two-factor">Enable Two-Factor Authentication</Label>
              </div>
              {/* OTP Support (if different from 2FA) */}
              <div className="flex items-center space-x-2">
                <Switch id="otp-support" /> {/* TODO: Connect state & setup flow */}
                <Label htmlFor="otp-support">Enable OTP Support</Label>
              </div>
            </CardContent>
            {/* Optional: Add active sessions/login history if needed for customer */}
          </Card>
        </TabsContent>

        {/* Notifications Tab (Reuse BA structure, maybe fewer options) */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Manage how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Reuse notification controls from BA settings */}
              {/* Example: */}
              <div className="flex items-center space-x-2">
                <Switch
                  id="email-notifications"
                  checked={settings.notifications.email}
                  onCheckedChange={(checked) =>
                    updateNotificationSettings({ ...settings.notifications, email: !!checked })
                  }
                />
                <Label htmlFor="email-notifications">Email Notifications</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="push-notifications"
                  checked={settings.notifications.push}
                  onCheckedChange={(checked) =>
                    updateNotificationSettings({ ...settings.notifications, push: !!checked })
                  }
                />
                <Label htmlFor="push-notifications">Push Notifications (App)</Label>
              </div>
              {/* Add other relevant notification types */}
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveNotifications}>Save Notification Settings</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Privacy Tab (Reuse BA structure) */}
        <TabsContent value="privacy">
          <Card>
            <CardHeader>
              <CardTitle>Privacy Settings</CardTitle>
              <CardDescription>Manage your privacy and data settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Reuse privacy controls from BA settings */}
              {/* Example: */}
              <div className="flex items-center justify-between">
                <Label htmlFor="analytics-sharing">Share usage data for improvement</Label>
                <Switch
                  id="analytics-sharing"
                  checked={settings.privacy.analyticsSharing}
                  onCheckedChange={(checked) =>
                    updatePrivacySettings({ ...settings.privacy, analyticsSharing: !!checked })
                  }
                />
              </div>
              {/* Add other relevant privacy controls */}
              <div className="border-t pt-6 mt-6 flex justify-between">
                <Button variant="outline">Download Your Data</Button> {/* TODO: Implement data export */}
                <Button variant="destructive" onClick={handleDeleteAccount}>Delete My Account</Button>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSavePrivacy}>Save Privacy Settings</Button>
            </CardFooter>
          </Card>
        </TabsContent>

      </Tabs>
      {/* Other Sections from Spec (could be modals or separate cards) */}
      <div className="mt-6 grid gap-4">
        <Card>
          <CardHeader><CardTitle>Fault Reports</CardTitle></CardHeader>
          <CardContent>
            <Button variant="outline">Report an Issue</Button> {/* TODO: Implement fault report form/modal */}
            <p className="text-sm text-muted-foreground mt-2">View your past fault reports here.</p> {/* TODO: Display report history */}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Rate App</CardTitle></CardHeader>
          <CardContent>
            <Button variant="outline">Rate Us Now</Button> {/* TODO: Link to app store or feedback form */}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>What's New?</CardTitle></CardHeader>
          <CardContent>
            <p>Check out the latest updates and features.</p>
            {/* TODO: Display changelog or link to it */}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Help Center</CardTitle></CardHeader>
          <CardContent>
            <Button variant="outline">Visit Support / Help Center</Button> {/* TODO: Link to help center */}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Privacy Policy</CardTitle></CardHeader>
          <CardContent>
            <Button variant="link" className="p-0 h-auto">View Privacy Policy</Button> {/* TODO: Link to policy */}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
// END OF FILE: app/(dashboard)/customer/settings/page.tsx