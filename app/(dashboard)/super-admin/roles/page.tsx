import { Metadata } from "next";
import { RoleAssignmentClient } from "./roles-client";

export const metadata: Metadata = {
  title: "Roles & Permissions",
  description: "Configure Role-Based Access Control (RBAC) for the platform.",
};

export default function SuperAdminRolesPage() {
  return <RoleAssignmentClient />;
}
