"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useActiveOrganization } from "@/contexts/active-organization-context";
import { organizationRepository } from "@/lib/data-repo/organization";
import {
  EmployeeDto,
  CustomerDto,
  ProviderDto,
  SalesPersonDto,
  ProspectDto,
} from "@/types/organization";
import { PageHeader } from "@/components/ui/page-header";
import {
  StatCard,
  StatCardSkeleton,
} from "@/components/dashboard/organization/stat-card";
import { SalesChart } from "@/components/dashboard/organization/sales-chart";
import { TeamRoster } from "@/components/dashboard/agency/team-roster";
import {
  RecentActivity,
  ActivityItem,
} from "@/components/dashboard/organization/recent-activity";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FeedbackCard } from "@/components/ui/feedback-card";
import {
  Building,
  Users,
  Briefcase,
  Truck,
  UserCheck,
  UserPlus,
  DollarSign,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

// REASON: Define a comprehensive state structure for all dynamic agency data.
interface AgencyDashboardData {
  employeeCount: number;
  customerCount: number;
  supplierCount: number;
  salesPeopleCount: number;
  prospectCount: number;
  employees: EmployeeDto[];
  error?: string | null;
}

const initialData: AgencyDashboardData = {
  employeeCount: 0,
  customerCount: 0,
  supplierCount: 0,
  salesPeopleCount: 0,
  prospectCount: 0,
  employees: [],
};

export function AgencyDashboardClientPage() {
  const router = useRouter();
  const {
    activeOrganizationId,
    activeAgencyId,
    activeAgencyDetails,
    isLoadingAgencyDetails,
  } = useActiveOrganization();
  const [data, setData] = useState<AgencyDashboardData>(initialData);
  const [activityFeed, setActivityFeed] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // REASON: This function now fetches all relevant data for the specific agency in parallel.
  const fetchData = useCallback(async () => {
    if (!activeOrganizationId || !activeAgencyId) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const [employees, customers, suppliers, salesPeople, prospects] =
        await Promise.all([
          organizationRepository.getAgencyEmployees(
            activeOrganizationId,
            activeAgencyId
          ),
          organizationRepository.getAgencyCustomers(
            activeOrganizationId,
            activeAgencyId
          ),
          organizationRepository.getAgencySuppliers(
            activeOrganizationId,
            activeAgencyId
          ),
          organizationRepository.getAgencySalesPersons(
            activeOrganizationId,
            activeAgencyId
          ),
          organizationRepository.getAgencyProspects(
            activeOrganizationId,
            activeAgencyId
          ),
        ]);

      // REASON: Create a dynamic recent activity feed, just like the organization dashboard.
      const allItems = [
        ...(employees || []).map((item) => ({
          ...item,
          type: "Employee" as const,
          name: `${item.first_name} ${item.last_name}`,
          id: item.employee_id,
          timestamp: item.updated_at || item.created_at,
        })),
        ...(customers || []).map((item) => ({
          ...item,
          type: "Customer" as const,
          name: `${item.first_name} ${item.last_name}`,
          id: item.customer_id,
          timestamp: item.updated_at || item.created_at,
        })),
        ...(prospects || []).map((item) => ({
          ...item,
          type: "Prospect" as const,
          name: `${item.first_name} ${item.last_name}`,
          id: item.prospect_id,
          timestamp: item.updated_at || item.created_at,
        })),
      ];

      const sortedActivities = allItems
        .filter((item) => item.timestamp)
        .sort(
          (a, b) =>
            new Date(b.timestamp!).getTime() - new Date(a.timestamp!).getTime()
        )
        .slice(0, 5)
        .map((item) => ({
          id: `${item.type}-${item.id}`,
          type: item.type,
          targetName: item.name || "Unnamed",
          timestamp: item.timestamp!,
          action: (new Date(item.updated_at!).getTime() -
            new Date(item.created_at!).getTime() <
          2000
            ? "created"
            : "updated") as "created" | "updated",
        }));

      setActivityFeed(sortedActivities);
      setData({
        employeeCount: employees?.length || 0,
        customerCount: customers?.length || 0,
        supplierCount: suppliers?.length || 0,
        salesPeopleCount: salesPeople?.length || 0,
        prospectCount: prospects?.length || 0,
        employees: employees || [],
        error: null,
      });
    } catch (error: any) {
      setData({
        ...initialData,
        error: "Failed to load agency dashboard data.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [activeOrganizationId, activeAgencyId]);

  useEffect(() => {
    if (activeAgencyId) {
      fetchData();
    } else if (!isLoadingAgencyDetails) {
      setIsLoading(false); // Stop loading if context is ready but no agency is selected
    }
  }, [activeAgencyId, isLoadingAgencyDetails, fetchData]);

  // REASON: Provide a robust loading state to prevent UI flicker.
  if (isLoading || isLoadingAgencyDetails) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-1/3" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-7">
          <Skeleton className="lg:col-span-4 h-96 w-full" />
          <Skeleton className="lg:col-span-3 h-96 w-full" />
        </div>
      </div>
    );
  }

  // REASON: Provide a clear empty state if no agency is active.
  if (!activeAgencyId) {
    return (
      <FeedbackCard
        icon={Building}
        title="No Agency Selected"
        description="Please select an agency from the switcher in the sidebar to view its dashboard."
      />
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title={activeAgencyDetails?.long_name || "Agency Dashboard"}
        description="A focused overview of this agency's performance."
        action={
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/business-actor/org/agencies")}
          >
            Back to All Agencies
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <StatCard
          title="Team Members"
          value={`${data.employeeCount}`}
          description="Active employees in this agency"
          icon={Users}
        />
        <StatCard
          title="Agency Customers"
          value={`${data.customerCount}`}
          description="Total clients managed"
          icon={Briefcase}
        />
        <StatCard
          title="New Prospects"
          value={`${data.prospectCount}`}
          description="Potential new leads"
          icon={UserPlus}
        />
        <StatCard
          title="Sales Team"
          value={`${data.salesPeopleCount}`}
          description="Active sales representatives"
          icon={UserCheck}
        />
        <StatCard
          title="Suppliers"
          value={`${data.supplierCount}`}
          description="Associated suppliers"
          icon={Truck}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-7">
        <SalesChart />
        <RecentActivity activities={activityFeed} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <TeamRoster employees={data.employees} />
        {/* You can add another chart or widget here */}
      </div>
    </div>
  );
}
