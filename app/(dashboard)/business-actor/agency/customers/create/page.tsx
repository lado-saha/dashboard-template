import { Metadata } from "next";
import { CreateAgencyCustomerClientPage } from "./create-client";

export const metadata: Metadata = { title: "Create Agency Customer" };

export default function CreateAgencyCustomerPage() {
  return <CreateAgencyCustomerClientPage />;
}
