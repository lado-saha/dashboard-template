import { Metadata } from "next";
import { SuperAdminDashboardClient } from "./dashboard-client";

export const metadata: Metadata = {
  title: "Super Admin Dashboard",
  description: "Platform-wide overview of users, organizations, and activity.",
};

export default function SuperAdminDashboardPage() {
  return <SuperAdminDashboardClient />;
}
