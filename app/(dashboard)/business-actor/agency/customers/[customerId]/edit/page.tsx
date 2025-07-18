import { Metadata } from "next";
import { EditAgencyCustomerClientPage } from "./edit-client";

export const metadata: Metadata = { title: "Edit Agency Customer" };

type Props = { params: Promise<{ customerId: string }> };

export default async function EditAgencyCustomerPage({ params }: Props) {
  return <EditAgencyCustomerClientPage customerId={(await params).customerId} />;
}
