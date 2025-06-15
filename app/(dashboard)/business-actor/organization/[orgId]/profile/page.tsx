"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useActiveOrganization } from "@/contexts/active-organization-context";
import { OrganizationForm } from "@/components/organization/organization-form";
import { OrganizationDetailView } from "@/components/organization/organization-detail-view";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Edit3,
  PlusCircle,
  MapPin,
  Phone,
  Info,
  Award,
  Users,
  Image as ImageIcon,
} from "lucide-react";
import { AddressList } from "@/components/organization/address-list"; // To be created
import { ContactList } from "@/components/organization/contact-list"; // To be created
import {
  OrganizationDto,
  UpdateOrganizationStatusRequest,
} from "@/types/organization";
import { toast } from "sonner";
import { organizationApi } from "@/lib/apiClient";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

// Placeholder components until they are fully implemented
const PracticalInfoSection = () => (
  <Card className="mt-6">
    <CardHeader>
      <CardTitle className="flex items-center">
        <Info className="mr-2" />
        Practical Information
      </CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-muted-foreground">
        Management UI for practical info coming soon.
      </p>
    </CardContent>
  </Card>
);
const CertificationsSection = () => (
  <Card className="mt-6">
    <CardHeader>
      <CardTitle className="flex items-center">
        <Award className="mr-2" />
        Certifications
      </CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-muted-foreground">
        Management UI for certifications coming soon.
      </p>
    </CardContent>
  </Card>
);
const BusinessDomainsSection = () => (
  <Card className="mt-6">
    <CardHeader>
      <CardTitle className="flex items-center">
        <Users className="mr-2" />
        Business Domains
      </CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-muted-foreground">
        Management UI for business domains coming soon.
      </p>
    </CardContent>
  </Card>
);
const ImagesSection = () => (
  <Card className="mt-6">
    <CardHeader>
      <CardTitle className="flex items-center">
        <ImageIcon className="mr-2" />
        Image Gallery
      </CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-muted-foreground">
        Management UI for image gallery coming soon.
      </p>
    </CardContent>
  </Card>
);

export default function OrganizationProfilePage() {
  const params = useParams();
  const orgId = params.orgId as string;
  const {
    activeOrganizationDetails,
    fetchActiveOrganizationDetails,
    isLoadingOrgDetails,
    refreshUserOrganizations,
    setActiveOrganization,
  } = useActiveOrganization();
  const router = useRouter();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<
    OrganizationDto["status"] | undefined
  >(activeOrganizationDetails?.status);

  useEffect(() => {
    if (orgId && !activeOrganizationDetails && !isLoadingOrgDetails) {
      fetchActiveOrganizationDetails(orgId);
    }
    if (
      activeOrganizationDetails &&
      activeOrganizationDetails.status !== selectedStatus
    ) {
      setSelectedStatus(activeOrganizationDetails.status);
    }
  }, [
    orgId,
    fetchActiveOrganizationDetails,
    activeOrganizationDetails,
    isLoadingOrgDetails,
  ]);

  const handleUpdateSuccess = (updatedOrg: OrganizationDto) => {
    fetchActiveOrganizationDetails(orgId); // Re-fetch to get latest details
    refreshUserOrganizations(); // Refresh list in dashboard/context
    setIsEditModalOpen(false);
  };

  const handleStatusUpdate = async () => {
    if (!orgId || !selectedStatus) {
      toast.error("Organization ID or status missing.");
      return;
    }
    try {
      const payload: UpdateOrganizationStatusRequest = {
        status: selectedStatus,
      };
      const updatedOrg = await organizationApi.updateOrganizationStatus(
        orgId,
        payload
      );
      toast.success(`Organization status updated to ${selectedStatus}.`);
      setActiveOrganization(orgId, updatedOrg); // Update context with full new DTO
      setIsStatusModalOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to update organization status.");
    }
  };

  if (isLoadingOrgDetails && !activeOrganizationDetails) {
    return <div>Loading organization details...</div>; // Add Skeleton later
  }

  if (!activeOrganizationDetails) {
    return (
      <div className="text-center py-10">
        <p>
          Organization not found or not loaded. Please select an organization
          from the dashboard.
        </p>
        <Button
          onClick={() => router.push("/business-actor/dashboard")}
          className="mt-4"
        >
          Go to Dashboard
        </Button>
      </div>
    );
  }

  const organizationStatusOptions: {
    value: OrganizationDto["status"];
    label: string;
  }[] = [
    { value: "ACTIVE", label: "Active" },
    { value: "INACTIVE", label: "Inactive" },
    { value: "SUSPENDED", label: "Suspended" },
    { value: "PENDING_APPROVAL", label: "Pending Approval" },
    { value: "UNDER_REVIEW", label: "Under Review" }, // Add others as needed
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Organization Overview</h2>
        <div className="flex gap-2">
          <Dialog open={isStatusModalOpen} onOpenChange={setIsStatusModalOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                Change Status
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Update Organization Status</DialogTitle>
                <DialogDescription>
                  Select the new status for{" "}
                  {activeOrganizationDetails.short_name}.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <Select
                  value={selectedStatus}
                  onValueChange={(value) =>
                    setSelectedStatus(value as OrganizationDto["status"])
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status..." />
                  </SelectTrigger>
                  <SelectContent>
                    {organizationStatusOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value!}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsStatusModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleStatusUpdate}>Update Status</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Edit3 className="mr-2 h-4 w-4" /> Edit Details
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>Edit Organization</DialogTitle>
                <DialogDescription>
                  Make changes to your organization's details below.
                </DialogDescription>
              </DialogHeader>
              <OrganizationForm
                mode="edit"
                initialData={activeOrganizationDetails}
                organizationId={orgId}
                onFormSubmitSuccess={handleUpdateSuccess}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <OrganizationDetailView organization={activeOrganizationDetails} />

      <Separator className="my-8" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center">
              <MapPin className="mr-2" />
              Addresses
            </CardTitle>
            <Button size="sm" variant="outline"><PlusCircle className="mr-2 h-4 w-4"/>Add Address</Button>
          </CardHeader>
          <CardContent>
            <AddressList
              organizationId={orgId}
              contactableType="ORGANIZATION"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center">
              <Phone className="mr-2" />
              Contacts
            </CardTitle>
            <Button size="sm" variant="outline"><PlusCircle className="mr-2 h-4 w-4"/>Add Contact</Button>
          </CardHeader>
          <CardContent>
            <ContactList
              organizationId={orgId}
              contactableType="ORGANIZATION"
            />
          </CardContent>
        </Card>
      </div>

      <PracticalInfoSection />
      <CertificationsSection />
      <BusinessDomainsSection />
      <ImagesSection />
    </div>
  );
}
