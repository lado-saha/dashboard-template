// FILE: components/top-nav.tsx
"use client"

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home } from "lucide-react";

import { Notifications } from "./notifications";
// import { ModeToggle } from "./mode-toggle"; // No longer needed here
import { UserNav } from "./user-nav";
import { cn } from "@/lib/utils";
import { ModeToggle } from "./mode-toggle";

// Helper function (keep as is)
function formatBreadcrumbSegment(segment: string): string {
  if (!segment) return "";
  return segment
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function TopNav() {
  const pathname = usePathname();

  // --- Breadcrumb and Role Logic (Keep as is) ---
  const pathSegments = pathname.split('/').filter(Boolean);
  const roleSegment = pathSegments.length > 0 ? pathSegments[0] : null;
  const displaySegments = pathSegments.slice(1).filter(segment => segment !== 'dashboard');

  let homeHref = "/";
  let settingsHrefPrefix = "/";

  if (roleSegment === 'business-actor') {
    homeHref = '/business-actor/dashboard';
    settingsHrefPrefix = '/business-actor';
  } else if (roleSegment === 'customer') {
    homeHref = '/customer/dashboard';
    settingsHrefPrefix = '/customer';
  } else if (roleSegment === 'super-admin') {
    homeHref = '/super-admin/dashboard';
    settingsHrefPrefix = '/super-admin';
  }
  // --- End Breadcrumb and Role Logic ---


  // --- Logout Handler (Keep as is) ---
  const handleLogout = () => {
    console.log("Logout action triggered!");
    alert("Logout functionality not yet implemented.");
  };
  // --- End Logout Handler ---

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* Left Side: Breadcrumbs (Keep as is) */}
        <div className="hidden items-center gap-1 text-sm md:flex">
          {/* ... breadcrumbs code ... */}
          <Link href={homeHref} className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors">
            <Home className="h-4 w-4" />
            {displaySegments.length === 0 && (
              <span className="font-medium">Home</span>
            )}
          </Link>
          {displaySegments.length > 0 && <span className="text-muted-foreground">/</span>}
          {displaySegments.map((segment, index) => {
            const currentPathSegments = [roleSegment, ...displaySegments.slice(0, index + 1)].filter(Boolean);
            const href = `/${currentPathSegments.join("/")}`;
            const isLast = index === displaySegments.length - 1;
            return (
              <React.Fragment key={segment}>
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
                {!isLast && <span className="text-muted-foreground">/</span>}
              </React.Fragment>
            )
          })}
        </div>

        {/* Mobile Placeholder (Keep as is) */}
        <div className="md:hidden">
          <span className="text-sm font-medium">
            {displaySegments.length > 0
              ? formatBreadcrumbSegment(displaySegments[displaySegments.length - 1])
              : (roleSegment ? formatBreadcrumbSegment(roleSegment) : "Dashboard")
            }
          </span>
        </div>

        {/* Right Side: Actions */}
        <div className="flex items-center gap-x-4">
          <Notifications />
          <ModeToggle />
          <UserNav
            settingsHrefPrefix={settingsHrefPrefix}
            onLogout={handleLogout}
          />
        </div>
      </div>
    </header>
  );
}
