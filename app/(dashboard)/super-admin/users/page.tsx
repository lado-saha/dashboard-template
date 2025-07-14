import { Metadata } from "next";
import { authRepository } from "@/lib/data-repo/auth";
import { UsersClient } from "./users-client";

export const metadata: Metadata = {
  title: "User Management",
  description: "View, manage, and moderate all user accounts on the platform.",
};

export default async function SuperAdminUsersPage() {
  const users = await authRepository.getAllUsers();
  return <UsersClient initialUsers={users} />;
}
