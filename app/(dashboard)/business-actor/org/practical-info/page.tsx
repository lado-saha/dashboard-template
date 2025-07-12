import { Metadata } from "next";
import { PracticalInfoClientPage } from "./practical-info-client";

export const metadata: Metadata = {
  title: "Manage Practical Information",
  description: "View, add, and manage operational details for your organization.",
};

export default async function OrgPracticalInfoPage() {
  return <PracticalInfoClientPage />;
}
