import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
export default function AgencyStatusPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Agency Status Management</CardTitle>
      </CardHeader>
      <CardContent>
        <p>
          This page will allow managing the active/inactive status and other
          operational states of the agency.
        </p>
      </CardContent>
    </Card>
  );
}
