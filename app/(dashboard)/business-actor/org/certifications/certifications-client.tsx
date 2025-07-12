"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useActiveOrganization } from "@/contexts/active-organization-context";
import {
  CertificationDto,
  CreateCertificationRequest,
  UpdateCertificationRequest,
} from "@/types/organization";
import { organizationRepository } from "@/lib/data-repo/organization";
import {
  CertificationForm,
  CertificationFormData,
} from "@/components/organization/certifications/certification-form";
import { Button } from "@/components/ui/button";
import {
  PlusCircle,
  Award,
  Search as SearchIcon,
  Building,
} from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
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
import { ColumnDef } from "@tanstack/react-table";
import { getCertificationColumns } from "@/components/organization/certifications/columns";
import { CertificationCard } from "@/components/organization/certifications/certification-card";
import { ResourceDataTable } from "@/components/resource-management/resource-data-table";
import { FeedbackCard } from "@/components/ui/feedback-card";
import { PageHeader } from "@/components/ui/page-header";
import { DataTableFacetedFilter } from "@/components/ui/data-table-faceted-filter";
import { DataTableFilterOption } from "@/types/table";

const getCertificationTypeOptions = (
  items: CertificationDto[]
): DataTableFilterOption[] => {
  const allTypes = items
    .map((item) => item.type)
    .filter((type): type is string => typeof type === "string");
  return [...new Set(allTypes)]
    .map((type) => ({ label: type, value: type }))
    .sort((a, b) => a.label.localeCompare(b.label));
};

export function CertificationsClientPage() {
  const { activeOrganizationId, activeOrganizationDetails } =
    useActiveOrganization();
  const [allItems, setAllItems] = useState<CertificationDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<CertificationDto | undefined>(
    undefined
  );
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemsToDelete, setItemsToDelete] = useState<CertificationDto[]>([]);

  const derivedTypeOptions = useMemo(
    () => getCertificationTypeOptions(allItems),
    [allItems]
  );

  const refreshData = useCallback(async () => {
    if (!activeOrganizationId) {
      setIsLoading(false);
      setAllItems([]);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const data = await organizationRepository.getCertifications(
        activeOrganizationId
      );
      setAllItems(data || []);
    } catch (err: any) {
      setError(err.message || "Could not load certifications.");
    } finally {
      setIsLoading(false);
    }
  }, [activeOrganizationId]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const handleFormSubmit = async (
    data: CertificationFormData
  ): Promise<boolean> => {
    if (!activeOrganizationId) {
      toast.error("No active organization selected.");
      return false;
    }
    try {
      const payload = {
        ...data,
        obtainment_date: data.obtainment_date?.toISOString(),
      };
      const promise = editingItem?.certification_id
        ? organizationRepository.updateCertification(
            activeOrganizationId,
            editingItem.certification_id,
            payload as UpdateCertificationRequest
          )
        : organizationRepository.createCertification(
            activeOrganizationId,
            payload as CreateCertificationRequest
          );

      await toast.promise(promise, {
        loading: `${editingItem ? "Updating" : "Creating"} certification...`,
        success: `Certification ${
          editingItem ? "updated" : "created"
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

  const handleOpenFormModal = (item?: CertificationDto) => {
    setEditingItem(item);
    setIsFormModalOpen(true);
  };

  const handleDeleteConfirmation = (items: CertificationDto[]) => {
    if (items.length === 0) return;
    setItemsToDelete(items);
    setIsDeleteDialogOpen(true);
  };

  const executeDelete = async () => {
    if (!activeOrganizationId || itemsToDelete.length === 0) return;
    const originalItems = [...allItems];
    const idsToDelete = itemsToDelete.map((item) => item.certification_id!);
    setAllItems((prev) =>
      prev.filter((item) => !idsToDelete.includes(item.certification_id!))
    );
    setIsDeleteDialogOpen(false);

    const promise = Promise.all(
      itemsToDelete.map((item) =>
        organizationRepository.deleteCertification(
          activeOrganizationId,
          item.certification_id!
        )
      )
    );
    toast.promise(promise, {
      loading: `Deleting ${itemsToDelete.length} certification(s)...`,
      success: () => {
        refreshData();
        setItemsToDelete([]);
        return "Certification(s) deleted.";
      },
      error: (err) => {
        setAllItems(originalItems);
        setItemsToDelete([]);
        return `Failed to delete: ${err.message}`;
      },
    });
  };

  const columns = useMemo<ColumnDef<CertificationDto>[]>(
    () =>
      getCertificationColumns({
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
        description="Please select an active organization to manage its certifications."
      />
    );
  }

  return (
    <>
      <ResourceDataTable
        data={allItems}
        columns={columns}
        isLoading={isLoading}
        error={error}
        onRefreshAction={refreshData}
        searchPlaceholder="Search by name, type..."
        onDeleteItemsAction={handleDeleteConfirmation}
        viewModeStorageKey="org-certifications-view-mode"
        exportFileName="certifications.csv"
        pageHeader={
          <PageHeader
            title="Certifications"
            description={`Manage awards and certifications for ${activeOrganizationDetails?.long_name}`}
            action={
              <Button onClick={() => handleOpenFormModal()}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add New
              </Button>
            }
          />
        }
        filterControls={(table) =>
          derivedTypeOptions.length > 0 ? (
            <DataTableFacetedFilter
              column={table.getColumn("type")}
              title="Type"
              options={derivedTypeOptions}
            />
          ) : null
        }
        renderGridItemAction={(item) => (
          <CertificationCard
            item={item}
            onEditAction={handleOpenFormModal}
            onDeleteAction={(item) => handleDeleteConfirmation([item])}
          />
        )}
        emptyState={
          <FeedbackCard
            icon={Award}
            title="No Certifications Added Yet"
            description="Showcase your organization's qualifications by adding your first certification."
            actionButton={
              <Button onClick={() => handleOpenFormModal()}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Certification
              </Button>
            }
          />
        }
        filteredEmptyState={
          <FeedbackCard
            icon={SearchIcon}
            title="No Certifications Found"
            description="Your search or filter criteria did not match any certifications."
          />
        }
      />
      <Dialog
        open={isFormModalOpen}
        onOpenChange={(open) => {
          if (!open) setEditingItem(undefined);
          setIsFormModalOpen(open);
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogTitle className="sr-only">
            {editingItem ? "Edit Certification" : "Add New Certification"}
          </DialogTitle>
          <CertificationForm
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
              <strong>{itemsToDelete.length} certification(s)</strong>.
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
