"use client"

// Removed Link and specific icons like SettingsIcon, User, CreditCard, HelpCircle
import { LogOut } from "lucide-react"
import { useSettings } from "@/contexts/settings-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface UserNavProps {
  // Removed settingsHrefPrefix as it's no longer needed here
  /** Callback function to execute on logout */
  onLogout: () => void
}

// Updated props to only include onLogout
export function UserNav({ onLogout }: UserNavProps) {
  const { settings } = useSettings()

  // Simple fallback for avatar initials
  const avatarFallback = settings.fullName
    ? settings.fullName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
    : "U"

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
        {/* Display User Info */}
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{settings.fullName || "User"}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {settings.email || "No email provided"}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {/* REMOVED DropdownMenuGroup with Profile, Billing, Settings, Help links */}
        {/* Logout Item */}
        <DropdownMenuItem onClick={onLogout} className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}