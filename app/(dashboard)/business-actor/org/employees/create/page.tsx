"use client";

import { EmployeeForm } from "@/components/organization/employees/employee-form";
import { useActiveOrganization } from "@/contexts/active-organization-context";
import { useRouter } from "next/navigation";
import { organizationRepository } from "@/lib/data-repo/organization";
import { EmployeeFormData } from "@/components/organization/employees/employee-form";
import { toast } from "sonner";
import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";

export default function CreateEmployeePage() {
  const router = useRouter();
  const { activeOrganizationId, agenciesForCurrentOrg } =
    useActiveOrganization();
  const [isLoading, setIsLoading] = useState(false);

  // REASON: This handler is now completely rewritten to support the two-step
  // create-then-affect process for agency assignment.
  const handleCreate = async (data: EmployeeFormData): Promise<boolean> => {
    if (!activeOrganizationId) {
      toast.error("No active organization selected.");
      return false;
    }

    setIsLoading(true);
    let createdEmployeeId: string | undefined;

    try {
      // Step 1: Always create the employee at the organization level first.
      // We pass a version of the data without the agency_id, as the create endpoint
      // does not handle the assignment directly.
      const { agency_id, ...employeeData } = data;

      const creationPromise = organizationRepository.createOrgEmployee(
        activeOrganizationId,
        employeeData
      );

      const createdEmployeeResponse = await toast
        .promise(creationPromise, {
          loading: "Creating employee record...",
          success: (res) => {
            createdEmployeeId = res.employee_id;
            return `Employee ${res.first_name} created successfully!`;
          },
          error: "Failed to create employee record.",
        })
        .unwrap();

      // Step 2: If an agency was selected, affect the new employee to that agency.
      if (agency_id && createdEmployeeResponse.employee_id) {
        const affectPromise = organizationRepository.affectEmployeeToAgency(
          activeOrganizationId,
          agency_id,
          { employee_id: createdEmployeeResponse.employee_id }
        );

        await toast.promise(affectPromise, {
          loading: `Assigning employee to agency...`,
          success: `Successfully assigned to agency.`,
          error: "Failed to assign to agency.",
        });
      }

      // Final success step
      toast.success("Employee setup complete!");
      router.push("/business-actor/org/employees");
      router.refresh();
      return true;
    } catch (error: any) {
      // The toast.promise handles individual error messages,
      // this is a fallback for unexpected failures.
      toast.error("An unexpected error occurred.", {
        description: error.message,
      });

      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create New Employee"
        description="Add a new member to your organization's team."
      />
      <EmployeeForm
        agencies={agenciesForCurrentOrg}
        mode="create"
        onSubmitAction={handleCreate}
        // Pass isLoading state to the form wrapper
        // isLoading={isLoading}
      />
    </div>
  );
}
