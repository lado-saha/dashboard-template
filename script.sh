#!/bin/bash
# Description: Fixes chart colors to be theme-aware, providing proper contrast in both light and dark modes.

# --- 1. Correct the SalesChart Component ---
echo "🎨 Fixing SalesChart colors..."
mkdir -p components/dashboard/organization
code components/dashboard/organization/sales-chart.tsx
cat > components/dashboard/organization/sales-chart.tsx << 'EOF'
"use client";

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const data = [
  { month: "Jan", total: Math.floor(Math.random() * 5000) + 1000 },
  { month: "Feb", total: Math.floor(Math.random() * 5000) + 1000 },
  { month: "Mar", total: Math.floor(Math.random() * 5000) + 1000 },
  { month: "Apr", total: Math.floor(Math.random() * 5000) + 1000 },
  { month: "May", total: Math.floor(Math.random() * 5000) + 1000 },
  { month: "Jun", total: Math.floor(Math.random() * 5000) + 1000 },
  { month: "Jul", total: Math.floor(Math.random() * 5000) + 1000 },
  { month: "Aug", total: Math.floor(Math.random() * 5000) + 1000 },
  { month: "Sep", total: Math.floor(Math.random() * 5000) + 1000 },
  { month: "Oct", total: Math.floor(Math.random() * 5000) + 1000 },
  { month: "Nov", total: Math.floor(Math.random() * 5000) + 1000 },
  { month: "Dec", total: Math.floor(Math.random() * 5000) + 1000 },
];

export function SalesChart() {
  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Revenue Overview</CardTitle>
        <CardDescription>
          A summary of revenue generated per month this year.
        </CardDescription>
      </CardHeader>
      <CardContent className="pl-2">
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
            <XAxis
              dataKey="month"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${value / 1000}K`}
            />
            <Tooltip
              cursor={{ fill: "hsl(var(--muted))" }}
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                color: "hsl(var(--foreground))",
              }}
            />
            <Legend iconType="circle" wrapperStyle={{ color: "hsl(var(--foreground))" }} />
            <Bar
              dataKey="total"
              fill="hsl(var(--primary))"
              radius={[4, 4, 0, 0]}
              name="Monthly Revenue"
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
EOF

# --- 2. Correct the Organization Dashboard Chart ---
echo "🎨 Fixing Organization Dashboard chart colors..."
code app/\(dashboard\)/business-actor/dashboard/dashboard-client.tsx
cat > app/\(dashboard\)/business-actor/dashboard/dashboard-client.tsx << 'EOF'
"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useActiveOrganization } from "@/contexts/active-organization-context";
import { DollarSign, Users, Building, Truck, UserPlus, TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard, StatCardSkeleton } from "@/components/dashboard/organization/stat-card";
import { SalesChart } from "@/components/dashboard/organization/sales-chart";
import { RecentActivity, ActivityItem } from "@/components/dashboard/organization/recent-activity";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { organizationRepository } from "@/lib/data-repo/organization";
import { AgencyDto, EmployeeDto, CustomerDto, ProviderDto } from "@/types/organization";
import { Skeleton } from "@/components/ui/skeleton";
import { FeedbackCard } from "@/components/ui/feedback-card";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

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
  const { activeOrganizationId, activeOrganizationDetails, isLoadingOrgDetails } = useActiveOrganization();
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
        ...(employees || []).map(item => ({ ...item, type: 'Employee' as const, name: `${item.first_name} ${item.last_name}`, id: item.employee_id, timestamp: item.updated_at || item.created_at })),
        ...(agencies || []).map(item => ({ ...item, type: 'Agency' as const, name: item.long_name, id: item.agency_id, timestamp: item.updated_at || item.created_at })),
        ...(customers || []).map(item => ({ ...item, type: 'Customer' as const, name: `${item.first_name} ${item.last_name}`, id: item.customer_id, timestamp: item.updated_at || item.created_at })),
        ...(suppliers || []).map(item => ({ ...item, type: 'Supplier' as const, name: `${item.first_name} ${item.last_name}`, id: item.provider_id, timestamp: item.updated_at || item.created_at })),
      ];

      const sortedActivities = allItems
        .filter(item => item.timestamp)
        .sort((a, b) => new Date(b.timestamp!).getTime() - new Date(a.timestamp!).getTime())
        .slice(0, 10)
        .map(item => ({
          id: `${item.type}-${item.id}`,
          type: item.type,
          targetName: item.name || 'Unnamed',
          timestamp: item.timestamp!,
          action: new Date(item.updated_at!).getTime() - new Date(item.created_at!).getTime() < 2000 ? 'created' : 'updated'
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
        <div className="flex justify-between items-center"><Skeleton className="h-10 w-1/3" /><Skeleton className="h-10 w-48" /></div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">{Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)}</div>
        <div className="grid gap-4 lg:grid-cols-7"><Skeleton className="lg:col-span-4 h-96 w-full" /><Skeleton className="lg:col-span-3 h-96 w-full" /></div>
      </div>
    );
  }

  if (!activeOrganizationId) {
    return <FeedbackCard icon={Building} title="No Organization Selected" description="Please select an organization from the switcher in the sidebar to view its dashboard." />;
  }

  const departmentData = data.employees.reduce((acc, emp) => {
    const dept = emp.department || "Unassigned";
    acc[dept] = (acc[dept] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-8">
      <PageHeader title={activeOrganizationDetails?.long_name || "Dashboard"} description="Welcome to your organization's command center." />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Agencies" value={`${data.agencyCount}`} icon={Building} />
        <StatCard title="Total Employees" value={`${data.employeeCount}`} icon={Users} />
        <StatCard title="Total Customers" value={`${data.customerCount}`} icon={UserPlus} />
        <StatCard title="Total Suppliers" value={`${data.supplierCount}`} icon={Truck} />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-7">
        <SalesChart />
        <RecentActivity activities={activityFeed} />
      </div>
      <Card>
        <CardHeader><CardTitle>Department Headcount</CardTitle><CardDescription>Distribution of employees across departments.</CardDescription></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={Object.entries(departmentData).map(([name, count]) => ({name, count}))} layout="vertical" margin={{ left: 10, right: 30 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
              <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} allowDecimals={false}/>
              <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} width={100} />
              <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} contentStyle={{ backgroundColor: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }} />
              <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} name="Employees" barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
EOF

# --- 3. Correct the Super Admin Dashboard Charts ---
echo "🎨 Fixing Super Admin Dashboard chart colors..."
code app/\(dashboard\)/super-admin/dashboard/dashboard-client.tsx
cat > app/\(dashboard\)/super-admin/dashboard/dashboard-client.tsx << 'EOF'
"use client";

import React, { useMemo } from "react";
import { UserDto } from "@/types/auth";
import { OrganizationDto, BusinessActorDto } from "@/types/organization";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/dashboard/organization/stat-card";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { Users, Building, Briefcase, CheckCircle, Clock } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid, Pie, PieChart, Cell } from "recharts";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHeader, TableHead, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SuperAdminDashboardData {
  users: UserDto[];
  organizations: OrganizationDto[];
  businessActors: BusinessActorDto[];
  error?: string | null;
}

interface SuperAdminDashboardClientPageProps {
  initialData: SuperAdminDashboardData;
}

const PIE_COLORS = [
    "hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", 
    "hsl(var(--chart-4))", "hsl(var(--chart-5))"
];

export function SuperAdminDashboardClientPage({ initialData }: SuperAdminDashboardClientPageProps) {
  const { users, organizations, businessActors } = initialData;

  const orgStatusData = useMemo(() => {
    const counts = organizations.reduce((acc, org) => {
      const status = org.status || "UNKNOWN";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [organizations]);

  const baTypeData = useMemo(() => {
    const counts = businessActors.reduce((acc, actor) => {
      const type = actor.type || "GUEST";
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(counts).map(([name, value]) => ({ name: name.replace(/_/g, " "), value }));
  }, [businessActors]);

  const recentUsers = useMemo(() => {
    return [...users]
      .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
      .slice(0, 5);
  }, [users]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Platform Overview"
        description="A comprehensive, real-time view of all system activities and entities."
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard title="Total Users" value={users.length.toLocaleString()} icon={Users} description={`${users.filter(u => u.is_enabled).length} active`} />
        <StatCard title="Total Organizations" value={organizations.length.toLocaleString()} icon={Building} description={`${organizations.filter(o => o.status === "ACTIVE").length} active`} />
        <StatCard title="Business Actors" value={businessActors.length.toLocaleString()} icon={Briefcase} description="Total professional profiles" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <DashboardCard title="Organization Status" description="Distribution of organizations by their current status." icon={CheckCircle}>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={orgStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} labelLine={false} label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                  {orgStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--background))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }} />
              </PieChart>
            </ResponsiveContainer>
        </DashboardCard>
        <DashboardCard title="Business Actor Types" description="Breakdown of business actors by their primary role." icon={Briefcase}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={baTypeData} layout="vertical" margin={{ left: 20, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} width={120} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} contentStyle={{ backgroundColor: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }} />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} name="Count" barSize={25} />
              </BarChart>
            </ResponsiveContainer>
        </DashboardCard>
      </div>

      <DashboardCard title="Recently Registered Users" description="The latest users to join the platform." icon={Users}>
        <ScrollArea className="h-[300px]">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Username</TableHead>
                        <TableHead>Registered On</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {recentUsers.map(user => {
                        const name = `${user.first_name || ''} ${user.last_name || ''}`.trim();
                        return (
                            <TableRow key={user.id}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-9 w-9"><AvatarFallback>{name.charAt(0) || 'U'}</AvatarFallback></Avatar>
                                        <div className="font-medium">{name}</div>
                                    </div>
                                </TableCell>
                                <TableCell className="text-muted-foreground">{user.username}</TableCell>
                                <TableCell className="text-muted-foreground">{new Date(user.created_at!).toLocaleDateString()}</TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </ScrollArea>
      </DashboardCard>
    </div>
  );
}
EOF

echo "✅ All charts have been updated to use theme-aware colors."