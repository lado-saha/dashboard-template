import { Metadata } from "next";
import { DashboardClientPage } from "./dashboard-client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Organization Dashboard",
  description: "A complete overview of your organization's performance.",
};

export default async function OrganizationDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user.businessActorId) {
    redirect('/dashboard');
  }
  
  // The client component now handles all its own data fetching based on context.
  // No initial data needs to be passed.
  return <DashboardClientPage />;
}
