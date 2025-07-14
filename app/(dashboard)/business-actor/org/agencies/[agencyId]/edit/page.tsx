"use client";

import React, { useState, useEffect } from "react";
import { AgencyForm } from "@/components/organization/agencies/agency-form";
import { useActiveOrganization } from "@/contexts/active-organization-context";
import { organizationRepository } from "@/lib/data-repo/organization";
import { AgencyDto } from "@/types/organization";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default async function EditAgencyPage({
  params,
}: {
  params: Promise<{ agencyId: string }>;
}) {
  const { activeOrganizationId, fetchAgenciesForCurrentOrg } =
    useActiveOrganization();
  const [agencyData, setAgencyData] = useState<AgencyDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { agencyId } = await params;

  useEffect(() => {
    if (activeOrganizationId && agencyId) {
      setIsLoading(true);
      organizationRepository
        .getAgencyById(activeOrganizationId, agencyId)
        .then((data) => {
          if (data) setAgencyData(data);
          else setError("Agency not found.");
        })
        .catch(() => setError("Failed to fetch agency details."))
        .finally(() => setIsLoading(false));
    }
  }, [activeOrganizationId, agencyId]);

  const handleSuccessAction = (updatedAgency: AgencyDto) => {
    toast.success(`Agency "${updatedAgency.short_name}" updated successfully!`);
    // Refresh the agency list in the context so the main list page will be up-to-date
    fetchAgenciesForCurrentOrg();
    router.push("/business-actor/org/agencies");
  };

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
      <AgencyForm
        organizationId={activeOrganizationId!}
        mode="edit"
        initialData={agencyData}
        onSuccessAction={handleSuccessAction}
      />
    </div>
  );
}
