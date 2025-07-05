"use client";

import { EmployeeForm } from "@/components/organization/employees/employee-form";
import { useActiveOrganization } from "@/contexts/active-organization-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Inbox } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";

export default function CreateEmployeePage() {
  const router = useRouter();
  const { activeOrganizationId, isLoadingOrgDetails } = useActiveOrganization();

  const handleSuccess = () => {
    // No need to show toast here, form does it. Just navigate back.
    router.push("/business-actor/org/employees");
    router.refresh(); // Tell Next.js to re-fetch the list on the previous page.
  };

  if (isLoadingOrgDetails) {
    return (
      <div>
        <Skeleton className="h-8 w-1/4 mb-6" />
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-[500px] w-full" />
        </div>
      </div>
    );
  }

  if (!activeOrganizationId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Organization Selected</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center text-center p-10">
          <Inbox className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            Please select an active organization before creating an employee.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className=" mx-auto">
      <EmployeeForm
        organizationId={activeOrganizationId}
        mode="create"
        onSuccessAction={handleSuccess}
      />
    </div>
  );
}
