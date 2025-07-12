import { Metadata } from "next";
import { EditEmployeeClientPage } from "./edit-employee-client";

// Metadata can be generic here as we don't have the employee name on the server
export const metadata: Metadata = {
  title: "Edit Employee",
};

type Props = { params: { employeeId: string } };

export default async function EditOrgEmployeePage({ params }: Props) {
  // Simply pass the employeeId to the client component
  return <EditEmployeeClientPage employeeId={params.employeeId} />;
}