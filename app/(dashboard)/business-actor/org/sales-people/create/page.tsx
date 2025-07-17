import { Metadata } from "next";
import { CreateOrgSalesPersonClientPage } from "./create-client";

export const metadata: Metadata = {
  title: "Create New Sales Person",
};

export default function CreateSalesPersonPage() {
  return <CreateOrgSalesPersonClientPage />;
}
