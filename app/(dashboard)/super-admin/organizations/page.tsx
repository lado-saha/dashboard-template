import { Metadata } from "next";
import { OrganizationsClient } from "./organizations-client";

export const metadata: Metadata = {
  title: "Organization Management",
  description:
    "Approve, monitor, and manage all organizations on the platform.",
};

export default function SuperAdminOrganizationsPage() {
  return <OrganizationsClient />;
}
