import { Metadata } from "next";
import { EditAgencyEmployeeClientPage } from "./edit-client";

export const metadata: Metadata = {
  title: "Edit Agency Employee",
};

type Props = {
  params: Promise<{ employeeId: string }>;
};

export default async function EditAgencyEmployeePage({ params }: Props) {
  return (
    <EditAgencyEmployeeClientPage employeeId={(await params).employeeId} />
  );
}
