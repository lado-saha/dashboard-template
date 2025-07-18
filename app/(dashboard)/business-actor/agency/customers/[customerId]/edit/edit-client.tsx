"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useActiveOrganization } from "@/contexts/active-organization-context";
import { organizationRepository } from "@/lib/data-repo/organization";
import { CustomerDto } from "@/types/organization";
import { CustomerForm, CustomerFormData } from "@/components/organization/customers/customer-form";
import { PageHeader } from "@/components/ui/page-header";
import { FeedbackCard } from "@/components/ui/feedback-card";
import { Loader2, Users } from "lucide-react";

interface EditClientProps { customerId: string; }

export function EditAgencyCustomerClientPage({ customerId }: EditClientProps) {
  const router = useRouter();
  const { activeOrganizationId, activeAgencyId } = useActiveOrganization();
  const [initialData, setInitialData] = useState<CustomerDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!activeOrganizationId || !activeAgencyId || !customerId) return;
    setIsLoading(true);
    try {
      const data = await organizationRepository.getAgencyCustomerById(activeOrganizationId, activeAgencyId, customerId);
      setInitialData(data);
    } catch (error) {
      toast.error("Failed to fetch customer details.");
      setInitialData(null);
    } finally {
      setIsLoading(false);
    }
  }, [activeOrganizationId, activeAgencyId, customerId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleUpdateAction = async (data: CustomerFormData): Promise<boolean> => {
    if (!activeOrganizationId || !activeAgencyId || !initialData?.customer_id) return false;
    setIsLoading(true);
    try {
      await organizationRepository.updateAgencyCustomer(activeOrganizationId, activeAgencyId, initialData.customer_id, data);
      toast.success("Customer updated successfully!");
      router.push("/business-actor/agency/customers");
      router.refresh();
      return true;
    } catch (error: any) {
      toast.error("Failed to update customer.", { description: error.message });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <div className="flex justify-center items-center min-h-[400px]"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  if (!initialData) return <FeedbackCard icon={Users} title="Customer Not Found" description="The customer you are trying to edit does not exist in this agency." />;
  
  return (
    <div className="space-y-6">
      <PageHeader title="Edit Customer" description={`Update details for ${initialData.first_name} ${initialData.last_name}`} />
      <CustomerForm
        mode="edit"
        initialData={initialData}
        onSubmitAction={handleUpdateAction}
        agencies={[]}
        isLoading={isLoading}
        scopedAgencyId={activeAgencyId}
      />
    </div>
  );
}
