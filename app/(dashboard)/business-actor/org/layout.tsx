"use client";

import React from "react";
import { useActiveOrganization } from "@/contexts/active-organization-context";
import { Skeleton } from "@/components/ui/skeleton";

export default function OrganizationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { activeOrganizationId, isLoadingOrgDetails } = useActiveOrganization();

  if (isLoadingOrgDetails) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-80" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  // If loading is finished but there's still no active org, show an empty state (or let child pages handle it).
  if (!activeOrganizationId) {
    // This can be a dedicated "Please select an organization" component.
    // For now, we let the child pages render their specific empty states.
    return <div className="w-full">{children}</div>;
  }

  return <div className="w-full">{children}</div>;
}
