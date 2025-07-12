import { Metadata } from "next";
import { AgencyDashboardClientPage } from "./dashboard-client";

export const metadata: Metadata = {
  title: "Agency Dashboard",
  description: "A focused overview of your agency's performance.",
};

export default async function AgencyDashboardPage() {
  // The client component will fetch all data based on the active agency context
  return <AgencyDashboardClientPage />;
}
