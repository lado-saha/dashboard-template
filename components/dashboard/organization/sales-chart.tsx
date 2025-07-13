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
