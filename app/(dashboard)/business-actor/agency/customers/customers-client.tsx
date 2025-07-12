"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useActiveOrganization } from "@/contexts/active-organization-context";
import { organizationRepository } from "@/lib/data-repo/organization";
import { CustomerDto, CreateCustomerRequest, UpdateCustomerRequest } from "@/types/organization";
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
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { CustomerForm } from "@/components/organization/customers/customer-form";

export function AgencyCustomersClientPage() {
  const { activeOrganizationId, activeAgencyId, activeAgencyDetails } = useActiveOrganization();
  const [customers, setCustomers] = useState<CustomerDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemsToDelete, setItemsToDelete] = useState<CustomerDto[]>([]);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<CustomerDto | undefined>(undefined);

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

  const handleOpenFormModal = (customer?: CustomerDto) => {
    setEditingCustomer(customer);
    setIsFormModalOpen(true);
  };

  const handleDeleteConfirmation = (items: CustomerDto[]) => {
    if (items.length === 0) return;
    setItemsToDelete(items);
    setIsDeleteDialogOpen(true);
  };

  const executeDelete = async () => {
    if (!activeOrganizationId || !activeAgencyId || itemsToDelete.length === 0) return;
    const originalItems = [...customers];
    const idsToDelete = itemsToDelete.map(item => item.customer_id!);
    setCustomers(prev => prev.filter(item => !idsToDelete.includes(item.customer_id!)));
    setIsDeleteDialogOpen(false);

    const promise = Promise.all(itemsToDelete.map(item => organizationRepository.deleteAgencyCustomer(activeOrganizationId, activeAgencyId, item.customer_id!)));
    toast.promise(promise, {
      loading: `Deleting ${itemsToDelete.length} customer(s)...`,
      success: () => { refreshData(); setItemsToDelete([]); return "Customer(s) deleted."; },
      error: (err) => { setCustomers(originalItems); setItemsToDelete([]); return `Failed to delete: ${err.message}`; },
    });
  };

  const handleFormSubmit = async (data: CreateCustomerRequest | UpdateCustomerRequest): Promise<boolean> => {
    if (!activeOrganizationId || !activeAgencyId) { toast.error("No active agency selected."); return false; }
    try {
      const promise = editingCustomer?.customer_id
        ? organizationRepository.updateAgencyCustomer(activeOrganizationId, activeAgencyId, editingCustomer.customer_id, data as UpdateCustomerRequest)
        : organizationRepository.createAgencyCustomer(activeOrganizationId, activeAgencyId, data as CreateCustomerRequest);
      
      await toast.promise(promise, {
        loading: `${editingCustomer ? 'Updating' : 'Creating'} customer...`,
        success: `Customer ${editingCustomer ? 'updated' : 'created'} successfully!`,
        error: (err) => err.message,
      });

      refreshData();
      setIsFormModalOpen(false);
      return true;
    } catch (error) {
      return false;
    }
  };

  const columns = useMemo<ColumnDef<CustomerDto>[]>(() => getCustomerColumns({ onEditAction: handleOpenFormModal, onDeleteAction: (item) => handleDeleteConfirmation([item]) }, []), []);

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
        pageHeader={<PageHeader title="Agency Customers" description={`Manage customers for ${activeAgencyDetails?.long_name || 'this agency'}`} action={<Button onClick={() => handleOpenFormModal()}><PlusCircle className="mr-2 h-4 w-4" /> Add Customer</Button>} />}
        renderGridItemAction={(customer) => <CustomerCard customer={customer} agencies={[]} onEditAction={handleOpenFormModal} onDeleteAction={(item) => handleDeleteConfirmation([item])} />}
        emptyState={<FeedbackCard icon={Users} title="No Customers in this Agency" description="Add your first customer to this agency." actionButton={<Button onClick={() => handleOpenFormModal()}><PlusCircle className="mr-2 h-4 w-4" /> Add Customer</Button>} />}
        filteredEmptyState={<FeedbackCard icon={SearchIcon} title="No Customers Found" description="Your search did not match any customers in this agency." />}
      />
      <Dialog open={isFormModalOpen} onOpenChange={setIsFormModalOpen}>
        <DialogContent>
          <DialogTitle className="sr-only">{editingCustomer ? "Edit Customer" : "Add New Customer"}</DialogTitle>
          <CustomerForm mode={editingCustomer ? "edit" : "create"} initialData={editingCustomer} onSubmitAction={handleFormSubmit} agencies={[]} hideAgencySelector={true} />
        </DialogContent>
      </Dialog>
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will permanently delete <strong>{itemsToDelete.length} customer(s)</strong> from this agency.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={executeDelete}>Continue</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}