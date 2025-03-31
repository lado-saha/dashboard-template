// FILE: components/user-nav.tsx
"use client"

import Link from "next/link"
import {
  LogOut,
  User,
  Settings as SettingsIcon, // Renamed to avoid conflict
  CreditCard,
  HelpCircle, // Example additional item
} from "lucide-react"

import { useSettings } from "@/contexts/settings-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut, // Optional: for keyboard shortcuts display
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface UserNavProps {
  /** The base path for role-specific settings/profile links (e.g., '/business-actor') */
  settingsHrefPrefix: string
  /** Callback function to execute on logout */
  onLogout: () => void // Define a prop for the logout action
}

export function UserNav({ settingsHrefPrefix, onLogout }: UserNavProps) {
  const { settings } = useSettings()

  // --- Construct Links ---
  // Decide if /settings is shared or role-specific.
  // This implementation assumes a *single shared* /settings page as per app/settings/1page.tsx
  // If you intend role-specific settings pages (e.g., /business-actor/settings),
  // adjust the link construction accordingly.
  const settingsLink = "/settings"; // Shared settings page
  // Example: If settings were role-specific:
  // const settingsLink = `${settingsHrefPrefix}/settings`;
  // const profileLink = `${settingsHrefPrefix}/profile`; // Or link to account tab in settings

  // Simple fallback for avatar initials
  const avatarFallback = settings.fullName
    ? settings.fullName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
    : "U" // Default if no name

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={settings.avatar} alt={settings.fullName || "User Avatar"} />
            <AvatarFallback>{avatarFallback}</AvatarFallback>
          </Avatar>
          <span className="sr-only">Open user menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{settings.fullName || "User"}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {settings.email || "No email provided"}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {/* Example: Link to the 'Account' tab within the main Settings page */}
          {/* You might need a way to pass the target tab, e.g., query param */}
          <DropdownMenuItem asChild>
            <Link href={`${settingsLink}?tab=account`}>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </Link>
          </DropdownMenuItem>

          {/* Example Billing Link (adjust href as needed) */}
          <DropdownMenuItem asChild>
            <Link href={`${settingsHrefPrefix}/billing`}>
              <HelpCircle className="mr-2 h-4 w-4" />
              <span>Help & Support</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link href={settingsLink}>
              <SettingsIcon className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onLogout} className="cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
          {/* <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut> */}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}