import { Metadata } from "next";
import { AgencySuppliersClientPage } from "./suppliers-client";


export const metadata: Metadata = {
  title: "Manage Agency Suppliers",
  description: "View, add, and manage your agency's suppliers.",
};

export default async function AgencySuppliersPage() {
  return <AgencySuppliersClientPage />;
}