"use client"

import { useSettings } from "@/contexts/settings-context" // Using shared settings for the logged-in admin user
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useState } from "react"

export default function SuperAdminSettingsPage() {
  // Using the same shared settings context for the ADMIN's own profile/security
  const { settings, updateSettings } = useSettings();
  const [selectedAvatar, setSelectedAvatar] = useState(settings.avatar); // Admin's avatar

  const handleSaveAccount = () => {
    updateSettings({
      avatar: selectedAvatar,
      fullName: settings.fullName, // Admin's name
      email: settings.email,       // Admin's email
    });
    toast.success("Admin account settings saved successfully");
  }

  const handleSaveSecurity = () => {
    // TODO: Implement actual password change and 2FA logic for admin via API call
    toast.info("Admin security settings update not implemented yet.");
  }

  const handleDeleteAccount = () => {
    // TODO: Implement admin account deletion flow (use with extreme caution!)
    if (confirm("Are you sure you want to delete YOUR Super Admin account? This action cannot be undone.")) {
      toast.warning("Admin account deletion not implemented yet.");
      // Call API endpoint for deletion here
    }
  }

  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-6">Admin Account Settings</h1>
      <Tabs defaultValue="account" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2"> {/* Simplified for admin */}
          <TabsTrigger value="account">My Account</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          {/* Add other relevant admin-specific settings if needed */}
        </TabsList>

        {/* Account Tab */}
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>My Admin Profile</CardTitle>
              <CardDescription>Manage your admin account information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Admin Avatar */}
              <div className="space-y-2">
                <Label>Your Avatar</Label>
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedAvatar || settings.avatar} alt={settings.fullName} />
                  <AvatarFallback>
                    {settings.fullName?.split(" ").map((n) => n[0]).join("") || 'SA'}
                  </AvatarFallback>
                </Avatar>
                {/* Simplified avatar change, maybe just upload? */}
              </div>
              {/* Admin Info */}
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
              {/* Add admin-specific profile fields if any (e.g., Contact Details, DPA agreement) */}
              <div className="flex items-center space-x-2 pt-4">
                <Switch id="newsletter" /> {/* Admin Newsletter? */}
                <Label htmlFor="newsletter">Subscribe to Admin Newsletter</Label>
              </div>
              <div className="pt-4">
                <Button variant="link" className="p-0 h-auto">View Admin Data Processing Agreement</Button> {/* TODO: Link */}
              </div>
              <div className="pt-4">
                <Button variant="outline">View My Fault Reports</Button> {/* TODO: Link/Modal */}
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveAccount}>Save My Account Settings</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Admin Security</CardTitle>
              <CardDescription>Manage your admin password and authentication</CardDescription>
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
              <Button onClick={handleSaveSecurity} className="mt-2">Change My Password</Button>
              <div className="border-t pt-4 mt-4"></div>
              {/* 2FA */}
              <div className="flex items-center space-x-2">
                <Switch id="two-factor" /> {/* TODO: Connect state & setup flow */}
                <Label htmlFor="two-factor">Enable Two-Factor Authentication for Admin Login</Label>
              </div>
              {/* OTP Support */}
              <div className="flex items-center space-x-2">
                <Switch id="otp-support" /> {/* TODO: Connect state & setup flow */}
                <Label htmlFor="otp-support">Enable OTP Support for Admin Login</Label>
              </div>
              <div className="border-t pt-6 mt-6">
                <Button variant="destructive" onClick={handleDeleteAccount}>Delete My Admin Account</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
      {/* Other Admin-specific items */}
      <Card className="mt-4">
        <CardHeader><CardTitle>Admin Invite/Referral</CardTitle></CardHeader>
        <CardContent>
          <Button>Invite another Admin</Button> {/* TODO */}
        </CardContent>
      </Card>
      <Card className="mt-4">
        <CardHeader><CardTitle>Admin Support</CardTitle></CardHeader>
        <CardContent>
          <Button variant="outline">Access Admin Help Center</Button> {/* TODO */}
        </CardContent>
      </Card>
    </div>
  )
}