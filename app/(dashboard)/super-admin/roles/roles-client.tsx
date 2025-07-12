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
