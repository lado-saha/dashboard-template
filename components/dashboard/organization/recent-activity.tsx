"use client";

import { Avatar } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from 'date-fns';
import { Users, Building, Briefcase, Truck, UserPlus } from 'lucide-react'; // REASON: Added UserPlus for Prospects
import React from "react";

export interface ActivityItem {
  id: string;
  // REASON: Expanded the type to officially include 'Prospect'
  type: 'Employee' | 'Agency' | 'Customer' | 'Supplier' | 'Prospect';
  action: 'created' | 'updated';
  timestamp: string;
  targetName: string;
}

// REASON: Added a new entry for 'Prospect' to the configuration object.
// This is the core fix for the TypeError.
const typeConfig = {
    Employee: { icon: Users, color: 'bg-sky-100 dark:bg-sky-900/40', textColor: 'text-sky-600 dark:text-sky-400' },
    Agency: { icon: Building, color: 'bg-amber-100 dark:bg-amber-900/40', textColor: 'text-amber-600 dark:text-amber-400' },
    Customer: { icon: Briefcase, color: 'bg-green-100 dark:bg-green-900/40', textColor: 'text-green-600 dark:text-green-400' },
    Supplier: { icon: Truck, color: 'bg-slate-100 dark:bg-slate-800/60', textColor: 'text-slate-600 dark:text-slate-400' },
    Prospect: { icon: UserPlus, color: 'bg-purple-100 dark:bg-purple-900/40', textColor: 'text-purple-600 dark:text-purple-400' },
};


export function RecentActivity({ activities }: { activities: ActivityItem[] }) {
  return (
    <Card className="col-span-4 lg:col-span-3">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>An overview of the latest actions.</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[350px]">
            {activities.length > 0 ? (
                <div className="space-y-6">
                    {activities.map((activity) => {
                        const config = typeConfig[activity.type];
                        // This check prevents crashes if an unknown type is ever passed.
                        if (!config) {
                            console.warn(`RecentActivity: Unknown activity type "${activity.type}"`);
                            return null;
                        }
                        const Icon = config.icon;
                        return (
                        <div key={activity.id} className="flex items-center">
                            <Avatar className={`h-9 w-9 flex items-center justify-center ${config.color}`}>
                                <Icon className={`h-5 w-5 ${config.textColor}`} />
                            </Avatar>
                            <div className="ml-4 space-y-1">
                                <p className="text-sm font-medium leading-none">
                                    <span className="font-semibold text-primary">{activity.targetName}</span>
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {activity.type} {activity.action} • {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                                </p>
                            </div>
                        </div>
                        )
                    })}
                </div>
            ) : (
                <div className="flex h-[300px] items-center justify-center text-center text-sm text-muted-foreground">
                    <p>No recent activity to display.</p>
                </div>
            )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
