import { Metadata } from "next";
import { authRepository } from "@/lib/data-repo/auth";
import { RoleAssignmentClient } from "./roles-client";

export const metadata: Metadata = {
  title: "Roles & Permissions",
  description: "Configure Role-Based Access Control (RBAC) for the platform.",
};

export default async function SuperAdminRolesPage() {
  const [roles, permissions] = await Promise.all([
    authRepository.getRoles(),
    authRepository.getAllPermissions(),
  ]);

  return (
    <RoleAssignmentClient initialRoles={roles} allPermissions={permissions} />
  );
}
