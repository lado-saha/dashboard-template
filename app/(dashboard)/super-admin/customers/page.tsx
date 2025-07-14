import { Metadata } from "next";
import { CustomersClient } from "./customers-client";

export const metadata: Metadata = {
  title: "Global Customer Overview",
  description: "View and filter all customers across all organizations.",
};

export default function SuperAdminCustomersPage() {
  return <CustomersClient />;
}
