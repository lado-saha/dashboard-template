"use client";

import React, { useState, useMemo, useCallback } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { UserDto } from "@/types/auth";
import { authRepository } from "@/lib/data-repo/auth";
import { ResourceDataTable } from "@/components/resource-management/resource-data-table";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Users, Search as SearchIcon } from "lucide-react";
import { getUserColumns } from "./columns";
import { UserCard } from "./user-card";
import { FeedbackCard } from "@/components/ui/feedback-card";
import { DataTableFacetedFilter } from "@/components/ui/data-table-faceted-filter";

const statusOptions = [
  { value: "true", label: "Enabled" },
  { value: "false", label: "Disabled" },
];

interface UsersClientProps {
  initialUsers: UserDto[];
}

export function UsersClient({ initialUsers }: UsersClientProps) {
  const [users, setUsers] = useState<UserDto[]>(initialUsers);
  const [isLoading, setIsLoading] = useState(false);

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await authRepository.getAllUsers();
      setUsers(data);
    } catch (error) {
      toast.error("Failed to refresh user data.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleStatusToggle = (user: UserDto) => {
    toast.info(`Toggling status for ${user.username}... (Not Implemented in backend)`);
    // In a real app: call an API to update user status, then refreshData()
  };

  const handleVerify = (user: UserDto, type: "email" | "phone") => {
    toast.info(`Verifying ${type} for ${user.username}... (Not Implemented in backend)`);
    // In a real app: call an API to verify, then refreshData()
  };

  const columns = useMemo<ColumnDef<UserDto>[]>(
    () =>
      getUserColumns({
        onStatusToggleAction: handleStatusToggle,
        onVerifyAction: handleVerify,
      }),
    []
  );

  return (
    <ResourceDataTable
      data={users}
      columns={columns}
      isLoading={isLoading}
      error={null}
      onRefreshAction={refreshData}
      searchPlaceholder="Search by name, username, email..."
      onDeleteItemsAction={(items) =>
        toast.error(`Deletion of ${items.length} users is not implemented in backend.`)
      }
      viewModeStorageKey="sa-users-view-mode"
      exportFileName="users_export.csv"
      pageHeader={
        <PageHeader
          title="User Management"
          description="View, manage, and moderate all user accounts."
        />
      }
      filterControls={(table) => (
        <DataTableFacetedFilter
          column={table.getColumn("is_enabled")}
          title="Status"
          options={statusOptions}
        />
      )}
      renderGridItemAction={(user) => (
        <UserCard
          user={user}
          onStatusToggleAction={handleStatusToggle}
          onVerifyAction={handleVerify}
        />
      )}
      emptyState={
        <FeedbackCard
          icon={Users}
          title="No Users Found"
          description="There are no users registered on the platform yet."
        />
      }
      filteredEmptyState={
        <FeedbackCard
          icon={SearchIcon}
          title="No Users Found"
          description="Your search or filter criteria did not match any users."
        />
      }
    />
  );
}
