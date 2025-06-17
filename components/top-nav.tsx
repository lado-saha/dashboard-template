"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home } from "lucide-react"; // Removed Settings icon import as it's less relevant here now
import { signOut } from "next-auth/react";

import { Notifications } from "./notifications";
import { ModeToggle } from "./mode-toggle";
import { UserNav } from "./user-nav"; // UserNav now takes only onLogout
import { RoleSwitcher } from "./dev/role-switcher";
import { cn } from "@/lib/utils";

// Helper function (keep as is)
function formatBreadcrumbSegment(segment: string): string {
  if (!segment) return "";
  if (segment === "super-admin") return "Super Admin";
  if (segment === "business-actor") return "Business Actor";
  return segment
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

type Role = "business-actor" | "customer" | "super-admin";

export function TopNav() {
  const pathname = usePathname();

  // --- Breadcrumb and Role Logic (Still needed for breadcrumbs/home link) ---
  const pathSegments = pathname.split("/").filter(Boolean);
  let currentRole: Role | null = null;
  let homeHref = "/";

  if (pathSegments.length > 0) {
    const firstSegment = pathSegments[0] as Role;
    if (["business-actor", "customer", "super-admin"].includes(firstSegment)) {
      currentRole = firstSegment;
      homeHref = `/${firstSegment}/dashboard`;
      // settingsHrefPrefix is no longer needed for UserNav
    } else if (["settings", "help"].includes(firstSegment)) {
      homeHref = "/"; // Default home for shared pages
    }
  }

  const displaySegments = pathSegments.filter((segment, index) => {
    if (index === 0 && currentRole) return false;
    if (segment === "dashboard") return false;
    return true;
  });
  // --- End Breadcrumb and Role Logic ---

  // --- Logout Handler ---
  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
  };
  // --- End Logout Handler ---

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left Side: Breadcrumbs (No changes needed here) */}
        <div className="hidden items-center gap-1.5 text-sm md:flex flex-wrap mr-4">
          <Link
            href={homeHref}
            className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
          >
            <Home className="h-4 w-4" />
            {displaySegments.length === 0 && currentRole && (
              <span className="font-medium text-foreground">
                {formatBreadcrumbSegment(currentRole)}
              </span>
            )}
            {displaySegments.length === 0 && !currentRole && (
              <span className="font-medium text-foreground">Home</span>
            )}
          </Link>
          {(displaySegments.length > 0 ||
            (displaySegments.length === 0 && currentRole)) && (
            <span className="text-muted-foreground">/</span>
          )}
          {displaySegments.map((segment, index) => {
            const pathSoFar = currentRole
              ? [currentRole, ...displaySegments.slice(0, index + 1)]
              : displaySegments.slice(0, index + 1);
            const href = `/${pathSoFar.join("/")}`;
            const isLast = index === displaySegments.length - 1;
            return (
              <React.Fragment key={segment}>
                {isLast ? (
                  <span
                    className="font-medium text-foreground truncate max-w-[200px]"
                    title={formatBreadcrumbSegment(segment)}
                  >
                    {formatBreadcrumbSegment(segment)}
                  </span>
                ) : (
                  <Link
                    href={href}
                    className="text-muted-foreground hover:text-foreground transition-colors truncate max-w-[150px]"
                    title={formatBreadcrumbSegment(segment)}
                  >
                    {formatBreadcrumbSegment(segment)}
                  </Link>
                )}
                {!isLast && (
                  <span className="text-muted-foreground mx-1">/</span>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Mobile Title (No changes needed here) */}
        <div className="md:hidden">
          <span className="text-sm font-medium">
            {displaySegments.length > 0
              ? formatBreadcrumbSegment(
                  displaySegments[displaySegments.length - 1]
                )
              : currentRole
              ? formatBreadcrumbSegment(currentRole)
              : "Menu"}
          </span>
        </div>

        {/* Right Side: Actions */}
        <div className="flex items-center gap-x-3 sm:gap-x-4">
          <RoleSwitcher currentRole={currentRole} />
          <Notifications />
          <ModeToggle />
          {/* Updated UserNav call - no longer passing settingsHrefPrefix */}
          <UserNav onLogoutAction={handleLogout} />
        </div>
      </div>
    </header>
  );
}
