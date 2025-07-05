"use client";

import React, { useEffect } from "react";
import { useActiveOrganization } from "@/contexts/active-organization-context";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export default function OrganizationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { activeOrganizationId } =
    useActiveOrganization();

  // Show a loading skeleton while waiting for an active organization to be confirmed.
  if (!activeOrganizationId) {
    return (
      <div className="space-y-6">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Skeleton className="h-48 w-full" />
          </div>
          <div className="md:col-span-3">
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </div>
    );
  }

  // If an organization is active, render the page.
  return <div className="w-full">{children}</div>;
}
