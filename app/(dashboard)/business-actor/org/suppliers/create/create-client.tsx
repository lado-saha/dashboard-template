"use client";
import React, { useState } from "react";
import { SupplierForm, SupplierFormData } from "@/components/organization/suppliers/supplier-form";
import { useActiveOrganization } from "@/contexts/active-organization-context";
import { useRouter } from "next/navigation";
import { organizationRepository } from "@/lib/data-repo/organization";
import { toast } from "sonner";
import { PageHeader } from "@/components/ui/page-header";

export function CreateOrgSupplierClientPage() {
  const router = useRouter();
  const { activeOrganizationId, agenciesForCurrentOrg } = useActiveOrganization();
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = async (data: SupplierFormData): Promise<boolean> => {
    setIsLoading(true);
    if (!activeOrganizationId) {
      toast.error("No active organization selected.");
      setIsLoading(false);
      return false;
    }
    try {
      const createdSupplier = await organizationRepository.createOrgSupplier(activeOrganizationId, data);
      toast.success("Supplier created successfully!");
      router.push("/business-actor/org/suppliers");
      router.refresh();
      return true;
    } catch (error: any) {
      toast.error(error.message || "Failed to create supplier.");
      return false;
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Create New Supplier" description="Add a new supplier to your organization's network." />
      <SupplierForm
        agencies={agenciesForCurrentOrg}
        mode="create"
        onSubmitAction={handleCreate}
        isLoading={isLoading}
      />
    </div>
  );
}
