"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useActiveOrganization } from "@/contexts/active-organization-context";
import { organizationRepository } from "@/lib/data-repo/organization";
import { ProviderDto } from "@/types/organization";
import { SupplierForm, SupplierFormData } from "@/components/organization/suppliers/supplier-form";
import { toast } from "sonner";
import { PageHeader } from "@/components/ui/page-header";
import { FeedbackCard } from "@/components/ui/feedback-card";
import { Loader2, Truck } from "lucide-react";

interface EditClientProps {
  providerId: string;
}

export function EditOrgSupplierClientPage({ providerId }: EditClientProps) {
  const router = useRouter();
  const { activeOrganizationId, agenciesForCurrentOrg } = useActiveOrganization();
  
  const [initialData, setInitialData] = useState<ProviderDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!activeOrganizationId || !providerId) return;
    setIsLoading(true);
    try {
      const data = await organizationRepository.getOrgSupplierById(activeOrganizationId, providerId);
      setInitialData(data);
    } catch (error) {
      toast.error("Failed to fetch supplier details.");
      setInitialData(null);
    } finally {
      setIsLoading(false);
    }
  }, [activeOrganizationId, providerId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleUpdate = async (data: SupplierFormData): Promise<boolean> => {
    if (!activeOrganizationId || !initialData?.provider_id) return false;
    setIsLoading(true);
    try {
      const updatedSupplier = await organizationRepository.updateOrgSupplier(activeOrganizationId, initialData.provider_id, data);
      if (data.agency_id !== initialData.agency_id) {
        await organizationRepository.affectSupplierToAgency(activeOrganizationId, data.agency_id!, { provider_id: updatedSupplier.provider_id });
      }
      toast.success("Supplier updated successfully!");
      router.push("/business-actor/org/suppliers");
      router.refresh();
      return true;
    } catch (error: any) {
      toast.error(error.message || "Failed to update supplier.");
      return false;
    } finally {
        setIsLoading(false);
    }
  };
  
  if (isLoading) {
    return <div className="flex justify-center items-center min-h-[400px]"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }
  if (!initialData) {
    return <FeedbackCard icon={Truck} title="Supplier Not Found" description="The supplier you are trying to edit does not exist." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Edit Supplier" description={`Update details for ${initialData.first_name} ${initialData.last_name}`} />
      <SupplierForm
        agencies={agenciesForCurrentOrg}
        mode="edit"
        initialData={initialData}
        onSubmitAction={handleUpdate}
        isLoading={isLoading}
      />
    </div>
  );
}
