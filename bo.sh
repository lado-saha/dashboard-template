#!/bin/bash
#
# YOWYOB Dashboard - Form Overhaul & Correction Script
# This script creates new, dedicated pages and corrected form components
# for managing Sales People, Suppliers, Customers, and Prospects to fix
# data inconsistencies and improve user experience.
#

# ---
# Section 1: Sales People Form Overhaul
# This section creates a new, dedicated, multi-step form for Sales People
# that correctly matches the SalesPersonDto.
# ---
echo "--- Overhauling Sales People Form ---"

mkdir -p components/organization/sales-people
cat << 'EOF' > components/organization/sales-people/sales-person-form.tsx
"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { SalesPersonDto, AgencyDto } from "@/types/organization";
import { FormWrapper } from "@/components/ui/form-wrapper";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImageUploader } from "@/components/ui/image-uploader";
import { User, Building2 } from "lucide-react";

// REASON: The schema was incorrect. It's now aligned with SalesPersonDto.
// It uses `name` instead of first/last, and includes all relevant fields.
const salesPersonFormSchema = z.object({
  name: z.string().min(2, "Full name is required."),
  short_description: z.string().max(100, "Title is too long.").optional().or(z.literal("")),
  commission_rate: z.coerce.number().min(0, "Rate must be non-negative.").optional().nullable(),
  credit: z.coerce.number().optional().nullable(),
  current_balance: z.coerce.number().optional().nullable(),
  agency_id: z.string().nullable().optional(),
  logo: z.string().url("Invalid URL").optional().or(z.literal("")),
  logoFile: z.any().optional(),
});

export type SalesPersonFormData = z.infer<typeof salesPersonFormSchema>;

const formSteps = [
  { id: "details", name: "Sales Person Details", icon: User, fields: ['name', 'short_description', 'logoFile'] },
  { id: "assignment", name: "Assignment & Rates", icon: Building2, fields: ['agency_id', 'commission_rate', 'credit'] },
];

interface SalesPersonFormProps {
  initialData?: Partial<SalesPersonDto>;
  mode: "create" | "edit";
  onSubmitAction: (data: SalesPersonFormData) => Promise<boolean>;
  agencies: AgencyDto[];
  isLoading: boolean;
  scopedAgencyId?: string | null;
}

export function SalesPersonForm({ initialData, mode, onSubmitAction, agencies, isLoading, scopedAgencyId }: SalesPersonFormProps) {
  const form = useForm<SalesPersonFormData>({
    resolver: zodResolver(salesPersonFormSchema),
    defaultValues: {
      name: initialData?.name || `${initialData?.first_name || ''} ${initialData?.last_name || ''}`.trim(),
      short_description: initialData?.short_description || "",
      commission_rate: initialData?.commission_rate || null,
      credit: initialData?.credit || null,
      current_balance: initialData?.current_balance || null,
      agency_id: scopedAgencyId !== undefined ? scopedAgencyId : initialData?.agency_id || null,
      logo: initialData?.logo || "",
    },
  });

  return (
    <FormWrapper
      form={form}
      onFormSubmit={onSubmitAction}
      isLoading={isLoading}
      steps={formSteps}
      title={mode === 'create' ? "Create Sales Person" : "Edit Sales Person"}
      description="Fill in the details for the sales team member."
      submitButtonText={mode === 'create' ? "Create Sales Person" : "Save Changes"}
    >
      {(currentStep) => (
        <div className="min-h-[350px]">
          {currentStep === 0 && (
            <div className="space-y-6">
              <FormField control={form.control} name="logoFile" render={({ field }) => (
                <FormItem><FormLabel>Photo</FormLabel><FormControl><ImageUploader currentImageUrl={form.getValues("logo")} onImageSelectedAction={(file, url) => { field.onChange(file); form.setValue("logo", url || ""); }} label="Sales Person Photo" aspectRatio="square" fallbackName={form.watch("name")} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem><FormLabel>Full Name *</FormLabel><FormControl><Input placeholder="Jane Smith" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="short_description" render={({ field }) => (
                <FormItem><FormLabel>Title / Role</FormLabel><FormControl><Input placeholder="e.g., Senior Account Executive" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
          )}
          {currentStep === 1 && (
            <div className="space-y-6">
              <FormField control={form.control} name="commission_rate" render={({ field }) => (<FormItem><FormLabel>Commission Rate (%)</FormLabel><FormControl><Input type="number" placeholder="e.g., 5" {...field} value={field.value ?? ""} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="credit" render={({ field }) => (<FormItem><FormLabel>Credit Limit</FormLabel><FormControl><Input type="number" placeholder="e.g., 1000" {...field} value={field.value ?? ""} /></FormControl><FormMessage /></FormItem>)} />
              
              {scopedAgencyId === undefined && (
                <FormField control={form.control} name="agency_id" render={({ field }) => (
                  <FormItem><FormLabel>Agency Assignment</FormLabel><Select onValueChange={(value) => field.onChange(value === "headquarters" ? null : value)} defaultValue={field.value || "headquarters"}><FormControl><SelectTrigger><SelectValue placeholder="Assign to an agency..." /></SelectTrigger></FormControl><SelectContent><SelectItem value="headquarters">Headquarters</SelectItem>{agencies.map((agency) => (<SelectItem key={agency.agency_id} value={agency.agency_id!}>{agency.long_name}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>
                )} />
              )}
            </div>
          )}
        </div>
      )}
    </FormWrapper>
  );
}
EOF
code components/organization/sales-people/sales-person-form.tsx

mkdir -p app/\(dashboard\)/business-actor/org/sales-people/create
cat << 'EOF' > app/\(dashboard\)/business-actor/org/sales-people/create/page.tsx
import { Metadata } from "next";
import { CreateOrgSalesPersonClientPage } from "./create-client";

export const metadata: Metadata = {
  title: "Create New Sales Person",
};

export default function CreateSalesPersonPage() {
  return <CreateOrgSalesPersonClientPage />;
}
EOF
code app/\(dashboard\)/business-actor/org/sales-people/create/page.tsx

cat << 'EOF' > app/\(dashboard\)/business-actor/org/sales-people/create/create-client.tsx
"use client";
import React, { useState } from "react";
import { SalesPersonForm, SalesPersonFormData } from "@/components/organization/sales-people/sales-person-form";
import { useActiveOrganization } from "@/contexts/active-organization-context";
import { useRouter } from "next/navigation";
import { organizationRepository } from "@/lib/data-repo/organization";
import { toast } from "sonner";
import { PageHeader } from "@/components/ui/page-header";

export function CreateOrgSalesPersonClientPage() {
  const router = useRouter();
  const { activeOrganizationId, agenciesForCurrentOrg } = useActiveOrganization();
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = async (data: SalesPersonFormData): Promise<boolean> => {
    setIsLoading(true);
    if (!activeOrganizationId) {
      toast.error("No active organization selected.");
      setIsLoading(false);
      return false;
    }
    try {
      await organizationRepository.createOrgSalesPerson(activeOrganizationId, data);
      toast.success("Sales Person created successfully!");
      router.push("/business-actor/org/sales-people");
      router.refresh(); // Invalidate cache for the list page
      return true;
    } catch (error: any) {
      toast.error(error.message || "Failed to create sales person.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Create New Sales Person" description="Add a new member to your organization's sales team." />
      <SalesPersonForm
        agencies={agenciesForCurrentOrg}
        mode="create"
        onSubmitAction={handleCreate}
        isLoading={isLoading}
      />
    </div>
  );
}
EOF
code app/\(dashboard\)/business-actor/org/sales-people/create/create-client.tsx

mkdir -p app/\(dashboard\)/business-actor/org/sales-people/\[salesPersonId\]/edit
cat << 'EOF' > app/\(dashboard\)/business-actor/org/sales-people/\[salesPersonId\]/edit/page.tsx
import { Metadata } from "next";
import { EditOrgSalesPersonClientPage } from "./edit-client";

export const metadata: Metadata = {
  title: "Edit Sales Person",
};

type Props = { params: { salesPersonId: string } };

export default async function EditSalesPersonPage({ params }: Props) {
  const { salesPersonId } = params;
  return <EditOrgSalesPersonClientPage salesPersonId={salesPersonId} />;
}
EOF
code app/\(dashboard\)/business-actor/org/sales-people/\[salesPersonId\]/edit/page.tsx

cat << 'EOF' > app/\(dashboard\)/business-actor/org/sales-people/\[salesPersonId\]/edit/edit-client.tsx
"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useActiveOrganization } from "@/contexts/active-organization-context";
import { organizationRepository } from "@/lib/data-repo/organization";
import { SalesPersonDto } from "@/types/organization";
import { SalesPersonForm, SalesPersonFormData } from "@/components/organization/sales-people/sales-person-form";
import { toast } from "sonner";
import { PageHeader } from "@/components/ui/page-header";
import { FeedbackCard } from "@/components/ui/feedback-card";
import { Loader2, UserCheck } from "lucide-react";

interface EditClientProps {
  salesPersonId: string;
}

export function EditOrgSalesPersonClientPage({ salesPersonId }: EditClientProps) {
  const router = useRouter();
  const { activeOrganizationId, agenciesForCurrentOrg } = useActiveOrganization();
  
  const [initialData, setInitialData] = useState<SalesPersonDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!activeOrganizationId || !salesPersonId) return;
    setIsLoading(true);
    try {
      const data = await organizationRepository.getOrgSalesPersonById(activeOrganizationId, salesPersonId);
      setInitialData(data);
    } catch (error) {
      toast.error("Failed to fetch sales person details.");
      setInitialData(null);
    } finally {
      setIsLoading(false);
    }
  }, [activeOrganizationId, salesPersonId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleUpdate = async (data: SalesPersonFormData): Promise<boolean> => {
    if (!activeOrganizationId || !initialData?.sales_person_id) return false;
    setIsLoading(true);
    try {
      await organizationRepository.updateOrgSalesPerson(activeOrganizationId, initialData.sales_person_id, data);
      toast.success("Sales Person updated successfully!");
      router.push("/business-actor/org/sales-people");
      router.refresh();
      return true;
    } catch (error: any) {
      toast.error(error.message || "Failed to update sales person.");
      return false;
    } finally {
        setIsLoading(false);
    }
  };

  if (isLoading) return <div className="flex justify-center items-center min-h-[400px]"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  if (!initialData) return <FeedbackCard icon={UserCheck} title="Sales Person Not Found" description="The person you are trying to edit does not exist." />;

  return (
    <div className="space-y-6">
      <PageHeader title="Edit Sales Person" description={`Update details for ${initialData.name}`} />
      <SalesPersonForm
        agencies={agenciesForCurrentOrg}
        mode="edit"
        initialData={initialData}
        onSubmitAction={handleUpdate}
        isLoading={isLoading}
      />
    </div>
  );
}
EOF
code app/\(dashboard\)/business-actor/org/sales-people/\[salesPersonId\]/edit/edit-client.tsx

cat << 'EOF' > app/\(dashboard\)/business-actor/org/sales-people/sales-people-client.tsx
"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useActiveOrganization } from "@/contexts/active-organization-context";
import { organizationRepository } from "@/lib/data-repo/organization";
import { SalesPersonDto, AgencyDto } from "@/types/organization";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { PlusCircle, UserCheck, Search as SearchIcon, Building } from "lucide-react";
import { getSalesPersonColumns } from "@/components/organization/sales-people/columns";
import { SalesPersonCard } from "@/components/organization/sales-people/sales-person-card";
import { ResourceDataTable } from "@/components/resource-management/resource-data-table";
import { FeedbackCard } from "@/components/ui/feedback-card";
import { PageHeader } from "@/components/ui/page-header";
import { DataTableFacetedFilter } from "@/components/ui/data-table-faceted-filter";
import { DataTableFilterOption } from "@/types/table";

export function OrgSalesPeopleClientPage() {
  const router = useRouter();
  const { activeOrganizationId, activeOrganizationDetails } = useActiveOrganization();
  const [salesPeople, setSalesPeople] = useState<SalesPersonDto[]>([]);
  const [agencies, setAgencies] = useState<AgencyDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemsToDelete, setItemsToDelete] = useState<SalesPersonDto[]>([]);
  const [dataVersion, setDataVersion] = useState(0);

  const refreshData = useCallback(() => setDataVersion((v) => v + 1), []);

  useEffect(() => {
    async function fetchData() {
      if (!activeOrganizationId) {
        setIsLoading(false);
        setSalesPeople([]);
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const [agenciesData, hqData] = await Promise.all([
          organizationRepository.getAgencies(activeOrganizationId),
          organizationRepository.getOrgSalesPersons(activeOrganizationId),
        ]);
        setAgencies(agenciesData || []);
        const agencyPromises = (agenciesData || []).map((agency) =>
          organizationRepository.getAgencySalesPersons(activeOrganizationId, agency.agency_id!)
        );
        const agencyResults = await Promise.all(agencyPromises);
        setSalesPeople([...(hqData || []), ...agencyResults.flat()]);
      } catch (err: any) {
        setError(err.message || "Could not load sales people.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [activeOrganizationId, dataVersion]);

  // REASON: Changed from dialog to navigation
  const handleEditAction = (item: SalesPersonDto) => {
    router.push(`/business-actor/org/sales-people/${item.sales_person_id}/edit`);
  };

  const handleCreateAction = () => {
    router.push(`/business-actor/org/sales-people/create`);
  }

  const handleDeleteConfirmation = (items: SalesPersonDto[]) => {
    if (items.length === 0) return;
    setItemsToDelete(items);
    setIsDeleteDialogOpen(true);
  };

  const executeDelete = async () => {
    if (!activeOrganizationId || itemsToDelete.length === 0) return;
    const promise = Promise.all(
      itemsToDelete.map((item) =>
        item.agency_id
          ? organizationRepository.deleteAgencySalesPerson(activeOrganizationId, item.agency_id, item.sales_person_id!)
          : organizationRepository.deleteOrgSalesPerson(activeOrganizationId, item.sales_person_id!)
      )
    );
    toast.promise(promise, {
      loading: `Deleting ${itemsToDelete.length} sales person(s)...`,
      success: () => { refreshData(); setItemsToDelete([]); return "Sales person(s) deleted."; },
      error: (err) => `Failed to delete: ${err.message}`,
    });
    setIsDeleteDialogOpen(false);
  };

  const columns = useMemo<ColumnDef<SalesPersonDto>[]>(() => getSalesPersonColumns({
    onEditAction: handleEditAction,
    onDeleteAction: (sp) => handleDeleteConfirmation([sp]),
  }, agencies), [agencies, router]);

  const agencyFilterOptions: DataTableFilterOption[] = useMemo(() => [
    { value: "headquarters", label: "Headquarters" },
    ...agencies.map((a) => ({ value: a.agency_id!, label: a.short_name! })),
  ], [agencies]);

  if (!activeOrganizationId && !isLoading) {
    return <FeedbackCard icon={Building} title="No Organization Selected" description="Please select an active organization to manage sales people." />;
  }

  return (
    <>
      <ResourceDataTable
        data={salesPeople}
        columns={columns}
        isLoading={isLoading}
        error={error}
        onRefreshAction={refreshData}
        searchPlaceholder="Search sales people..."
        onDeleteItemsAction={handleDeleteConfirmation}
        viewModeStorageKey="org-sales-people-view-mode"
        exportFileName="organization_sales_people.csv"
        pageHeader={
          <PageHeader
            title="Sales People"
            description={`Manage all sales people for ${activeOrganizationDetails?.long_name}`}
            action={<Button onClick={handleCreateAction}><PlusCircle className="mr-2 h-4 w-4" /> Add Sales Person</Button>}
          />
        }
        filterControls={(table) => <DataTableFacetedFilter column={table.getColumn("agency_id")} title="Agency" options={agencyFilterOptions} />}
        renderGridItemAction={(item) => (
          <SalesPersonCard salesPerson={item} agencies={agencies} onEditAction={handleEditAction} onDeleteAction={(dto) => { handleDeleteConfirmation([dto]); }} />
        )}
        emptyState={
          <FeedbackCard icon={UserCheck} title="No Sales People Yet" description="Add your first sales person to build your sales team." actionButton={<Button onClick={handleCreateAction}><PlusCircle className="mr-2 h-4 w-4" /> Add Sales Person</Button>} />
        }
        filteredEmptyState={<FeedbackCard icon={SearchIcon} title="No Sales People Found" description="Your search did not match any sales people." />}
      />
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will permanently delete <strong>{itemsToDelete.length} sales person(s)</strong>.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={executeDelete}>Continue</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
EOF
code app/\(dashboard\)/business-actor/org/sales-people/sales-people-client.tsx

# ---
# Section 2: Supplier Form Overhaul
# This section creates a new, dedicated, multi-step form for Suppliers
# that correctly matches the ProviderDto.
# ---
echo "--- Overhauling Supplier Form ---"

mkdir -p components/organization/suppliers
cat << 'EOF' > components/organization/suppliers/supplier-form.tsx
"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ProviderDto, AgencyDto } from "@/types/organization";
import { FormWrapper } from "@/components/ui/form-wrapper";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImageUploader } from "@/components/ui/image-uploader";
import { User, Building2, Truck } from "lucide-react";

const supplierFormSchema = z.object({
  first_name: z.string().min(2, "Supplier first name or company name is required."),
  last_name: z.string().optional().or(z.literal("")),
  product_service_type: z.string().min(3, "Please specify the type of product or service provided."),
  contact_info: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  short_description: z.string().max(100).optional().or(z.literal("")),
  long_description: z.string().max(500).optional().or(z.literal("")),
  agency_id: z.string().nullable().optional(),
  logo: z.string().url("Invalid URL").optional().or(z.literal("")),
  logoFile: z.any().optional(),
});

export type SupplierFormData = z.infer<typeof supplierFormSchema>;

const formSteps = [
    { id: "details", name: "Supplier Details", icon: User, fields: ['first_name', 'last_name', 'logoFile', 'short_description', 'long_description'] },
    { id: "service", name: "Service & Assignment", icon: Truck, fields: ['product_service_type', 'agency_id', 'contact_info', 'address'] },
];

interface SupplierFormProps {
  initialData?: Partial<ProviderDto>;
  mode: "create" | "edit";
  onSubmitAction: (data: SupplierFormData) => Promise<boolean>;
  agencies: AgencyDto[];
  isLoading: boolean;
  scopedAgencyId?: string | null;
}

export function SupplierForm({ initialData, mode, onSubmitAction, agencies, isLoading, scopedAgencyId }: SupplierFormProps) {
  const form = useForm<SupplierFormData>({
    resolver: zodResolver(supplierFormSchema),
    defaultValues: {
      first_name: initialData?.first_name || "",
      last_name: initialData?.last_name || "",
      product_service_type: initialData?.product_service_type || "",
      contact_info: initialData?.contact_info || "",
      address: initialData?.address || "",
      short_description: initialData?.short_description || "",
      long_description: initialData?.long_description || "",
      agency_id: scopedAgencyId !== undefined ? scopedAgencyId : initialData?.agency_id || null,
      logo: initialData?.logo || "",
    },
  });

  return (
    <FormWrapper
      form={form}
      onFormSubmit={onSubmitAction}
      isLoading={isLoading}
      steps={formSteps}
      title={mode === 'create' ? "Add New Supplier" : "Edit Supplier"}
      description="Manage information for your suppliers and vendors."
      submitButtonText={mode === 'create' ? "Create Supplier" : "Save Changes"}
    >
      {(currentStep) => (
          <div className="min-h-[350px]">
              {currentStep === 0 && (
                  <div className="space-y-6">
                      <FormField control={form.control} name="logoFile" render={({ field }) => (
                          <FormItem><FormLabel>Supplier Logo</FormLabel><FormControl><ImageUploader currentImageUrl={form.getValues("logo")} onImageSelectedAction={(file, url) => { field.onChange(file); form.setValue("logo", url || ""); }} label="Supplier Logo" aspectRatio="square" fallbackName={`${form.watch("first_name")} ${form.watch("last_name")}`} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField control={form.control} name="first_name" render={({ field }) => (<FormItem><FormLabel>First Name / Company *</FormLabel><FormControl><Input placeholder="e.g., John or ACME Inc." {...field} /></FormControl><FormMessage /></FormItem>)} />
                          <FormField control={form.control} name="last_name" render={({ field }) => (<FormItem><FormLabel>Last Name (if applicable)</FormLabel><FormControl><Input placeholder="e.g., Doe" {...field} /></FormControl><FormMessage /></FormItem>)} />
                      </div>
                      <FormField control={form.control} name="short_description" render={({ field }) => (<FormItem><FormLabel>Tagline / Industry</FormLabel><FormControl><Input placeholder="e.g., Quality Raw Materials" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  </div>
              )}
              {currentStep === 1 && (
                   <div className="space-y-6">
                      <FormField control={form.control} name="product_service_type" render={({ field }) => (<FormItem><FormLabel>Primary Service/Product Type *</FormLabel><FormControl><Input placeholder="e.g., Office Supplies, SaaS Provider" {...field} /></FormControl><FormMessage /></FormItem>)} />
                      <FormField control={form.control} name="contact_info" render={({ field }) => (<FormItem><FormLabel>Contact Info (Email/Phone)</FormLabel><FormControl><Input placeholder="supplier@email.com or +123456789" {...field} /></FormControl><FormMessage /></FormItem>)} />
                      <FormField control={form.control} name="address" render={({ field }) => (<FormItem><FormLabel>Primary Address</FormLabel><FormControl><Textarea placeholder="123 Main St, Anytown, USA" {...field} /></FormControl><FormMessage /></FormItem>)} />

                      {scopedAgencyId === undefined && (
                          <FormField control={form.control} name="agency_id" render={({ field }) => (
                              <FormItem><FormLabel>Agency Assignment</FormLabel><Select onValueChange={(value) => field.onChange(value === "headquarters" ? null : value)} defaultValue={field.value || "headquarters"}><FormControl><SelectTrigger><SelectValue placeholder="Assign to an agency..." /></SelectTrigger></FormControl><SelectContent><SelectItem value="headquarters">Headquarters (No Agency)</SelectItem>{agencies.map((agency) => (<SelectItem key={agency.agency_id} value={agency.agency_id!}>{agency.long_name}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>
                          )} />
                      )}
                  </div>
              )}
          </div>
      )}
    </FormWrapper>
  );
}
EOF
code components/organization/suppliers/supplier-form.tsx

mkdir -p app/\(dashboard\)/business-actor/org/suppliers/create
cat << 'EOF' > app/\(dashboard\)/business-actor/org/suppliers/create/page.tsx
import { Metadata } from "next";
import { CreateOrgSupplierClientPage } from "./create-client";

export const metadata: Metadata = {
  title: "Create New Supplier",
};

export default function CreateSupplierPage() {
  return <CreateOrgSupplierClientPage />;
}
EOF
code app/\(dashboard\)/business-actor/org/suppliers/create/page.tsx

cat << 'EOF' > app/\(dashboard\)/business-actor/org/suppliers/create/create-client.tsx
"use client";
import React, { useState } from "react";
import { SupplierForm, SupplierFormData } from "@/components/organization/suppliers/supplier-form";
import { useActiveOrganization } from "@/contexts/active-organization-context";
import { useRouter } from "next/navigation";
import { organizationRepository } from "@/lib/data-repo/organization";
import { toast } from "sonner";
import { PageHeader } from "@/components/ui/page-header";

export function CreateOrgSupplierClientPage() {
  const router = useRouter();
  const { activeOrganizationId, agenciesForCurrentOrg } = useActiveOrganization();
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = async (data: SupplierFormData): Promise<boolean> => {
    setIsLoading(true);
    if (!activeOrganizationId) {
      toast.error("No active organization selected.");
      setIsLoading(false);
      return false;
    }
    try {
      const createdSupplier = await organizationRepository.createOrgSupplier(activeOrganizationId, data);
      toast.success("Supplier created successfully!");
      router.push("/business-actor/org/suppliers");
      router.refresh();
      return true;
    } catch (error: any) {
      toast.error(error.message || "Failed to create supplier.");
      return false;
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Create New Supplier" description="Add a new supplier to your organization's network." />
      <SupplierForm
        agencies={agenciesForCurrentOrg}
        mode="create"
        onSubmitAction={handleCreate}
        isLoading={isLoading}
      />
    </div>
  );
}
EOF
code app/\(dashboard\)/business-actor/org/suppliers/create/create-client.tsx

mkdir -p app/\(dashboard\)/business-actor/org/suppliers/\[providerId\]/edit
cat << 'EOF' > app/\(dashboard\)/business-actor/org/suppliers/\[providerId\]/edit/page.tsx
import { Metadata } from "next";
import { EditOrgSupplierClientPage } from "./edit-client";

export const metadata: Metadata = {
  title: "Edit Supplier",
};

type Props = { params: { providerId: string } };

export default async function EditSupplierPage({ params }: Props) {
  const { providerId } = params;
  return <EditOrgSupplierClientPage providerId={providerId} />;
}
EOF
code app/\(dashboard\)/business-actor/org/suppliers/\[providerId\]/edit/page.tsx

cat << 'EOF' > app/\(dashboard\)/business-actor/org/suppliers/\[providerId\]/edit/edit-client.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useActiveOrganization } from "@/contexts/active-organization-context";
import { organizationRepository } from "@/lib/data-repo/organization";
import { ProviderDto } from "@/types/organization";
import { SupplierForm, SupplierFormData } from "@/components/organization/suppliers/supplier-form";
import { toast } from "sonner";
import { PageHeader } from "@/components/ui/page-header";
import { FeedbackCard } from "@/components/ui/feedback-card";
import { Loader2, Truck } from "lucide-react";

interface EditClientProps {
  providerId: string;
}

export function EditOrgSupplierClientPage({ providerId }: EditClientProps) {
  const router = useRouter();
  const { activeOrganizationId, agenciesForCurrentOrg } = useActiveOrganization();
  
  const [initialData, setInitialData] = useState<ProviderDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!activeOrganizationId || !providerId) return;
    setIsLoading(true);
    try {
      const data = await organizationRepository.getOrgSupplierById(activeOrganizationId, providerId);
      setInitialData(data);
    } catch (error) {
      toast.error("Failed to fetch supplier details.");
      setInitialData(null);
    } finally {
      setIsLoading(false);
    }
  }, [activeOrganizationId, providerId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleUpdate = async (data: SupplierFormData): Promise<boolean> => {
    if (!activeOrganizationId || !initialData?.provider_id) return false;
    setIsLoading(true);
    try {
      const updatedSupplier = await organizationRepository.updateOrgSupplier(activeOrganizationId, initialData.provider_id, data);
      toast.success("Supplier updated successfully!");
      router.push("/business-actor/org/suppliers");
      router.refresh();
      return true;
    } catch (error: any) {
      toast.error(error.message || "Failed to update supplier.");
      return false;
    } finally {
        setIsLoading(false);
    }
  };
  
  if (isLoading) {
    return <div className="flex justify-center items-center min-h-[400px]"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }
  if (!initialData) {
    return <FeedbackCard icon={Truck} title="Supplier Not Found" description="The supplier you are trying to edit does not exist." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Edit Supplier" description={`Update details for ${initialData.first_name} ${initialData.last_name}`} />
      <SupplierForm
        agencies={agenciesForCurrentOrg}
        mode="edit"
        initialData={initialData}
        onSubmitAction={handleUpdate}
        isLoading={isLoading}
      />
    </div>
  );
}
EOF
code app/\(dashboard\)/business-actor/org/suppliers/\[providerId\]/edit/edit-client.tsx

cat << 'EOF' > app/\(dashboard\)/business-actor/org/suppliers/suppliers-client.tsx
"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useActiveOrganization } from "@/contexts/active-organization-context";
import { organizationRepository } from "@/lib/data-repo/organization";
import { ProviderDto, AgencyDto } from "@/types/organization";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { PlusCircle, Truck, Search as SearchIcon, Building } from "lucide-react";
import { getSupplierColumns } from "@/components/organization/suppliers/columns";
import { SupplierCard } from "@/components/organization/suppliers/supplier-card";
import { ResourceDataTable } from "@/components/resource-management/resource-data-table";
import { FeedbackCard } from "@/components/ui/feedback-card";
import { PageHeader } from "@/components/ui/page-header";
import { DataTableFacetedFilter } from "@/components/ui/data-table-faceted-filter";
import { DataTableFilterOption } from "@/types/table";

export function OrgSuppliersClientPage() {
  const router = useRouter();
  const { activeOrganizationId, activeOrganizationDetails } = useActiveOrganization();
  const [suppliers, setSuppliers] = useState<ProviderDto[]>([]);
  const [agencies, setAgencies] = useState<AgencyDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemsToDelete, setItemsToDelete] = useState<ProviderDto[]>([]);
  const [dataVersion, setDataVersion] = useState(0);

  const refreshData = useCallback(() => setDataVersion((v) => v + 1), []);

  useEffect(() => {
    async function fetchData() {
      if (!activeOrganizationId) {
        setIsLoading(false);
        setSuppliers([]);
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const [agenciesData, hqSuppliersData] = await Promise.all([
          organizationRepository.getAgencies(activeOrganizationId),
          organizationRepository.getOrgSuppliers(activeOrganizationId),
        ]);
        setAgencies(agenciesData || []);
        const agencySupplierPromises = (agenciesData || []).map((agency) =>
          organizationRepository.getAgencySuppliers(activeOrganizationId, agency.agency_id!)
        );
        const allAgencySuppliersNested = await Promise.all(agencySupplierPromises);
        setSuppliers([...(hqSuppliersData || []), ...allAgencySuppliersNested.flat()]);
      } catch (err: any) {
        setError(err.message || "Could not load supplier data.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [activeOrganizationId, dataVersion]);

  // REASON: Changed to navigation for a better UX on larger forms
  const handleEditAction = (item: ProviderDto) => {
    router.push(`/business-actor/org/suppliers/${item.provider_id}/edit`);
  };
  const handleCreateAction = () => {
    router.push("/business-actor/org/suppliers/create");
  }

  const handleDeleteConfirmation = (items: ProviderDto[]) => {
    if (items.length === 0) return;
    setItemsToDelete(items);
    setIsDeleteDialogOpen(true);
  };

  const executeDelete = async () => {
    if (!activeOrganizationId || itemsToDelete.length === 0) return;
    const promise = Promise.all(
      itemsToDelete.map((item) =>
        item.agency_id
          ? organizationRepository.deleteAgencySupplier(activeOrganizationId, item.agency_id, item.provider_id!)
          : organizationRepository.deleteOrgSupplier(activeOrganizationId, item.provider_id!)
      )
    );
    toast.promise(promise, {
      loading: `Deleting ${itemsToDelete.length} supplier(s)...`,
      success: () => { refreshData(); setItemsToDelete([]); return "Supplier(s) deleted."; },
      error: (err) => `Failed to delete: ${err.message}`,
    });
    setIsDeleteDialogOpen(false);
  };

  const columns = useMemo<ColumnDef<ProviderDto>[]>(() => getSupplierColumns({ onEditAction: handleEditAction, onDeleteAction: (item) => handleDeleteConfirmation([item]), }, agencies), [agencies, router]);
  const agencyFilterOptions: DataTableFilterOption[] = useMemo(() => [{ value: "headquarters", label: "Headquarters" }, ...agencies.map((a) => ({ value: a.agency_id!, label: a.short_name! }))], [agencies]);

  if (!activeOrganizationId && !isLoading) {
    return <FeedbackCard icon={Building} title="No Organization Selected" description="Please select an active organization to manage suppliers." />;
  }

  return (
    <>
      <ResourceDataTable
        data={suppliers}
        columns={columns}
        isLoading={isLoading}
        error={error}
        onRefreshAction={refreshData}
        searchPlaceholder="Search suppliers..."
        onDeleteItemsAction={handleDeleteConfirmation}
        viewModeStorageKey="org-suppliers-view-mode"
        exportFileName="organization_suppliers.csv"
        pageHeader={
          <PageHeader title="Suppliers" description={`Manage all suppliers for ${activeOrganizationDetails?.long_name}`} action={<Button onClick={handleCreateAction}><PlusCircle className="mr-2 h-4 w-4" /> Add Supplier</Button>} />
        }
        filterControls={(table) => <DataTableFacetedFilter column={table.getColumn("agency_id")} title="Agency" options={agencyFilterOptions} />}
        renderGridItemAction={(supplier) => <SupplierCard supplier={supplier} agencies={agencies} onEditAction={handleEditAction} onDeleteAction={(item) => handleDeleteConfirmation([item])} />}
        emptyState={<FeedbackCard icon={Truck} title="No Suppliers Yet" description="Add your first supplier to manage your supply chain." actionButton={<Button onClick={handleCreateAction}><PlusCircle className="mr-2 h-4 w-4" /> Add Supplier</Button>} />}
        filteredEmptyState={<FeedbackCard icon={SearchIcon} title="No Suppliers Found" description="Your search did not match any suppliers." />}
      />
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will permanently delete <strong>{itemsToDelete.length} supplier(s)</strong>.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={executeDelete}>Continue</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
EOF
code app/\(dashboard\)/business-actor/org/suppliers/suppliers-client.tsx

echo "✅ All partner form workflows have been successfully overhauled and corrected."
echo "You now have dedicated, multi-step forms for Sales People and Suppliers."
echo "The client pages have been updated to use these new form pages."