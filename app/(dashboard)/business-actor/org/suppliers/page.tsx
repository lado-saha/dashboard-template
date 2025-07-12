import { Metadata } from "next";
import { OrgSuppliersClientPage } from "./suppliers-client";

export const metadata: Metadata = {
  title: "Manage Suppliers",
  description: "View, add, and manage all of your organization's suppliers.",
};

export default async function OrgSuppliersPage() {
  return <OrgSuppliersClientPage />;
}