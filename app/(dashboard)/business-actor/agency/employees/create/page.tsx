import { Metadata } from "next";
import { CreateAgencyEmployeeClientPage } from "./create-client";

export const metadata: Metadata = {
  title: "Create Agency Employee",
};

export default function CreateAgencyEmployeePage() {
  return <CreateAgencyEmployeeClientPage />;
}
