"use client";

import React, { useEffect } from "react";
import { useActiveOrganization } from "@/contexts/active-organization-context";
import { useRouter } from "next/navigation";
import { Building, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";

interface OrgLayoutProps {
  children: React.ReactNode;
}

export default function OrganizationLayout({ children }: OrgLayoutProps) {
  const {
    activeOrganizationId,
    activeOrganizationDetails,
    isLoadingOrgDetails,
    isOrgContextInitialized,
  } = useActiveOrganization();
  const router = useRouter();

  useEffect(() => {
    // If context is initialized and there's no active org, redirect to selection.
    if (isOrgContextInitialized && !activeOrganizationId) {
      router.replace("/business-actor/dashboard");
    }
  }, [activeOrganizationId, isOrgContextInitialized, router]);

  // While context is loading or if redirecting, show a loading state.
  if (
    !isOrgContextInitialized ||
    !activeOrganizationId ||
    isLoadingOrgDetails
  ) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center gap-4">
        {activeOrganizationDetails?.logo_url ? (
          <Image
            src={activeOrganizationDetails.logo_url}
            alt="Logo"
            width={48}
            height={48}
            className="h-12 w-12 rounded-lg object-cover border"
          />
        ) : (
          <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center border">
            <Building className="h-6 w-6 text-muted-foreground" />
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {activeOrganizationDetails?.long_name}
          </h1>
          <p className="text-muted-foreground">
            {activeOrganizationDetails?.short_name}
          </p>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
