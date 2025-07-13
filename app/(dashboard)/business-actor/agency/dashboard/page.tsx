import { Metadata } from "next";
import { AgencyDashboardClientPage } from "./dashboard-client";

export const metadata: Metadata = {
  title: "Agency Dashboard",
  description: "A focused overview of your agency's performance.",
};

export default async function AgencyDashboardPage() {
  return <AgencyDashboardClientPage />;
}
