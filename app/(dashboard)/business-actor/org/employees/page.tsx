import { Metadata } from "next";
import { OrgEmployeesClientPage } from "./employees-client";

export const metadata: Metadata = {
  title: "Manage Employees",
  description: "View, add, and manage all employees across your organization.",
};

export default async function OrgEmployeesPage() {
  return <OrgEmployeesClientPage />;
}
