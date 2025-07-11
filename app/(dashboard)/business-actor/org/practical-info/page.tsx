"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useActiveOrganization } from "@/contexts/active-organization-context";
import {
  PracticalInformationDto,
  CreatePracticalInformationRequest,
  UpdatePracticalInformationRequest,
} from "@/types/organization";
import { organizationRepository } from "@/lib/data-repo/organization";
import { PracticalInfoForm } from "@/components/organization/practical-info/practical-info-form";
import { Button } from "@/components/ui/button";
import { PlusCircle, Info, Search as SearchIcon } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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
import { getPracticalInfoColumns } from "@/components/organization/practical-info/columns";
import { PracticalInfoCard } from "@/components/organization/practical-info/practical-info-card";
import { ResourceDataTable } from "@/components/resource-management/resource-data-table";
import { DataTableFacetedFilter } from "@/components/ui/data-table-faceted-filter";
import { DataTableFilterOption } from "@/types/table";
import { FeedbackCard } from "@/components/ui/feedback-card";

const getPracticalInfoTypeOptions = (
  items: PracticalInformationDto[]
): DataTableFilterOption[] => {
  const allTypes = items
    .map((item) => item.type)
    .filter((type): type is string => typeof type === "string");
  return [...new Set(allTypes)]
    .map((type) => ({ label: type, value: type }))
    .sort((a, b) => a.label.localeCompare(b.label));
};

export default function ManagePracticalInfoPage() {
  const { activeOrganizationId, activeOrganizationDetails } =
    useActiveOrganization();

  const [editingItem, setEditingItem] = useState<
    PracticalInformationDto | undefined
  >(undefined);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemsToDelete, setItemsToDelete] = useState<PracticalInformationDto[]>(
    []
  );
  const [allItems, setAllItems] = useState<PracticalInformationDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataVersion, setDataVersion] = useState(0);

  const derivedTypeOptions = useMemo(
    () => getPracticalInfoTypeOptions(allItems),
    [allItems]
  );

  const fetchData = useCallback(async () => {
    if (!activeOrganizationId) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const data = await organizationRepository.getPracticalInformation(
        activeOrganizationId
      );
      setAllItems(data || []);
    } catch (err: any) {
      setError(err.message || "Could not load practical information.");
    } finally {
      setIsLoading(false);
    }
  }, [activeOrganizationId]);

  useEffect(() => {
    fetchData();
  }, [fetchData, dataVersion]);

  const refreshData = useCallback(() => setDataVersion((v) => v + 1), []);

  const handleFormSubmitAttempt = async (
    data: CreatePracticalInformationRequest | UpdatePracticalInformationRequest,
    infoId?: string
  ): Promise<boolean> => {
    if (!activeOrganizationId) {
      toast.error("No active organization selected.");
      return false;
    }
    try {
      const promise = infoId
        ? organizationRepository.updatePracticalInformation(
            activeOrganizationId,
            infoId,
            data as UpdatePracticalInformationRequest
          )
        : organizationRepository.createPracticalInformation(
            activeOrganizationId,
            data as CreatePracticalInformationRequest
          );

      await toast.promise(promise, {
        loading: `${infoId ? "Updating" : "Adding"} information...`,
        success: `Information ${infoId ? "updated" : "added"} successfully!`,
        error: (err) => err.message || "Failed to save information.",
      });

      refreshData();
      setIsFormModalOpen(false);
      return true;
    } catch (error) {
      return false;
    }
  };

  const handleOpenFormModal = (item?: PracticalInformationDto) => {
    setEditingItem(item);
    setIsFormModalOpen(true);
  };

  const handleDeleteConfirmation = (items: PracticalInformationDto[]) => {
    if (items.length === 0) return;
    setItemsToDelete(items);
    setIsDeleteDialogOpen(true);
  };

  const executeDelete = async () => {
    if (!activeOrganizationId || itemsToDelete.length === 0) return;
    const originalItems = [...allItems];
    const idsToDelete = itemsToDelete.map((item) => item.information_id!);
    setAllItems((prev) =>
      prev.filter((item) => !idsToDelete.includes(item.information_id!))
    );
    setIsDeleteDialogOpen(false);

    const promise = Promise.all(
      itemsToDelete.map((item) =>
        organizationRepository.deletePracticalInformation(
          activeOrganizationId,
          item.information_id!
        )
      )
    );

    toast.promise(promise, {
      loading: `Deleting ${itemsToDelete.length} item(s)...`,
      success: () => {
        refreshData();
        setItemsToDelete([]);
        return `${itemsToDelete.length} item(s) deleted.`;
      },
      error: (err) => {
        setAllItems(originalItems);
        setItemsToDelete([]);
        return `Failed to delete: ${err.message}`;
      },
    });
  };

  const columns = useMemo<ColumnDef<PracticalInformationDto>[]>(
    () =>
      getPracticalInfoColumns({
        onEditAction: handleOpenFormModal,
        onDeleteAction: (item) => handleDeleteConfirmation([item]),
      }),
    []
  );

  return (
    <>
      <ResourceDataTable
        data={allItems}
        columns={columns}
        isLoading={isLoading}
        error={error}
        onRefreshAction={refreshData}
        searchPlaceholder="Search by type, value..."
        onDeleteItemsAction={handleDeleteConfirmation}
        viewModeStorageKey="practical-info-view-mode"
        exportFileName="practical_info_export.csv"
        pageHeader={
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Practical Information
              </h1>
              <p className="text-muted-foreground">
                Manage operational details for{" "}
                <b>{activeOrganizationDetails?.long_name}</b>
              </p>
            </div>
            <Button
              onClick={() => handleOpenFormModal()}
              size="sm"
              className="h-10"
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Add New
            </Button>
          </div>
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
          <PracticalInfoCard
            item={item}
            onEditAction={handleOpenFormModal}
            onDeleteAction={(item) => handleDeleteConfirmation([item])}
          />
        )}
        emptyState={
          <FeedbackCard
            icon={Info}
            title="No Practical Information Added"
            description="Add useful information for your team or customers, like opening hours or contact details."
            actionButton={
              <Button onClick={() => handleOpenFormModal()}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Information
              </Button>
            }
          />
        }
        filteredEmptyState={
          <FeedbackCard
            icon={SearchIcon}
            title="No Information Found"
            description="Your search or filter criteria did not match any items."
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
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Edit Information" : "Add New Information"}
            </DialogTitle>
            <DialogDescription>
              {editingItem
                ? `Update details for "${editingItem?.type}"`
                : "Provide details for the new piece of information."}
            </DialogDescription>
          </DialogHeader>
          <PracticalInfoForm
            organizationId={activeOrganizationId!}
            initialData={editingItem}
            mode={editingItem ? "edit" : "create"}
            onSubmitAttemptAction={handleFormSubmitAttempt}
            onCancelAction={() => {
              setIsFormModalOpen(false);
              setEditingItem(undefined);
            }}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete{" "}
              <strong>{itemsToDelete.length} item(s)</strong>.
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
