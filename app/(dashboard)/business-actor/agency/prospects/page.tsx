import { Metadata } from "next";
import { AgencyProspectsClientPage } from "./prospects-client";

export const metadata: Metadata = {
  title: "Manage Agency Prospects",
  description: "View, add, and manage your agency's prospects.",
};

export default async function AgencyProspectsPage() {
  return <AgencyProspectsClientPage />;
}
