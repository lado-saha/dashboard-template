"use client";

import { useActiveOrganization } from "@/contexts/active-organization-context";
import { OrganizationDetailView } from "@/components/organization/organization-detail-view";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContactList } from "@/components/organization/contact-list";
import { AddressList } from "@/components/organization/address-list";
import { Skeleton } from "@/components/ui/skeleton";

export default function OrganizationProfilePage() {
  const { activeOrganizationDetails, isLoadingOrgDetails } =
    useActiveOrganization();

  if (isLoadingOrgDetails) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-1/2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!activeOrganizationDetails) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Organization Selected</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Please select an organization to view its profile.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <OrganizationDetailView organization={activeOrganizationDetails} />
      <Tabs defaultValue="contacts">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="contacts">Contacts</TabsTrigger>
          <TabsTrigger value="addresses">Addresses</TabsTrigger>
        </TabsList>
        <TabsContent value="contacts">
          <Card>
            <CardHeader>
              <CardTitle>Manage Contacts</CardTitle>
            </CardHeader>
            <CardContent>
              <ContactList
                organizationId={activeOrganizationDetails.organization_id!}
                contactableType="ORGANIZATION"
              />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="addresses">
          <Card>
            <CardHeader>
              <CardTitle>Manage Addresses</CardTitle>
            </CardHeader>
            <CardContent>
              <AddressList
                organizationId={activeOrganizationDetails.organization_id!}
                contactableType="ORGANIZATION"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
