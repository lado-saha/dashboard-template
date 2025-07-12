#!/bin/bash

echo "🚀 Starting comprehensive Employee Management UI Generation..."

# --- 1. Create Directories ---
echo "📁 Creating directories..."
mkdir -p components/organization/employees
mkdir -p app/\(dashboard\)/business-actor/org/employees
mkdir -p app/\(dashboard\)/business-actor/agency/employees

# --- 2. Reusable Components for Employees ---

# Create components/organization/employees/columns.tsx
code "components/organization/employees/columns.tsx"
cat > components/organization/employees/columns.tsx << 'EOF'
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { EmployeeDto, AgencyDto } from "@/types/organization";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit3, Trash2, Building2 } from "lucide-react";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { Badge } from "@/components/ui/badge";

interface EmployeeRowActionsProps {
  employee: EmployeeDto;
  onEditAction: (employeeId: string) => void;
  onDeleteAction: (employee: EmployeeDto) => void;
}

const RowActions: React.FC<EmployeeRowActionsProps> = ({ employee, onEditAction, onDeleteAction }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0 data-[state=open]:bg-muted">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        <DropdownMenuItem onClick={() => onEditAction(employee.employee_id!)}><Edit3 className="mr-2 h-4 w-4" /> Edit Details</DropdownMenuItem>
        <DropdownMenuItem onClick={() => onDeleteAction(employee)} className="text-destructive focus:text-destructive"><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const getEmployeeColumns = (
  actionHandlers: Omit<EmployeeRowActionsProps, "employee">,
  agencies: AgencyDto[]
): ColumnDef<EmployeeDto>[] => [
  {
    id: "select",
    header: ({ table }) => <Checkbox checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")} onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)} aria-label="Select all" />,
    cell: ({ row }) => <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} aria-label="Select row" />,
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "first_name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
    cell: ({ row }) => {
      const employee = row.original;
      const fullName = `${employee.first_name || ""} ${employee.last_name || ""}`.trim();
      const fallback = fullName ? fullName.charAt(0).toUpperCase() : "E";
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border"><AvatarImage src={employee.logo} alt={fullName} /><AvatarFallback>{fallback}</AvatarFallback></Avatar>
          <div>
            <div className="font-medium">{fullName}</div>
            <div className="text-xs text-muted-foreground">{employee.short_description || "No title"}</div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "employee_role",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Role" />,
    cell: ({ row }) => <Badge variant="outline" className="capitalize">{row.getValue("employee_role")?.toString().replace(/_/g, ' ').toLowerCase() || "N/A"}</Badge>,
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
  },
  {
    accessorKey: "department",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Department" />,
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
  },
  {
    accessorKey: "agency_id",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Assignment" />,
    cell: ({ row }) => {
      const agencyId = row.getValue("agency_id");
      if (!agencyId) return <div className="text-sm text-muted-foreground">Headquarters</div>;
      const agency = agencies.find(a => a.agency_id === agencyId);
      return (
        <div className="text-sm text-muted-foreground flex items-center gap-2">
          <Building2 className="h-4 w-4 flex-shrink-0" />
          <span className="truncate">{agency ? agency.short_name : "Unknown Agency"}</span>
        </div>
      );
    },
    filterFn: (row, id, value) => value.includes(row.getValue(id) || "headquarters"),
  },
  {
    id: "actions",
    cell: ({ row }) => <RowActions employee={row.original} {...actionHandlers} />,
  },
];
EOF

# Create components/organization/employees/employee-card.tsx
code "components/organization/employees/employee-card.tsx"
cat > components/organization/employees/employee-card.tsx << 'EOF'
"use client";

import React from "react";
import { EmployeeDto, AgencyDto } from "@/types/organization";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit3, Trash2, Building2, Briefcase } from "lucide-react";

interface EmployeeCardProps {
  employee: EmployeeDto;
  agency?: AgencyDto | null;
  onEditAction: (employeeId: string) => void;
  onDeleteAction: (employee: EmployeeDto) => void;
}

export function EmployeeCard({ employee, agency, onEditAction, onDeleteAction }: EmployeeCardProps) {
  const fullName = `${employee.first_name || ""} ${employee.last_name || ""}`.trim();
  const fallback = fullName ? fullName.charAt(0).toUpperCase() : "E";
  const roleDisplay = employee.employee_role?.replace(/_/g, " ").toLowerCase() || "N/A";

  return (
    <Card className="flex flex-col h-full shadow-sm hover:shadow-lg transition-shadow group">
      <CardHeader className="flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12 border-2 border-background ring-1 ring-ring"><AvatarImage src={employee.logo} alt={fullName} /><AvatarFallback className="text-lg bg-muted">{fallback}</AvatarFallback></Avatar>
          <div>
            <CardTitle className="text-base font-semibold line-clamp-1">{fullName}</CardTitle>
            <p className="text-xs text-muted-foreground line-clamp-1">{employee.short_description || "No job title"}</p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEditAction(employee.employee_id!)}><Edit3 className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDeleteAction(employee)} className="text-destructive focus:text-destructive"><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="flex-grow space-y-3 pt-0">
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="capitalize text-xs items-center font-normal"><Briefcase className="mr-1.5 h-3 w-3" />{roleDisplay}</Badge>
          {employee.department && <Badge variant="outline" className="capitalize text-xs items-center font-normal">{employee.department}</Badge>}
        </div>
        <div className="text-sm text-muted-foreground flex items-center gap-2 pt-2">
          <Building2 className="h-4 w-4 flex-shrink-0" />
          <span>{agency ? agency.short_name : "Headquarters"}</span>
        </div>
      </CardContent>
    </Card>
  );
}
EOF

# Create components/organization/employees/employee-form.tsx
code "components/organization/employees/employee-form.tsx"
cat > components/organization/employees/employee-form.tsx << 'EOF'
"use client";

import React, { useState } from "react";
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
  initialData?: Partial<EmployeeDto>;
  agencies: AgencyDto[];
  mode: "create" | "edit";
  onSubmitAction: (data: EmployeeFormData) => Promise<boolean>;
}

export function EmployeeForm({ initialData, agencies, mode, onSubmitAction }: EmployeeFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<EmployeeFormData>({
    resolver: zodResolver(fullEmployeeSchema),
    mode: "onChange",
    defaultValues: {
      first_name: initialData?.first_name || "",
      last_name: initialData?.last_name || "",
      employee_role: initialData?.employee_role || undefined,
      department: initialData?.department || "",
      short_description: initialData?.short_description || "",
      long_description: initialData?.long_description || "",
      logo: initialData?.logo || "",
      agency_id: initialData?.agency_id || null,
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
              <FormField control={form.control} name="agency_id" render={({ field }) => (
                <FormItem>
                  <FormLabel>Agency Assignment</FormLabel>
                  <Select onValueChange={(value) => field.onChange(value === "headquarters" ? null : value)} defaultValue={field.value || "headquarters"}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select an agency" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="headquarters">Headquarters</SelectItem>
                      {agencies.map((agency) => (<SelectItem key={agency.agency_id} value={agency.agency_id!}>{agency.long_name}</SelectItem>))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
          )}
        </div>
      )}
    </FormWrapper>
  );
}
EOF

# --- 3. Organization-Level Employee Pages ---
echo "🏢 Implementing Organization-Level Employee pages..."

# Create app/(dashboard)/business-actor/org/employees/page.tsx
code "app/(dashboard)/business-actor/org/employees/page.tsx"
cat > app/\(dashboard\)/business-actor/org/employees/page.tsx << 'EOF'
import { Metadata } from "next";
import { OrgEmployeesClientPage } from "./employees-client";

export const metadata: Metadata = {
  title: "Manage Employees",
  description: "View, add, and manage all employees across your organization.",
};

export default async function OrgEmployeesPage() {
  return <OrgEmployeesClientPage />;
}
EOF

# Create app/(dashboard)/business-actor/org/employees/employees-client.tsx
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

# Create app/(dashboard)/business-actor/org/employees/create/page.tsx
code "app/(dashboard)/business-actor/org/employees/create/page.tsx"
cat > app/\(dashboard\)/business-actor/org/employees/create/page.tsx << 'EOF'
"use client";

import { EmployeeForm } from "@/components/organization/employees/employee-form";
import { useActiveOrganization } from "@/contexts/active-organization-context";
import { useRouter } from "next/navigation";
import { organizationRepository } from "@/lib/data-repo/organization";
import { EmployeeFormData } from "@/components/organization/employees/employee-form";
import { toast } from "sonner";

export default function CreateEmployeePage() {
  const router = useRouter();
  const { activeOrganizationId, agenciesForCurrentOrg } = useActiveOrganization();

  const handleCreate = async (data: EmployeeFormData): Promise<boolean> => {
    if (!activeOrganizationId) { toast.error("No active organization selected."); return false; }
    try {
      await organizationRepository.createOrgEmployee(activeOrganizationId, data);
      toast.success("Employee created successfully!");
      router.push("/business-actor/org/employees");
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
        organizationId={activeOrganizationId!}
        agencies={agenciesForCurrentOrg}
        mode="create"
        onSuccessAction={() => {}} // The form wrapper handles submission now
        onSubmitAction={handleCreate}
      />
    </div>
  );
}
EOF

# Create app/(dashboard)/business-actor/org/employees/[employeeId]/page.tsx
code "app/(dashboard)/business-actor/org/employees/[employeeId]/page.tsx"
cat > app/\(dashboard\)/business-actor/org/employees/[employeeId]/page.tsx << 'EOF'
import { Metadata } from "next";
import { organizationRepository } from "@/lib/data-repo/organization";
import { EditEmployeeClientPage } from "./edit-employee-client";

type Props = { params: { orgId: string; employeeId: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // Note: We can't get orgId from context here. A better URL would be /orgs/{orgId}/employees/{empId}
  // For now, we fetch without orgId scoping, which is not ideal but works for this structure.
  const employee = await organizationRepository.getOrgEmployeeById(params.orgId, params.employeeId).catch(() => null);
  if (!employee) return { title: "Employee Not Found" };
  return { title: `Edit ${employee.first_name} ${employee.last_name}` };
}

export default async function EditOrgEmployeePage({ params }: Props) {
  const employee = await organizationRepository.getOrgEmployeeById(params.orgId, params.employeeId).catch(() => null);
  return <EditEmployeeClientPage initialData={employee} />;
}
EOF

# Create app/(dashboard)/business-actor/org/employees/[employeeId]/edit-employee-client.tsx
code "app/(dashboard)/business-actor/org/employees/[employeeId]/edit-employee-client.tsx"
cat > app/\(dashboard\)/business-actor/org/employees/[employeeId]/edit-employee-client.tsx << 'EOF'
"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useActiveOrganization } from "@/contexts/active-organization-context";
import { organizationRepository } from "@/lib/data-repo/organization";
import { EmployeeDto } from "@/types/organization";
import { EmployeeForm, EmployeeFormData } from "@/components/organization/employees/employee-form";
import { toast } from "sonner";
import { FeedbackCard } from "@/components/ui/feedback-card";
import { User } from "lucide-react";

interface EditEmployeeClientPageProps {
  initialData: EmployeeDto | null;
}

export function EditEmployeeClientPage({ initialData }: EditEmployeeClientPageProps) {
  const router = useRouter();
  const { activeOrganizationId, agenciesForCurrentOrg } = useActiveOrganization();

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

  if (!initialData) {
    return <FeedbackCard icon={User} title="Employee Not Found" description="The employee you are trying to edit does not exist." />;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <EmployeeForm
        organizationId={activeOrganizationId!}
        agencies={agenciesForCurrentOrg}
        mode="edit"
        initialData={initialData}
        onSuccessAction={() => {}}
        onSubmitAction={handleUpdate}
      />
    </div>
  );
}
EOF

# --- 4. Agency-Level Employee Pages ---
echo "🏢 Implementing Agency-Level Employee pages..."

# Create app/(dashboard)/business-actor/agency/employees/page.tsx
code "app/(dashboard)/business-actor/agency/employees/page.tsx"
cat > app/\(dashboard\)/business-actor/agency/employees/page.tsx << 'EOF'
import { Metadata } from "next";
import { AgencyEmployeesClientPage } from "./employees-client";

export const metadata: Metadata = {
  title: "Manage Agency Employees",
  description: "View and manage employees assigned to this agency.",
};

export default function AgencyEmployeesPage() {
  return <AgencyEmployeesClientPage />;
}
EOF

# Create app/(dashboard)/business-actor/agency/employees/employees-client.tsx
code "app/(dashboard)/business-actor/agency/employees/employees-client.tsx"
cat > app/\(dashboard\)/business-actor/agency/employees/employees-client.tsx << 'EOF'
"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useActiveOrganization } from "@/contexts/active-organization-context";
import { organizationRepository } from "@/lib/data-repo/organization";
import { EmployeeDto } from "@/types/organization";
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
        pageHeader={<PageHeader title="Agency Employees" description={`Manage the team for ${activeAgencyDetails?.long_name}`} action={<Button disabled><PlusCircle className="mr-2 h-4 w-4" /> Add Employee to Agency</Button>} />}
        renderGridItemAction={(employee) => <EmployeeCard employee={employee} agency={activeAgencyDetails} onEditAction={handleEditAction} onDeleteAction={(item) => handleDeleteConfirmation([item])} />}
        emptyState={<FeedbackCard icon={Users} title="No Employees in this Agency" description="Assign an existing employee or create a new one for this agency." />}
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

# Create app/(dashboard)/business-actor/agency/employees/[employeeId]/page.tsx
code "app/(dashboard)/business-actor/agency/employees/[employeeId]/page.tsx"
cat > app/\(dashboard\)/business-actor/agency/employees/[employeeId]/page.tsx << 'EOF'
import { Metadata } from "next";
import { organizationRepository } from "@/lib/data-repo/organization";
import { EditAgencyEmployeeClientPage } from "./edit-employee-client";

type Props = { params: { orgId: string; agencyId: string; employeeId: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const employee = await organizationRepository.getAgencyEmployeeById(params.orgId, params.agencyId, params.employeeId).catch(() => null);
  if (!employee) return { title: "Employee Not Found" };
  return { title: `Edit ${employee.first_name} ${employee.last_name}` };
}

export default async function EditAgencyEmployeePage({ params }: Props) {
  const employee = await organizationRepository.getAgencyEmployeeById(params.orgId, params.agencyId, params.employeeId).catch(() => null);
  return <EditAgencyEmployeeClientPage initialData={employee} />;
}
EOF

# Create app/(dashboard)/business-actor/agency/employees/[employeeId]/edit-employee-client.tsx
code "app/(dashboard)/business-actor/agency/employees/[employeeId]/edit-employee-client.tsx"
cat > app/\(dashboard\)/business-actor/agency/employees/[employeeId]/edit-employee-client.tsx << 'EOF'
"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useActiveOrganization } from "@/contexts/active-organization-context";
import { organizationRepository } from "@/lib/data-repo/organization";
import { EmployeeDto } from "@/types/organization";
import { EmployeeForm, EmployeeFormData } from "@/components/organization/employees/employee-form";
import { toast } from "sonner";
import { FeedbackCard } from "@/components/ui/feedback-card";
import { User } from "lucide-react";

interface EditEmployeeClientPageProps {
  initialData: EmployeeDto | null;
}

export function EditAgencyEmployeeClientPage({ initialData }: EditEmployeeClientPageProps) {
  const router = useRouter();
  const { activeOrganizationId, activeAgencyId, agenciesForCurrentOrg } = useActiveOrganization();

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

  if (!initialData) {
    return <FeedbackCard icon={User} title="Employee Not Found" description="The employee you are trying to edit does not exist in this agency." />;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <EmployeeForm
        organizationId={activeOrganizationId!}
        agencies={agenciesForCurrentOrg}
        mode="edit"
        initialData={initialData}
        onSuccessAction={() => {}}
        onSubmitAction={handleUpdate}
      />
    </div>
  );
}
EOF

echo "✅ Employee Management feature files created successfully."
echo "🔴 IMPORTANT: You must now update 'components/main-sidebar.tsx' to add the new navigation links to the 'baOrgNavigation' and 'agencyNavigation' arrays."