"use client";

import { EmployeeForm } from "@/components/organization/employees/employee-form";
import { useActiveOrganization } from "@/contexts/active-organization-context";
import { useRouter } from "next/navigation";
import { organizationRepository } from "@/lib/data-repo/organization";
import { EmployeeFormData } from "@/components/organization/employees/employee-form";
import { toast } from "sonner";

export default function CreateAgencyEmployeePage() {
  const router = useRouter();
  const { activeOrganizationId, activeAgencyId, activeAgencyDetails } = useActiveOrganization();

  const handleCreate = async (data: EmployeeFormData): Promise<boolean> => {
    if (!activeOrganizationId || !activeAgencyId) {
      toast.error("No active agency selected.");
      return false;
    }
    try {
      await organizationRepository.createAgencyEmployee(activeOrganizationId, activeAgencyId, data);
      toast.success("Employee created and assigned to agency successfully!");
      router.push("/business-actor/agency/employees");
      router.refresh();
      return true;
    } catch (error: any) {
      toast.error(error.message || "Failed to create employee.");
      return false;
    }
  };

  return (
    <div className="mx-auto">
      <EmployeeForm
        agencies={activeAgencyDetails ? [activeAgencyDetails] : []}
        mode="create"
        onSubmitAction={handleCreate}
        scopedAgencyId={activeAgencyId} // Lock the form to the current agency
      />
    </div>
  );
}
