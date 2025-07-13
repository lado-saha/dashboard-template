"use client";

import React from 'react';
import { useSession } from "next-auth/react";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ArrowRight, Building, Loader2, LifeBuoy, Settings } from 'lucide-react';
import { useActiveOrganization } from '@/contexts/active-organization-context';

export default function UserDashboardPage() {
  const { data: session, status } = useSession();
  const { userOrganizations, isLoadingUserOrgs } = useActiveOrganization();

  if (status === 'loading' || (session?.user?.businessActorId && isLoadingUserOrgs)) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-muted-foreground">Loading Dashboard...</p>
      </div>
    );
  }

  const isBusinessActor = !!session?.user.businessActorId;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome, {session?.user.first_name || "User"}!</h1>
          <p className="text-muted-foreground">This is your personal space. Manage your settings or jump into your business workspace.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {isBusinessActor ? (
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Building className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Business Workspace</CardTitle>
              <CardDescription>You have {userOrganizations.length} organization(s). Jump in to manage your business operations.</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button asChild>
                <Link href="/business-actor/organizations">Enter Workspace <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <Card className="border-primary/50 hover:shadow-lg transition-shadow">
            <CardHeader>
              <Building className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Become a Business Actor</CardTitle>
              <CardDescription>Unlock powerful tools to manage your organization, list services, and grow your business.</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button asChild>
                <Link href="/business-actor/onboarding">Get Started <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </CardFooter>
          </Card>
        )}

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <Settings className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Account Settings</CardTitle>
            <CardDescription>Manage your personal profile, notification preferences, and account security.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild variant="outline">
              <Link href="/settings">Go to Settings</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      <Card>
        <CardHeader>
            <LifeBuoy className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Need Help?</CardTitle>
            <CardDescription>Find answers to common questions or get in touch with our support team.</CardDescription>
        </CardHeader>
        <CardFooter>
            <Button asChild variant="secondary">
                <Link href="/help">Visit Help Center</Link>
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
