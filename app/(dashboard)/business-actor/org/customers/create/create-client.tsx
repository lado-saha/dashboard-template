"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useActiveOrganization } from "@/contexts/active-organization-context";
import { organizationRepository } from "@/lib/data-repo/organization";
import { PageHeader } from "@/components/ui/page-header";
import { CustomerForm, CustomerFormData } from "@/components/organization/customers/customer-form";
import { CreateCustomerRequest } from "@/types/organization";

export function CreateCustomerClientPage() {
  const router = useRouter();
  const { activeOrganizationId, agenciesForCurrentOrg } = useActiveOrganization();
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateAction = async (data: CustomerFormData): Promise<boolean> => {
    if (!activeOrganizationId) {
      toast.error("No active organization selected.");
      return false;
    }
    setIsLoading(true);
    try {
      if (data.agency_id) {
        await organizationRepository.createAgencyCustomer(activeOrganizationId, data.agency_id, data as CreateCustomerRequest);
      } else {
        await organizationRepository.createOrgCustomer(activeOrganizationId, data as CreateCustomerRequest);
      }
      toast.success("Customer created successfully!");
      router.push("/business-actor/org/customers");
      router.refresh(); // Invalidate cache for the list page
      return true;
    } catch (error: any) {
      toast.error("Failed to create customer", { description: error.message });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Create New Customer" description="Add a new customer to start managing your client relationships." />
      <CustomerForm
        mode="create"
        onSubmitAction={handleCreateAction}
        agencies={agenciesForCurrentOrg}
        isLoading={isLoading}
      />
    </div>
  );
}
