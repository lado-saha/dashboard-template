"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { BusinessActorForm } from "@/components/business-actor/business-actor-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight } from "lucide-react";
import { BusinessActorDto } from "@/types/organization";
import { toast } from "sonner";

export default function BusinessActorOnboardingPage() {
  const { data: session, update: updateSession } = useSession();
  const router = useRouter();
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSuccessAction = async (newBA: BusinessActorDto) => {
    toast.success("Business profile created successfully!");
    await updateSession();

    setIsSuccess(true);
  };

  const handleContinue = () => {
    // After session update, the user is now a BA and needs to create an org.
    router.push("/business-actor/organization/create");
  };

  if (session?.user.businessActorId && !isSuccess) {
    return (
      <div className="container mx-auto flex items-center justify-center min-h-[calc(100vh-10rem)]">
        <Card className="max-w-lg text-center">
          <CardHeader>
            <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
            <CardTitle>You're Already a Business Actor!</CardTitle>
            <CardDescription>
              Your business profile is already set up. You can proceed to your
              workspace.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button
              className="w-full"
              onClick={() => router.push("/business-actor/organizations")}
            >
              Go to My Organizations
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {isSuccess ? (
        <Card className="max-w-2xl mx-auto animate-fade-in-up text-center">
          <CardHeader>
            <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
            <CardTitle className="text-3xl font-bold">
              Profile Activated!
            </CardTitle>
            <CardDescription className="text-lg text-muted-foreground pt-2">
              Your business profile is ready. The next step is to create your
              first organization.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center">
            <Button size="lg" onClick={handleContinue}>
              Create Organization <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <div className="max-w-4xl mx-auto">
          <BusinessActorForm
            onSuccessAction={handleSuccessAction}
            mode={"create"}
          />
        </div>
      )}
    </div>
  );
}
