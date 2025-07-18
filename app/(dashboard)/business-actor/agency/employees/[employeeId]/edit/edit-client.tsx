"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useActiveOrganization } from "@/contexts/active-organization-context";
import { organizationRepository } from "@/lib/data-repo/organization";
import { EmployeeDto } from "@/types/organization";
import {
  EmployeeForm,
  EmployeeFormData,
} from "@/components/organization/employees/employee-form";
import { PageHeader } from "@/components/ui/page-header";
import { FeedbackCard } from "@/components/ui/feedback-card";
import { Loader2, User } from "lucide-react";

interface EditClientProps {
  employeeId: string;
}

export function EditAgencyEmployeeClientPage({ employeeId }: EditClientProps) {
  const router = useRouter();
  const { activeOrganizationId, activeAgencyId, activeAgencyDetails } =
    useActiveOrganization();
  const [initialData, setInitialData] = useState<EmployeeDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!activeOrganizationId || !activeAgencyId || !employeeId) return;
    setIsLoading(true);
    try {
      const data = await organizationRepository.getAgencyEmployeeById(
        activeOrganizationId,
        activeAgencyId,
        employeeId
      );
      setInitialData(data);
    } catch (error) {
      toast.error("Failed to fetch employee details for this agency.");
      setInitialData(null);
    } finally {
      setIsLoading(false);
    }
  }, [activeOrganizationId, activeAgencyId, employeeId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleUpdateAction = async (
    data: EmployeeFormData
  ): Promise<boolean> => {
    if (!activeOrganizationId || !activeAgencyId || !initialData?.employee_id) {
      toast.error("Cannot update employee: Missing context or ID.");
      return false;
    }
    setIsLoading(true);
    try {
      await organizationRepository.updateAgencyEmployee(
        activeOrganizationId,
        activeAgencyId,
        initialData.employee_id,
        data
      );
      toast.success("Employee updated successfully!");
      router.push("/business-actor/agency/employees");
      router.refresh();
      return true;
    } catch (error: any) {
      toast.error("Failed to update employee.", { description: error.message });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!initialData) {
    return (
      <FeedbackCard
        icon={User}
        title="Employee Not Found"
        description="The employee you are trying to edit does not exist in this agency."
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Employee"
        description={`Update details for ${initialData.first_name} ${initialData.last_name}`}
      />
      <EmployeeForm
        agencies={activeAgencyDetails ? [activeAgencyDetails] : []}
        mode="edit"
        initialData={initialData}
        onSubmitAction={handleUpdateAction}
        scopedAgencyId={activeAgencyId}
      />
    </div>
  );
}
