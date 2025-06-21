"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home } from "lucide-react";
import { signOut } from "next-auth/react";

import { Notifications } from "./notifications";
import { ModeToggle } from "./mode-toggle";
import { UserNav } from "./user-nav";
import { RoleSwitcher } from "./dev/role-switcher";
import { useActiveOrganization } from "@/contexts/active-organization-context";

function formatBreadcrumbSegment(segment: string): string {
  if (!segment) return "";
  if (segment === "super-admin") return "Super Admin";
  if (segment === "business-actor") return "Business Actor";
  if (segment === "org") return "Organization";
  return segment
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

type Role = "business-actor" | "customer" | "super-admin";

export function TopNav() {
  const pathname = usePathname();
  const { activeOrganizationDetails, activeAgencyDetails } =
    useActiveOrganization();

  const pathSegments = pathname.split("/").filter(Boolean);
  let currentRole: Role | null = null;
  let homeHref = "/";

  if (pathSegments.length > 0) {
    const firstSegment = pathSegments[0] as Role;
    if (["business-actor", "customer", "super-admin"].includes(firstSegment)) {
      currentRole = firstSegment;
      homeHref = `/${firstSegment}/dashboard`;
    }
  }

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  const getBreadcrumbs = () => {
    if (!currentRole) return null;

    if (pathname.startsWith("/business-actor/agency")) {
      const agencySegments = pathSegments.slice(2); // Skip 'business-actor' and 'agency'
      return (
        <>
          <Link
            href="/business-actor/agency/dashboard"
            className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
          >
            <Home className="h-4 w-4" />
          </Link>
          <span className="text-muted-foreground">/</span>
          <span
            className="font-medium text-foreground truncate max-w-[200px]"
            title={activeAgencyDetails?.short_name || "Agency"}
          >
            {activeAgencyDetails?.short_name || "Agency"}
          </span>
          {agencySegments.map((segment, index) => (
            <React.Fragment key={segment}>
              <span className="text-muted-foreground mx-1">/</span>
              <span className="font-medium text-foreground">
                {formatBreadcrumbSegment(segment)}
              </span>
            </React.Fragment>
          ))}
        </>
      );
    }

    if (pathname.startsWith("/business-actor/org")) {
      const orgSegments = pathSegments.slice(2); // Skip 'business-actor' and 'org'
      return (
        <>
          <Link
            href="/business-actor/dashboard"
            className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
          >
            <Home className="h-4 w-4" />
          </Link>
          <span className="text-muted-foreground">/</span>
          <span
            className="font-medium text-foreground truncate max-w-[200px]"
            title={activeOrganizationDetails?.short_name || "Organization"}
          >
            {activeOrganizationDetails?.short_name || "Organization"}
          </span>
          {orgSegments.map((segment, index) => (
            <React.Fragment key={segment}>
              <span className="text-muted-foreground mx-1">/</span>
              <span className="font-medium text-foreground">
                {formatBreadcrumbSegment(segment)}
              </span>
            </React.Fragment>
          ))}
        </>
      );
    }

    // Default breadcrumb for other role pages
    const displaySegments = pathSegments
      .slice(1)
      .filter((s) => s !== "dashboard");
    return (
      <>
        <Link
          href={homeHref}
          className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
        >
          <Home className="h-4 w-4" />
          <span className="font-medium text-foreground">
            {formatBreadcrumbSegment(currentRole)}
          </span>
        </Link>
        {displaySegments.map((segment) => (
          <React.Fragment key={segment}>
            <span className="text-muted-foreground mx-1">/</span>
            <span className="font-medium text-foreground">
              {formatBreadcrumbSegment(segment)}
            </span>
          </React.Fragment>
        ))}
      </>
    );
  };

  return (
    <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="hidden items-center gap-1.5 text-sm md:flex flex-wrap mr-4">
          {getBreadcrumbs()}
        </div>

        <div className="md:hidden">
          <span className="text-sm font-medium">
            {activeAgencyDetails?.short_name ||
              activeOrganizationDetails?.short_name ||
              formatBreadcrumbSegment(pathSegments[pathSegments.length - 1])}
          </span>
        </div>

        <div className="flex items-center gap-x-3 sm:gap-x-4">
          <RoleSwitcher currentRole={currentRole} />
          <Notifications />
          <ModeToggle />
          <UserNav onLogoutAction={handleLogout} />
        </div>
      </div>
    </header>
  );
}
