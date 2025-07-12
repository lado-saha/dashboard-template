"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { authRepository } from "@/lib/data-repo/auth";
import { UserDto } from "@/types/auth";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PlusCircle, Users, Search as SearchIcon } from "lucide-react";
import { getUserColumns } from "@/components/admin/users/columns";
import { ResourceDataTable } from "@/components/resource-management/resource-data-table";
import { FeedbackCard } from "@/components/ui/feedback-card";
import { PageHeader } from "@/components/ui/page-header";
import { DataTableFacetedFilter } from "@/components/ui/data-table-faceted-filter";

const statusOptions = [{ value: "true", label: "Enabled" }, { value: "false", label: "Disabled" }];

export function UsersClientPage({ initialData }: { initialData: UserDto[] }) {
  const [users, setUsers] = useState<UserDto[]>(initialData);
  const [isLoading, setIsLoading] = useState(initialData.length === 0);
  const [error, setError] = useState<string | null>(null);

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await authRepository.getAllUsers();
      setUsers(data || []);
    } catch (err: any) {
      setError(err.message || "Could not load users.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialData.length === 0) {
      refreshData();
    }
  }, [initialData, refreshData]);

  const handleEditUser = (user: UserDto) => toast.info(`Editing for ${user.username} is not yet implemented.`);
  const handleDeleteUsers = (users: UserDto[]) => toast.error(`Deletion of ${users.length} user(s) is not yet implemented.`);

  const columns = useMemo<ColumnDef<UserDto>[]>(() => getUserColumns({ onEditAction: handleEditUser }), []);

  return (
    <ResourceDataTable
      data={users}
      columns={columns}
      isLoading={isLoading}
      error={error}
      onRefreshAction={refreshData}
      searchPlaceholder="Search users by name, email, or username..."
      onDeleteItemsAction={handleDeleteUsers}
      viewModeStorageKey="admin-users-view-mode"
      exportFileName="platform_users.csv"
      pageHeader={<PageHeader title="User Management" description="View and manage all user accounts on the platform." action={<Button disabled><PlusCircle className="mr-2 h-4 w-4" /> Add User</Button>} />}
      filterControls={(table) => <DataTableFacetedFilter column={table.getColumn("is_enabled")} title="Status" options={statusOptions} />}
      renderGridItemAction={(user) => <div>Card view not implemented for users.</div>}
      emptyState={<FeedbackCard icon={Users} title="No Users Found" description="This is unusual. There should at least be an admin user." />}
      filteredEmptyState={<FeedbackCard icon={SearchIcon} title="No Users Found" description="Your search did not match any users." />}
    />
  );
}
