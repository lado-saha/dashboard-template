import { Metadata } from "next";
import { AgencyDashboardClientPage } from "./dashboard-client";

export const metadata: Metadata = {
  title: "Agency Dashboard",
  description: "A focused overview of your agency's performance, team, and recent activities.",
};

export default async function AgencyDashboardPage() {
  // This Server Component's only role is to render the Client Component
  // which will handle all data fetching and state management.
  return <AgencyDashboardClientPage />;
}
