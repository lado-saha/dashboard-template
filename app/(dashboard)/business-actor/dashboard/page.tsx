"use client";

import React, { useEffect, useState } from "react";
import { useActiveOrganization } from "@/contexts/active-organization-context";
import { organizationRepository } from "@/lib/data-repo/organization";
import { AgencyDto, EmployeeDto } from "@/types/organization";
import {
  DollarSign, Users, Building2, UserPlus, ArrowRight, Package, PlusCircle, FileText,
} from "lucide-react";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid, Pie, PieChart, Cell,
} from "recharts";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// --- Mock Data Fetching Functions ---
// In a real app, these would be replaced with actual API calls using the orgId.
const getMockOrgStats = (orgId: string) => ({
  revenue: 45231.89,
  newCustomers: 235,
  monthlyRevenue: [
    { name: "Jan", total: Math.floor(Math.random() * 5000) + 1000 },
    { name: "Feb", total: Math.floor(Math.random() * 5000) + 1000 },
    { name: "Mar", total: Math.floor(Math.random() * 5000) + 1000 },
    { name: "Apr", total: Math.floor(Math.random() * 5000) + 1000 },
    { name: "May", total: Math.floor(Math.random() * 5000) + 1000 },
    { name: "Jun", total: Math.floor(Math.random() * 5000) + 1000 },
  ],
  recentActivities: [
    { user: "Liam Johnson", action: "added a new employee:", target: "Olivia Davis" },
    { user: "Emma Williams", action: "updated the product:", target: "Quantum Widget" },
    { user: "Noah Brown", action: "created a new agency:", target: "Innovate East" },
    { user: "Ava Jones", action: "closed a deal with:", target: "TechCorp Inc." },
  ],
  departmentDistribution: [
    { name: 'Engineering', value: 40 },
    { name: 'Sales', value: 25 },
    { name: 'Marketing', value: 15 },
    { name: 'Support', value: 10 },
    { name: 'HR', value: 5 },
  ],
});

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'];

export default function OrganizationDashboardPage() {
  const { activeOrganizationDetails, isLoadingOrgDetails } = useActiveOrganization();
  const [stats, setStats] = useState<any>(null);
  const [agencies, setAgencies] = useState<AgencyDto[]>([]);
  const [employees, setEmployees] = useState<EmployeeDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (activeOrganizationDetails?.organization_id) {
        setIsLoading(true);
        try {
          const [agenciesData, employeesData] = await Promise.all([
            organizationRepository.getAgencies(activeOrganizationDetails.organization_id),
            organizationRepository.getOrgEmployees(activeOrganizationDetails.organization_id),
          ]);
          setAgencies(agenciesData || []);
          setEmployees(employeesData || []);
          setStats(getMockOrgStats(activeOrganizationDetails.organization_id));
        } catch (error) {
          console.error("Failed to fetch dashboard data", error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    fetchData();
  }, [activeOrganizationDetails]);

  if (isLoadingOrgDetails || isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-1/3" />
          <Skeleton className="h-10 w-48" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
        <div className="grid gap-4 lg:grid-cols-7">
          <Skeleton className="lg:col-span-4 h-96 w-full" />
          <Skeleton className="lg:col-span-3 h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!activeOrganizationDetails) {
    return (
      <Alert variant="destructive">
        <Building2 className="h-4 w-4" />
        <AlertTitle>No Active Organization</AlertTitle>
        <AlertDescription>
          Please select an organization from the hub to view its dashboard.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title={activeOrganizationDetails.long_name || "Dashboard"}
        description="Welcome to your organization's central command."
        action={
          <div className="flex items-center gap-2">
            <Button asChild variant="outline">
              <Link href="/business-actor/org/profile"><FileText className="mr-2 h-4 w-4" /> View Details</Link>
            </Button>
            <Button asChild>
              <Link href="/business-actor/org/agencies/create"><PlusCircle className="mr-2 h-4 w-4" /> New Agency</Link>
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Revenue</CardTitle><DollarSign className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">${stats.revenue.toLocaleString()}</div><p className="text-xs text-muted-foreground">+20.1% from last month</p></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">New Customers</CardTitle><Users className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">+{stats.newCustomers}</div><p className="text-xs text-muted-foreground">+180.1% from last month</p></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Active Agencies</CardTitle><Building2 className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{agencies.length}</div><p className="text-xs text-muted-foreground">View all agencies</p></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Employees</CardTitle><UserPlus className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{employees.length}</div><p className="text-xs text-muted-foreground">+5 since last week</p></CardContent></Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card><CardHeader><CardTitle>Revenue Overview</CardTitle><CardDescription>Monthly revenue for the last 6 months.</CardDescription></CardHeader><CardContent className="pl-2"><ResponsiveContainer width="100%" height={350}><BarChart data={stats.monthlyRevenue}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} /><YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value / 1000}k`} /><Tooltip cursor={{ fill: "hsl(var(--muted))" }} contentStyle={{ backgroundColor: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }} /><Legend /><Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></CardContent></Card>
        <Card><CardHeader><CardTitle>Employee Distribution</CardTitle><CardDescription>Breakdown of employees by department.</CardDescription></CardHeader><CardContent><ResponsiveContainer width="100%" height={350}><PieChart><Pie data={stats.departmentDistribution} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`} outerRadius={120} dataKey="value">{stats.departmentDistribution.map((entry: any, index: number) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}</Pie><Tooltip contentStyle={{ backgroundColor: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }} /><Legend /></PieChart></ResponsiveContainer></CardContent></Card>
      </div>

      <Tabs defaultValue="agencies">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="agencies">Top Agencies</TabsTrigger>
          <TabsTrigger value="team">Team Roster</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
        </TabsList>
        <TabsContent value="agencies">
          <Card><CardHeader><CardTitle>Top Performing Agencies</CardTitle><CardDescription>Agencies with the most activity or revenue.</CardDescription></CardHeader><CardContent><div className="space-y-4">{agencies.slice(0, 5).map((agency) => (<div key={agency.agency_id} className="flex items-center"><Avatar className="h-9 w-9"><AvatarImage src={agency.logo} alt="Avatar" /><AvatarFallback>{agency.short_name?.charAt(0)}</AvatarFallback></Avatar><div className="ml-4 space-y-1"><p className="text-sm font-medium leading-none">{agency.long_name}</p><p className="text-sm text-muted-foreground">{agency.location}</p></div><div className="ml-auto font-medium">+$1,999.00</div></div>))}</div></CardContent></Card>
        </TabsContent>
        <TabsContent value="team">
          <Card><CardHeader><CardTitle>Team Roster</CardTitle><CardDescription>A look at the members of your organization.</CardDescription></CardHeader><CardContent><ScrollArea className="h-[350px]"><div className="space-y-4">{employees.map((employee) => (<div key={employee.employee_id} className="flex items-center"><Avatar className="h-9 w-9"><AvatarImage src={employee.logo} alt="Avatar" /><AvatarFallback>{employee.first_name?.charAt(0)}</AvatarFallback></Avatar><div className="ml-4 space-y-1"><p className="text-sm font-medium leading-none">{employee.first_name} {employee.last_name}</p><p className="text-sm text-muted-foreground capitalize">{employee.employee_role?.replace(/_/g, " ").toLowerCase()}</p></div><div className="ml-auto font-medium">{employee.department}</div></div>))}</div></ScrollArea></CardContent></Card>
        </TabsContent>
        <TabsContent value="activity">
          <Card><CardHeader><CardTitle>Recent Activity</CardTitle><CardDescription>An overview of recent actions within your organization.</CardDescription></CardHeader><CardContent><div className="space-y-4">{stats.recentActivities.map((activity: any, index: number) => (<div key={index} className="flex items-center"><div className="ml-4 space-y-1"><p className="text-sm font-medium leading-none"><span className="font-semibold text-primary">{activity.user}</span> {activity.action}</p><p className="text-sm text-muted-foreground">{activity.target}</p></div></div>))}</div></CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
