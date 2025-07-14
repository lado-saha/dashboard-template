"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
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
import { OrganizationDto, BusinessActorDto } from "@/types/organization";
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

interface SuperAdminDashboardClientProps {
  initialData: DashboardData;
}

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#82ca9d",
];

export function SuperAdminDashboardClient({
  initialData,
}: SuperAdminDashboardClientProps) {
  const { stats, charts, recentActivity } = initialData;

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
                      {user.username}
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
