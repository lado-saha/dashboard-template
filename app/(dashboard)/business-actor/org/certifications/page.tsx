import { Metadata } from "next";
import { CertificationsClientPage } from "./certifications-client";

export const metadata: Metadata = {
  title: "Manage Certifications",
  description: "View, add, and manage your organization's certifications and awards.",
};

export default async function OrgCertificationsPage() {
  return <CertificationsClientPage />;
}
