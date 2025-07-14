import { Metadata } from "next";
import { organizationRepository } from "@/lib/data-repo/organization";
import { SuppliersClient } from "./suppliers-client";

export const metadata: Metadata = {
  title: "Global Supplier Overview",
  description: "View and filter all suppliers across all organizations.",
};

export default async function SuperAdminSuppliersPage() {
  const [suppliers, organizations] = await Promise.all([
    organizationRepository.getAllOrganizations().then(orgs => 
      Promise.all(orgs.map(org => organizationRepository.getOrgSuppliers(org.organization_id!)))
    ).then(arrays => arrays.flat()),
    organizationRepository.getAllOrganizations(),
  ]);

  return <SuppliersClient allSuppliers={suppliers} allOrganizations={organizations} />;
}