"use client";

import React, { useState, useEffect } from "react";
// We will reuse the same form component for edit
import { AgencyForm } from "@/components/organization/agencies/agency-form";
import { useActiveOrganization } from "@/contexts/active-organization-context";
import { organizationRepository } from "@/lib/data-repo/organization";
import { AgencyDto } from "@/types/organization";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

export default function EditAgencyPage({
  params,
}: {
  params: { agencyId: string };
}) {
  const { activeOrganizationId } = useActiveOrganization();
  const [agencyData, setAgencyData] = useState<AgencyDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (activeOrganizationId && params.agencyId) {
      setIsLoading(true);
      organizationRepository
        .getAgencyById(activeOrganizationId, params.agencyId)
        .then((data) => {
          if (data) {
            setAgencyData(data);
          } else {
            setError("Agency not found.");
          }
        })
        .catch(() => setError("Failed to fetch agency details."))
        .finally(() => setIsLoading(false));
    }
  }, [activeOrganizationId, params.agencyId]);

  if (isLoading) {
    return (
      <div>
        <Skeleton className="h-8 w-1/4 mb-6" />
        <Skeleton className="h-[500px] w-full" />
      </div>
    );
  }

  if (error || !agencyData) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center gap-2">
            <AlertTriangle /> Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>{error || "The agency could not be loaded."}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight mb-6">
        Edit Agency: {agencyData.short_name}
      </h1>
      {/* The form for editing will be implemented in a future step, similar to the create form. */}
      <p className="p-8 border-2 border-dashed rounded-lg text-center">
        Edit Form for Agency will be placed here.
      </p>
    </div>
  );
}
