import { Metadata } from "next";
import { BusinessDomainsClientPage } from "./business-domains-client";

export const metadata: Metadata = {
  title: "Manage Business Domains",
  description: "Administer the global list of business domains for all organizations.",
};

export default async function BusinessDomainsPage() {
  return <BusinessDomainsClientPage />;
}