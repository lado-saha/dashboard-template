import { Metadata } from "next";
import { CustomersClientPage } from "./customers-client";

export const metadata: Metadata = {
  title: "Manage Customers",
  description: "View, add, and manage your organization's customers.",
};

export default async function OrgCustomersPage() {
  return <CustomersClientPage />;
}