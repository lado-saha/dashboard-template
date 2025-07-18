"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { useActiveOrganization } from "@/contexts/active-organization-context";
import { organizationRepository } from "@/lib/data-repo/organization";
import { CustomerForm, CustomerFormData } from "@/components/organization/customers/customer-form";
import { PageHeader } from "@/components/ui/page-header";

export function CreateAgencyCustomerClientPage() {
  const router = useRouter();
  const { activeOrganizationId, activeAgencyId, activeAgencyDetails } = useActiveOrganization();
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateAction = async (data: CustomerFormData): Promise<boolean> => {
    if (!activeOrganizationId || !activeAgencyId) {
      toast.error("No active agency selected.");
      return false;
    }
    setIsLoading(true);
    try {
      await organizationRepository.createAgencyCustomer(activeOrganizationId, activeAgencyId, data);
      toast.success("Customer created successfully!");
      router.push("/business-actor/agency/customers");
      router.refresh();
      return true;
    } catch (error: any) {
      toast.error("Failed to create customer.", { description: error.message });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
        <PageHeader title="Create New Agency Customer" description={`Add a new customer to ${activeAgencyDetails?.long_name || 'this agency'}.`} />
        <CustomerForm
            mode="create"
            onSubmitAction={handleCreateAction}
            agencies={[]}
            isLoading={isLoading}
            scopedAgencyId={activeAgencyId}
        />
    </div>
  );
}
