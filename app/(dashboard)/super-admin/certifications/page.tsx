import { Metadata } from "next";
import { CertificationsClient } from "./certifications-client";

export const metadata: Metadata = {
  title: "Global Certification Overview",
  description: "View and filter all certifications across all organizations.",
};

export default function SuperAdminCertificationsPage() {
  return <CertificationsClient />;
}
