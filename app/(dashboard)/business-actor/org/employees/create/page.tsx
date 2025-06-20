"use client";

import { EmployeeForm } from "@/components/organization/employees/employee-form";
import { useActiveOrganization } from "@/contexts/active-organization-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Inbox } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function CreateEmployeePage() {
  const { activeOrganizationId, isLoadingOrgDetails } = useActiveOrganization();

  if (isLoadingOrgDetails) {
    return (
      <div>
        <Skeleton className="h-8 w-1/4 mb-6" />
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
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
      <EmployeeForm organizationId={activeOrganizationId} mode="create" />
    </div>
  );
}
