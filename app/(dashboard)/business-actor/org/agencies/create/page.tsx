"use client";

import { AgencyForm } from "@/components/organization/agencies/agency-form";
import { useActiveOrganization } from "@/contexts/active-organization-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Inbox } from "lucide-react";

export default function CreateAgencyPage() {
  const { activeOrganizationId, isLoadingOrgDetails } = useActiveOrganization();

  if (!activeOrganizationId && !isLoadingOrgDetails) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Organization Selected</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center text-center p-10">
          <Inbox className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            Please select an active organization before creating an agency.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight mb-6">
        Create New Agency
      </h1>
      {activeOrganizationId && (
        <AgencyForm organizationId={activeOrganizationId} />
      )}
    </div>
  );
}
