"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useActiveOrganization } from "@/contexts/active-organization-context";
import {
  DollarSign,
  Users,
  Building,
  Truck,
  UserPlus,
  TrendingUp,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import {
  StatCard,
  StatCardSkeleton,
} from "@/components/dashboard/organization/stat-card";
import { SalesChart } from "@/components/dashboard/organization/sales-chart";
import {
  RecentActivity,
  ActivityItem,
} from "@/components/dashboard/organization/recent-activity";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { organizationRepository } from "@/lib/data-repo/organization";
import {
  AgencyDto,
  EmployeeDto,
  CustomerDto,
  ProviderDto,
} from "@/types/organization";
import { Skeleton } from "@/components/ui/skeleton";
import { FeedbackCard } from "@/components/ui/feedback-card";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

interface DashboardData {
  employeeCount: number;
  agencyCount: number;
  customerCount: number;
  supplierCount: number;
  employees: EmployeeDto[];
  agencies: AgencyDto[];
  customers: CustomerDto[];
  suppliers: ProviderDto[];
  error?: string | null;
}

const initialData: DashboardData = {
  employeeCount: 0,
  agencyCount: 0,
  customerCount: 0,
  supplierCount: 0,
  employees: [],
  agencies: [],
  customers: [],
  suppliers: [],
};

export function DashboardClientPage() {
  const {
    activeOrganizationId,
    activeOrganizationDetails,
    isLoadingOrgDetails,
  } = useActiveOrganization();
  const [data, setData] = useState<DashboardData>(initialData);
  const [activityFeed, setActivityFeed] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!activeOrganizationId) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const [employees, agencies, customers, suppliers] = await Promise.all([
        organizationRepository.getOrgEmployees(activeOrganizationId),
        organizationRepository.getAgencies(activeOrganizationId),
        organizationRepository.getOrgCustomers(activeOrganizationId),
        organizationRepository.getOrgSuppliers(activeOrganizationId),
      ]);

      const allItems = [
        ...(employees || []).map((item) => ({
          ...item,
          type: "Employee" as const,
          name: `${item.first_name} ${item.last_name}`,
          id: item.employee_id,
          timestamp: item.updated_at || item.created_at,
        })),
        ...(agencies || []).map((item) => ({
          ...item,
          type: "Agency" as const,
          name: item.long_name,
          id: item.agency_id,
          timestamp: item.updated_at || item.created_at,
        })),
        ...(customers || []).map((item) => ({
          ...item,
          type: "Customer" as const,
          name: `${item.first_name} ${item.last_name}`,
          id: item.customer_id,
          timestamp: item.updated_at || item.created_at,
        })),
        ...(suppliers || []).map((item) => ({
          ...item,
          type: "Supplier" as const,
          name: `${item.first_name} ${item.last_name}`,
          id: item.provider_id,
          timestamp: item.updated_at || item.created_at,
        })),
      ];

      const sortedActivities = allItems
        .filter((item) => item.timestamp)
        .sort(
          (a, b) =>
            new Date(b.timestamp!).getTime() - new Date(a.timestamp!).getTime()
        )
        .slice(0, 10)
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
        agencyCount: agencies?.length || 0,
        customerCount: customers?.length || 0,
        supplierCount: suppliers?.length || 0,
        employees: employees || [],
        agencies: agencies || [],
        customers: customers || [],
        suppliers: suppliers || [],
      });
    } catch (error: any) {
      setData({ ...initialData, error: "Failed to load dashboard data." });
    } finally {
      setIsLoading(false);
    }
  }, [activeOrganizationId]);

  useEffect(() => {
    if (activeOrganizationId) fetchData();
    else if (!isLoadingOrgDetails) setIsLoading(false);
  }, [activeOrganizationId, isLoadingOrgDetails, fetchData]);

  if (isLoading || isLoadingOrgDetails) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-1/3" />
          <Skeleton className="h-10 w-48" />
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

  if (!activeOrganizationId) {
    return (
      <FeedbackCard
        icon={Building}
        title="No Organization Selected"
        description="Please select an organization from the switcher in the sidebar to view its dashboard."
      />
    );
  }

  const departmentData = data.employees.reduce((acc, emp) => {
    const dept = emp.department || "Unassigned";
    acc[dept] = (acc[dept] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-8">
      <PageHeader
        title={activeOrganizationDetails?.long_name || "Dashboard"}
        description="Welcome to your organization's command center."
      />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Agencies"
          value={`${data.agencyCount}`}
          icon={Building}
        />
        <StatCard
          title="Total Employees"
          value={`${data.employeeCount}`}
          icon={Users}
        />
        <StatCard
          title="Total Customers"
          value={`${data.customerCount}`}
          icon={UserPlus}
        />
        <StatCard
          title="Total Suppliers"
          value={`${data.supplierCount}`}
          icon={Truck}
        />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-7">
        <SalesChart />
        <RecentActivity activities={activityFeed} />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Department Headcount</CardTitle>
          <CardDescription>
            Distribution of employees across departments.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart
              data={Object.entries(departmentData).map(([name, count]) => ({
                name,
                count,
              }))}
              layout="vertical"
              margin={{ left: 10, right: 30 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                horizontal={false}
                stroke="hsl(var(--border))"
              />
              <XAxis
                type="number"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                allowDecimals={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                width={100}
              />
              <Tooltip
                cursor={{ fill: "hsl(var(--muted))" }}
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                }}
              />
              <Bar
                dataKey="count"
                fill="hsl(var(--primary))"
                radius={[0, 4, 4, 0]}
                name="Employees"
                barSize={20}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
