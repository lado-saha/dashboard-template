import { Metadata } from "next";
import { authRepository } from "@/lib/data-repo/auth";
import { organizationRepository } from "@/lib/data-repo/organization";
import { DashboardData, SuperAdminDashboardClient } from "./dashboard-client";

export const metadata: Metadata = {
  title: "Super Admin Dashboard",
  description: "Platform-wide overview of users, organizations, and activity.",
};

// Change return type to: DashboardData | null
async function getDashboardStats(): Promise<DashboardData | null> {
  try {
    const [users, organizations, businessActors] = await Promise.all([
      authRepository.getAllUsers(),
      organizationRepository.getAllOrganizations(),
      organizationRepository.getAllBusinessActors(),
    ]);

    const totalUsers = users.length;
    const totalOrgs = organizations.length;
    const totalBAs = businessActors.length;

    const orgStatusCounts = organizations.reduce((acc, org) => {
      const status = org.status || "UNKNOWN";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const baTypeCounts = businessActors.reduce((acc, ba) => {
      const type = ba.type || "UNKNOWN";
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      stats: { totalUsers, totalOrgs, totalBAs },
      charts: { orgStatusCounts, baTypeCounts },
      recentActivity: {
        users: users.slice(0, 5),
        organizations: organizations.slice(0, 5),
      },
    };
  } catch (error) {
    console.error("Failed to fetch dashboard stats:", error);
    return null;
  }
}

export default async function SuperAdminDashboardPage() {
  const dashboardData = await getDashboardStats();

  if (!dashboardData) {
    return <div>Error: Could not load platform statistics.</div>;
  }

  return <SuperAdminDashboardClient initialData={dashboardData} />;
}
