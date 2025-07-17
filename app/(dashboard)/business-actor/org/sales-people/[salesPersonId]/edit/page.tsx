import { Metadata } from "next";
import { EditOrgSalesPersonClientPage } from "./edit-client";

export const metadata: Metadata = {
  title: "Edit Sales Person",
};

type Props = { params: Promise<{ salesPersonId: string }> };

export default async function EditSalesPersonPage({ params }: Props) {
  const { salesPersonId } = await params;
  return <EditOrgSalesPersonClientPage salesPersonId={salesPersonId} />;
}
