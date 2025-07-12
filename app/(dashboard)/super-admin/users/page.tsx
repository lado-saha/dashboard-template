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
