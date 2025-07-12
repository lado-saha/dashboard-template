"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useActiveOrganization } from "@/contexts/active-organization-context";
import { organizationRepository } from "@/lib/data-repo/organization";
import {
  CustomerDto,
  CreateCustomerRequest,
  UpdateCustomerRequest,
} from "@/types/organization";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { PlusCircle, Users, Search as SearchIcon } from "lucide-react";
import { getCustomerColumns } from "@/components/organization/customers/columns";
import { CustomerCard } from "@/components/organization/customers/customer-card";
import { ResourceDataTable } from "@/components/resource-management/resource-data-table";
import { FeedbackCard } from "@/components/ui/feedback-card";
import { PageHeader } from "@/components/ui/page-header";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { CustomerForm } from "@/components/organization/customers/customer-form";

interface CustomersClientPageProps {
  initialData: CustomerDto[];
}

export function CustomersClientPage() {
  const router = useRouter();
  const { activeOrganizationId, activeOrganizationDetails } =
    useActiveOrganization();

  const [customers, setCustomers] = useState<CustomerDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemsToDelete, setItemsToDelete] = useState<CustomerDto[]>([]);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<
    CustomerDto | undefined
  >(undefined);

  const refreshData = useCallback(async () => {
    if (!activeOrganizationId) {
      // If there's no active org, don't try to fetch.
      setIsLoading(false);
      setCustomers([]); // Ensure data is cleared
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const data = await organizationRepository.getOrgCustomers(
        activeOrganizationId
      );
      setCustomers(data || []);
    } catch (err: any) {
      setError(err.message || "Could not load customer data.");
    } finally {
      setIsLoading(false);
    }
  }, [activeOrganizationId]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

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
    if (!activeOrganizationId || itemsToDelete.length === 0) return;
    const originalItems = [...customers];
    const idsToDelete = itemsToDelete.map((item) => item.customer_id!);
    setCustomers((prev) =>
      prev.filter((item) => !idsToDelete.includes(item.customer_id!))
    );
    setIsDeleteDialogOpen(false);

    const promise = Promise.all(
      itemsToDelete.map((item) =>
        organizationRepository.deleteOrgCustomer(
          activeOrganizationId,
          item.customer_id!
        )
      )
    );
    toast.promise(promise, {
      loading: `Deleting ${itemsToDelete.length} customer(s)...`,
      success: () => {
        refreshData();
        setItemsToDelete([]);
        return "Customer(s) deleted.";
      },
      error: (err) => {
        setCustomers(originalItems);
        setItemsToDelete([]);
        return `Failed to delete: ${err.message}`;
      },
    });
  };

  const handleFormSubmit = async (
    data: CreateCustomerRequest | UpdateCustomerRequest
  ): Promise<boolean> => {
    if (!activeOrganizationId) {
      toast.error("No active organization.");
      return false;
    }
    try {
      const promise = editingCustomer?.customer_id
        ? organizationRepository.updateOrgCustomer(
            activeOrganizationId,
            editingCustomer.customer_id,
            data as UpdateCustomerRequest
          )
        : organizationRepository.createOrgCustomer(
            activeOrganizationId,
            data as CreateCustomerRequest
          );

      await toast.promise(promise, {
        loading: `${editingCustomer ? "Updating" : "Creating"} customer...`,
        success: `Customer ${
          editingCustomer ? "updated" : "created"
        } successfully!`,
        error: (err) => err.message,
      });

      refreshData();
      setIsFormModalOpen(false);
      return true;
    } catch (error) {
      return false;
    }
  };

  const columns = useMemo<ColumnDef<CustomerDto>[]>(
    () =>
      getCustomerColumns({
        onEditAction: handleOpenFormModal,
        onDeleteAction: (item) => handleDeleteConfirmation([item]),
      }),
    []
  );

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
            description={`Manage customers for ${activeOrganizationDetails?.long_name}`}
            action={
              <Button onClick={() => handleOpenFormModal()}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Customer
              </Button>
            }
          />
        }
        renderGridItemAction={(customer) => (
          <CustomerCard
            customer={customer}
            onEditAction={handleOpenFormModal}
            onDeleteAction={(item) => handleDeleteConfirmation([item])}
          />
        )}
        emptyState={
          <FeedbackCard
            icon={Users}
            title="No Customers Yet"
            description="Add your first customer to start managing your client relationships."
            actionButton={
              <Button onClick={() => handleOpenFormModal()}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Customer
              </Button>
            }
          />
        }
        filteredEmptyState={
          <FeedbackCard
            icon={SearchIcon}
            title="No Customers Found"
            description="Your search did not match any customers."
          />
        }
      />

      <Dialog open={isFormModalOpen} onOpenChange={setIsFormModalOpen}>
        <DialogContent>
          <CustomerForm
            mode={editingCustomer ? "edit" : "create"}
            initialData={editingCustomer}
            onSubmitAction={handleFormSubmit}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete{" "}
              <strong>{itemsToDelete.length} customer(s)</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={executeDelete}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
