"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useActiveOrganization } from "@/contexts/active-organization-context";
import { Loader2 } from "lucide-react";

export default function BusinessActorDashboardRedirector() {
  const router = useRouter();
  // This page can now safely assume the user is a BA and userOrganizations will be populated.
  const {
    activeOrganizationId,
    userOrganizations,
    isOrgContextInitialized,
    setActiveOrganization,
  } = useActiveOrganization();

  useEffect(() => {
    // We only act once the organization list is ready.
    if (!isOrgContextInitialized) {
      return;
    }

    // If there's already an active org, go to its dashboard.
    if (activeOrganizationId) {
      router.replace(`/business-actor/dashboard`);
      return;
    }

    // If there's NO active org, but we have a list of them,
    // set the first one as active. This will cause a re-render
    // which will then trigger the condition above.
    if (userOrganizations.length > 0) {
      setActiveOrganization(
        userOrganizations[0].organization_id!,
        userOrganizations[0]
      );
    }
    // The case of `userOrganizations.length === 0` is now fully handled by the parent layout.
  }, [
    isOrgContextInitialized,
    activeOrganizationId,
    userOrganizations,
    setActiveOrganization,
    router,
  ]);

  // This page is a gateway, so it should always show a loading state while it does its job.
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <p className="mt-4 text-muted-foreground">
        Loading your business workspace...
      </p>
    </div>
  );
}
