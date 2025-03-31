"use client"
import { ThemeToggle } from "./theme-toggle" // Ensure this uses ui/button if sidebar does
import { Notifications } from "./notifications"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSettings } from "@/contexts/settings-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button" // Use ui/button
import React from "react"
import { Home } from "lucide-react"; // Import Home icon
import { ModeToggle } from "./mode-toggle"

// Helper function to format segment names for display
function formatBreadcrumbSegment(segment: string): string {
  if (!segment) return "";
  // Replace hyphens with spaces and capitalize words
  return segment
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function TopNav() {
  const pathname = usePathname();
  const { settings } = useSettings();

  // Breadcrumb Logic
  const pathSegments = pathname.split('/').filter(Boolean);

  // Identify role segment (first segment)
  const roleSegment = pathSegments.length > 0 ? pathSegments[0] : null;
  // Filter out the role segment for breadcrumb display
  const displaySegments = pathSegments.slice(1);

  // Determine home link based on role
  let homeHref = "/"; // Default fallback
  if (roleSegment === 'business-actor') {
    homeHref = '/business-actor/dashboard';
  } else if (roleSegment === 'customer') {
    homeHref = '/customer/dashboard';
  } else if (roleSegment === 'super-admin') {
    homeHref = '/super-admin/dashboard';
  }


  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background backdrop-blur-sm"> {/* Reduced z-index, added blur */}
      <div className="container mx-auto flex h-16 max-w-screen-2xl items-center justify-between px-4 md:px-6"> {/* Use container */}
        {/* Breadcrumbs */}
        <div className="hidden items-center gap-1 text-sm md:flex">
          <Link href={homeHref} className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors">
            <Home className="h-4 w-4" />
            <span className="font-medium">Home</span>
          </Link>
          {displaySegments.filter((str, _) => str !== 'dashboard').map((segment, index) => {
            const href = `/${pathSegments.slice(0, index + 2).join("/")}`; // Build href including role segment
            const isLast = index === displaySegments.length - 1;
            return (
              <React.Fragment key={segment}>
                <span className="text-muted-foreground">/</span>
                {isLast ? (
                  <span className="font-medium text-foreground">
                    {formatBreadcrumbSegment(segment)}
                  </span>
                ) : (
                  <Link
                    href={href}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {formatBreadcrumbSegment(segment)}
                  </Link>
                )}
              </React.Fragment>
            )
          })}
        </div>

        {/* Right Side Actions */}
        <div className="flex flex-1 items-center justify-end gap-4"> {/* Ensure right alignment */}
          <Notifications />
          <ModeToggle /> {/* Use mode toggle from ui (check its implementation) */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full"> {/* Consistent size */}
                <Avatar className="h-8 w-8"> {/* Slightly smaller to fit button */}
                  <AvatarImage src={settings.avatar} alt={settings.fullName} />
                  <AvatarFallback>
                    {settings.fullName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <span className="sr-only">Open user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{settings.fullName}</p>
                  <p className="text-xs leading-none text-muted-foreground">{settings.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {/* <DropdownMenuItem asChild>
                 Adjust link based on role if settings is role-specific
                 <Link href={`${settingsHrefPrefix}/settings`}>Profile</Link>
               </DropdownMenuItem> */}
              <DropdownMenuItem asChild>
                <Link href="/settings">Settings</Link> {/* Assuming one settings page */}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                {/* Add Logout Logic */}
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
