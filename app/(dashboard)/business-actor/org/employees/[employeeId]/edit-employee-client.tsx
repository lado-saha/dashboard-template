"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useActiveOrganization } from "@/contexts/active-organization-context";
import { organizationRepository } from "@/lib/data-repo/organization";
import { EmployeeDto } from "@/types/organization";
import { EmployeeForm, EmployeeFormData } from "@/components/organization/employees/employee-form";
import { toast } from "sonner";
import { FeedbackCard } from "@/components/ui/feedback-card";
import { User, Loader2 } from "lucide-react";

interface EditEmployeeClientPageProps {
  employeeId: string;
}

export function EditEmployeeClientPage({ employeeId }: EditEmployeeClientPageProps) {
  const router = useRouter();
  const { activeOrganizationId, agenciesForCurrentOrg } = useActiveOrganization();
  
  const [initialData, setInitialData] = useState<EmployeeDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!activeOrganizationId || !employeeId) return;
    setIsLoading(true);
    try {
      const data = await organizationRepository.getOrgEmployeeById(activeOrganizationId, employeeId);
      setInitialData(data);
    } catch (error) {
      toast.error("Failed to fetch employee details.");
      setInitialData(null);
    } finally {
      setIsLoading(false);
    }
  }, [activeOrganizationId, employeeId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleUpdate = async (data: EmployeeFormData): Promise<boolean> => {
    if (!activeOrganizationId || !initialData?.employee_id) {
      toast.error("Cannot update employee: Missing context or ID.");
      return false;
    }
    try {
      await organizationRepository.updateOrgEmployee(activeOrganizationId, initialData.employee_id, data);
      toast.success("Employee updated successfully!");
      router.push("/business-actor/org/employees");
      router.refresh();
      return true;
    } catch (error: any) {
      toast.error(error.message || "Failed to update employee.");
      return false;
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-[400px]"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (!initialData) {
    return <FeedbackCard icon={User} title="Employee Not Found" description="The employee you are trying to edit does not exist." />;
  }

  return (
    <div className="mx-auto">
      <EmployeeForm
        // organizationId={activeOrganizationId!}
        agencies={agenciesForCurrentOrg}
        mode="edit"
        initialData={initialData}
        onSubmitAction={handleUpdate}
      />
    </div>
  );
}