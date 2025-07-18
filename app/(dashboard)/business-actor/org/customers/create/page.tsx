import { Metadata } from "next";
import { CreateCustomerClientPage } from "./create-client";

export const metadata: Metadata = {
  title: "Create New Customer",
  description: "Add a new customer to your organization.",
};

export default async function CreateCustomerPage() {
  // This page is a server component, but all logic is in the client component
  // to have access to hooks and context.
  return <CreateCustomerClientPage />;
}
