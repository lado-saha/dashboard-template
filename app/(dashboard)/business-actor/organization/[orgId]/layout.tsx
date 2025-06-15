"use client";

import React, { useEffect, ReactNode } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useActiveOrganization } from "@/contexts/active-organization-context";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Building,
  LayoutDashboard,
  Package,
  Users,
  Briefcase,
  Settings,
  BarChart2,
  ShieldCheckIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface OrgLayoutProps {
  children: ReactNode;
  params: { orgId: string }; // Next.js 13+ passes params directly
}

const orgNavItems = [
  { name: "Profile & Details", href: "profile", icon: Building },
  { name: "Products & Services", href: "products", icon: Package },
  { name: "Agencies", href: "agencies", icon: Briefcase },
  { name: "Personnel", href: "personnel", icon: Users },
  { name: "Partners (CRM)", href: "partners", icon: Users }, // Placeholder icon
  { name: "Settings", href: "settings", icon: Settings }, // Org-specific settings
  { name: "Analytics", href: "analytics", icon: BarChart2 },
];

export default function OrganizationManagementLayout({
  children,
  params,
}: OrgLayoutProps) {
  const { orgId } = params;
  // Note: In a Client Component, you cannot "await" params directly.
  // If you need to fetch data based on params asynchronously, you should do it in a Server Component or useEffect.
  // Here, we keep using the hook as before:
  const {
    activeOrganizationId,
    activeOrganizationDetails,
    fetchActiveOrganizationDetails,
    isLoadingOrgDetails,
    setActiveOrganization,
    userOrganizations,
  } = useActiveOrganization();
  const router = useRouter();
  const currentPathname = usePathname();

  useEffect(() => {
    if (orgId && orgId !== activeOrganizationId) {
      setActiveOrganization(orgId);
    } else if (orgId && !activeOrganizationDetails && !isLoadingOrgDetails) {
      // If activeOrganizationId is set from URL but details are not loaded yet
      fetchActiveOrganizationDetails(orgId);
    }
  }, [
    orgId,
    activeOrganizationId,
    setActiveOrganization,
    activeOrganizationDetails,
    isLoadingOrgDetails,
    fetchActiveOrganizationDetails,
  ]);

  // Redirect if orgId is invalid or not found after loading attempt
  useEffect(() => {
    if (
      !isLoadingOrgDetails &&
      orgId &&
      !activeOrganizationDetails &&
      userOrganizations.length > 0
    ) {
      const orgExists = userOrganizations.some(
        (org) => org.organization_id === orgId
      );
      if (!orgExists) {
        // console.warn(`Organization ID ${orgId} not found or not accessible. Redirecting.`);
        // router.replace('/business-actor/dashboard'); // Or show a "not found" specific to org
      }
    }
  }, [
    isLoadingOrgDetails,
    orgId,
    activeOrganizationDetails,
    router,
    userOrganizations,
  ]);

  if (isLoadingOrgDetails && !activeOrganizationDetails) {
    return (
      <div className="container mx-auto py-8">
        <Skeleton className="h-10 w-1/3 mb-4" />
        <Skeleton className="h-8 w-full mb-6" />
        <div className="p-6 border rounded-lg">
          <Skeleton className="h-[300px] w-full" />
        </div>
      </div>
    );
  }

  if (!activeOrganizationDetails && !isLoadingOrgDetails && orgId) {
    return (
      <div className="container mx-auto py-8 text-center">
        <p className="text-destructive mb-4">
          Organization (ID: {orgId}) not found or you do not have access.
        </p>
        <Button onClick={() => router.push("/business-actor/dashboard")}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const baseOrgPath = `/business-actor/organization/${orgId}`;

  return (
    <div className="container mx-auto py-6 sm:py-8">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <Button variant="outline" size="sm" asChild className="mb-3 sm:mb-4">
            <Link href="/business-actor/dashboard">
              <ArrowLeft className="mr-3 h-4 w-4" />
              Back to Organizations
            </Link>
          </Button>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center mt-1">
            <Building className="mr-3 h-7 w-7 text-primary flex-shrink-0" />
            {activeOrganizationDetails?.long_name ||
              activeOrganizationDetails?.short_name ||
              "Organization"}
          </h1>
          <p className="text-sm text-muted-foreground ml-10">
            {activeOrganizationDetails?.description
              ? activeOrganizationDetails.description.substring(0, 70) + "..."
              : "Manage your organization details and operations."}
          </p>
        </div>
        {activeOrganizationDetails?.status && (
          <Badge
            variant={
              activeOrganizationDetails.status === "ACTIVE"
                ? "default"
                : "secondary"
            }
            className="capitalize text-sm px-3 py-1 self-start sm:self-center"
          >
            {activeOrganizationDetails.status.toLowerCase().replace("_", " ")}
          </Badge>
        )}
      </div>

      {/* Secondary Navigation (Tabs for now) */}
      <div className="mb-6 sm:mb-8 border-b">
        <nav
          className="-mb-px flex space-x-4 sm:space-x-6 overflow-x-auto pb-0.5 scrollbar-hide"
          aria-label="Tabs"
        >
          {orgNavItems.map((item) => {
            const itemPath = `${baseOrgPath}/${item.href}`;
            const isActive =
              currentPathname === itemPath ||
              (item.href === "profile" && currentPathname === baseOrgPath); // Handle base path as profile
            return (
              <Link
                key={item.name}
                href={itemPath}
                className={cn(
                  "group inline-flex items-center whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm",
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300 dark:hover:border-gray-700"
                )}
              >
                <item.icon
                  className={cn(
                    "mr-2 h-4 w-4",
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground group-hover:text-foreground"
                  )}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div>{children}</div>
    </div>
  );
}
