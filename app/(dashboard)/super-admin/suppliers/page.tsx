import { Metadata } from "next";
import { SuppliersClient } from "./suppliers-client";

export const metadata: Metadata = {
  title: "Global Supplier Overview",
  description: "View and filter all suppliers across all organizations.",
};

export default function SuperAdminSuppliersPage() {
  return <SuppliersClient />;
}
