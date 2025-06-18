"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useActiveOrganization } from "@/contexts/active-organization-context";
import { Loader2, Briefcase, PlusCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function BusinessActorLandingPage() {
  const {
    activeOrganizationId,
    userOrganizations,
    isOrgContextInitialized,
    setActiveOrganization,
  } = useActiveOrganization();
  const router = useRouter();

  useEffect(() => {
    if (!isOrgContextInitialized) {
      return; // Wait for context to finish loading
    }

    // If an org is already active, redirect to its dashboard
    if (activeOrganizationId) {
      router.replace(`/business-actor/org/dashboard`);
      return;
    }

    // If no org is active, but user has orgs, make the first one active and redirect
    if (userOrganizations.length > 0) {
      const firstOrg = userOrganizations[0];
      if (firstOrg?.organization_id) {
        setActiveOrganization(firstOrg.organization_id, firstOrg as any).then(
          () => {
            router.replace(`/business-actor/org/dashboard`);
          }
        );
      }
    }

    // If no organizations exist, the component will render the "Create Org" prompt.
  }, [
    isOrgContextInitialized,
    activeOrganizationId,
    userOrganizations,
    router,
    setActiveOrganization,
  ]);

  // Loading state while context initializes
  if (!isOrgContextInitialized) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-muted-foreground">Loading your workspace...</p>
      </div>
    );
  }

  // Onboarding prompt for users with no organizations
  if (userOrganizations.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="text-center py-12 px-6 sm:px-10 max-w-lg shadow-lg animate-fade-in-up">
          <CardHeader>
            <Briefcase className="mx-auto h-16 w-16 text-primary mb-4" />
            <CardTitle className="text-2xl">Welcome, Business Actor!</CardTitle>
            <CardDescription className="text-base">
              You're all set up. Your next step is to create or join an
              organization to start managing your business.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button size="lg" asChild>
              <Link href="/business-actor/organization/create">
                <PlusCircle className="mr-2 h-5 w-5" /> Create Your First
                Organization
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Fallback loading state during redirects
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <p className="ml-4 text-muted-foreground">Preparing your dashboard...</p>
    </div>
  );
}
