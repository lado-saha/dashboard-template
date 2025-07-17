#!/bin/bash
# Description: Refactors entity forms to follow Next.js best practices.
# 1. Creates reusable, DTO-accurate form components.
# 2. Establishes dedicated Server Component pages for create/edit routes.
# 3. Implements Client Components to handle logic and data fetching for these pages.
# 4. Updates main list views to navigate to these new pages.

echo "--- Starting Form Refactoring ---"

# ==============================================================================
# SECTION 1: REFACTORING SUPPLIERS (PROVIDER)
# ==============================================================================
echo "--- [1/3] Refactoring Supplier Forms and Pages ---"

# --- 1a. Create the reusable, corrected SupplierForm component ---
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

// REASON: This schema is now corrected to match the ProviderDto,
// using first_name, last_name, and product_service_type as required.
const supplierFormSchema = z.object({
  first_name: z.string().min(2, "First name is required."),
  last_name: z.string().min(2, "Last name is required."),
  product_service_type: z.string().min(3, "Service/Product type is required."),
  short_description: z.string().optional(),
  long_description: z.string().optional(),
  agency_id: z.string().nullable().optional(),
  logo: z.string().url("Invalid URL").optional().or(z.literal("")),
  logoFile: z.any().optional(),
});

export type SupplierFormData = z.infer<typeof supplierFormSchema>;

interface SupplierFormProps {
  initialData?: Partial<ProviderDto>;
  mode: "create" | "edit";
  onSubmitAction: (data: SupplierFormData) => Promise<boolean>;
  agencies: AgencyDto[];
  scopedAgencyId?: string | null;
  isLoading: boolean;
}

// REASON: This is a pure UI component. It is stateless and receives all logic
// via props, making it reusable for create, edit, org, and agency contexts.
export function SupplierForm({ initialData, mode, onSubmitAction, agencies, scopedAgencyId, isLoading }: SupplierFormProps) {
  const form = useForm<SupplierFormData>({
    resolver: zodResolver(supplierFormSchema),
    defaultValues: {
      first_name: initialData?.first_name || "",
      last_name: initialData?.last_name || "",
      product_service_type: initialData?.product_service_type || "",
      short_description: initialData?.short_description || "",
      long_description: initialData?.long_description || "",
      agency_id: scopedAgencyId !== undefined ? scopedAgencyId : (initialData?.agency_id || null),
      logo: initialData?.logo || "",
    },
  });

  return (
    <FormWrapper
      form={form}
      onFormSubmit={onSubmitAction}
      isLoading={isLoading}
      submitButtonText={mode === 'create' ? "Create Supplier" : "Save Changes"}
    >
      {() => (
        <div className="space-y-6">
          <FormField control={form.control} name="logoFile" render={({ field }) => ( <FormItem> <FormLabel>Supplier Logo / Photo</FormLabel> <FormControl> <ImageUploader currentImageUrl={form.getValues("logo")} onImageSelectedAction={(file, url) => { field.onChange(file); form.setValue("logo", url || ""); }} label="" fallbackName={`${form.getValues("first_name")} ${form.getValues("last_name")}`} /> </FormControl> <FormMessage /> </FormItem> )} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="first_name" render={({ field }) => (<FormItem><FormLabel>First Name *</FormLabel><FormControl><Input placeholder="John" {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="last_name" render={({ field }) => (<FormItem><FormLabel>Last Name *</FormLabel><FormControl><Input placeholder="Smith" {...field} /></FormControl><FormMessage /></FormItem>)} />
          </div>
          <FormField control={form.control} name="product_service_type" render={({ field }) => (<FormItem><FormLabel>Primary Service/Product Type *</FormLabel><FormControl><Input placeholder="e.g., Raw Materials, Logistics" {...field} /></FormControl><FormMessage /></FormItem>)} />
          
          {scopedAgencyId === undefined && (
             <FormField control={form.control} name="agency_id" render={({ field }) => (<FormItem><FormLabel>Agency Assignment</FormLabel><Select onValueChange={(value) => field.onChange(value === "headquarters" ? null : value)} defaultValue={field.value || "headquarters"}><FormControl><SelectTrigger><SelectValue placeholder="Assign to an agency..." /></SelectTrigger></FormControl><SelectContent><SelectItem value="headquarters">Headquarters (No Agency)</SelectItem>{agencies.map((agency) => (<SelectItem key={agency.agency_id} value={agency.agency_id!}>{agency.long_name}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>)} />
          )}
        </div>
      )}
    </FormWrapper>
  );
}
EOF
code components/organization/suppliers/supplier-form.tsx

# --- 1b. Create dedicated pages for Org Suppliers ---
mkdir -p app/\(dashboard\)/business-actor/org/suppliers/create
mkdir -p app/\(dashboard\)/business-actor/org/suppliers/[providerId]

# REASON: RSC page for creating an org-level supplier. Handles metadata, renders client component.
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

# REASON: Client component for the create page. Handles all state and logic.
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
      if (data.agency_id && createdSupplier.provider_id) {
         await organizationRepository.affectSupplierToAgency(activeOrganizationId, data.agency_id, { provider_id: createdSupplier.provider_id });
      }
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

# REASON: RSC page for editing an org-level supplier. Handles metadata, passes ID to client component.
cat << 'EOF' > app/\(dashboard\)/business-actor/org/suppliers/[providerId]/page.tsx
import { Metadata } from "next";
import { EditOrgSupplierClientPage } from "./edit-client";

export const metadata: Metadata = {
  title: "Edit Supplier",
};

type Props = { params: { providerId: string } };

export default function EditSupplierPage({ params }: Props) {
  return <EditOrgSupplierClientPage providerId={params.providerId} />;
}
EOF
code app/\(dashboard\)/business-actor/org/suppliers/[providerId]/page.tsx

# REASON: Client component for the edit page. Fetches data based on ID, handles logic.
cat << 'EOF' > app/\(dashboard\)/business-actor/org/suppliers/[providerId]/edit-client.tsx
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
      if (data.agency_id !== initialData.agency_id) {
        await organizationRepository.affectSupplierToAgency(activeOrganizationId, data.agency_id!, { provider_id: updatedSupplier.provider_id });
      }
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
code app/\(dashboard\)/business-actor/org/suppliers/[providerId]/edit-client.tsx

# --- 1c. Update main org supplier list to navigate to new pages ---
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

  const refreshData = useCallback(() => setDataVersion(v => v + 1), []);

  useEffect(() => {
    async function fetchData() {
        if (!activeOrganizationId) { setIsLoading(false); setSuppliers([]); return; }
        setIsLoading(true);
        setError(null);
        try {
          const [agenciesData, hqSuppliersData] = await Promise.all([
            organizationRepository.getAgencies(activeOrganizationId),
            organizationRepository.getOrgSuppliers(activeOrganizationId)
          ]);
          setAgencies(agenciesData || []);
          const agencySupplierPromises = (agenciesData || []).map(agency => organizationRepository.getAgencySuppliers(activeOrganizationId, agency.agency_id!));
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

  const handleEditAction = (providerId: string) => {
    router.push(`/business-actor/org/suppliers/${providerId}`);
  };

  const handleDeleteConfirmation = (items: ProviderDto[]) => {
    if (items.length === 0) return;
    setItemsToDelete(items);
    setIsDeleteDialogOpen(true);
  };

  const executeDelete = async () => {
    if (!activeOrganizationId || itemsToDelete.length === 0) return;
    const promise = Promise.all(itemsToDelete.map(item => item.agency_id
      ? organizationRepository.deleteAgencySupplier(activeOrganizationId, item.agency_id, item.provider_id!)
      : organizationRepository.deleteOrgSupplier(activeOrganizationId, item.provider_id!)
    ));
    toast.promise(promise, {
      loading: `Deleting ${itemsToDelete.length} supplier(s)...`,
      success: () => { refreshData(); setItemsToDelete([]); return "Supplier(s) deleted."; },
      error: (err) => `Failed to delete: ${err.message}`,
    });
    setIsDeleteDialogOpen(false);
  };

  const columns = useMemo<ColumnDef<ProviderDto>[]>(() => getSupplierColumns({ 
      onEditAction: (supplier) => handleEditAction(supplier.provider_id!),
      onDeleteAction: (item) => handleDeleteConfirmation([item]) 
    }, agencies), [agencies]);
  
  const agencyFilterOptions: DataTableFilterOption[] = useMemo(() => [{ value: "headquarters", label: "Headquarters" }, ...agencies.map(a => ({ value: a.agency_id!, label: a.short_name! }))], [agencies]);

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
        pageHeader={<PageHeader title="Suppliers" description={`Manage all suppliers for ${activeOrganizationDetails?.long_name}`} action={<Button onClick={() => router.push("/business-actor/org/suppliers/create")}><PlusCircle className="mr-2 h-4 w-4" /> Add Supplier</Button>} />}
        filterControls={(table) => (<DataTableFacetedFilter column={table.getColumn("agency_id")} title="Agency" options={agencyFilterOptions} />)}
        renderGridItemAction={(supplier) => <SupplierCard supplier={supplier} agencies={agencies} onEditAction={(s) => handleEditAction(s.provider_id!)} onDeleteAction={(item) => handleDeleteConfirmation([item])} />}
        emptyState={<FeedbackCard icon={Truck} title="No Suppliers Yet" description="Add your first supplier to manage your supply chain." actionButton={<Button onClick={() => router.push("/business-actor/org/suppliers/create")}><PlusCircle className="mr-2 h-4 w-4" /> Add Supplier</Button>} />}
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

echo "--- [2/3] Refactoring Sales People Forms and Pages ---"
# REASON: The DTO for SalesPerson uses a single `name` field, not first/last.
# The commission rate is also a key field. This corrects the form to match the DTO.

# --- 2a. Create the reusable, corrected SalesPersonForm component ---
mkdir -p components/organization/sales-people
cat << 'EOF' > components/organization/sales-people/sales-person-form.tsx
"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { SalesPersonDto, AgencyDto } from "@/types/organization";
import { FormWrapper } from "@/components/ui/form-wrapper";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// REASON: Corrected schema to use `name` and `commission_rate` as per DTO.
const salesPersonFormSchema = z.object({
  name: z.string().min(2, "Name is required."),
  commission_rate: z.coerce.number().min(0, "Commission rate cannot be negative.").optional(),
  agency_id: z.string().nullable().optional(),
});

export type SalesPersonFormData = z.infer<typeof salesPersonFormSchema>;

interface SalesPersonFormProps {
  initialData?: Partial<SalesPersonDto>;
  mode: "create" | "edit";
  onSubmitAction: (data: SalesPersonFormData) => Promise<boolean>;
  agencies: AgencyDto[];
  scopedAgencyId?: string | null;
  isLoading: boolean;
}

export function SalesPersonForm({ initialData, mode, onSubmitAction, agencies, scopedAgencyId, isLoading }: SalesPersonFormProps) {
  const form = useForm<SalesPersonFormData>({
    resolver: zodResolver(salesPersonFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      commission_rate: initialData?.commission_rate || 0,
      agency_id: scopedAgencyId !== undefined ? scopedAgencyId : (initialData?.agency_id || null),
    },
  });

  return (
    <FormWrapper
      form={form}
      onFormSubmit={onSubmitAction}
      isLoading={isLoading}
      title={mode === 'create' ? "Add New Sales Person" : "Edit Sales Person"}
      description="Manage sales team members and their assignments."
      submitButtonText={mode === 'create' ? "Add Sales Person" : "Save Changes"}
    >
      {() => (
        <div className="space-y-6">
          <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Full Name *</FormLabel><FormControl><Input placeholder="e.g., Jane Smith" {...field} /></FormControl><FormMessage /></FormItem>)} />
          <FormField control={form.control} name="commission_rate" render={({ field }) => (<FormItem><FormLabel>Commission Rate (%)</FormLabel><FormControl><Input type="number" placeholder="e.g., 5" {...field} value={field.value ?? ""} /></FormControl><FormMessage /></FormItem>)} />
          
          {scopedAgencyId === undefined && (
            <FormField control={form.control} name="agency_id" render={({ field }) => (<FormItem><FormLabel>Agency Assignment</FormLabel><Select onValueChange={(value) => field.onChange(value === "headquarters" ? null : value)} defaultValue={field.value || "headquarters"}><FormControl><SelectTrigger><SelectValue placeholder="Assign to an agency..." /></SelectTrigger></FormControl><SelectContent><SelectItem value="headquarters">Headquarters</SelectItem>{agencies.map((agency) => (<SelectItem key={agency.agency_id} value={agency.agency_id!}>{agency.long_name}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>)} />
          )}
        </div>
      )}
    </FormWrapper>
  );
}
EOF
code components/organization/sales-people/sales-person-form.tsx

# --- 2b. Create dedicated pages for Org Sales People ---
mkdir -p app/\(dashboard\)/business-actor/org/sales-people/create
mkdir -p app/\(dashboard\)/business-actor/org/sales-people/[salesPersonId]

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
      router.refresh();
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

cat << 'EOF' > app/\(dashboard\)/business-actor/org/sales-people/[salesPersonId]/page.tsx
import { Metadata } from "next";
import { EditOrgSalesPersonClientPage } from "./edit-client";

export const metadata: Metadata = {
  title: "Edit Sales Person",
};

type Props = { params: { salesPersonId: string } };

export default function EditSalesPersonPage({ params }: Props) {
  return <EditOrgSalesPersonClientPage salesPersonId={params.salesPersonId} />;
}
EOF
code app/\(dashboard\)/business-actor/org/sales-people/[salesPersonId]/page.tsx

cat << 'EOF' > app/\(dashboard\)/business-actor/org/sales-people/[salesPersonId]/edit-client.tsx
"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
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
code app/\(dashboard\)/business-actor/org/sales-people/[salesPersonId]/edit-client.tsx

# --- 2c. Update main org sales-people list to navigate to new pages ---
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

  const refreshData = useCallback(() => setDataVersion(v => v + 1), []);

  useEffect(() => {
    async function fetchData() {
        if (!activeOrganizationId) { setIsLoading(false); setSalesPeople([]); return; }
        setIsLoading(true);
        setError(null);
        try {
          const [agenciesData, hqData] = await Promise.all([
            organizationRepository.getAgencies(activeOrganizationId),
            organizationRepository.getOrgSalesPersons(activeOrganizationId),
          ]);
          setAgencies(agenciesData || []);
          const agencyPromises = (agenciesData || []).map((agency) => organizationRepository.getAgencySalesPersons(activeOrganizationId, agency.agency_id!));
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

  const handleEditAction = (salesPersonId: string) => {
    router.push(`/business-actor/org/sales-people/${salesPersonId}`);
  };

  const handleDeleteConfirmation = (items: SalesPersonDto[]) => {
    if (items.length === 0) return;
    setItemsToDelete(items);
    setIsDeleteDialogOpen(true);
  };

  const executeDelete = async () => {
    if (!activeOrganizationId || itemsToDelete.length === 0) return;
    const promise = Promise.all(itemsToDelete.map(item => item.agency_id
      ? organizationRepository.deleteAgencySalesPerson(activeOrganizationId, item.agency_id, item.sales_person_id!)
      : organizationRepository.deleteOrgSalesPerson(activeOrganizationId, item.sales_person_id!)
    ));
    toast.promise(promise, {
      loading: `Deleting ${itemsToDelete.length} sales person(s)...`,
      success: () => { refreshData(); setItemsToDelete([]); return "Sales person(s) deleted."; },
      error: (err) => `Failed to delete: ${err.message}`,
    });
    setIsDeleteDialogOpen(false);
  };

  const columns = useMemo<ColumnDef<SalesPersonDto>[]>(() => getSalesPersonColumns({
    onEditAction: (sp) => handleEditAction(sp.sales_person_id!),
    onDeleteAction: handleDeleteConfirmation
  }, agencies), [agencies]);

  const agencyFilterOptions: DataTableFilterOption[] = useMemo(() => [{ value: "headquarters", label: "Headquarters" }, ...agencies.map(a => ({ value: a.agency_id!, label: a.short_name! }))], [agencies]);

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
        pageHeader={<PageHeader title="Sales People" description={`Manage all sales people for ${activeOrganizationDetails?.long_name}`} action={<Button onClick={() => router.push("/business-actor/org/sales-people/create")}><PlusCircle className="mr-2 h-4 w-4" /> Add Sales Person</Button>} />}
        filterControls={(table) => (<DataTableFacetedFilter column={table.getColumn("agency_id")} title="Agency" options={agencyFilterOptions} />)}
        renderGridItemAction={(item) => <SalesPersonCard salesPerson={item} agencies={agencies} onEditAction={(sp) => handleEditAction(sp.sales_person_id!)} onDeleteAction={handleDeleteConfirmation} />}
        emptyState={<FeedbackCard icon={UserCheck} title="No Sales People Yet" description="Add your first sales person to build your sales team." actionButton={<Button onClick={() => router.push("/business-actor/org/sales-people/create")}><PlusCircle className="mr-2 h-4 w-4" /> Add Sales Person</Button>} />}
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


echo "--- [3/3] Finalizing Customer Page Refactor ---"
# REASON: The original script was on the right track but this ensures the final
# customer client component uses navigation instead of a dialog for create/edit.

# Update main org customer list to navigate to new pages (this is a correction/confirmation)
cat << 'EOF' > app/\(dashboard\)/business-actor/org/customers/customers-client.tsx
"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useActiveOrganization } from "@/contexts/active-organization-context";
import { organizationRepository } from "@/lib/data-repo/organization";
import { CustomerDto, AgencyDto } from "@/types/organization";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { PlusCircle, Users, Search as SearchIcon, Building } from "lucide-react";
import { getCustomerColumns } from "@/components/organization/customers/columns";
import { CustomerCard } from "@/components/organization/customers/customer-card";
import { ResourceDataTable } from "@/components/resource-management/resource-data-table";
import { FeedbackCard } from "@/components/ui/feedback-card";
import { PageHeader } from "@/components/ui/page-header";
import { DataTableFacetedFilter } from "@/components/ui/data-table-faceted-filter";
import { DataTableFilterOption } from "@/types/table";

export function CustomersClientPage() {
  const router = useRouter();
  const { activeOrganizationId, activeOrganizationDetails } = useActiveOrganization();
  const [customers, setCustomers] = useState<CustomerDto[]>([]);
  const [agencies, setAgencies] = useState<AgencyDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemsToDelete, setItemsToDelete] = useState<CustomerDto[]>([]);
  const [dataVersion, setDataVersion] = useState(0);

  const refreshData = useCallback(() => setDataVersion(v => v + 1), []);

  useEffect(() => {
    async function fetchData() {
        if (!activeOrganizationId) {
            setIsLoading(false); setCustomers([]); return;
        }
        setIsLoading(true); setError(null);
        try {
            const [agenciesData, hqCustomersData] = await Promise.all([
                organizationRepository.getAgencies(activeOrganizationId),
                organizationRepository.getOrgCustomers(activeOrganizationId),
            ]);
            setAgencies(agenciesData || []);
            const agencyCustomerPromises = (agenciesData || []).map((agency) =>
                organizationRepository.getAgencyCustomers(activeOrganizationId, agency.agency_id!)
            );
            const allAgencyCustomersNested = await Promise.all(agencyCustomerPromises);
            setCustomers([...(hqCustomersData || []), ...allAgencyCustomersNested.flat()]);
        } catch (err: any) {
            setError(err.message || "Could not load customer data.");
        } finally {
            setIsLoading(false);
        }
    }
    fetchData();
  }, [activeOrganizationId, dataVersion]);

  const handleEditAction = (customerId: string) => {
    router.push(`/business-actor/org/customers/${customerId}`);
  };
  
  const handleDeleteConfirmation = (items: CustomerDto[]) => {
    if (items.length === 0) return;
    setItemsToDelete(items);
    setIsDeleteDialogOpen(true);
  };

  const executeDelete = async () => {
    if (!activeOrganizationId || itemsToDelete.length === 0) return;
    const promise = Promise.all(
        itemsToDelete.map((item) => item.agency_id
            ? organizationRepository.deleteAgencyCustomer(activeOrganizationId, item.agency_id, item.customer_id!)
            : organizationRepository.deleteOrgCustomer(activeOrganizationId, item.customer_id!)
        )
    );
    toast.promise(promise, {
        loading: `Deleting ${itemsToDelete.length} customer(s)...`,
        success: () => { refreshData(); setItemsToDelete([]); return "Customer(s) deleted."; },
        error: (err) => `Failed to delete: ${err.message}`,
    });
    setIsDeleteDialogOpen(false);
  };

  const columns = useMemo<ColumnDef<CustomerDto>[]>(() => getCustomerColumns({ 
      onEditAction: (customer) => handleEditAction(customer.customer_id!), 
      onDeleteAction: handleDeleteConfirmation 
    }, agencies), [agencies]);

  const agencyFilterOptions: DataTableFilterOption[] = useMemo(() => [
      { value: "headquarters", label: "Headquarters" },
      ...agencies.map((a) => ({ value: a.agency_id!, label: a.short_name! })),
    ], [agencies]);

  if (!activeOrganizationId && !isLoading) {
    return <FeedbackCard icon={Building} title="No Organization Selected" description="Please select an active organization to manage customers." />;
  }

  return (
    <>
      <ResourceDataTable
        data={customers}
        columns={columns}
        isLoading={isLoading}
        error={error}
        onRefreshAction={refreshData}
        searchPlaceholder="Search customers..."
        onDeleteItemsAction={handleDeleteConfirmation}
        viewModeStorageKey="org-customers-view-mode"
        exportFileName="organization_customers.csv"
        pageHeader={
          <PageHeader
            title="Customers"
            description={`Manage all customers for ${activeOrganizationDetails?.long_name}`}
            action={ <Button onClick={() => router.push("/business-actor/org/customers/create")}><PlusCircle className="mr-2 h-4 w-4" /> Add Customer</Button> }
          />
        }
        filterControls={(table) => <DataTableFacetedFilter column={table.getColumn("agency_id")} title="Agency" options={agencyFilterOptions} />}
        renderGridItemAction={(customer) => <CustomerCard customer={customer} agencies={agencies} onEditAction={(c) => handleEditAction(c.customer_id!)} onDeleteAction={handleDeleteConfirmation} />}
        emptyState={
          <FeedbackCard icon={Users} title="No Customers Yet" description="Add your first customer to start managing your client relationships." actionButton={ <Button onClick={() => router.push("/business-actor/org/customers/create")}><PlusCircle className="mr-2 h-4 w-4" /> Add Customer</Button> } />
        }
        filteredEmptyState={<FeedbackCard icon={SearchIcon} title="No Customers Found" description="Your search did not match any customers." />}
      />
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will permanently delete <strong>{itemsToDelete.length} customer(s)</strong>.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={executeDelete}>Continue</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
EOF
code app/\(dashboard\)/business-actor/org/customers/customers-client.tsx


echo "--- All form refactoring steps complete. ---"