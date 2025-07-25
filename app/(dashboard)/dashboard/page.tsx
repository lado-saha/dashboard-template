"use client";

import React from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useSettings } from "@/contexts/settings-context";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Building,
  Gift,
  HandCoins,
  History,
  Megaphone,
  Star,
  ArrowRight,
  Briefcase,
  Loader2,
} from "lucide-react";

export default function UserDashboardPage() {
  const { data: session, status } = useSession();
  const { settings } = useSettings();

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-muted-foreground">Loading Dashboard...</p>
      </div>
    );
  }

  const isBusinessActor = !!session?.user.businessActorId;
  const upcomingReservations = 0;
  const bonusPoints = 1234;
  const recentFavorites = 2;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {settings.fullName || "User"}!
          </h1>
          <p className="text-muted-foreground">
            Here's a quick overview of your personal account.
          </p>
        </div>
        {isBusinessActor ? (
          <Button size="lg" asChild>
            <Link href="/business-actor/organizations">
              Enter Business Workspace <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        ) : (
          <Button
            size="lg"
            asChild
            className="animate-pulse bg-gradient-to-r from-primary to-primary/80 hover:from-primary/80 hover:to-primary/70 text-primary-foreground shadow-lg hover:shadow-primary/40 transition-shadow duration-300"
          >
            <Link href="/business-actor/organization/create">
              Create an Organization <Building className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              My Bonus Points
            </CardTitle>
            <HandCoins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {bonusPoints.toLocaleString()} Pts
            </div>
            <p className="text-xs text-muted-foreground">
              Value: ~${(bonusPoints * 0.01).toFixed(2)}
            </p>
          </CardContent>
          <CardFooter className="pt-0">
            <Button variant="link" size="sm" className="p-0 h-auto" asChild>
              <Link href="/bonus">View Details</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Upcoming Reservations
            </CardTitle>
            <History className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingReservations}</div>
            <p className="text-xs text-muted-foreground">Check your schedule</p>
          </CardContent>
          <CardFooter className="pt-0">
            <Button variant="link" size="sm" className="p-0 h-auto" asChild>
              <Link href="/services?tab=transactions">View Transactions</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Favorites</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentFavorites}</div>
            <p className="text-xs text-muted-foreground">
              Recently saved items
            </p>
          </CardContent>
          <CardFooter className="pt-0">
            <Button variant="link" size="sm" className="p-0 h-auto" asChild>
              <Link href="/favorites">Manage Favorites</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="hover:shadow-md transition-shadow bg-secondary/30 dark:bg-secondary/20 border-secondary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Invite Friends
            </CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold">Earn Rewards!</div>
            <p className="text-xs text-muted-foreground">
              Share your link & get bonuses.
            </p>
          </CardContent>
          <CardFooter className="pt-0">
            <Button variant="link" size="sm" className="p-0 h-auto" asChild>
              <Link href="/invite">Get Invite Link</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Megaphone className="h-5 w-5" /> Latest Announcements
            </CardTitle>
            <CardDescription>
              Updates and offers from businesses you follow.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground p-4 border rounded-md text-center italic">
                No recent announcements.
              </p>
            </div>
            <Button variant="outline" size="sm" className="mt-4" asChild>
              <Link href="/services?tab=announcements">
                View All Announcements
              </Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" /> Recent Activity
            </CardTitle>
            <CardDescription>
              Your latest reservations or purchases.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground p-4 border rounded-md text-center italic">
                No recent transactions.
              </p>
            </div>
            <Button variant="outline" size="sm" className="mt-4" asChild>
              <Link href="/services?tab=transactions">
                View All Transactions
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
