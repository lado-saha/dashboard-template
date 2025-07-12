"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useActiveOrganization } from "@/contexts/active-organization-context";
import { organizationRepository } from "@/lib/data-repo/organization";
import {
  ProviderDto,
  CreateProviderRequest,
  UpdateProviderRequest,
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
import {
  PlusCircle,
  Truck,
  Search as SearchIcon,
  Building,
} from "lucide-react";
import { getSupplierColumns } from "@/components/organization/suppliers/columns";
import { SupplierCard } from "@/components/organization/suppliers/supplier-card";
import { ResourceDataTable } from "@/components/resource-management/resource-data-table";
import { FeedbackCard } from "@/components/ui/feedback-card";
import { PageHeader } from "@/components/ui/page-header";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  SupplierForm,
  SupplierFormData,
} from "@/components/organization/suppliers/supplier-form";

export function AgencySuppliersClientPage() {
  const { activeOrganizationId, activeAgencyId, activeAgencyDetails } =
    useActiveOrganization();
  const [suppliers, setSuppliers] = useState<ProviderDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemsToDelete, setItemsToDelete] = useState<ProviderDto[]>([]);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<
    ProviderDto | undefined
  >(undefined);

  const refreshData = useCallback(async () => {
    if (!activeOrganizationId || !activeAgencyId) {
      setIsLoading(false);
      setSuppliers([]);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const data = await organizationRepository.getAgencySuppliers(
        activeOrganizationId,
        activeAgencyId
      );
      setSuppliers(data || []);
    } catch (err: any) {
      setError(err.message || "Could not load agency suppliers.");
    } finally {
      setIsLoading(false);
    }
  }, [activeOrganizationId, activeAgencyId]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const handleOpenFormModal = (supplier?: ProviderDto) => {
    setEditingSupplier(supplier);
    setIsFormModalOpen(true);
  };

  const handleDeleteConfirmation = (items: ProviderDto[]) => {
    if (items.length === 0) return;
    setItemsToDelete(items);
    setIsDeleteDialogOpen(true);
  };

  const executeDelete = async () => {
    if (!activeOrganizationId || !activeAgencyId || itemsToDelete.length === 0)
      return;
    const originalItems = [...suppliers];
    const idsToDelete = itemsToDelete.map((item) => item.provider_id!);
    setSuppliers((prev) =>
      prev.filter((item) => !idsToDelete.includes(item.provider_id!))
    );
    setIsDeleteDialogOpen(false);

    const promise = Promise.all(
      itemsToDelete.map((item) =>
        organizationRepository.deleteAgencySupplier(
          activeOrganizationId,
          activeAgencyId,
          item.provider_id!
        )
      )
    );
    toast.promise(promise, {
      loading: `Deleting ${itemsToDelete.length} supplier(s)...`,
      success: () => {
        refreshData();
        setItemsToDelete([]);
        return "Supplier(s) deleted.";
      },
      error: (err) => {
        setSuppliers(originalItems);
        setItemsToDelete([]);
        return `Failed to delete: ${err.message}`;
      },
    });
  };

  const handleFormSubmit = async (data: SupplierFormData): Promise<boolean> => {
    if (!activeOrganizationId || !activeAgencyId) {
      toast.error("No active agency selected.");
      return false;
    }
    try {
      const promise = editingSupplier?.provider_id
        ? organizationRepository.updateAgencySupplier(
            activeOrganizationId,
            activeAgencyId,
            editingSupplier.provider_id,
            data as UpdateProviderRequest
          )
        : organizationRepository.createAgencySupplier(
            activeOrganizationId,
            activeAgencyId,
            data as CreateProviderRequest
          );

      await toast.promise(promise, {
        loading: `${editingSupplier ? "Updating" : "Creating"} supplier...`,
        success: `Supplier ${
          editingSupplier ? "updated" : "created"
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

  const columns = useMemo<ColumnDef<ProviderDto>[]>(
    () =>
      getSupplierColumns(
        {
          onEditAction: handleOpenFormModal,
          onDeleteAction: (item) => handleDeleteConfirmation([item]),
        },
        [activeAgencyDetails!].filter(Boolean)
      ),
    [activeAgencyDetails]
  );

  if (!activeAgencyId && !isLoading) {
    return (
      <FeedbackCard
        icon={Building}
        title="No Agency Selected"
        description="Please select an active agency to manage its suppliers."
      />
    );
  }

  return (
    <>
      <ResourceDataTable
        data={suppliers}
        columns={columns}
        isLoading={isLoading}
        error={error}
        onRefreshAction={refreshData}
        searchPlaceholder="Search agency suppliers..."
        onDeleteItemsAction={handleDeleteConfirmation}
        viewModeStorageKey="agency-suppliers-view-mode"
        exportFileName="agency_suppliers.csv"
        pageHeader={
          <PageHeader
            title="Agency Suppliers"
            description={`Manage suppliers for ${
              activeAgencyDetails?.long_name || "this agency"
            }`}
            action={
              <Button onClick={() => handleOpenFormModal()}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Supplier
              </Button>
            }
          />
        }
        renderGridItemAction={(supplier) => (
          <SupplierCard
            supplier={supplier}
            agencies={[]}
            onEditAction={handleOpenFormModal}
            onDeleteAction={(item) => handleDeleteConfirmation([item])}
          />
        )}
        emptyState={
          <FeedbackCard
            icon={Truck}
            title="No Suppliers in this Agency"
            description="Add your first supplier to this agency."
            actionButton={
              <Button onClick={() => handleOpenFormModal()}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Supplier
              </Button>
            }
          />
        }
        filteredEmptyState={
          <FeedbackCard
            icon={SearchIcon}
            title="No Suppliers Found"
            description="Your search did not match any suppliers in this agency."
          />
        }
      />
      <Dialog open={isFormModalOpen} onOpenChange={setIsFormModalOpen}>
        <DialogContent>
          <DialogTitle className="sr-only">
            {editingSupplier ? "Edit Supplier" : "Add New Supplier"}
          </DialogTitle>
          <SupplierForm
            mode={editingSupplier ? "edit" : "create"}
            initialData={editingSupplier}
            onSubmitAction={handleFormSubmit}
            agencies={[]}
            hideAgencySelector={true}
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
              <strong>{itemsToDelete.length} supplier(s)</strong> from this
              agency.
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
