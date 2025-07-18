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

  const refreshData = useCallback(() => setDataVersion((v) => v + 1), []);

  useEffect(() => {
    async function fetchData() {
      if (!activeOrganizationId) {
        setIsLoading(false);
        setCustomers([]);
        return;
      }
      setIsLoading(true);
      setError(null);
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

  // REASON: Changed to navigation
  const handleEditAction = (customer: CustomerDto) => {
    router.push(`/business-actor/org/customers/${customer.customer_id}/edit`);
  };

  const handleCreateAction = () => {
    router.push("/business-actor/org/customers/create");
  }

  const handleDeleteConfirmation = (items: CustomerDto[]) => {
    if (items.length === 0) return;
    setItemsToDelete(items);
    setIsDeleteDialogOpen(true);
  };

  const executeDelete = async () => {
    if (!activeOrganizationId || itemsToDelete.length === 0) return;
    const promise = Promise.all(
      itemsToDelete.map((item) =>
        item.agency_id
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

  const columns = useMemo<ColumnDef<CustomerDto>[]>(() => getCustomerColumns({ onEditAction: handleEditAction, onDeleteAction: (customer) => handleDeleteConfirmation([customer]), }, agencies), [agencies, router]);

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
          <PageHeader title="Customers" description={`Manage all customers for ${activeOrganizationDetails?.long_name}`} action={<Button onClick={handleCreateAction}><PlusCircle className="mr-2 h-4 w-4" /> Add Customer</Button>} />
        }
        filterControls={(table) => <DataTableFacetedFilter column={table.getColumn("agency_id")} title="Agency" options={agencyFilterOptions} />}
        renderGridItemAction={(customer) => <CustomerCard customer={customer} agencies={agencies} onEditAction={handleEditAction} onDeleteAction={(c) => { handleDeleteConfirmation([c]); }} />}
        emptyState={<FeedbackCard icon={Users} title="No Customers Yet" description="Add your first customer to start managing your client relationships." actionButton={<Button onClick={handleCreateAction}><PlusCircle className="mr-2 h-4 w-4" /> Add Customer</Button>} />}
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
