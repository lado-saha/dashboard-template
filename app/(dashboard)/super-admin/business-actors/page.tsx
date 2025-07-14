import { Metadata } from "next";
import { organizationRepository } from "@/lib/data-repo/organization";
import { BusinessActorsClient } from "./business-actors-client";

export const metadata: Metadata = {
  title: "Business Actors Management",
  description:
    "Create, view, and manage all Business Actor profiles on the platform.",
};

export default async function SuperAdminBusinessActorsPage() {
  // Fetch only the business actors. No user list is needed.
  const actors = await organizationRepository.getAllBusinessActors();
  return <BusinessActorsClient initialActors={actors} />;
}
