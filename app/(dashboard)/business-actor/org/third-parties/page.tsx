import { Metadata } from "next";
import { OrgThirdPartiesClientPage } from "./third-parties-client";

export const metadata: Metadata = {
  title: "Manage Third-Parties",
  description: "View, add, and manage all third-party partners for your organization.",
};

export default async function OrgThirdPartiesPage() {
  return <OrgThirdPartiesClientPage />;
}
