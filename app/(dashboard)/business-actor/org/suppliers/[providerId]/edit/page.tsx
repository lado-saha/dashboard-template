import { Metadata } from "next";
import { EditOrgSupplierClientPage } from "./edit-client";

export const metadata: Metadata = {
  title: "Edit Supplier",
};

type Props = { params: Promise<{ providerId: string }> };

export default async function EditSupplierPage({ params }: Props) {
  const { providerId } = await params;
  return <EditOrgSupplierClientPage providerId={providerId} />;
}
