import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { BarChart3 } from "lucide-react";

export default function OrganizationDashboardPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Organization Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <BarChart3 className="h-4 w-4" />
            <AlertTitle>Under Construction</AlertTitle>
            <AlertDescription>
              This page will feature a comprehensive dashboard summarizing the
              performance and key metrics of the active organization or a
              selected agency. Coming soon.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
