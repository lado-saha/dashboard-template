"use client";

import { useActiveOrganization } from "@/contexts/active-organization-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
// import { toast } from "sonner";
// import { useRouter } from "next/navigation";
// import { useEffect } from "react";

export default function AgencyDashboardPage() {
  const { activeAgencyDetails, isLoadingAgencyDetails } =
    useActiveOrganization();

  if (isLoadingAgencyDetails) {
    return <Skeleton className="h-48 w-full" />;
  }

  if (!activeAgencyDetails) {
    return (
      <div>
        No active agency selected. Please return to the organization view to
        select an agency.
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Agency Dashboard: {activeAgencyDetails.long_name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Welcome to the dashboard for {activeAgencyDetails.short_name}.</p>
        <p className="mt-4 p-4 border-2 border-dashed rounded-lg">
          This area will contain charts, KPIs, and summaries specific to this
          agency performance.
        </p>
      </CardContent>
    </Card>
  );
}
