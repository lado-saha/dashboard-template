import { Metadata } from "next";
import { AgenciesClient } from "./agencies-client";

export const metadata: Metadata = {
  title: "Global Agency Overview",
  description: "View and filter all agencies across all organizations.",
};

export default function SuperAdminAgenciesPage() {
  return <AgenciesClient />;
}
