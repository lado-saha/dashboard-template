import { Metadata } from "next";
import { OrgSalesPeopleClientPage } from "./sales-people-client";

export const metadata: Metadata = {
  title: "Manage Sales People",
  description: "View, add, and manage all sales people in your organization.",
};

export default async function OrgSalesPeoplePage() {
  return <OrgSalesPeopleClientPage />;
}