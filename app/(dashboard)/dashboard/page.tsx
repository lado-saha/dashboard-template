"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useActiveOrganization } from "@/contexts/active-organization-context";
import { useSession } from "next-auth/react";
import { Loader2, ArrowRight, Building2, Briefcase, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useSettings } from "@/contexts/settings-context";

export default function DashboardRedirectPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  // For BAs, we need the organization context to decide where to go next
  const { userOrganizations, isOrgContextInitialized, setActiveOrganization } = useActiveOrganization();

  // For Normal Users, we use the settings context for a personalized welcome
  const { settings } = useSettings();

  useEffect(() => {
    // Wait until both session and organization context are initialized
    if (status !== 'authenticated' || !isOrgContextInitialized) {
      return; // Do nothing while loading
    }

    // Check if the user is a Business Actor
    if (session.user.businessActorId) {
      if (userOrganizations.length > 0) {
        // If they have orgs, try to set one active and go to its dashboard
        const firstOrg = userOrganizations[0];
        if (firstOrg?.organization_id) {
          setActiveOrganization(firstOrg.organization_id, firstOrg as any).then(() => {
            router.replace(`/business-actor/org/dashboard`);
          });
        }
      } else {
        // If they are a BA but have no orgs, they MUST create one
        router.replace(`/business-actor/organization/create`);
      }
    }
    // If not a BA, they stay on this page, which will render the "Normal User" view.
  }, [status, session, isOrgContextInitialized, userOrganizations, router, setActiveOrganization]);

  // Loading state for all users
  if (status === 'loading' || !isOrgContextInitialized) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-muted-foreground">Loading your workspace...</p>
      </div>
    );
  }

  // This view is only for Normal Users (non-BAs). BAs will be redirected by the useEffect.
  if (status === 'authenticated' && !session.user.businessActorId) {
    return (
      <div className="space-y-8">
        <div className="text-center px-4 pt-8">
          <h1 className="text-3xl font-bold tracking-tight">Welcome, {settings.fullName || "User"}!</h1>
          <p className="text-muted-foreground mt-2 max-w-xl mx-auto">This is your personal account dashboard. Manage your profile or upgrade to unlock powerful business tools.</p>
        </div>
        <Card className="max-w-2xl mx-auto shadow-lg border-primary/20 animate-fade-in-up">
          <CardHeader>
            <CardTitle className="flex items-center gap-3"><Building2 className="h-6 w-6 text-primary" />Become a Business Actor</CardTitle>
            <CardDescription>
              Unlock the full potential of the platform by creating a professional profile. Manage organizations, products, services, and much more.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">By becoming a Business Actor, you gain access to a dedicated workspace designed for professionals and entrepreneurs.</p>
          </CardContent>
          <CardFooter>
            <Button asChild className="group w-full sm:w-auto">
              <Link href="/business-actor/onboarding">
                <PlusCircle className="mr-2 h-4 w-4" /> Start Professional Onboarding <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Fallback content, should ideally not be reached if logic is correct
  return null;
}