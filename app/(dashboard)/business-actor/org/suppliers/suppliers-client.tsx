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
