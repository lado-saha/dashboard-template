import { Metadata } from "next";
import { authRepository } from "@/lib/data-repo/auth";
import { organizationRepository } from "@/lib/data-repo/organization";
import { SuperAdminDashboardClientPage } from "./dashboard-client";

export const metadata: Metadata = {
  title: "Super Admin Dashboard",
  description: "Platform-wide overview of all users, organizations, and activities.",
};

// This page can be cached and revalidated periodically
export const revalidate = 300; // 5 minutes

async function getDashboardData() {
  try {
    const [users, organizations, businessActors] = await Promise.all([
      authRepository.getAllUsers(),
      organizationRepository.getAllOrganizations(),
      organizationRepository.getAllBusinessActors(),
    ]);

    return {
      users: users || [],
      organizations: organizations || [],
      businessActors: businessActors || [],
      error: null,
    };
  } catch (error: any) {
    console.error("Super Admin Dashboard data fetching error:", error);
    return { users: [], organizations: [], businessActors: [], error: "Failed to load platform data." };
  }
}

export default async function SuperAdminDashboardPage() {
  const initialData = await getDashboardData();
  return <SuperAdminDashboardClientPage initialData={initialData} />;
}
