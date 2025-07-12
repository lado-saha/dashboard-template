import { Metadata } from "next";
import { OrgProposedActivitiesClientPage } from "./proposed-activities-client";

export const metadata: Metadata = {
  title: "Manage Proposed Activities",
  description: "View, add, and manage all proposed activities for your organization.",
};

export default async function OrgProposedActivitiesPage() {
  return <OrgProposedActivitiesClientPage />;
}
