#!/bin/bash

# ==============================================================================
# Refactoring Script: Move Data Fetching from Server Pages to Client Components
# Objective: Make page.tsx files responsible for metadata and rendering the
#            client component shell. The client components will now handle
#            all data fetching, loading, and error states.
# Generated On: Mon Jul 14 06:12:53 PM WAT 2025
# ==============================================================================

echo "Starting the refactoring process..."

# 1. Refactor: agencies
# ------------------------------------------------------------------------------
echo "Refactoring 'agencies'..."

# Update agencies/page.tsx to be a simple shell
cat <<'EOF' > agencies/page.tsx
import { Metadata } from "next";
import { AgenciesClient } from "./agencies-client";

export const metadata: Metadata = {
  title: "Global Agency Overview",
  description: "View and filter all agencies across all organizations.",
};

export default function SuperAdminAgenciesPage() {
  return <AgenciesClient />;
}
EOF

# Update agencies/agencies-client.tsx to fetch its own data
cat <<'EOF' > agencies/agencies-client.tsx
"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { AgencyDto, OrganizationDto } from "@/types/organization";
import { organizationRepository } from "@/lib/data-repo/organization";
import { ResourceDataTable } from "@/components/resource-management/resource-data-table";
import { PageHeader } from "@/components/ui/page-header";
import { getSuperAdminAgencyColumns } from "./columns";
import { DataTableFacetedFilter } from "@/components/ui/data-table-faceted-filter";
import { FeedbackCard } from "@/components/ui/feedback-card";
import { Building, Search } from "lucide-react";

export function AgenciesClient() {
  const [agencies, setAgencies] = useState<AgencyDto[]>([]);
  const [organizations, setOrganizations] = useState<OrganizationDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const orgs = await organizationRepository.getAllOrganizations();
      setOrganizations(orgs);
      
      const agencyArrays = await Promise.all(
        orgs.map((org) =>
          organizationRepository.getAgencies(org.organization_id!)
        )
      );
      setAgencies(agencyArrays.flat());
    } catch (err: any) {
      setError(err.message || "Failed to fetch data.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const orgOptions = useMemo(
    () =>
      organizations.map((org) => ({
        label: org.long_name || org.organization_id!,
        value: org.organization_id!,
      })),
    [organizations]
  );

  const columns = useMemo<ColumnDef<AgencyDto>[]>(
    () => getSuperAdminAgencyColumns(),
    []
  );

  return (
    <ResourceDataTable
      data={agencies}
      columns={columns}
      isLoading={isLoading}
      error={error}
      onRefreshAction={fetchData}
      searchPlaceholder="Search by agency name or location..."
      onDeleteItemsAction={() => {}}
      viewModeStorageKey="sa-agencies-view-mode"
      exportFileName="all_agencies.csv"
      pageHeader={
        <PageHeader
          title="Global Agency Overview"
          description="View and filter all agencies across the platform."
        />
      }
      filterControls={(table) => (
        <DataTableFacetedFilter
          column={table.getColumn("organization_id")}
          title="Organization"
          options={orgOptions}
        />
      )}
      renderGridItemAction={(agency) => (
        <div className="p-4 border rounded-md">{agency.long_name}</div>
      )}
      emptyState={
        <FeedbackCard
          icon={Building}
          title="No Agencies Found"
          description="There are no agencies created on the platform yet."
        />
      }
      filteredEmptyState={
        <FeedbackCard
          icon={Search}
          title="No Agencies Found"
          description="Your filter criteria did not match any agencies."
        />
      }
    />
  );
}
EOF

# 2. Refactor: business-actors
# ------------------------------------------------------------------------------
echo "Refactoring 'business-actors'..."

# Update business-actors/page.tsx
cat <<'EOF' > business-actors/page.tsx
import { Metadata } from "next";
import { BusinessActorsClient } from "./business-actors-client";

export const metadata: Metadata = {
  title: "Business Actors Management",
  description:
    "Create, view, and manage all Business Actor profiles on the platform.",
};

export default function SuperAdminBusinessActorsPage() {
  return <BusinessActorsClient />;
}
EOF

# Update business-actors/business-actors-client.tsx
cat <<'EOF' > business-actors/business-actors-client.tsx
"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { BusinessActorDto } from "@/types/organization";
import { organizationRepository } from "@/lib/data-repo/organization";
import { ResourceDataTable } from "@/components/resource-management/resource-data-table";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { PlusCircle, UserPlus, Search as SearchIcon } from "lucide-react";
import { getBusinessActorColumns } from "./columns";
import { BusinessActorCard } from "./business-actor-card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { BusinessActorForm } from "@/components/business-actor/business-actor-form";
import { FeedbackCard } from "@/components/ui/feedback-card";
import { DataTableFacetedFilter } from "@/components/ui/data-table-faceted-filter";

const statusOptions = [
  { value: "true", label: "Active" },
  { value: "false", label: "Inactive" },
];
const verifiedOptions = [
  { value: "true", label: "Verified" },
  { value: "false", label: "Not Verified" },
];

export function BusinessActorsClient() {
  const [actors, setActors] = useState<BusinessActorDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingActor, setEditingActor] = useState<
    BusinessActorDto | undefined
  >();

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const updatedActors = await organizationRepository.getAllBusinessActors();
      setActors(updatedActors);
    } catch (err: any) {
      setError(err.message || "Failed to fetch business actors.");
      toast.error(err.message || "Failed to fetch business actors.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const handleOpenDialog = (actor?: BusinessActorDto) => {
    setEditingActor(actor);
    setIsFormOpen(true);
  };

  const handleFormSuccess = () => {
    refreshData();
    setIsFormOpen(false);
    setEditingActor(undefined);
  };

  const handleDelete = (actorsToDelete: BusinessActorDto[]) => {
    toast.error(
      `Deletion of ${actorsToDelete.length} actor(s) is not implemented.`
    );
  };

  const columns = useMemo<ColumnDef<BusinessActorDto>[]>(
    () =>
      getBusinessActorColumns({
        onEditAction: handleOpenDialog,
        onDeleteAction: (actor) => handleDelete([actor]),
      }),
    []
  );

  return (
    <>
      <ResourceDataTable
        data={actors}
        columns={columns}
        isLoading={isLoading}
        error={error}
        onRefreshAction={refreshData}
        searchPlaceholder="Search by name, email..."
        onDeleteItemsAction={handleDelete}
        viewModeStorageKey="sa-ba-view-mode"
        exportFileName="business_actors.csv"
        pageHeader={
          <PageHeader
            title="Business Actors"
            description="Manage all business actor profiles on the platform."
            action={
              <Button onClick={() => handleOpenDialog()}>
                <UserPlus className="mr-2 h-4 w-4" /> Create Profile
              </Button>
            }
          />
        }
        filterControls={(table) => (
          <>
            <DataTableFacetedFilter
              column={table.getColumn("is_active")}
              title="Status"
              options={statusOptions}
            />
            <DataTableFacetedFilter
              column={table.getColumn("is_verified")}
              title="Verification"
              options={verifiedOptions}
            />
          </>
        )}
        renderGridItemAction={(actor) => (
          <BusinessActorCard
            actor={actor}
            onEditAction={handleOpenDialog}
            onDeleteAction={() => handleDelete([actor])}
          />
        )}
        emptyState={
          <FeedbackCard
            icon={UserPlus}
            title="No Business Actors"
            description="There are no business actor profiles created yet. Create one to get started."
            actionButton={
              <Button onClick={() => handleOpenDialog()}>
                <PlusCircle className="mr-2 h-4 w-4" /> Create Profile
              </Button>
            }
          />
        }
        filteredEmptyState={
          <FeedbackCard
            icon={SearchIcon}
            title="No Actors Found"
            description="Your search or filter criteria did not match any business actors."
          />
        }
      />

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {editingActor
                ? "Edit Business Actor Profile"
                : "Create New Business Actor Profile"}
            </DialogTitle>
            <DialogDescription>
              {editingActor
                ? `Editing profile for ${editingActor.first_name}`
                : "Create a new, independent business profile."}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 max-h-[80vh] overflow-y-auto pr-2">
            <BusinessActorForm
              mode={editingActor ? "edit" : "create"}
              initialData={editingActor}
              onSuccessAction={handleFormSuccess}
              onCancelAction={() => setIsFormOpen(false)}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
EOF

# 3. Refactor: certifications
# ------------------------------------------------------------------------------
echo "Refactoring 'certifications'..."

# Update certifications/page.tsx
cat <<'EOF' > certifications/page.tsx
import { Metadata } from "next";
import { CertificationsClient } from "./certifications-client";

export const metadata: Metadata = {
  title: "Global Certification Overview",
  description: "View and filter all certifications across all organizations.",
};

export default function SuperAdminCertificationsPage() {
  return <CertificationsClient />;
}
EOF

# Update certifications/certifications-client.tsx
cat <<'EOF' > certifications/certifications-client.tsx
"use client";

import React, { useMemo, useState, useEffect, useCallback } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { CertificationDto, OrganizationDto } from "@/types/organization";
import { organizationRepository } from "@/lib/data-repo/organization";
import { ResourceDataTable } from "@/components/resource-management/resource-data-table";
import { PageHeader } from "@/components/ui/page-header";
import { getSuperAdminCertificationColumns } from "./columns";
import { DataTableFacetedFilter } from "@/components/ui/data-table-faceted-filter";
import { FeedbackCard } from "@/components/ui/feedback-card";
import { Award, Search } from "lucide-react";

export function CertificationsClient() {
  const [certifications, setCertifications] = useState<CertificationDto[]>([]);
  const [organizations, setOrganizations] = useState<OrganizationDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const orgs = await organizationRepository.getAllOrganizations();
      setOrganizations(orgs);
      
      const certArrays = await Promise.all(
        orgs.map((org) =>
          organizationRepository.getCertifications(org.organization_id!)
        )
      );
      setCertifications(certArrays.flat());
    } catch (err: any) {
      setError(err.message || "Failed to fetch certifications.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const orgOptions = useMemo(
    () =>
      organizations.map((org) => ({
        label: org.long_name || org.organization_id!,
        value: org.organization_id!,
      })),
    [organizations]
  );

  const columns = useMemo<ColumnDef<CertificationDto>[]>(
    () => getSuperAdminCertificationColumns(),
    []
  );

  return (
    <ResourceDataTable
      data={certifications}
      columns={columns}
      isLoading={isLoading}
      error={error}
      onRefreshAction={fetchData}
      searchPlaceholder="Search by certification name or type..."
      onDeleteItemsAction={() => {}}
      viewModeStorageKey="sa-certs-view-mode"
      exportFileName="all_certifications.csv"
      pageHeader={
        <PageHeader
          title="Global Certification Overview"
          description="View and filter all certifications across the platform."
        />
      }
      filterControls={(table) => (
        <DataTableFacetedFilter
          column={table.getColumn("organization_id")}
          title="Organization"
          options={orgOptions}
        />
      )}
      renderGridItemAction={(cert) => (
        <div className="p-4 border rounded-md">{cert.name}</div>
      )}
      emptyState={
        <FeedbackCard
          icon={Award}
          title="No Certifications Found"
          description="No organizations have added certifications yet."
        />
      }
      filteredEmptyState={
        <FeedbackCard
          icon={Search}
          title="No Certifications Found"
          description="Your filter criteria did not match any certifications."
        />
      }
    />
  );
}
EOF

# 4. Refactor: customers
# ------------------------------------------------------------------------------
echo "Refactoring 'customers'..."

# Update customers/page.tsx
cat <<'EOF' > customers/page.tsx
import { Metadata } from "next";
import { CustomersClient } from "./customers-client";

export const metadata: Metadata = {
  title: "Global Customer Overview",
  description: "View and filter all customers across all organizations.",
};

export default function SuperAdminCustomersPage() {
  return <CustomersClient />;
}
EOF

# Update customers/customers-client.tsx
cat <<'EOF' > customers/customers-client.tsx
"use client";

import React, { useMemo, useState, useEffect, useCallback } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { CustomerDto, OrganizationDto } from "@/types/organization";
import { organizationRepository } from "@/lib/data-repo/organization";
import { ResourceDataTable } from "@/components/resource-management/resource-data-table";
import { PageHeader } from "@/components/ui/page-header";
import { getSuperAdminCustomerColumns } from "./columns";
import { DataTableFacetedFilter } from "@/components/ui/data-table-faceted-filter";
import { FeedbackCard } from "@/components/ui/feedback-card";
import { Users, Search } from "lucide-react";

export function CustomersClient() {
  const [customers, setCustomers] = useState<CustomerDto[]>([]);
  const [organizations, setOrganizations] = useState<OrganizationDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const orgs = await organizationRepository.getAllOrganizations();
      setOrganizations(orgs);
      
      const customerArrays = await Promise.all(
        orgs.map((org) =>
          organizationRepository.getOrgCustomers(org.organization_id!)
        )
      );
      setCustomers(customerArrays.flat());
    } catch (err: any) {
      setError(err.message || "Failed to fetch customer data.");
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const orgOptions = useMemo(
    () =>
      organizations.map((org) => ({
        label: org.long_name || org.organization_id!,
        value: org.organization_id!,
      })),
    [organizations]
  );

  const columns = useMemo<ColumnDef<CustomerDto>[]>(
    () => getSuperAdminCustomerColumns(),
    []
  );

  return (
    <ResourceDataTable
      data={customers}
      columns={columns}
      isLoading={isLoading}
      error={error}
      onRefreshAction={fetchData}
      searchPlaceholder="Search by customer name..."
      onDeleteItemsAction={() => {}}
      viewModeStorageKey="sa-customers-view-mode"
      exportFileName="all_customers.csv"
      pageHeader={
        <PageHeader
          title="Global Customer Overview"
          description="View and filter all customers across the platform."
        />
      }
      filterControls={(table) => (
        <DataTableFacetedFilter
          column={table.getColumn("organization_id")}
          title="Organization"
          options={orgOptions}
        />
      )}
      renderGridItemAction={(customer) => (
        <div className="p-4 border rounded-md">{customer.first_name}</div>
      )}
      emptyState={
        <FeedbackCard
          icon={Users}
          title="No Customers Found"
          description="There are no customers registered on the platform yet."
        />
      }
      filteredEmptyState={
        <FeedbackCard
          icon={Search}
          title="No Customers Found"
          description="Your filter criteria did not match any customers."
        />
      }
    />
  );
}
EOF

# 5. Refactor: dashboard
# ------------------------------------------------------------------------------
echo "Refactoring 'dashboard'..."

# Update dashboard/page.tsx
cat <<'EOF' > dashboard/page.tsx
import { Metadata } from "next";
import { SuperAdminDashboardClient } from "./dashboard-client";

export const metadata: Metadata = {
  title: "Super Admin Dashboard",
  description: "Platform-wide overview of users, organizations, and activity.",
};

export default function SuperAdminDashboardPage() {
  return <SuperAdminDashboardClient />;
}
EOF

# Update dashboard/dashboard-client.tsx
cat <<'EOF' > dashboard/dashboard-client.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Loader2 } from "lucide-react";
import { authRepository } from "@/lib/data-repo/auth";
import { organizationRepository } from "@/lib/data-repo/organization";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Pie,
  PieChart,
  Cell,
} from "recharts";
import { Users, Building, Briefcase, FileText, UserPlus } from "lucide-react";
import { OrganizationDto } from "@/types/organization";
import { UserDto } from "@/types/auth";
import { format } from "date-fns";

export interface DashboardData {
  stats: {
    totalUsers: number;
    totalOrgs: number;
    totalBAs: number;
  };
  charts: {
    orgStatusCounts: Record<string, number>;
    baTypeCounts: Record<string, number>;
  };
  recentActivity: {
    users: UserDto[];
    organizations: OrganizationDto[];
  };
}

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#82ca9d",
];

export function SuperAdminDashboardClient() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [users, organizations, businessActors] = await Promise.all([
        authRepository.getAllUsers(),
        organizationRepository.getAllOrganizations(),
        organizationRepository.getAllBusinessActors(),
      ]);

      const orgStatusCounts = organizations.reduce((acc, org) => {
        const status = org.status || "UNKNOWN";
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const baTypeCounts = businessActors.reduce((acc, ba) => {
        const type = ba.type || "UNKNOWN";
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      setData({
        stats: {
          totalUsers: users.length,
          totalOrgs: organizations.length,
          totalBAs: businessActors.length,
        },
        charts: { orgStatusCounts, baTypeCounts },
        recentActivity: {
          users: users.slice(0, 5),
          organizations: organizations.slice(0, 5),
        },
      });
    } catch (err: any) {
      setError(err.message || "Failed to fetch dashboard data.");
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-destructive">Error: {error || "Could not load platform statistics."}</p>
      </div>
    );
  }

  const { stats, charts, recentActivity } = data;
  const orgStatusData = Object.entries(charts.orgStatusCounts).map(
    ([name, value]) => ({ name, value })
  );
  const baTypeData = Object.entries(charts.baTypeCounts).map(
    ([name, value]) => ({ name, value })
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Platform Dashboard"
        description="A high-level overview of all activity across the YowYob platform."
      />

      {/* Stat Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              All registered user accounts.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Organizations
            </CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrgs}</div>
            <p className="text-xs text-muted-foreground">Across all users.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Business Actors
            </CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBAs}</div>
            <p className="text-xs text-muted-foreground">
              Users with business profiles.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Organizations by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={orgStatusData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {orgStatusData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Business Actors by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={baTypeData}>
                <XAxis
                  dataKey="name"
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Feeds */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recently Created Organizations</CardTitle>
            <CardDescription>
              The 5 most recently created organizations.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.organizations.map((org) => (
                <div key={org.organization_id} className="flex items-center">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {org.long_name}
                    </p>
                    <p className="text-sm text-muted-foreground">{org.email}</p>
                  </div>
                  <div className="ml-auto text-xs text-muted-foreground">
                    {format(new Date(org.created_at!), "PP")}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recently Joined Users</CardTitle>
            <CardDescription>
              The 5 most recently registered users.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.users.map((user) => (
                <div key={user.id} className="flex items-center">
                  <UserPlus className="h-5 w-5 text-muted-foreground" />
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user.first_name} {user.last_name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      @{user.username}
                    </p>
                  </div>
                  <div className="ml-auto text-xs text-muted-foreground">
                    {format(new Date(user.created_at!), "PP")}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
EOF

# 6. Refactor: organizations
# ------------------------------------------------------------------------------
echo "Refactoring 'organizations'..."

# Update organizations/page.tsx
cat <<'EOF' > organizations/page.tsx
import { Metadata } from "next";
import { OrganizationsClient } from "./organizations-client";

export const metadata: Metadata = {
  title: "Organization Management",
  description:
    "Approve, monitor, and manage all organizations on the platform.",
};

export default function SuperAdminOrganizationsPage() {
  return <OrganizationsClient />;
}
EOF

# Update organizations/organizations-client.tsx
cat <<'EOF' > organizations/organizations-client.tsx
"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import {
  OrganizationDto,
  OrganizationStatus,
  OrganizationStatusValues,
} from "@/types/organization";
import { organizationRepository } from "@/lib/data-repo/organization";
import { ResourceDataTable } from "@/components/resource-management/resource-data-table";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Building, Search as SearchIcon } from "lucide-react";
import { getSuperAdminOrganizationColumns } from "./columns";
import { AdminOrganizationCard } from "./organization-card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { FeedbackCard } from "@/components/ui/feedback-card";
import { DataTableFacetedFilter } from "@/components/ui/data-table-faceted-filter";

const statusOptions = OrganizationStatusValues.map((s) => ({
  value: s,
  label: s.replace(/_/g, " "),
}));

export function OrganizationsClient() {
  const [organizations, setOrganizations] =
    useState<OrganizationDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogState, setDialogState] = useState<{
    open: boolean;
    items: OrganizationDto[];
    newStatus?: OrganizationStatus;
    type?: "status" | "delete";
  }>({ open: false, items: [] });

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await organizationRepository.getAllOrganizations();
      setOrganizations(data);
    } catch (err: any) {
      const errorMessage = err.message || "Failed to refresh organization data.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const handleStatusChangeConfirmation = (
    org: OrganizationDto,
    newStatus: OrganizationStatus
  ) => {
    setDialogState({ open: true, items: [org], newStatus, type: "status" });
  };

  const handleDeleteConfirmation = (orgs: OrganizationDto[]) => {
    if (orgs.length === 0) return;
    setDialogState({ open: true, items: orgs, type: "delete" });
  };

  const executeAction = async () => {
    const { items, newStatus, type } = dialogState;
    if (items.length === 0) return;

    const actionPromise: Promise<void> =
      type === "status" && newStatus
        ? organizationRepository
            .updateOrganizationStatus(items[0].organization_id!, {
              status: newStatus,
            })
            .then(() => {})
        : Promise.all(
            items.map((org) =>
              organizationRepository.deleteOrganization(org.organization_id!)
            )
          ).then(() => {});

    toast.promise(actionPromise, {
      loading: `Processing action...`,
      success: () => {
        refreshData();
        setDialogState({ open: false, items: [] });
        return `Action completed successfully.`;
      },
      error: (err) => `An error occurred: ${err.message}`,
    });
  };

  const columns = useMemo<ColumnDef<OrganizationDto>[]>(
    () =>
      getSuperAdminOrganizationColumns({
        onStatusChangeAction: handleStatusChangeConfirmation,
        onDeleteAction: (org) => handleDeleteConfirmation([org]),
      }),
    []
  );

  return (
    <>
      <ResourceDataTable
        data={organizations}
        columns={columns}
        isLoading={isLoading}
        error={error}
        onRefreshAction={refreshData}
        searchPlaceholder="Search by name, email..."
        onDeleteItemsAction={handleDeleteConfirmation}
        viewModeStorageKey="sa-orgs-view-mode"
        exportFileName="organizations_export.csv"
        pageHeader={
          <PageHeader
            title="Organization Management"
            description="Monitor, approve, and manage all organizations on the platform."
          />
        }
        filterControls={(table) => (
          <DataTableFacetedFilter
            column={table.getColumn("status")}
            title="Status"
            options={statusOptions}
          />
        )}
        renderGridItemAction={(org) => (
          <AdminOrganizationCard
            organization={org}
            onStatusChangeAction={handleStatusChangeConfirmation}
            onDeleteAction={() => handleDeleteConfirmation([org])}
          />
        )}
        emptyState={
          <FeedbackCard
            icon={Building}
            title="No Organizations Found"
            description="There are currently no organizations registered on the platform."
          />
        }
        filteredEmptyState={
          <FeedbackCard
            icon={SearchIcon}
            title="No Organizations Found"
            description="Your search or filter criteria did not match any organizations."
          />
        }
      />

      <AlertDialog
        open={dialogState.open}
        onOpenChange={(open) => setDialogState((prev) => ({ ...prev, open }))}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              {dialogState.type === "delete"
                ? `This will permanently delete ${dialogState.items.length} organization(s). This action cannot be undone.`
                : `This will change the status of "${dialogState.items[0]?.long_name}" to ${dialogState.newStatus}.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={executeAction}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
EOF

# 7. Refactor: roles
# ------------------------------------------------------------------------------
echo "Refactoring 'roles'..."

# Update roles/page.tsx
cat <<'EOF' > roles/page.tsx
import { Metadata } from "next";
import { RoleAssignmentClient } from "./roles-client";

export const metadata: Metadata = {
  title: "Roles & Permissions",
  description: "Configure Role-Based Access Control (RBAC) for the platform.",
};

export default function SuperAdminRolesPage() {
  return <RoleAssignmentClient />;
}
EOF

# Update roles/roles-client.tsx
cat <<'EOF' > roles/roles-client.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { RoleDto, PermissionDto } from "@/types/auth";
import { authRepository } from "@/lib/data-repo/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { Loader2, Save } from "lucide-react";
import { cn } from "@/lib/utils";

export function RoleAssignmentClient() {
  const [roles, setRoles] = useState<RoleDto[]>([]);
  const [allPermissions, setAllPermissions] = useState<PermissionDto[]>([]);
  const [selectedRole, setSelectedRole] = useState<RoleDto | null>(null);
  const [rolePermissions, setRolePermissions] = useState<Set<string>>(new Set());
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoadingData(true);
    try {
      const [fetchedRoles, fetchedPermissions] = await Promise.all([
        authRepository.getRoles(),
        authRepository.getAllPermissions(),
      ]);
      setRoles(fetchedRoles);
      setAllPermissions(fetchedPermissions);
      if (fetchedRoles.length > 0) {
        setSelectedRole(fetchedRoles[0]);
      }
    } catch (error: any) {
      toast.error(`Failed to load roles and permissions: ${error.message}`);
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    // This logic should be updated when an endpoint to fetch permissions per role is available.
    if (selectedRole?.id) {
      const mockPerms = new Set<string>(selectedRole.permissions?.map(p => p.id!) || []);
      setRolePermissions(mockPerms);
    }
  }, [selectedRole]);

  const handlePermissionToggle = (permissionId: string, checked: boolean) => {
    setRolePermissions(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(permissionId);
      } else {
        newSet.delete(permissionId);
      }
      return newSet;
    });
  };

  const handleSaveChanges = async () => {
    if (!selectedRole?.id) return;
    setIsSaving(true);
    try {
      await authRepository.assignPermissionsToRole(selectedRole.id, Array.from(rolePermissions));
      toast.success(`Permissions for role "${selectedRole.name}" updated.`);
    } catch (error: any) {
      toast.error(`Failed to save permissions: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };
  
  if (isLoadingData) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Role & Permission Management"
        description="Assign permissions to roles to control user access across the platform."
        action={<Button onClick={handleSaveChanges} disabled={isSaving}>{isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Changes</Button>}
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader><CardTitle>Roles</CardTitle></CardHeader>
          <CardContent>
            <ScrollArea className="h-[60vh]">
              <div className="space-y-1 pr-4">
                {roles.map(role => (
                  <Button
                    key={role.id}
                    variant="ghost"
                    className={cn("w-full justify-start", selectedRole?.id === role.id && "bg-accent text-accent-foreground")}
                    onClick={() => setSelectedRole(role)}
                  >
                    {role.name}
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Permissions for: {selectedRole?.name || '...'}</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[60vh]">
              <div className="space-y-4 pr-4">
                {allPermissions.map(permission => (
                  <div key={permission.id} className="flex items-center space-x-3 rounded-md border p-3">
                    <Checkbox
                      id={`perm-${permission.id}`}
                      checked={rolePermissions.has(permission.id!)}
                      onCheckedChange={(checked) => handlePermissionToggle(permission.id!, !!checked)}
                    />
                    <Label htmlFor={`perm-${permission.id}`} className="font-medium leading-none cursor-pointer">
                      {permission.name}
                      <p className="text-xs text-muted-foreground font-normal">{permission.description}</p>
                    </Label>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
EOF

# 8. Refactor: suppliers
# ------------------------------------------------------------------------------
echo "Refactoring 'suppliers'..."

# Update suppliers/page.tsx
cat <<'EOF' > suppliers/page.tsx
import { Metadata } from "next";
import { SuppliersClient } from "./suppliers-client";

export const metadata: Metadata = {
  title: "Global Supplier Overview",
  description: "View and filter all suppliers across all organizations.",
};

export default function SuperAdminSuppliersPage() {
  return <SuppliersClient />;
}
EOF

# Update suppliers/suppliers-client.tsx
cat <<'EOF' > suppliers/suppliers-client.tsx
"use client";

import React, { useMemo, useState, useEffect, useCallback } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { ProviderDto, OrganizationDto } from "@/types/organization";
import { organizationRepository } from "@/lib/data-repo/organization";
import { ResourceDataTable } from "@/components/resource-management/resource-data-table";
import { PageHeader } from "@/components/ui/page-header";
import { getSuperAdminSupplierColumns } from "./columns";
import { DataTableFacetedFilter } from "@/components/ui/data-table-faceted-filter";
import { FeedbackCard } from "@/components/ui/feedback-card";
import { Truck, Search } from "lucide-react";

export function SuppliersClient() {
  const [suppliers, setSuppliers] = useState<ProviderDto[]>([]);
  const [organizations, setOrganizations] = useState<OrganizationDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const orgs = await organizationRepository.getAllOrganizations();
      setOrganizations(orgs);
      
      const supplierArrays = await Promise.all(
        orgs.map(org => organizationRepository.getOrgSuppliers(org.organization_id!))
      );
      setSuppliers(supplierArrays.flat());
    } catch (err: any) {
      setError(err.message || "Failed to fetch supplier data.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const orgOptions = useMemo(
    () =>
      organizations.map((org) => ({
        label: org.long_name || org.organization_id!,
        value: org.organization_id!,
      })),
    [organizations]
  );

  const columns = useMemo<ColumnDef<ProviderDto>[]>(
    () => getSuperAdminSupplierColumns(),
    []
  );

  return (
    <ResourceDataTable
      data={suppliers}
      columns={columns}
      isLoading={isLoading}
      error={error}
      onRefreshAction={fetchData}
      searchPlaceholder="Search by supplier name..."
      onDeleteItemsAction={() => {}}
      viewModeStorageKey="sa-suppliers-view-mode"
      exportFileName="all_suppliers.csv"
      pageHeader={
        <PageHeader
          title="Global Supplier Overview"
          description="View and filter all suppliers across the platform."
        />
      }
      filterControls={(table) => (
        <DataTableFacetedFilter
          column={table.getColumn("organization_id")}
          title="Organization"
          options={orgOptions}
        />
      )}
      renderGridItemAction={(supplier) => (
        <div className="p-4 border rounded-md">{supplier.first_name}</div>
      )}
      emptyState={
        <FeedbackCard
          icon={Truck}
          title="No Suppliers Found"
          description="There are no suppliers registered on the platform yet."
        />
      }
      filteredEmptyState={
        <FeedbackCard
          icon={Search}
          title="No Suppliers Found"
          description="Your filter criteria did not match any suppliers."
        />
      }
    />
  );
}
EOF

# 9. Refactor: users
# ------------------------------------------------------------------------------
echo "Refactoring 'users'..."

# Update users/page.tsx
cat <<'EOF' > users/page.tsx
import { Metadata } from "next";
import { UsersClient } from "./users-client";

export const metadata: Metadata = {
  title: "User Management",
  description: "View, manage, and moderate all user accounts on the platform.",
};

export default function SuperAdminUsersPage() {
  return <UsersClient />;
}
EOF

# Update users/users-client.tsx
cat <<'EOF' > users/users-client.tsx
"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { UserDto } from "@/types/auth";
import { authRepository } from "@/lib/data-repo/auth";
import { ResourceDataTable } from "@/components/resource-management/resource-data-table";
import { PageHeader } from "@/components/ui/page-header";
import { Users, Search as SearchIcon } from "lucide-react";
import { getUserColumns } from "./columns";
import { UserCard } from "./user-card";
import { FeedbackCard } from "@/components/ui/feedback-card";
import { DataTableFacetedFilter } from "@/components/ui/data-table-faceted-filter";

const statusOptions = [
  { value: "true", label: "Enabled" },
  { value: "false", label: "Disabled" },
];

export function UsersClient() {
  const [users, setUsers] = useState<UserDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await authRepository.getAllUsers();
      setUsers(data);
    } catch (err: any) {
      const errorMessage = err.message || "Failed to refresh user data.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const handleStatusToggle = (user: UserDto) => {
    toast.info(`Toggling status for ${user.username}... (Not Implemented)`);
  };

  const handleVerify = (user: UserDto, type: "email" | "phone") => {
    toast.info(`Verifying ${type} for ${user.username}... (Not Implemented)`);
  };

  const columns = useMemo<ColumnDef<UserDto>[]>(
    () =>
      getUserColumns({
        onStatusToggleAction: handleStatusToggle,
        onVerifyAction: handleVerify,
      }),
    []
  );

  return (
    <ResourceDataTable
      data={users}
      columns={columns}
      isLoading={isLoading}
      error={error}
      onRefreshAction={refreshData}
      searchPlaceholder="Search by name, username, email..."
      onDeleteItemsAction={(items) =>
        toast.error(`Deletion of ${items.length} users is not implemented.`)
      }
      viewModeStorageKey="sa-users-view-mode"
      exportFileName="users_export.csv"
      pageHeader={
        <PageHeader
          title="User Management"
          description="View, manage, and moderate all user accounts."
        />
      }
      filterControls={(table) => (
        <DataTableFacetedFilter
          column={table.getColumn("is_enabled")}
          title="Status"
          options={statusOptions}
        />
      )}
      renderGridItemAction={(user) => (
        <UserCard
          user={user}
          onStatusToggleAction={handleStatusToggle}
          onVerifyAction={handleVerify}
        />
      )}
      emptyState={
        <FeedbackCard
          icon={Users}
          title="No Users Found"
          description="There are no users registered on the platform yet."
        />
      }
      filteredEmptyState={
        <FeedbackCard
          icon={SearchIcon}
          title="No Users Found"
          description="Your search or filter criteria did not match any users."
        />
      }
    />
  );
}
EOF

echo "Refactoring complete. All targeted files have been updated."