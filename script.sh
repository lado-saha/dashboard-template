#!/bin/bash

echo "🚀 Starting Full Employee Management Feature Enhancement..."

# --- 1. Update EmployeeForm to be Agency-Context Aware ---
echo "🧠 Making EmployeeForm smarter for agency context..."
code "components/organization/employees/employee-form.tsx"
cat > components/organization/employees/employee-form.tsx << 'EOF'
"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { AgencyDto, EmployeeDto, EmployeeRoleValues } from "@/types/organization";
import { FormWrapper } from "@/components/ui/form-wrapper";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImageUploader } from "@/components/ui/image-uploader";
import { User, Building2 } from "lucide-react";

const employeeDetailsSchema = z.object({
  first_name: z.string().min(2, "First name is required."),
  last_name: z.string().min(2, "Last name is required."),
  employee_role: z.enum(EmployeeRoleValues, { required_error: "Employee role is required." }),
  department: z.string().min(2, "Department is required.").optional().or(z.literal("")),
  short_description: z.string().max(100, "Title is too long.").optional(),
  long_description: z.string().max(500, "Description is too long.").optional(),
  logo: z.string().url("Invalid URL").optional().or(z.literal("")),
  logoFile: z.any().optional(),
});

const assignmentSchema = z.object({
  agency_id: z.string().nullable().optional(),
});

const fullEmployeeSchema = employeeDetailsSchema.merge(assignmentSchema);
export type EmployeeFormData = z.infer<typeof fullEmployeeSchema>;

const formSteps = [
  { id: "details", name: "Employee Details", icon: User, fields: Object.keys(employeeDetailsSchema.shape) },
  { id: "assignment", name: "Agency Assignment", icon: Building2, fields: Object.keys(assignmentSchema.shape) },
];

interface EmployeeFormProps {
  agencies: AgencyDto[];
  mode: "create" | "edit";
  onSubmitAction: (data: EmployeeFormData) => Promise<boolean>;
  initialData?: Partial<EmployeeDto>;
  // [ADD] Prop to lock the form to a specific agency
  scopedAgencyId?: string | null;
}

export function EmployeeForm({ initialData, agencies, mode, onSubmitAction, scopedAgencyId }: EmployeeFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<EmployeeFormData>({
    resolver: zodResolver(fullEmployeeSchema),
    defaultValues: {
      first_name: initialData?.first_name || "",
      last_name: initialData?.last_name || "",
      employee_role: initialData?.employee_role || undefined,
      department: initialData?.department || "",
      short_description: initialData?.short_description || "",
      long_description: initialData?.long_description || "",
      logo: initialData?.logo || "",
      // [CHANGE] If scoped to an agency, use that ID, otherwise use initial data.
      agency_id: scopedAgencyId !== undefined ? scopedAgencyId : (initialData?.agency_id || null),
    },
  });

  const handleSubmit = async (data: EmployeeFormData) => {
    setIsLoading(true);
    const success = await onSubmitAction(data);
    if (!success) setIsLoading(false);
  };

  return (
    <FormWrapper
      form={form}
      onFormSubmit={handleSubmit}
      isLoading={isLoading}
      title={mode === 'create' ? "Add New Employee" : `Edit Employee: ${initialData?.first_name} ${initialData?.last_name}`}
      description="Provide the employee's details and assign them to an agency."
      steps={formSteps}
      submitButtonText={mode === 'create' ? "Create Employee" : "Save Changes"}
    >
      {(currentStep) => (
        <div className="min-h-[450px] p-1">
          {currentStep === 0 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="first_name" render={({ field }) => (<FormItem><FormLabel>First Name *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="last_name" render={({ field }) => (<FormItem><FormLabel>Last Name *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
              </div>
              <FormField control={form.control} name="logoFile" render={({ field }) => (<FormItem><FormLabel>Profile Photo</FormLabel><FormControl><ImageUploader currentImageUrl={form.getValues("logo")} onImageSelectedAction={(file, url) => { field.onChange(file); form.setValue("logo", url || ""); }} label="" fallbackName={`${form.getValues("first_name")} ${form.getValues("last_name")}`} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="employee_role" render={({ field }) => (<FormItem><FormLabel>Role *</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select a role" /></SelectTrigger></FormControl><SelectContent>{EmployeeRoleValues.map((role) => (<SelectItem key={role} value={role}>{role.replace(/_/g, " ").charAt(0).toUpperCase() + role.replace(/_/g, " ").slice(1).toLowerCase()}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="department" render={({ field }) => (<FormItem><FormLabel>Department</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="short_description" render={({ field }) => (<FormItem><FormLabel>Job Title</FormLabel><FormControl><Input placeholder="e.g., Senior Software Engineer" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="long_description" render={({ field }) => (<FormItem><FormLabel>Responsibilities</FormLabel><FormControl><Textarea rows={4} {...field} /></FormControl><FormMessage /></FormItem>)} />
            </div>
          )}
          {currentStep === 1 && (
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="agency_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Agency Assignment</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value === "headquarters" ? null : value)}
                      defaultValue={field.value || "headquarters"}
                      // [CHANGE] Disable the select if we are scoped to a specific agency
                      disabled={scopedAgencyId !== undefined}
                    >
                      <FormControl><SelectTrigger><SelectValue placeholder="Select an agency" /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="headquarters">Headquarters</SelectItem>
                        {agencies.map((agency) => (<SelectItem key={agency.agency_id} value={agency.agency_id!}>{agency.long_name}</SelectItem>))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}
        </div>
      )}
    </FormWrapper>
  );
}
EOF

# --- 2. Update Organization-Level Employee Page to Restore Filters ---
echo "🏢 Restoring filters to Organization-Level Employee page..."
code "app/(dashboard)/business-actor/org/employees/employees-client.tsx"
cat > app/\(dashboard\)/business-actor/org/employees/employees-client.tsx << 'EOF'
"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useActiveOrganization } from "@/contexts/active-organization-context";
import { organizationRepository } from "@/lib/data-repo/organization";
import { EmployeeDto, AgencyDto, EmployeeRoleValues } from "@/types/organization";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { PlusCircle, Users, Search as SearchIcon, Building } from "lucide-react";
import { getEmployeeColumns } from "@/components/organization/employees/columns";
import { EmployeeCard } from "@/components/organization/employees/employee-card";
import { ResourceDataTable } from "@/components/resource-management/resource-data-table";
import { FeedbackCard } from "@/components/ui/feedback-card";
import { PageHeader } from "@/components/ui/page-header";
import { DataTableFacetedFilter } from "@/components/ui/data-table-faceted-filter";
import { DataTableFilterOption } from "@/types/table";

export function OrgEmployeesClientPage() {
  const router = useRouter();
  const { activeOrganizationId, activeOrganizationDetails } = useActiveOrganization();
  const [employees, setEmployees] = useState<EmployeeDto[]>([]);
  const [agencies, setAgencies] = useState<AgencyDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemsToDelete, setItemsToDelete] = useState<EmployeeDto[]>([]);

  const refreshData = useCallback(async () => {
    if (!activeOrganizationId) { setIsLoading(false); setEmployees([]); return; }
    setIsLoading(true);
    setError(null);
    try {
      const [employeesData, agenciesData] = await Promise.all([
        organizationRepository.getOrgEmployees(activeOrganizationId),
        organizationRepository.getAgencies(activeOrganizationId, true)
      ]);
      setEmployees(employeesData || []);
      setAgencies(agenciesData || []);
    } catch (err: any) {
      setError(err.message || "Could not load employee data.");
    } finally {
      setIsLoading(false);
    }
  }, [activeOrganizationId]);

  useEffect(() => { refreshData(); }, [refreshData]);

  const handleEditAction = (employeeId: string) => router.push(`/business-actor/org/employees/${employeeId}`);
  const handleDeleteConfirmation = (items: EmployeeDto[]) => { if (items.length > 0) { setItemsToDelete(items); setIsDeleteDialogOpen(true); } };

  const executeDelete = async () => {
    if (!activeOrganizationId || itemsToDelete.length === 0) return;
    const originalItems = [...employees];
    const idsToDelete = itemsToDelete.map(item => item.employee_id!);
    setEmployees(prev => prev.filter(item => !idsToDelete.includes(item.employee_id!)));
    setIsDeleteDialogOpen(false);

    const promise = Promise.all(itemsToDelete.map(item => organizationRepository.deleteOrgEmployee(activeOrganizationId, item.employee_id!)));
    toast.promise(promise, {
      loading: `Deleting ${itemsToDelete.length} employee(s)...`,
      success: () => { refreshData(); setItemsToDelete([]); return "Employee(s) deleted."; },
      error: (err) => { setEmployees(originalItems); setItemsToDelete([]); return `Failed to delete: ${err.message}`; },
    });
  };

  const roleOptions: DataTableFilterOption[] = useMemo(() => EmployeeRoleValues.map(role => ({ label: role.replace(/_/g, " "), value: role })), []);
  const departmentOptions: DataTableFilterOption[] = useMemo(() => {
    const departments = new Set(employees.map((item) => item.department).filter(Boolean));
    return Array.from(departments).map((dept) => ({ label: dept!, value: dept! }));
  }, [employees]);
  const agencyOptions: DataTableFilterOption[] = useMemo(() => {
    const options = agencies.map(agency => ({ label: agency.long_name!, value: agency.agency_id! }));
    options.unshift({ label: "Headquarters", value: "headquarters" });
    return options;
  }, [agencies]);

  const columns = useMemo<ColumnDef<EmployeeDto>[]>(() => getEmployeeColumns({ onEditAction: handleEditAction, onDeleteAction: (item) => handleDeleteConfirmation([item]) }, agencies), [agencies]);

  if (!activeOrganizationId && !isLoading) {
    return <FeedbackCard icon={Building} title="No Organization Selected" description="Please select an active organization to manage its employees." />;
  }

  return (
    <>
      <ResourceDataTable
        data={employees}
        columns={columns}
        isLoading={isLoading}
        error={error}
        onRefreshAction={refreshData}
        searchPlaceholder="Search employees..."
        onDeleteItemsAction={handleDeleteConfirmation}
        viewModeStorageKey="org-employees-view-mode"
        exportFileName="organization_employees.csv"
        pageHeader={<PageHeader title="Employee Roster" description={`Manage all employees for ${activeOrganizationDetails?.long_name}`} action={<Button onClick={() => router.push('/business-actor/org/employees/create')}><PlusCircle className="mr-2 h-4 w-4" /> Add Employee</Button>} />}
        filterControls={(table) => (
          <>
            <DataTableFacetedFilter column={table.getColumn("employee_role")} title="Role" options={roleOptions} />
            <DataTableFacetedFilter column={table.getColumn("department")} title="Department" options={departmentOptions} />
            <DataTableFacetedFilter column={table.getColumn("agency_id")} title="Agency" options={agencyOptions} />
          </>
        )}
        renderGridItemAction={(employee) => {
          const agency = agencies.find(a => a.agency_id === employee.agency_id);
          return <EmployeeCard employee={employee} agency={agency} onEditAction={handleEditAction} onDeleteAction={(item) => handleDeleteConfirmation([item])} />;
        }}
        emptyState={<FeedbackCard icon={Users} title="No Employees Yet" description="Add your first employee to build your team." actionButton={<Button onClick={() => router.push('/business-actor/org/employees/create')}><PlusCircle className="mr-2 h-4 w-4" /> Add Employee</Button>} />}
        filteredEmptyState={<FeedbackCard icon={SearchIcon} title="No Employees Found" description="Your search did not match any employees." />}
      />
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will permanently delete <strong>{itemsToDelete.length} employee(s)</strong>.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={executeDelete}>Continue</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
EOF

# --- 3. Update Agency-Level Employee Pages for CRUD ---
echo "🏢 Implementing Agency-Level Employee CRUD..."

# Update app/(dashboard)/business-actor/agency/employees/employees-client.tsx
code "app/(dashboard)/business-actor/agency/employees/employees-client.tsx"
cat > app/\(dashboard\)/business-actor/agency/employees/employees-client.tsx << 'EOF'
"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useActiveOrganization } from "@/contexts/active-organization-context";
import { organizationRepository } from "@/lib/data-repo/organization";
import { EmployeeDto, CreateEmployeeRequest, UpdateEmployeeRequest } from "@/types/organization";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { PlusCircle, Users, Search as SearchIcon, Building } from "lucide-react";
import { getEmployeeColumns } from "@/components/organization/employees/columns";
import { EmployeeCard } from "@/components/organization/employees/employee-card";
import { ResourceDataTable } from "@/components/resource-management/resource-data-table";
import { FeedbackCard } from "@/components/ui/feedback-card";
import { PageHeader } from "@/components/ui/page-header";

export function AgencyEmployeesClientPage() {
  const router = useRouter();
  const { activeOrganizationId, activeAgencyId, activeAgencyDetails } = useActiveOrganization();
  const [employees, setEmployees] = useState<EmployeeDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemsToDelete, setItemsToDelete] = useState<EmployeeDto[]>([]);

  const refreshData = useCallback(async () => {
    if (!activeOrganizationId || !activeAgencyId) { setIsLoading(false); setEmployees([]); return; }
    setIsLoading(true);
    setError(null);
    try {
      const data = await organizationRepository.getAgencyEmployees(activeOrganizationId, activeAgencyId);
      setEmployees(data || []);
    } catch (err: any) {
      setError(err.message || "Could not load agency employees.");
    } finally {
      setIsLoading(false);
    }
  }, [activeOrganizationId, activeAgencyId]);

  useEffect(() => { refreshData(); }, [refreshData]);

  const handleEditAction = (employeeId: string) => router.push(`/business-actor/agency/employees/${employeeId}`);
  const handleDeleteConfirmation = (items: EmployeeDto[]) => { if (items.length > 0) { setItemsToDelete(items); setIsDeleteDialogOpen(true); } };

  const executeDelete = async () => {
    if (!activeOrganizationId || !activeAgencyId || itemsToDelete.length === 0) return;
    const originalItems = [...employees];
    const idsToDelete = itemsToDelete.map(item => item.employee_id!);
    setEmployees(prev => prev.filter(item => !idsToDelete.includes(item.employee_id!)));
    setIsDeleteDialogOpen(false);

    const promise = Promise.all(itemsToDelete.map(item => organizationRepository.deleteAgencyEmployee(activeOrganizationId, activeAgencyId, item.employee_id!)));
    toast.promise(promise, {
      loading: `Deleting ${itemsToDelete.length} employee(s)...`,
      success: () => { refreshData(); setItemsToDelete([]); return "Employee(s) deleted."; },
      error: (err) => { setEmployees(originalItems); setItemsToDelete([]); return `Failed to delete: ${err.message}`; },
    });
  };

  const columns = useMemo<ColumnDef<EmployeeDto>[]>(() => getEmployeeColumns({ onEditAction: handleEditAction, onDeleteAction: (item) => handleDeleteConfirmation([item]) }, [activeAgencyDetails!].filter(Boolean)), [activeAgencyDetails]);

  if (!activeAgencyId && !isLoading) {
    return <FeedbackCard icon={Building} title="No Agency Selected" description="Please select an active agency to manage its employees." />;
  }

  return (
    <>
      <ResourceDataTable
        data={employees}
        columns={columns}
        isLoading={isLoading}
        error={error}
        onRefreshAction={refreshData}
        searchPlaceholder="Search agency employees..."
        onDeleteItemsAction={handleDeleteConfirmation}
        viewModeStorageKey="agency-employees-view-mode"
        exportFileName="agency_employees.csv"
        pageHeader={<PageHeader title="Agency Employees" description={`Manage the team for ${activeAgencyDetails?.long_name}`} action={<Button onClick={() => router.push('/business-actor/agency/employees/create')}><PlusCircle className="mr-2 h-4 w-4" /> Add Employee</Button>} />}
        renderGridItemAction={(employee) => <EmployeeCard employee={employee} agency={activeAgencyDetails} onEditAction={handleEditAction} onDeleteAction={(item) => handleDeleteConfirmation([item])} />}
        emptyState={<FeedbackCard icon={Users} title="No Employees in this Agency" description="Assign an existing employee or create a new one for this agency." actionButton={<Button onClick={() => router.push('/business-actor/agency/employees/create')}><PlusCircle className="mr-2 h-4 w-4" /> Add Employee</Button>} />}
        filteredEmptyState={<FeedbackCard icon={SearchIcon} title="No Employees Found" description="Your search did not match any employees in this agency." />}
      />
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will permanently delete <strong>{itemsToDelete.length} employee(s)</strong> from this agency.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={executeDelete}>Continue</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
EOF

# Create app/(dashboard)/business-actor/agency/employees/create/page.tsx
code "app/(dashboard)/business-actor/agency/employees/create/page.tsx"
cat > app/\(dashboard\)/business-actor/agency/employees/create/page.tsx << 'EOF'
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
    <div className="max-w-4xl mx-auto">
      <EmployeeForm
        agencies={activeAgencyDetails ? [activeAgencyDetails] : []}
        mode="create"
        onSubmitAction={handleCreate}
        scopedAgencyId={activeAgencyId} // Lock the form to the current agency
      />
    </div>
  );
}
EOF

# Create app/(dashboard)/business-actor/agency/employees/[employeeId]/page.tsx
code "app/(dashboard)/business-actor/agency/employees/[employeeId]/page.tsx"
cat > app/\(dashboard\)/business-actor/agency/employees/[employeeId]/page.tsx << 'EOF'
import { Metadata } from "next";
import { EditAgencyEmployeeClientPage } from "./edit-employee-client";

export const metadata: Metadata = {
  title: "Edit Agency Employee",
};

type Props = { params: { employeeId: string } };

export default async function EditAgencyEmployeePage({ params }: Props) {
  return <EditAgencyEmployeeClientPage employeeId={params.employeeId} />;
}
EOF

# Create app/(dashboard)/business-actor/agency/employees/[employeeId]/edit-employee-client.tsx
code "app/(dashboard)/business-actor/agency/employees/[employeeId]/edit-employee-client.tsx"
cat > app/\(dashboard\)/business-actor/agency/employees/[employeeId]/edit-employee-client.tsx << 'EOF'
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

export function EditAgencyEmployeeClientPage({ employeeId }: EditEmployeeClientPageProps) {
  const router = useRouter();
  const { activeOrganizationId, activeAgencyId, activeAgencyDetails } = useActiveOrganization();
  const [initialData, setInitialData] = useState<EmployeeDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!activeOrganizationId || !activeAgencyId || !employeeId) return;
    setIsLoading(true);
    try {
      const data = await organizationRepository.getAgencyEmployeeById(activeOrganizationId, activeAgencyId, employeeId);
      setInitialData(data);
    } catch (error) {
      toast.error("Failed to fetch employee details for this agency.");
      setInitialData(null);
    } finally {
      setIsLoading(false);
    }
  }, [activeOrganizationId, activeAgencyId, employeeId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleUpdate = async (data: EmployeeFormData): Promise<boolean> => {
    if (!activeOrganizationId || !activeAgencyId || !initialData?.employee_id) {
      toast.error("Cannot update employee: Missing context or ID.");
      return false;
    }
    try {
      await organizationRepository.updateAgencyEmployee(activeOrganizationId, activeAgencyId, initialData.employee_id, data);
      toast.success("Employee updated successfully!");
      router.push("/business-actor/agency/employees");
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
    return <FeedbackCard icon={User} title="Employee Not Found" description="The employee you are trying to edit does not exist in this agency." />;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <EmployeeForm
        agencies={activeAgencyDetails ? [activeAgencyDetails] : []}
        mode="edit"
        initialData={initialData}
        onSubmitAction={handleUpdate}
        scopedAgencyId={activeAgencyId} // Lock the form to the current agency
      />
    </div>
  );
}
EOF

echo "✅ Full Employee Management feature implemented successfully."
echo "ℹ️ Remember to add the new routes to the sidebar if they are not already present."