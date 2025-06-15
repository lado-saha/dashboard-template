"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useActiveOrganization } from "@/contexts/active-organization-context";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  PlusCircle,
  Building,
  ArrowRight,
  AlertTriangle,
  Briefcase,
} from "lucide-react";
import { OrganizationTableRow } from "@/lib/types/organization";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";

export default function BusinessActorDashboardPage() {
  const {
    userOrganizations,
    isLoadingUserOrgs,
    setActiveOrganization,
    activeOrganizationId,
    activeOrganizationDetails,
  } = useActiveOrganization();
  const router = useRouter();

  const handleSelectOrganization = (org: OrganizationTableRow) => {
    if (org.organization_id) {
      // The setActiveOrganization will also trigger fetching details if not provided
      setActiveOrganization(org.organization_id, org as any); // Cast if OrganizationTableRow is subset of OrganizationDto
      router.push(
        `/business-actor/organization/${org.organization_id}/profile`
      );
    }
  };

  if (isLoadingUserOrgs) {
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-10 w-1/3" />
          <Skeleton className="h-10 w-36" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2 mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3 mt-2" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-9 w-24" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Attempt to show currently active organization details if available
  if (activeOrganizationId && activeOrganizationDetails) {
    // This could be a summary card of the active org with a link to manage it fully
    // For now, let's assume if an org is active, the user might want to see the list or create another.
    // Or, we could redirect them directly to the org's profile if that's the desired UX.
    // For this example, we'll still show the list.
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Your Organizations
          </h1>
          <p className="text-muted-foreground">
            Select an organization to manage or create a new one.
          </p>
        </div>
        <Button asChild>
          <Link href="/business-actor/organization/create">
            <PlusCircle className="mr-2 h-4 w-4" /> Create New Organization
          </Link>
        </Button>
      </div>

      {userOrganizations.length === 0 && !isLoadingUserOrgs && (
        <Card className="text-center py-12">
          <CardHeader>
            <Briefcase className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <CardTitle className="text-2xl">No Organizations Found</CardTitle>
            <CardDescription>
              You haven't created or joined any organizations yet. <br />
              Get started by creating your first one.
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
      )}

      {userOrganizations.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {userOrganizations.map((org) => (
            <Card
              key={org.organization_id}
              className="flex flex-col hover:shadow-lg transition-shadow"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  <div className="relative h-12 w-12 flex-shrink-0">
                    <Image
                      src={org.logo_url || "/placeholder.svg"}
                      alt={org.short_name || "Org Logo"}
                      fill
                      className="rounded-md object-cover"
                    />
                  </div>
                  <div>
                    <CardTitle className="text-lg line-clamp-1">
                      {org.long_name || org.short_name}
                    </CardTitle>
                    <CardDescription className="text-xs line-clamp-1">
                      {org.email}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px]">
                  {org.description || "No description available."}
                </p>
                {org.status && (
                  <Badge
                    variant={org.status === "ACTIVE" ? "default" : "secondary"}
                    className="mt-2 capitalize"
                  >
                    {org.status.toLowerCase().replace("_", " ")}
                  </Badge>
                )}
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  onClick={() => handleSelectOrganization(org)}
                >
                  Manage Organization <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
