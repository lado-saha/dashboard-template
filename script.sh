#!/bin/bash

echo "🚀 Starting Super Admin UI Generation..."

# --- 1. Create Directories ---
echo "📁 Creating directories..."
mkdir -p components/admin/users
mkdir -p components/admin/roles
mkdir -p app/\(dashboard\)/super-admin/dashboard
mkdir -p app/\(dashboard\)/super-admin/users
mkdir -p app/\(dashboard\)/super-admin/roles
mkdir -p app/\(dashboard\)/super-admin/business-domains

# --- 2. Super Admin Dashboard Page ---
echo "📊 Creating Super Admin Dashboard page..."
code "app/(dashboard)/super-admin/dashboard/page.tsx"
cat > app/\(dashboard\)/super-admin/dashboard/page.tsx << 'EOF'
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Building, ShieldCheck } from "lucide-react";

export default function SuperAdminDashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Super Admin Dashboard"
        description="Platform-wide overview and management tools."
      />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">...</div>
            <p className="text-xs text-muted-foreground">Loading data...</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Organizations</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">...</div>
            <p className="text-xs text-muted-foreground">Loading data...</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Operational</div>
            <p className="text-xs text-muted-foreground">All services are online.</p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Platform Activity Feed</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Activity feed coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}
EOF

# --- 3. User Management Feature ---
echo "👤 Implementing User Management..."

# Create components/admin/users/columns.tsx
code "components/admin/users/columns.tsx"
cat > components/admin/users/columns.tsx << 'EOF'
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { UserDto } from "@/types/auth";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Shield, Ban } from "lucide-react";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface RowActionsProps {
  user: UserDto;
  onEditAction: (user: UserDto) => void;
}

const RowActions: React.FC<RowActionsProps> = ({ user, onEditAction }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onEditAction(user)}><Edit className="mr-2 h-4 w-4" /> Edit User</DropdownMenuItem>
        <DropdownMenuItem className="text-destructive focus:text-destructive"><Ban className="mr-2 h-4 w-4" /> Disable User</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const getUserColumns = (actionHandlers: Omit<RowActionsProps, "user">): ColumnDef<UserDto>[] => [
  { id: "select", header: ({ table }) => <Checkbox checked={table.getIsAllPageRowsSelected()} onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)} />, cell: ({ row }) => <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} />, enableSorting: false, enableHiding: false },
  {
    accessorKey: "first_name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="User" />,
    cell: ({ row }) => {
      const user = row.original;
      const name = `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username;
      const fallback = name ? name.charAt(0).toUpperCase() : "U";
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border"><AvatarImage src={undefined} alt={name} /><AvatarFallback>{fallback}</AvatarFallback></Avatar>
          <div>
            <div className="font-medium">{name}</div>
            <div className="text-xs text-muted-foreground">{user.email}</div>
          </div>
        </div>
      );
    },
  },
  { accessorKey: "username", header: ({ column }) => <DataTableColumnHeader column={column} title="Username" /> },
  {
    accessorKey: "is_enabled",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => <Badge variant={row.getValue("is_enabled") ? "default" : "destructive"}>{row.getValue("is_enabled") ? "Enabled" : "Disabled"}</Badge>,
    filterFn: (row, id, value) => value.includes(String(row.getValue(id))),
  },
  { id: "actions", cell: ({ row }) => <RowActions user={row.original} {...actionHandlers} /> },
];
EOF

# Create app/(dashboard)/super-admin/users/page.tsx
code "app/(dashboard)/super-admin/users/page.tsx"
cat > app/\(dashboard\)/super-admin/users/page.tsx << 'EOF'
import { Metadata } from "next";
import { UsersClientPage } from "./users-client";
import { authRepository } from "@/lib/data-repo/auth";

export const metadata: Metadata = {
  title: "User Management",
  description: "Administer all user accounts on the platform.",
};

export default async function SuperAdminUsersPage() {
  // Fetch initial data on the server
  const initialData = await authRepository.getAllUsers().catch(() => []);
  return <UsersClientPage initialData={initialData} />;
}
EOF

# Create app/(dashboard)/super-admin/users/users-client.tsx
code "app/(dashboard)/super-admin/users/users-client.tsx"
cat > app/\(dashboard\)/super-admin/users/users-client.tsx << 'EOF'
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
EOF

# --- 4. Role & Permission Management Feature ---
echo "🛡️ Implementing Role & Permission Management..."

# Create app/(dashboard)/super-admin/roles/page.tsx
code "app/(dashboard)/super-admin/roles/page.tsx"
cat > app/\(dashboard\)/super-admin/roles/page.tsx << 'EOF'
import { Metadata } from "next";
import { RolesClientPage } from "./roles-client";
import { authRepository } from "@/lib/data-repo/auth";

export const metadata: Metadata = {
  title: "Role & Permission Management",
  description: "Administer user roles and their associated permissions.",
};

export default async function SuperAdminRolesPage() {
  const [roles, permissions] = await Promise.all([
    authRepository.getRoles().catch(() => []),
    authRepository.getAllPermissions().catch(() => [])
  ]);
  return <RolesClientPage initialRoles={roles} initialPermissions={permissions} />;
}
EOF

# Create app/(dashboard)/super-admin/roles/roles-client.tsx
code "app/(dashboard)/super-admin/roles/roles-client.tsx"
cat > app/\(dashboard\)/super-admin/roles/roles-client.tsx << 'EOF'
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { RoleDto, PermissionDto } from "@/types/auth";
import { authRepository } from "@/lib/data-repo/auth";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, ShieldCheck, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function RolesClientPage({ initialRoles, initialPermissions }: { initialRoles: RoleDto[], initialPermissions: PermissionDto[] }) {
  const [roles, setRoles] = useState<RoleDto[]>(initialRoles);
  const [permissions, setPermissions] = useState<PermissionDto[]>(initialPermissions);
  const [selectedRole, setSelectedRole] = useState<RoleDto | null>(initialRoles[0] || null);
  const [assignedPermissions, setAssignedPermissions] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (selectedRole) {
      const rolePermissions = new Set(selectedRole.permissions?.map(p => p.id!) || []);
      setAssignedPermissions(rolePermissions);
    }
  }, [selectedRole]);

  const handlePermissionToggle = (permissionId: string) => {
    setAssignedPermissions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(permissionId)) {
        newSet.delete(permissionId);
      } else {
        newSet.add(permissionId);
      }
      return newSet;
    });
  };

  const handleSaveChanges = async () => {
    if (!selectedRole || !selectedRole.id) return;
    setIsLoading(true);
    
    const originalPermissions = new Set(selectedRole.permissions?.map(p => p.id!) || []);
    const permissionsToAssign = Array.from(assignedPermissions).filter(p => !originalPermissions.has(p));
    const permissionsToRemove = Array.from(originalPermissions).filter(p => !assignedPermissions.has(p));

    try {
      if (permissionsToAssign.length > 0) {
        await authRepository.assignPermissionsToRole(selectedRole.id, permissionsToAssign);
      }
      if (permissionsToRemove.length > 0) {
        await authRepository.removePermissionsFromRole(selectedRole.id, permissionsToRemove);
      }
      toast.success(`Permissions for role "${selectedRole.name}" updated successfully.`);
      // Refresh data
      const updatedRoles = await authRepository.getRoles();
      setRoles(updatedRoles);
      setSelectedRole(updatedRoles.find(r => r.id === selectedRole.id) || null);
    } catch (error: any) {
      toast.error("Failed to save changes: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Role Management" description="Assign permissions to user roles." action={<Button disabled><PlusCircle className="mr-2 h-4 w-4" /> Create Role</Button>} />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        <Card className="md:col-span-1">
          <CardHeader><CardTitle>Roles</CardTitle></CardHeader>
          <CardContent>
            <ScrollArea className="h-[60vh]">
              <div className="space-y-2">
                {roles.map(role => (
                  <Button key={role.id} variant={selectedRole?.id === role.id ? "secondary" : "ghost"} className="w-full justify-start" onClick={() => setSelectedRole(role)}>
                    <ShieldCheck className="mr-2 h-4 w-4" /> {role.name}
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Permissions for: {selectedRole ? `"${selectedRole.name}"` : "..."}</CardTitle>
            <CardDescription>Select the permissions this role should have.</CardDescription>
          </CardHeader>
          <CardContent>
            {selectedRole ? (
              <ScrollArea className="h-[60vh]">
                <div className="space-y-4">
                  {permissions.map(permission => (
                    <div key={permission.id} className="flex items-center space-x-3 rounded-md border p-3">
                      <Checkbox
                        id={`perm-${permission.id}`}
                        checked={assignedPermissions.has(permission.id!)}
                        onCheckedChange={() => handlePermissionToggle(permission.id!)}
                      />
                      <Label htmlFor={`perm-${permission.id}`} className="font-medium cursor-pointer">
                        {permission.name}
                        <p className="text-xs text-muted-foreground font-normal">{permission.description}</p>
                      </Label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="h-[60vh] flex items-center justify-center text-muted-foreground">Select a role to see its permissions.</div>
            )}
          </CardContent>
          {selectedRole && (
            <CardFooter className="border-t pt-6">
              <Button onClick={handleSaveChanges} disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
}
EOF

# --- 5. Move Business Domains Feature ---
echo "🚚 Moving Business Domains feature to Super Admin section..."
# Check if the old directory exists before trying to move
if [ -d "app/(dashboard)/business-actor/org/business-domains" ]; then
    mv app/\(dashboard\)/business-actor/org/business-domains/* app/\(dashboard\)/super-admin/business-domains/
    rm -rf app/\(dashboard\)/business-actor/org/business-domains
    echo "✅ Old business domains directory moved and removed."
else
    echo "ℹ️ No old business domains directory found to move."
fi

# --- Final Instructions ---
echo "🎉 Super Admin UI generation complete!"
echo "🔴 IMPORTANT: You must now update 'components/main-sidebar.tsx' to add the new Super Admin navigation links:"
echo "   - /super-admin/dashboard"
echo "   - /super-admin/users"
echo "   - /super-admin/roles"
echo "   - /super-admin/business-domains"