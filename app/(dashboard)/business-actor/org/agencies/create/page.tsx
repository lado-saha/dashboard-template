"use client";

import { AgencyForm } from "@/components/organization/agencies/agency-form";
import { useActiveOrganization } from "@/contexts/active-organization-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Inbox } from "lucide-react";
import { AgencyDto } from "@/types/organization";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function CreateAgencyPage() {
  const router = useRouter();
  const {
    activeOrganizationId,
    isLoadingOrgDetails,
    fetchAgenciesForCurrentOrg,
  } = useActiveOrganization();

  const handleCreateSuccess = (newAgency: AgencyDto) => {
    toast.success(`Agency "${newAgency.short_name}" created successfully!`);
    // Refresh the agency list in the context so the main list page will be up-to-date
    fetchAgenciesForCurrentOrg();
    router.push("/business-actor/org/agencies");
  };

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
        <AgencyForm
          organizationId={activeOrganizationId}
          mode="create"
          onSuccessAction={handleCreateSuccess}
        />
      )}
    </div>
  );
}
