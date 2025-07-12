import { Metadata } from "next";
import { CustomersClientPage } from "./customers-client";

// This metadata is static because the server doesn't know the active organization.
// The client can update the document title dynamically if needed.
export const metadata: Metadata = {
  title: "Manage Customers",
  description: "View, add, and manage your organization's customers.",
};

// This Server Component is now very simple.
export default async function CustomersPage() {
  // It cannot access client-side context, so it cannot fetch initial data.
  // It delegates all logic and data fetching to the Client Component.
  return <CustomersClientPage />;
}
