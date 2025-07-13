"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search } from "lucide-react";
import { useActiveOrganization } from "@/contexts/active-organization-context";
import { UserNav } from "./user-nav";
import { ModeToggle } from "./mode-toggle";
import { Button } from "./ui/button";
import { signOut } from "next-auth/react";
import { DevRoleSwitcher } from "./dev/role-switcher";

interface TopNavProps {
  onOpenCommandPalette: () => void;
}

export function TopNav({ onOpenCommandPalette }: TopNavProps) {
  const pathname = usePathname();
  const { activeOrganizationDetails, activeAgencyDetails } = useActiveOrganization();

  const getBreadcrumbs = () => {
    const pathSegments = pathname.split("/").filter(Boolean);
    if (pathSegments.length === 0) return null;

    const breadcrumbs: React.ReactNode[] = [];
    let currentPath = "";

    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      let text = segment.replace(/-/g, " ");

      // Replace IDs with names from context
      if (segment === activeOrganizationDetails?.organization_id) {
        text = activeOrganizationDetails.short_name || "Organization";
      } else if (segment === activeAgencyDetails?.agency_id) {
        text = activeAgencyDetails.short_name || "Agency";
      }

      // Don't link the very last segment (the current page)
      const isLast = index === pathSegments.length - 1;

      breadcrumbs.push(
        <React.Fragment key={currentPath}>
          <span className="text-muted-foreground mx-1">/</span>
          {isLast ? (
            <span className="font-medium text-foreground capitalize">{text}</span>
          ) : (
            <Link href={currentPath} className="capitalize text-muted-foreground hover:text-foreground">
              {text}
            </Link>
          )}
        </React.Fragment>
      );
    });

    return (
      <>
        <Link href="/dashboard" className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground">
          <Home className="h-4 w-4" />
        </Link>
        {breadcrumbs}
      </>
    );
  };

  return (
    <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="hidden items-center gap-1.5 text-sm md:flex flex-wrap mr-4">
          {getBreadcrumbs()}
        </div>
        <div className="flex items-center gap-x-2">
          <DevRoleSwitcher />
          <Button variant="outline" size="sm" className="h-9 gap-2" onClick={onOpenCommandPalette}>
            <Search className="h-4 w-4" />
            <span className="hidden lg:inline-block">Search...</span>
            <kbd className="hidden lg:inline-block pointer-events-none select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
              <span className="text-xs">⌘</span>K
            </kbd>
          </Button>
          <ModeToggle />
          <UserNav onLogoutAction={() => signOut({ callbackUrl: "/login" })} />
        </div>
      </div>
    </header>
  );
}
