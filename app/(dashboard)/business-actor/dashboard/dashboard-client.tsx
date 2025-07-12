"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useActiveOrganization } from "@/contexts/active-organization-context";
import {
  DollarSign,
  Users,
  Building,
  Truck,
  Briefcase,
  UserPlus,
  Package,
  Users2,
  TrendingUp,
  BarChartHorizontal,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import {
  StatCard,
  StatCardSkeleton,
} from "@/components/dashboard/organization/stat-card";
import { SalesChart } from "@/components/dashboard/organization/sales-chart";
import { RecentActivity } from "@/components/dashboard/organization/recent-activity";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { organizationRepository } from "@/lib/data-repo/organization";
import {
  AgencyDto,
  EmployeeDto,
  CustomerDto,
  ProviderDto,
} from "@/types/organization";
import { Progress } from "@/components/ui/progress";
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
import { cn } from "@/lib/utils";

interface DashboardData {
  employeeCount: number;
  agencyCount: number;
  customerCount: number;
  supplierCount: number;
  topAgencies: AgencyDto[];
  employees: EmployeeDto[];
  customers: CustomerDto[];
  suppliers: ProviderDto[];
  error?: string | null;
}

interface DashboardClientPageProps {
  initialData: Omit<DashboardData, "employees" | "customers" | "suppliers">;
}

export function DashboardClientPage({ initialData }: DashboardClientPageProps) {
  const router = useRouter();
  const {
    activeOrganizationId,
    activeOrganizationDetails,
    isLoadingOrgDetails,
  } = useActiveOrganization();
  const [data, setData] = useState<DashboardData>({
    ...initialData,
    employees: [],
    customers: [],
    suppliers: [],
  });
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
      setData({
        employeeCount: employees?.length || 0,
        agencyCount: agencies?.length || 0,
        customerCount: customers?.length || 0,
        supplierCount: suppliers?.length || 0,
        topAgencies:
          agencies
            ?.sort(
              (a, b) => (b.average_revenue || 0) - (a.average_revenue || 0)
            )
            .slice(0, 5) || [],
        employees: employees || [],
        customers: customers || [],
        suppliers: suppliers || [],
      });
    } catch (error: any) {
      setData({
        ...initialData,
        employees: [],
        customers: [],
        suppliers: [],
        error: "Failed to load dashboard data.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [activeOrganizationId, initialData]);

  useEffect(() => {
    if (activeOrganizationId) {
      fetchData();
    } else if (!isLoadingOrgDetails) {
      setIsLoading(false);
    }
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

  const totalRevenue = data.topAgencies.reduce(
    (acc, agency) => acc + (agency.average_revenue || 0),
    0
  );

  const departmentDistribution = data.employees.reduce((acc, emp) => {
    const dept = emp.department || "Unassigned";
    acc[dept] = (acc[dept] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const departmentData = Object.entries(departmentDistribution)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  return (
    <div className="space-y-8">
      <PageHeader
        title={activeOrganizationDetails?.long_name || "Dashboard"}
        description="Welcome to your organization's command center."
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Est. Annual Revenue"
          value={`$${(totalRevenue * 12).toLocaleString()}`}
          description="+20.1% from last year"
          icon={DollarSign}
        />
        <StatCard
          title="Active Customers"
          value={`${data.customerCount}`}
          description="+180 since last month"
          icon={Users}
        />
        <StatCard
          title="Total Agencies"
          value={`${data.agencyCount}`}
          description="View all agencies"
          icon={Building}
        />
        <StatCard
          title="Total Employees"
          value={`${data.employeeCount}`}
          description="+5 since last week"
          icon={UserPlus}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-7">
        <SalesChart />
        <RecentActivity />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Organization Entities Overview</CardTitle>
          <CardDescription>
            A detailed breakdown of your key operational entities.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="agencies" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
              <TabsTrigger value="agencies">
                <Users2 className="mr-2 h-4 w-4" />
                Agencies
              </TabsTrigger>
              <TabsTrigger value="employees">
                <Users className="mr-2 h-4 w-4" />
                Employees
              </TabsTrigger>
              <TabsTrigger value="customers">
                <Briefcase className="mr-2 h-4 w-4" />
                Customers
              </TabsTrigger>
              <TabsTrigger value="suppliers">
                <Truck className="mr-2 h-4 w-4" />
                Suppliers
              </TabsTrigger>
            </TabsList>

            <TabsContent value="agencies" className="pt-6 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {data.agencyCount} total agencies.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push("/business-actor/org/agencies")}
                >
                  Manage All
                </Button>
              </div>
              <div className="space-y-4">
                {data.topAgencies.map((agency) => (
                  <div key={agency.agency_id} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <p className="font-medium">{agency.short_name}</p>
                      <p className="text-muted-foreground">
                        ${(agency.average_revenue || 0).toLocaleString()}/mo
                      </p>
                    </div>
                    <Progress
                      value={
                        totalRevenue > 0
                          ? ((agency.average_revenue || 0) / totalRevenue) * 100
                          : 0
                      }
                    />
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="employees" className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-muted-foreground">
                  {data.employeeCount} total employees.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push("/business-actor/org/employees")}
                >
                  Manage All
                </Button>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart
                  data={departmentData}
                  layout="vertical"
                  margin={{ left: 10, right: 30 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" stroke="#888888" fontSize={12} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    stroke="#888888"
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
            </TabsContent>

            <TabsContent value="customers" className="pt-6">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {data.customerCount} total customers.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push("/business-actor/org/customers")}
                >
                  Manage All
                </Button>
              </div>
              <div className="h-[250px] flex items-center justify-center text-muted-foreground italic">
                New customer acquisition chart coming soon...
              </div>
            </TabsContent>

            <TabsContent value="suppliers" className="pt-6">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {data.supplierCount} total suppliers.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push("/business-actor/org/suppliers")}
                >
                  Manage All
                </Button>
              </div>
              <div className="h-[250px] flex items-center justify-center text-muted-foreground italic">
                Supplier category breakdown chart coming soon...
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
