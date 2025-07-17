"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useActiveOrganization } from "@/contexts/active-organization-context";
import { organizationRepository } from "@/lib/data-repo/organization";
import { SalesPersonDto } from "@/types/organization";
import { SalesPersonForm, SalesPersonFormData } from "@/components/organization/sales-people/sales-person-form";
import { toast } from "sonner";
import { PageHeader } from "@/components/ui/page-header";
import { FeedbackCard } from "@/components/ui/feedback-card";
import { Loader2, UserCheck } from "lucide-react";

interface EditClientProps {
  salesPersonId: string;
}

export function EditOrgSalesPersonClientPage({ salesPersonId }: EditClientProps) {
  const router = useRouter();
  const { activeOrganizationId, agenciesForCurrentOrg } = useActiveOrganization();
  
  const [initialData, setInitialData] = useState<SalesPersonDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!activeOrganizationId || !salesPersonId) return;
    setIsLoading(true);
    try {
      const data = await organizationRepository.getOrgSalesPersonById(activeOrganizationId, salesPersonId);
      setInitialData(data);
    } catch (error) {
      toast.error("Failed to fetch sales person details.");
      setInitialData(null);
    } finally {
      setIsLoading(false);
    }
  }, [activeOrganizationId, salesPersonId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleUpdate = async (data: SalesPersonFormData): Promise<boolean> => {
    if (!activeOrganizationId || !initialData?.sales_person_id) return false;
    setIsLoading(true);
    try {
      await organizationRepository.updateOrgSalesPerson(activeOrganizationId, initialData.sales_person_id, data);
      toast.success("Sales Person updated successfully!");
      router.push("/business-actor/org/sales-people");
      router.refresh();
      return true;
    } catch (error: any) {
      toast.error(error.message || "Failed to update sales person.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <div className="flex justify-center items-center min-h-[400px]"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  if (!initialData) return <FeedbackCard icon={UserCheck} title="Sales Person Not Found" description="The person you are trying to edit does not exist." />;

  return (
    <div className="space-y-6">
      <PageHeader title="Edit Sales Person" description={`Update details for ${initialData.name}`} />
      <SalesPersonForm
        agencies={agenciesForCurrentOrg}
        mode="edit"
        initialData={initialData}
        onSubmitAction={handleUpdate}
        isLoading={isLoading}
      />
    </div>
  );
}
