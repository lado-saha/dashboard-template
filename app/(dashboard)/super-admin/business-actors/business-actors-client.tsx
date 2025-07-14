"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { BusinessActorDto } from "@/types/organization";
import { organizationRepository } from "@/lib/data-repo/organization";
import { ResourceDataTable } from "@/components/resource-management/resource-data-table";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { PlusCircle, UserPlus, Search as SearchIcon } from "lucide-react";
import { getBusinessActorColumns } from "./columns";
import { BusinessActorCard } from "./business-actor-card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { BusinessActorForm } from "@/components/business-actor/business-actor-form";
import { FeedbackCard } from "@/components/ui/feedback-card";
import { DataTableFacetedFilter } from "@/components/ui/data-table-faceted-filter";

const statusOptions = [
  { value: "true", label: "Active" },
  { value: "false", label: "Inactive" },
];
const verifiedOptions = [
  { value: "true", label: "Verified" },
  { value: "false", label: "Not Verified" },
];

export function BusinessActorsClient() {
  const [actors, setActors] = useState<BusinessActorDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingActor, setEditingActor] = useState<
    BusinessActorDto | undefined
  >();

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const updatedActors = await organizationRepository.getAllBusinessActors();
      setActors(updatedActors);
    } catch (err: any) {
      setError(err.message || "Failed to fetch business actors.");
      toast.error(err.message || "Failed to fetch business actors.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const handleOpenDialog = (actor?: BusinessActorDto) => {
    setEditingActor(actor);
    setIsFormOpen(true);
  };

  const handleFormSuccess = () => {
    refreshData();
    setIsFormOpen(false);
    setEditingActor(undefined);
  };

  const handleDelete = (actorsToDelete: BusinessActorDto[]) => {
    toast.error(
      `Deletion of ${actorsToDelete.length} actor(s) is not implemented.`
    );
  };

  const columns = useMemo<ColumnDef<BusinessActorDto>[]>(
    () =>
      getBusinessActorColumns({
        onEditAction: handleOpenDialog,
        onDeleteAction: (actor) => handleDelete([actor]),
      }),
    []
  );

  return (
    <>
      <ResourceDataTable
        data={actors}
        columns={columns}
        isLoading={isLoading}
        error={error}
        onRefreshAction={refreshData}
        searchPlaceholder="Search by name, email..."
        onDeleteItemsAction={handleDelete}
        viewModeStorageKey="sa-ba-view-mode"
        exportFileName="business_actors.csv"
        pageHeader={
          <PageHeader
            title="Business Actors"
            description="Manage all business actor profiles on the platform."
            action={
              <Button onClick={() => handleOpenDialog()}>
                <UserPlus className="mr-2 h-4 w-4" /> Create Profile
              </Button>
            }
          />
        }
        filterControls={(table) => (
          <>
            <DataTableFacetedFilter
              column={table.getColumn("is_active")}
              title="Status"
              options={statusOptions}
            />
            <DataTableFacetedFilter
              column={table.getColumn("is_verified")}
              title="Verification"
              options={verifiedOptions}
            />
          </>
        )}
        renderGridItemAction={(actor) => (
          <BusinessActorCard
            actor={actor}
            onEditAction={handleOpenDialog}
            onDeleteAction={() => handleDelete([actor])}
          />
        )}
        emptyState={
          <FeedbackCard
            icon={UserPlus}
            title="No Business Actors"
            description="There are no business actor profiles created yet. Create one to get started."
            actionButton={
              <Button onClick={() => handleOpenDialog()}>
                <PlusCircle className="mr-2 h-4 w-4" /> Create Profile
              </Button>
            }
          />
        }
        filteredEmptyState={
          <FeedbackCard
            icon={SearchIcon}
            title="No Actors Found"
            description="Your search or filter criteria did not match any business actors."
          />
        }
      />

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {editingActor
                ? "Edit Business Actor Profile"
                : "Create New Business Actor Profile"}
            </DialogTitle>
            <DialogDescription>
              {editingActor
                ? `Editing profile for ${editingActor.first_name}`
                : "Create a new, independent business profile."}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 max-h-[80vh] overflow-y-auto pr-2">
            <BusinessActorForm
              mode={editingActor ? "edit" : "create"}
              initialData={editingActor}
              onSuccessAction={handleFormSuccess}
              onCancelAction={() => setIsFormOpen(false)}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
