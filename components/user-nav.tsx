"use client";

import { LogOut } from "lucide-react"; // Removed Link and other icons for simplicity
import { useSettings } from "@/contexts/settings-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link"; // Added Link back for explicit settings link
import { Settings as SettingsIcon, User as UserIcon } from "lucide-react"; // Added UserIcon

interface UserNavProps {
  onLogoutAction: () => void;
}

export function UserNav({ onLogoutAction }: UserNavProps) {
  const { settings } = useSettings();

  const avatarFallback = settings.fullName
    ? settings.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : settings.username
    ? settings.username.charAt(0).toUpperCase()
    : "U";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={settings.avatar}
              alt={settings.fullName || "User Avatar"}
            />
            <AvatarFallback>{avatarFallback}</AvatarFallback>
          </Avatar>
          <span className="sr-only">Open user menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {settings.fullName || settings.username || "User"}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {settings.email || "No email provided"}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {/* Link to the "Account" tab of the unified settings page */}
        <DropdownMenuItem asChild>
          <Link href="/settings?tab=account">
            <UserIcon className="mr-2 h-4 w-4" />
            <span>My Account</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/settings">
            <SettingsIcon className="mr-2 h-4 w-4" />
            <span>All Settings</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={onLogoutAction}
          className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
