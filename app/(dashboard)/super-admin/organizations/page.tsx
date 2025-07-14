import { Metadata } from "next";
import { organizationRepository } from "@/lib/data-repo/organization";
import { OrganizationsClient } from "./organizations-client";

export const metadata: Metadata = {
  title: "Organization Management",
  description:
    "Approve, monitor, and manage all organizations on the platform.",
};

export default async function SuperAdminOrganizationsPage() {
  const organizations = await organizationRepository.getAllOrganizations();
  return <OrganizationsClient initialOrganizations={organizations} />;
}
