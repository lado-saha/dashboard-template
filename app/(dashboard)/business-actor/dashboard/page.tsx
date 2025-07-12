import { Metadata } from "next";
import { organizationRepository } from "@/lib/data-repo/organization";
import { DashboardClientPage } from "./dashboard-client";
import { getSession } from "next-auth/react";
import { headers } from "next/headers";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Organization Dashboard",
  description: "A complete overview of your organization's performance.",
};

// Next.js Route Segment Config for caching
export const revalidate = 60; // Revalidate data every 60 seconds

async function getDashboardData(orgId: string) {
    try {
        const [employees, agencies, customers, suppliers] = await Promise.all([
            organizationRepository.getOrgEmployees(orgId),
            organizationRepository.getAgencies(orgId),
            organizationRepository.getOrgCustomers(orgId),
            organizationRepository.getOrgSuppliers(orgId),
        ]);
        return {
            employeeCount: employees?.length || 0,
            agencyCount: agencies?.length || 0,
            customerCount: customers?.length || 0,
            supplierCount: suppliers?.length || 0,
            topAgencies: agencies?.sort((a,b) => (b.average_revenue || 0) - (a.average_revenue || 0)).slice(0, 5) || [],
        };
    } catch (error) {
        console.error("Dashboard data fetching error:", error);
        return { employeeCount: 0, agencyCount: 0, customerCount: 0, supplierCount: 0, topAgencies: [], error: "Failed to load dashboard data." };
    }
}

export default async function OrganizationDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user.businessActorId) {
    // This page is for business actors only. Redirect if not.
    redirect('/dashboard');
  }
  
  // In a real app with context on server, we'd get activeOrgId here.
  // For now, we pass a placeholder and let the client-side context drive the real data fetching.
  // This structure allows for future server-side optimization.
  const placeholderData = {
    employeeCount: 0,
    agencyCount: 0,
    customerCount: 0,
    supplierCount: 0,
    topAgencies: [],
    error: null,
  };

  return <DashboardClientPage initialData={placeholderData} />;
}
