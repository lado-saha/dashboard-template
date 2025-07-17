import { Metadata } from "next";
import { CreateOrgSupplierClientPage } from "./create-client";

export const metadata: Metadata = {
  title: "Create New Supplier",
};

export default function CreateSupplierPage() {
  return <CreateOrgSupplierClientPage />;
}
