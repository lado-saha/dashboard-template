"use client";

import React, { useEffect } from "react";
import { useActiveOrganization } from "@/contexts/active-organization-context";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

interface OrgLayoutProps {
  children: React.ReactNode;
}

export default function OrganizationLayout({ children }: OrgLayoutProps) {
  const { activeOrganizationId, isLoadingOrgDetails, isOrgContextInitialized } =
    useActiveOrganization();
  const router = useRouter();

  useEffect(() => {
    // If context is initialized and there's no active org, redirect to selection.
    if (isOrgContextInitialized && !activeOrganizationId) {
      router.replace("/business-actor/dashboard");
    }
  }, [activeOrganizationId, isOrgContextInitialized, router]);

  // While context is loading or if redirecting, show a loading skeleton.
  if (
    !isOrgContextInitialized ||
    !activeOrganizationId ||
    isLoadingOrgDetails
  ) {
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

  // Render the page content directly without any extra header or wrapper.
  return <div className="w-full">{children}</div>;
}
