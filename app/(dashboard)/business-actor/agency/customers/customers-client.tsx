"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useActiveOrganization } from "@/contexts/active-organization-context";
import { organizationRepository } from "@/lib/data-repo/organization";
import { CustomerDto } from "@/types/organization";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { PlusCircle, Users, Building, Search as SearchIcon } from "lucide-react";
import { getCustomerColumns } from "@/components/organization/customers/columns";
import { CustomerCard } from "@/components/organization/customers/customer-card";
import { ResourceDataTable } from "@/components/resource-management/resource-data-table";
import { FeedbackCard } from "@/components/ui/feedback-card";
import { PageHeader } from "@/components/ui/page-header";

export function AgencyCustomersClientPage() {
  const router = useRouter();
  const { activeOrganizationId, activeAgencyId, activeAgencyDetails } = useActiveOrganization();
  const [customers, setCustomers] = useState<CustomerDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemsToDelete, setItemsToDelete] = useState<CustomerDto[]>([]);

  const refreshData = useCallback(async () => {
    if (!activeOrganizationId || !activeAgencyId) { setIsLoading(false); setCustomers([]); return; }
    setIsLoading(true);
    setError(null);
    try {
      const data = await organizationRepository.getAgencyCustomers(activeOrganizationId, activeAgencyId);
      setCustomers(data || []);
    } catch (err: any) {
      setError(err.message || "Could not load agency customers.");
    } finally {
      setIsLoading(false);
    }
  }, [activeOrganizationId, activeAgencyId]);

  useEffect(() => { refreshData(); }, [refreshData]);

  const handleCreateAction = () => router.push("/business-actor/agency/customers/create");
  const handleEditAction = (customer: CustomerDto) => router.push(`/business-actor/agency/customers/${customer.customer_id}/edit`);

  const handleDeleteConfirmation = (items: CustomerDto[]) => {
    if (items.length === 0) return;
    setItemsToDelete(items);
    setIsDeleteDialogOpen(true);
  };

  const executeDelete = async () => {
    if (!activeOrganizationId || !activeAgencyId || itemsToDelete.length === 0) return;
    const promise = Promise.all(itemsToDelete.map(item => organizationRepository.deleteAgencyCustomer(activeOrganizationId, activeAgencyId, item.customer_id!)));
    toast.promise(promise, {
      loading: `Deleting ${itemsToDelete.length} customer(s)...`,
      success: () => { refreshData(); setItemsToDelete([]); return "Customer(s) deleted."; },
      error: (err) => `Failed to delete: ${err.message}`,
    });
    setIsDeleteDialogOpen(false);
  };

  const columns = useMemo<ColumnDef<CustomerDto>[]>(() => getCustomerColumns({ onEditAction: handleEditAction, onDeleteAction: (item) => handleDeleteConfirmation([item]) }, [activeAgencyDetails!].filter(Boolean)), [activeAgencyDetails, router]);

  if (!activeAgencyId && !isLoading) {
    return <FeedbackCard icon={Building} title="No Agency Selected" description="Please select an active agency to manage its customers." />;
  }

  return (
    <>
      <ResourceDataTable
        data={customers}
        columns={columns}
        isLoading={isLoading}
        error={error}
        onRefreshAction={refreshData}
        searchPlaceholder="Search agency customers..."
        onDeleteItemsAction={handleDeleteConfirmation}
        viewModeStorageKey="agency-customers-view-mode"
        exportFileName="agency_customers.csv"
        pageHeader={<PageHeader title="Agency Customers" description={`Manage customers for ${activeAgencyDetails?.long_name || 'this agency'}`} action={<Button onClick={handleCreateAction}><PlusCircle className="mr-2 h-4 w-4" /> Add Customer</Button>} />}
        renderGridItemAction={(customer) => <CustomerCard customer={customer} agencies={[]} onEditAction={handleEditAction} onDeleteAction={(item) => handleDeleteConfirmation([item])} />}
        emptyState={<FeedbackCard icon={Users} title="No Customers in this Agency" description="Add your first customer to this agency." actionButton={<Button onClick={handleCreateAction}><PlusCircle className="mr-2 h-4 w-4" /> Add Customer</Button>} />}
        filteredEmptyState={<FeedbackCard icon={SearchIcon} title="No Customers Found" description="Your search did not match any customers in this agency." />}
      />
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will permanently delete <strong>{itemsToDelete.length} customer(s)</strong> from this agency.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={executeDelete}>Continue</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
