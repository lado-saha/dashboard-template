"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { useActiveOrganization } from "@/contexts/active-organization-context";
import { organizationRepository } from "@/lib/data-repo/organization";
import {
  EmployeeForm,
  EmployeeFormData,
} from "@/components/organization/employees/employee-form";
import { PageHeader } from "@/components/ui/page-header";

export function CreateAgencyEmployeeClientPage() {
  const router = useRouter();
  const { activeOrganizationId, activeAgencyId, activeAgencyDetails } =
    useActiveOrganization();
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateAction = async (
    data: EmployeeFormData
  ): Promise<boolean> => {
    if (!activeOrganizationId || !activeAgencyId) {
      toast.error("No active agency selected.");
      return false;
    }
    setIsLoading(true);
    try {
      await organizationRepository.createAgencyEmployee(
        activeOrganizationId,
        activeAgencyId,
        data
      );
      toast.success("Employee created and assigned to agency successfully!");
      router.push("/business-actor/agency/employees");
      router.refresh();
      return true;
    } catch (error: any) {
      toast.error("Failed to create employee.", { description: error.message });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create New Agency Employee"
        description={`Add a new team member to ${
          activeAgencyDetails?.long_name || "this agency"
        }.`}
      />
      <EmployeeForm
        agencies={activeAgencyDetails ? [activeAgencyDetails] : []}
        mode="create"
        onSubmitAction={handleCreateAction}
        scopedAgencyId={activeAgencyId}
      />
    </div>
  );
}
