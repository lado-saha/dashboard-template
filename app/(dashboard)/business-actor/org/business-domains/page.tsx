import { Metadata } from "next";
import { OrgBusinessDomainsClientPage } from "./business-domains-client";

export const metadata: Metadata = {
  title: "Manage Custom Business Domains",
  description:
    "View and manage business domains specific to your organization.",
};

export default async function OrgBusinessDomainsPage() {
  return <OrgBusinessDomainsClientPage />;
}
