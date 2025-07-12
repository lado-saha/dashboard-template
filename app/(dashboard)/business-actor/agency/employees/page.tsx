import { Metadata } from "next";
import { AgencyEmployeesClientPage } from "./employees-client";

export const metadata: Metadata = {
  title: "Manage Agency Employees",
  description: "View and manage employees assigned to this agency.",
};

export default function AgencyEmployeesPage() {
  return <AgencyEmployeesClientPage />;
}
