"use client";
import React, { useState } from "react";
import { SalesPersonForm, SalesPersonFormData } from "@/components/organization/sales-people/sales-person-form";
import { useActiveOrganization } from "@/contexts/active-organization-context";
import { useRouter } from "next/navigation";
import { organizationRepository } from "@/lib/data-repo/organization";
import { toast } from "sonner";
import { PageHeader } from "@/components/ui/page-header";

export function CreateOrgSalesPersonClientPage() {
  const router = useRouter();
  const { activeOrganizationId, agenciesForCurrentOrg } = useActiveOrganization();
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = async (data: SalesPersonFormData): Promise<boolean> => {
    setIsLoading(true);
    if (!activeOrganizationId) {
      toast.error("No active organization selected.");
      setIsLoading(false);
      return false;
    }
    try {
      await organizationRepository.createOrgSalesPerson(activeOrganizationId, data);
      toast.success("Sales Person created successfully!");
      router.push("/business-actor/org/sales-people");
      router.refresh();
      return true;
    } catch (error: any) {
      toast.error(error.message || "Failed to create sales person.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Create New Sales Person" description="Add a new member to your organization's sales team." />
      <SalesPersonForm
        agencies={agenciesForCurrentOrg}
        mode="create"
        onSubmitAction={handleCreate}
        isLoading={isLoading}
      />
    </div>
  );
}
