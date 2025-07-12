"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EmployeeDto } from "@/types/organization";

interface TeamRosterProps {
  employees: EmployeeDto[];
}

export function TeamRoster({ employees }: TeamRosterProps) {
  return (
    <Card className="col-span-4 md:col-span-3">
      <CardHeader>
        <CardTitle>Team Roster</CardTitle>
        <CardDescription>Employees assigned to this agency.</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[350px]">
          {employees.length > 0 ? (
            <div className="space-y-6">
              {employees.map((employee) => (
                <div key={employee.employee_id} className="flex items-center">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={employee.logo} alt="Avatar" />
                    <AvatarFallback>{employee.first_name?.charAt(0)}{employee.last_name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">{employee.first_name} {employee.last_name}</p>
                    <p className="text-sm text-muted-foreground capitalize">{employee.employee_role?.replace(/_/g, " ").toLowerCase() || "Member"}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-[300px] items-center justify-center text-center text-sm text-muted-foreground">
              <p>No employees assigned to this agency yet.</p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
