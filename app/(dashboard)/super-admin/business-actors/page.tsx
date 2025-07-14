import { Metadata } from "next";
import { BusinessActorsClient } from "./business-actors-client";

export const metadata: Metadata = {
  title: "Business Actors Management",
  description:
    "Create, view, and manage all Business Actor profiles on the platform.",
};

export default function SuperAdminBusinessActorsPage() {
  return <BusinessActorsClient />;
}
