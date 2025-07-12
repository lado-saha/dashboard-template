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
