import { Metadata } from "next";
import { organizationRepository } from "@/lib/data-repo/organization";
import { AgenciesClient } from "./agencies-client";

export const metadata: Metadata = {
  title: "Global Agency Overview",
  description: "View and filter all agencies across all organizations.",
};

export default async function SuperAdminAgenciesPage() {
  const [agencies, organizations] = await Promise.all([
    // A new repository method would be ideal here, but we can simulate by fetching all orgs then all their agencies
    // For simplicity, we'll assume a flat list can be fetched or constructed.
    // This mock will be a placeholder for a real `getAllAgencies` endpoint.
    organizationRepository
      .getAllOrganizations()
      .then((orgs) =>
        Promise.all(
          orgs.map((org) =>
            organizationRepository.getAgencies(org.organization_id!)
          )
        )
      )
      .then((agencyArrays) => agencyArrays.flat()),
    organizationRepository.getAllOrganizations(),
  ]);

  return (
    <AgenciesClient allAgencies={agencies} allOrganizations={organizations} />
  );
}
