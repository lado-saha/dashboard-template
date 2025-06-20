"use client";

import React, { useState, useEffect, use } from "react";
import { EmployeeForm } from "@/components/organization/employees/employee-form";
import { useActiveOrganization } from "@/contexts/active-organization-context";
import { organizationRepository } from "@/lib/data-repo/organization";
import { EmployeeDto } from "@/types/organization";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, Inbox } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useParams } from "next/navigation";

export default function EditEmployeePage() {
  const { employeeId }: { employeeId: string } = useParams();
  const { activeOrganizationId } = useActiveOrganization();
  const [employeeData, setEmployeeData] = useState<EmployeeDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // THE FIX: Use the destructured employeeId variable.
    if (activeOrganizationId && employeeId) {
      setIsLoading(true);
      setError(null);
      organizationRepository
        .getOrgEmployeeById(activeOrganizationId, employeeId)
        .then((data) => {
          if (data) {
            setEmployeeData(data);
          } else {
            setError("Employee not found.");
          }
        })
        .catch(() => setError("Failed to fetch employee details."))
        .finally(() => setIsLoading(false));
    }
    // THE FIX: Update the dependency array.
  }, [activeOrganizationId, employeeId]);

  if (isLoading) {
    return (
      <div className=" mx-auto">
        <Skeleton className="h-8 w-1/4 mb-6" />
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-[500px] w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center gap-2">
            <AlertTriangle /> Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!employeeData) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Employee Not Found</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center text-center p-10">
          <Inbox className="h-12 w-12 text-muted-foreground mb-4" />
          <p>The requested employee could not be found in this organization.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mx-auto">
      <EmployeeForm
        organizationId={activeOrganizationId!}
        mode="edit"
        initialData={employeeData}
      />
    </div>
  );
}
