import { Metadata } from "next";
import { EditAgencyEmployeeClientPage } from "./edit-employee-client";

export const metadata: Metadata = {
  title: "Edit Agency Employee",
};

type Props = { params: Promise<{ employeeId: string }> };

export default async function EditAgencyEmployeePage({ params }: Props) {
  const { employeeId } = await params;
  return <EditAgencyEmployeeClientPage employeeId={employeeId} />;
}
