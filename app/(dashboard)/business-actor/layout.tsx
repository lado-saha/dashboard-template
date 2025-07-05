"use client";

import React, { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useActiveOrganization } from "@/contexts/active-organization-context";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function BusinessActorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status: sessionStatus } = useSession();
  const { userOrganizations, isOrgContextInitialized } =
    useActiveOrganization();

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Wait until we have a definitive session status.
    if (sessionStatus === "loading") {
      return;
    }

    // 1. First Guard: Ensure the user is authenticated and is a Business Actor.
    if (sessionStatus === "authenticated") {
      if (
        !session.user.businessActorId &&
        pathname !== "/business-actor/onboarding"
      ) {
        toast.error("Access Denied: This area is for Business Actors only.");
        router.replace("/dashboard");
        return;
      }
    } else {
      // Unauthenticated
      router.replace("/login");
      return;
    }

    // 2. Second Guard: For a verified BA, ensure they have an organization.
    // This check runs only after the organization list has been loaded.
    if (isOrgContextInitialized && session.user.businessActorId) {
      if (
        userOrganizations.length === 0 &&
        pathname !== "/business-actor/organization/create"
      ) {
        // If they have no orgs, they MUST be on the creation page.
        // If they try to go anywhere else (e.g., /business-actor/dashboard), force them to create.
        toast.info("You must create an organization to continue.");
        router.replace("/business-actor/organization/create");
      }
    }
  }, [
    session,
    sessionStatus,
    router,
    userOrganizations,
    isOrgContextInitialized,
    pathname,
  ]);

  // Show a loading state while we verify the user's BA status and organization count.
  if (
    sessionStatus === "loading" ||
    (session?.user.businessActorId && !isOrgContextInitialized)
  ) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-muted-foreground">
          Verifying business access...
        </p>
      </div>
    );
  }

  // If all checks pass, render the requested child page.
  return <>{children}</>;
}
