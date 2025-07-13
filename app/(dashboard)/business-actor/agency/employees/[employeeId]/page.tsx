import { Metadata } from "next";
import { EditAgencyEmployeeClientPage } from "./edit-employee-client";

export const metadata: Metadata = {
  title: "Edit Agency Employee",
};

type Props = { params: { employeeId: string } };
export default function EditAgencyEmployeePage({ params }: Props) {
  return <EditAgencyEmployeeClientPage employeeId={params.employeeId} />;
}
