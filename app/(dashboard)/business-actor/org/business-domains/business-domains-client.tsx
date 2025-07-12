"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useActiveOrganization } from "@/contexts/active-organization-context";
import { organizationRepository } from "@/lib/data-repo/organization";
import {
  BusinessDomainDto,
  CreateBusinessDomainRequest,
  UpdateBusinessDomainRequest,
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
import { PlusCircle, Tag, Search as SearchIcon, Building } from "lucide-react";
import { getBusinessDomainColumns } from "@/components/admin/business-domains/columns";
import { BusinessDomainCard } from "@/components/admin/business-domains/business-domain-card";
import { ResourceDataTable } from "@/components/resource-management/resource-data-table";
import { FeedbackCard } from "@/components/ui/feedback-card";
import { PageHeader } from "@/components/ui/page-header";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  BusinessDomainForm,
  BusinessDomainFormData,
} from "@/components/admin/business-domains/business-domain-form";

export function OrgBusinessDomainsClientPage() {
  const { activeOrganizationId, activeOrganizationDetails } =
    useActiveOrganization();
  const [domains, setDomains] = useState<BusinessDomainDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemsToDelete, setItemsToDelete] = useState<BusinessDomainDto[]>([]);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BusinessDomainDto | undefined>(
    undefined
  );

  const refreshData = useCallback(async () => {
    if (!activeOrganizationId) {
      setIsLoading(false);
      setDomains([]);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const data = await organizationRepository.getAllBusinessDomains({
        organization_id: activeOrganizationId,
      });
      setDomains(data || []);
    } catch (err: any) {
      setError(err.message || "Could not load custom business domains.");
    } finally {
      setIsLoading(false);
    }
  }, [activeOrganizationId]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const handleOpenFormModal = (item?: BusinessDomainDto) => {
    setEditingItem(item);
    setIsFormModalOpen(true);
  };

  const handleDeleteConfirmation = (items: BusinessDomainDto[]) => {
    if (items.length === 0) return;
    setItemsToDelete(items);
    setIsDeleteDialogOpen(true);
  };

  const executeDelete = async () => {
    if (itemsToDelete.length === 0) return;
    const originalItems = [...domains];
    const idsToDelete = itemsToDelete.map((item) => item.id!);
    setDomains((prev) =>
      prev.filter((item) => !idsToDelete.includes(item.id!))
    );
    setIsDeleteDialogOpen(false);

    const promise = Promise.all(
      itemsToDelete.map((item) =>
        organizationRepository.deleteBusinessDomain(item.id!)
      )
    );
    toast.promise(promise, {
      loading: `Deleting ${itemsToDelete.length} domain(s)...`,
      success: () => {
        refreshData();
        setItemsToDelete([]);
        return "Domain(s) deleted.";
      },
      error: (err) => {
        setDomains(originalItems);
        setItemsToDelete([]);
        return `Failed to delete: ${err.message}`;
      },
    });
  };

  const handleFormSubmit = async (
    data: BusinessDomainFormData
  ): Promise<boolean> => {
    try {
      const payload = { ...data, organization_id: activeOrganizationId };
      const promise = editingItem?.id
        ? organizationRepository.updateBusinessDomain(
            editingItem.id,
            payload as UpdateBusinessDomainRequest
          )
        : organizationRepository.createBusinessDomain(
            payload as CreateBusinessDomainRequest
          );

      await toast.promise(promise, {
        loading: `${editingItem ? "Updating" : "Creating"} domain...`,
        success: `Domain ${editingItem ? "updated" : "created"} successfully!`,
        error: (err) => err.message,
      });

      refreshData();
      setIsFormModalOpen(false);
      return true;
    } catch (error) {
      return false;
    }
  };

  const columns = useMemo<ColumnDef<BusinessDomainDto>[]>(
    () =>
      getBusinessDomainColumns({
        onEditAction: handleOpenFormModal,
        onDeleteAction: (item) => handleDeleteConfirmation([item]),
      }),
    []
  );

  if (!activeOrganizationId && !isLoading) {
    return (
      <FeedbackCard
        icon={Building}
        title="No Organization Selected"
        description="Please select an active organization to manage its custom domains."
      />
    );
  }

  return (
    <>
      <ResourceDataTable
        data={domains}
        columns={columns}
        isLoading={isLoading}
        error={error}
        onRefreshAction={refreshData}
        searchPlaceholder="Search custom domains..."
        onDeleteItemsAction={handleDeleteConfirmation}
        viewModeStorageKey="org-domains-view-mode"
        exportFileName="custom_domains.csv"
        pageHeader={
          <PageHeader
            title="Custom Business Domains"
            description={`Manage domains specific to ${activeOrganizationDetails?.long_name}`}
            action={
              <Button onClick={() => handleOpenFormModal()}>
                <PlusCircle className="mr-2 h-4 w-4" /> Create Domain
              </Button>
            }
          />
        }
        renderGridItemAction={(item) => (
          <BusinessDomainCard
            domain={item}
            onEditAction={handleOpenFormModal}
            onDeleteAction={(item) => handleDeleteConfirmation([item])}
          />
        )}
        emptyState={
          <FeedbackCard
            icon={Tag}
            title="No Custom Domains"
            description="Create custom business domains tailored to your organization's needs."
            actionButton={
              <Button onClick={() => handleOpenFormModal()}>
                <PlusCircle className="mr-2 h-4 w-4" /> Create Domain
              </Button>
            }
          />
        }
        filteredEmptyState={
          <FeedbackCard
            icon={SearchIcon}
            title="No Domains Found"
            description="Your search did not match any custom domains."
          />
        }
      />
      <Dialog open={isFormModalOpen} onOpenChange={setIsFormModalOpen}>
        <DialogContent>
          <DialogTitle className="sr-only">
            {editingItem ? "Edit Domain" : "Create New Domain"}
          </DialogTitle>
          <BusinessDomainForm
            mode={editingItem ? "edit" : "create"}
            initialData={editingItem}
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
              <strong>{itemsToDelete.length} domain(s)</strong>.
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
