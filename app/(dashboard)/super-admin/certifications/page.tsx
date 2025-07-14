import { Metadata } from "next";
import { organizationRepository } from "@/lib/data-repo/organization";
import { CertificationsClient } from "./certifications-client";

export const metadata: Metadata = {
  title: "Global Certification Overview",
  description: "View and filter all certifications across all organizations.",
};

export default async function SuperAdminCertificationsPage() {
  const [certifications, organizations] = await Promise.all([
    organizationRepository
      .getAllOrganizations()
      .then((orgs) =>
        Promise.all(
          orgs.map((org) =>
            organizationRepository.getCertifications(org.organization_id!)
          )
        )
      )
      .then((arrays) => arrays.flat()),
    organizationRepository.getAllOrganizations(),
  ]);

  return (
    <CertificationsClient
      allCertifications={certifications}
      allOrganizations={organizations}
    />
  );
}
