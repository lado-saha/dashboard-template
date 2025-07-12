import { Metadata } from "next";
import { AgencyCustomersClientPage } from "./customers-client";

export const metadata: Metadata = {
  title: "Manage Agency Customers",
  description: "View, add, and manage your agency's customers.",
};

export default async function AgencyCustomersPage() {
  return <AgencyCustomersClientPage />;
}