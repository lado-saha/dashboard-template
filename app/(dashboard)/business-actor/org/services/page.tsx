import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Combine } from "lucide-react";

export default function OrganizationServicesPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Service Management</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <Combine className="h-4 w-4" />
            <AlertTitle>Under Construction</AlertTitle>
            <AlertDescription>
              This page will be used to define and manage the services offered
              by the organization, often utilizing its available products and
              resources. Coming soon.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
