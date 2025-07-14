"use client";

import React, { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useActiveOrganization } from "@/contexts/active-organization-context";

export default function BusinessActorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status: sessionStatus } = useSession();
  const { isOrgContextInitialized } = useActiveOrganization();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Wait until session and org context are fully loaded to prevent premature redirects
    if (sessionStatus === "loading" || !isOrgContextInitialized) {
      return;
    }

    // If the user is not authenticated at all, send them to login.
    if (sessionStatus === "unauthenticated") {
      router.replace("/login");
      return;
    }

    // [THE FIX] The guard logic now includes an exception for the organization creation page.
    // A user is allowed into this layout if:
    // 1. They are already a Business Actor (have a businessActorId).
    // OR
    // 2. They are on the specific page to create their first organization.
    const isAllowed =
      !!session?.user.businessActorId ||
      pathname.startsWith("/business-actor/organization/create");

    if (!isAllowed) {
      toast.error(
        "Access denied. Create an organization to enter the business workspace."
      );
      router.replace("/dashboard");
    }
  }, [session, sessionStatus, router, isOrgContextInitialized, pathname]);

  // Show a loading state while verifying access.
  if (sessionStatus === "loading" || !isOrgContextInitialized) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-muted-foreground">
          Verifying business access...
        </p>
      </div>
    );
  }

  // Render the children. The useEffect handles redirection for unauthorized access.
  // We don't need to conditionally render here, as the redirect will prevent the wrong UI from being shown.
  return <>{children}</>;
}
