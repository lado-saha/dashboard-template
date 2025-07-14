import { Metadata } from "next";
import { UsersClient } from "./users-client";

export const metadata: Metadata = {
  title: "User Management",
  description: "View, manage, and moderate all user accounts on the platform.",
};

export default function SuperAdminUsersPage() {
  return <UsersClient />;
}
