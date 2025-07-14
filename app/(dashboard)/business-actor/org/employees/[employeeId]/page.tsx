import { Metadata } from "next";
import { EditEmployeeClientPage } from "./edit-employee-client";

export const metadata: Metadata = {
  title: "Edit Employee",
};

type Props = { params: Promise<{ employeeId: string }> };

export default async function EditOrgEmployeePage({ params }: Props) {
  const { employeeId } = await params;
  return <EditEmployeeClientPage employeeId={employeeId} />;
}
