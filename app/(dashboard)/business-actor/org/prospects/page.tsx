import { Metadata } from "next";
import { OrgProspectsClientPage } from "./prospects-client";

export const metadata: Metadata = {
  title: "Manage Prospects",
  description: "View, add, and manage all prospects for your organization.",
};

export default async function OrgProspectsPage() {
  return <OrgProspectsClientPage />;
}
