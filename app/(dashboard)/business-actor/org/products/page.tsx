import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Package } from "lucide-react";

export default function OrganizationProductsPage() {
  return (
    <div className="space-y-6">
        <Card>
            <CardHeader>
                <CardTitle>Product Management</CardTitle>
            </CardHeader>
            <CardContent>
                <Alert>
                    <Package className="h-4 w-4" />
                    <AlertTitle>Under Construction</AlertTitle>
                    <AlertDescription>
                        This page will be used to create, view, and manage all products (resources) owned by the organization. Coming soon.
                    </AlertDescription>
                </Alert>
            </CardContent>
        </Card>
    </div>
  );
}