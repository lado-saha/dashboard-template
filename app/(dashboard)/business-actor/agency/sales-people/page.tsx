import { Metadata } from "next";
import { AgencySalesPeopleClientPage } from "./sales-people-client";

export const metadata: Metadata = {
  title: "Manage Agency Sales People",
  description: "View, add, and manage your agency's sales team.",
};

export default async function AgencySalesPeoplePage() {
  return <AgencySalesPeopleClientPage />;
}