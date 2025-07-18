import { Metadata } from "next";
import { EditCustomerClientPage } from "./edit-client";

export const metadata: Metadata = {
  title: "Edit Customer",
};

type Props = {
  params: Promise<{ customerId: string }>;
};

export default async function EditCustomerPage({ params }: Props) {
  return <EditCustomerClientPage customerId={(await params).customerId} />;
}
