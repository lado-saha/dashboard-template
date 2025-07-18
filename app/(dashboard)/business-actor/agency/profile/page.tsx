"use client";

import React from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useActiveOrganization } from "@/contexts/active-organization-context";
import { organizationRepository } from "@/lib/data-repo/organization";
import { AgencyDto } from "@/types/organization";
import { AgencyForm } from "@/components/organization/agencies/agency-form";
import { PageHeader } from "@/components/ui/page-header";
import { FeedbackCard } from "@/components/ui/feedback-card";
import { Building, Loader2 } from "lucide-react";

export default function AgencyProfilePage() {
  const router = useRouter();
  const { 
    activeOrganizationId, 
    activeAgencyDetails, 
    isLoadingAgencyDetails,
    fetchAgenciesForCurrentOrg 
  } = useActiveOrganization();

  const handleSuccessAction = (updatedAgency: AgencyDto) => {
    toast.success(`Agency "${updatedAgency.short_name}" updated successfully!`);
    fetchAgenciesForCurrentOrg(); // Refresh context list
    router.push("/business-actor/agency/dashboard");
  };
  
  if (isLoadingAgencyDetails) {
      return <div className="flex justify-center items-center min-h-[400px]"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (!activeAgencyDetails) {
    return (
      <FeedbackCard
        icon={Building}
        title="No Active Agency"
        description="Please select an agency from the switcher to view its profile."
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Agency Profile"
        description={`Update the details for ${activeAgencyDetails.long_name}`}
      />
      <AgencyForm
        organizationId={activeOrganizationId!}
        mode="edit"
        initialData={activeAgencyDetails}
        onSuccessAction={handleSuccessAction}
      />
    </div>
  );
}
