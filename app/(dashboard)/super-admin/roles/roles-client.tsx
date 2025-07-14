"use client";

import React, { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { RoleDto, PermissionDto } from "@/types/auth";
import { authRepository } from "@/lib/data-repo/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { Separator } from "@/components/ui/separator";
import { Loader2, Save } from "lucide-react";
import { cn } from "@/lib/utils";

interface RoleAssignmentClientProps {
  initialRoles: RoleDto[];
  allPermissions: PermissionDto[];
}

export function RoleAssignmentClient({ initialRoles, allPermissions }: RoleAssignmentClientProps) {
  const [roles, setRoles] = useState<RoleDto[]>(initialRoles);
  const [selectedRole, setSelectedRole] = useState<RoleDto | null>(null);
  const [rolePermissions, setRolePermissions] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (roles.length > 0 && !selectedRole) {
      setSelectedRole(roles[0]);
    }
  }, [roles, selectedRole]);

  useEffect(() => {
    if (selectedRole?.id) {
      setIsLoading(true);
      // In a real app, you'd fetch permissions for the selected role.
      // Here, we'll just simulate it.
      // For mock, we can assume some roles have some permissions.
      const mockPerms = new Set<string>();
      if (selectedRole.name === 'ADMIN_ROLE') {
        allPermissions.slice(0, 5).forEach(p => mockPerms.add(p.id!));
      }
      setRolePermissions(mockPerms);
      setIsLoading(false);
    }
  }, [selectedRole, allPermissions]);

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
    setIsLoading(true);
    try {
      // This logic would need to be more sophisticated in a real app,
      // calculating which permissions to add and which to remove.
      await authRepository.assignPermissionsToRole(selectedRole.id, Array.from(rolePermissions));
      toast.success(`Permissions for role "${selectedRole.name}" updated.`);
    } catch (error: any) {
      toast.error(`Failed to save permissions: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Role & Permission Management"
        description="Assign permissions to roles to control user access across the platform."
        action={<Button onClick={handleSaveChanges} disabled={isLoading}>{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Changes</Button>}
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader><CardTitle>Roles</CardTitle></CardHeader>
          <CardContent>
            <ScrollArea className="h-[60vh]">
              <div className="space-y-1 pr-4">
                {roles.map(role => (
                  <Button
                    key={role.id}
                    variant="ghost"
                    className={cn("w-full justify-start", selectedRole?.id === role.id && "bg-accent text-accent-foreground")}
                    onClick={() => setSelectedRole(role)}
                  >
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
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center h-[60vh]"><Loader2 className="h-8 w-8 animate-spin" /></div>
            ) : (
              <ScrollArea className="h-[60vh]">
                <div className="space-y-4 pr-4">
                  {allPermissions.map(permission => (
                    <div key={permission.id} className="flex items-center space-x-3 rounded-md border p-3">
                      <Checkbox
                        id={`perm-${permission.id}`}
                        checked={rolePermissions.has(permission.id!)}
                        onCheckedChange={(checked) => handlePermissionToggle(permission.id!, !!checked)}
                      />
                      <Label htmlFor={`perm-${permission.id}`} className="font-medium leading-none cursor-pointer">
                        {permission.name}
                        <p className="text-xs text-muted-foreground font-normal">{permission.description}</p>
                      </Label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}