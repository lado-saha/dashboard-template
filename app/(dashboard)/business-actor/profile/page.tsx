"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { organizationRepository } from "@/lib/data-repo/organization";
import { BusinessActorDto } from "@/types/organization";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertTriangle, UserCircle2 } from "lucide-react";
import { toast } from "sonner";
import { BusinessActorForm } from "@/components/business-actor/business-actor-form";

export default function EditBusinessActorProfilePage() {
  const { data: session } = useSession();
  const [actorData, setActorData] = useState<BusinessActorDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // The businessActorId is now authoritative from the session
    const baId = session?.user?.businessActorId;
    if (baId) {
      setIsLoading(true);
      setError(null);
      organizationRepository.getBusinessActorById(baId)
        .then(data => {
          if (data) {
            setActorData(data);
          } else {
            setError("Business Actor profile not found.");
          }
        })
        .catch(() => setError("Failed to fetch your profile details."))
        .finally(() => setIsLoading(false));
    } else if (session) {
      // User is logged in but has no BA profile ID in session
      setError("You have not completed the Business Actor onboarding process.");
      setIsLoading(false);
    }
  }, [session]);

  const handleSuccess = (updatedBA: BusinessActorDto) => {
    toast.success("Your professional profile has been updated!");
    setActorData(updatedBA); // Refresh local state with updated data
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <Skeleton className="h-8 w-1/2 mb-6" />
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }

  if (error || !actorData) {
    return (
      <Card className="border-destructive max-w-2xl mx-auto">
        <CardHeader><CardTitle className="text-destructive flex items-center gap-2"><AlertTriangle /> Error Loading Profile</CardTitle></CardHeader>
        <CardContent><p>{error || "Your Business Actor profile could not be loaded."}</p></CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <UserCircle2 className="h-8 w-8 text-primary" />
          Business Actor Profile
        </h1>
        <p className="text-muted-foreground mt-1">Manage your global professional information across all your organizations.</p>
      </div>
      <BusinessActorForm
        mode="edit"
        initialData={actorData}
        onSuccessAction={handleSuccess}
      />
    </div>
  );
}