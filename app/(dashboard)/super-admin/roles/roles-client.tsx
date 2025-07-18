"use client";

import React, { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { RoleDto, PermissionDto } from "@/types/auth";
import { authRepository } from "@/lib/data-repo/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { Loader2, Save, KeyRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export function RoleAssignmentClient() {
  const [roles, setRoles] = useState<RoleDto[]>([]);
  const [allPermissions, setAllPermissions] = useState<PermissionDto[]>([]);
  const [selectedRole, setSelectedRole] = useState<RoleDto | null>(null);
  const [rolePermissions, setRolePermissions] = useState<Set<string>>(new Set());
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isLoadingRolePerms, setIsLoadingRolePerms] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoadingData(true);
    try {
      const [fetchedRoles, fetchedPermissions] = await Promise.all([
        authRepository.getRoles(),
        authRepository.getAllPermissions(),
      ]);
      setRoles(fetchedRoles);
      setAllPermissions(fetchedPermissions);
      if (fetchedRoles.length > 0) {
        // Select the first role by default
        setSelectedRole(fetchedRoles[0]);
      }
    } catch (error: any) {
      toast.error(`Failed to load roles and permissions: ${error.message}`);
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // REASON: This effect now correctly fetches permissions when a role is selected.
  useEffect(() => {
    const fetchRolePermissions = async () => {
      if (!selectedRole?.id) {
        setRolePermissions(new Set());
        return;
      }
      setIsLoadingRolePerms(true);
      try {
        const perms = await authRepository.getPermissionsForRole(selectedRole.id);
        const permIds = new Set(perms.map(p => p.id!));
        setRolePermissions(permIds);
      } catch (error: any) {
        toast.error(`Failed to load permissions for ${selectedRole.name}.`);
      } finally {
        setIsLoadingRolePerms(false);
      }
    };
    fetchRolePermissions();
  }, [selectedRole]);

  const handlePermissionToggle = (permissionId: string, checked: boolean) => {
    setRolePermissions(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(permissionId);
      } else {
        newSet.delete(permissionId);
      }
      return newSet;
    });
  };

  const handleSaveChanges = async () => {
    if (!selectedRole?.id) return;
    setIsSaving(true);
    try {
      await authRepository.assignPermissionsToRole(selectedRole.id, Array.from(rolePermissions));
      toast.success(`Permissions for role "${selectedRole.name}" updated.`);
    } catch (error: any) {
      toast.error(`Failed to save permissions: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };
  
  if (isLoadingData) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Role & Permission Management"
        description="Assign permissions to roles to control user access across the platform."
        action={<Button onClick={handleSaveChanges} disabled={isSaving || isLoadingRolePerms}>{isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Changes</Button>}
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader><CardTitle>Roles</CardTitle></CardHeader>
          <CardContent>
            <ScrollArea className="h-[60vh]">
              <div className="space-y-1 pr-4">
                {roles.map(role => (
                  <Button key={role.id} variant="ghost" className={cn("w-full justify-start", selectedRole?.id === role.id && "bg-accent text-accent-foreground")} onClick={() => setSelectedRole(role)}>
                    {role.name}
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Permissions for: {selectedRole?.name || '...'}</CardTitle>
            <CardDescription>Select permissions to assign to this role.</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[60vh] relative">
              {isLoadingRolePerms && (
                <div className="absolute inset-0 bg-background/50 z-10 flex items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              )}
              <div className="space-y-4 pr-4">
                {allPermissions.length > 0 ? allPermissions.map(permission => (
                  <div key={permission.id} className="flex items-center space-x-3 rounded-md border p-3">
                    <Checkbox id={`perm-${permission.id}`} checked={rolePermissions.has(permission.id!)} onCheckedChange={(checked) => handlePermissionToggle(permission.id!, !!checked)} />
                    <Label htmlFor={`perm-${permission.id}`} className="font-medium leading-none cursor-pointer flex items-center gap-2">
                      <KeyRound className="h-4 w-4 text-muted-foreground" />
                      <div>
                        {permission.name}
                        <p className="text-xs text-muted-foreground font-normal">{permission.description || `Resource: ${permission.resource_id}`}</p>
                      </div>
                    </Label>
                  </div>
                )) : <p className="text-muted-foreground text-center">No permissions defined.</p>}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
