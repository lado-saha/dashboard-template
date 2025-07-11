"use client";

import React, { useState } from "react";
import { signOut } from "next-auth/react";
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
import { CheckCircle, LogOut } from "lucide-react";
import {
  BusinessActorDto,
} from "@/types/organization";

export default function BusinessActorOnboardingPage() {
  const [isSuccess, setIsSuccess] = useState(false);

  // This action is passed to the form to be called on successful submission
  const handleSuccessAction = (newBA: BusinessActorDto) => {
    setIsSuccess(true);
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  // The main view for the onboarding page
  return (
    <div className="space-y-6">
      {isSuccess ? (
        <Card className="max-w-2xl mx-auto animate-fade-in-up text-center border-green-500/50 shadow-lg shadow-green-500/10">
          <CardHeader>
            <div className="mx-auto bg-green-100 dark:bg-green-900/30 p-4 rounded-full w-fit mb-4">
              <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-3xl font-bold text-green-700 dark:text-green-300">
              Profile Created!
            </CardTitle>
            <CardDescription className="text-lg text-muted-foreground pt-2">
              Your Business Actor profile is now active.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="font-semibold text-foreground">
              One final step is required to access your new workspace.
            </p>
            <p className="text-muted-foreground">
              Please sign out and sign back in to refresh your account
              permissions. You will then be redirected to your new Business
              Actor dashboard.
            </p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button size="lg" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out & Continue
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <>
          <div className="space-y-0.5">
            <h1 className="text-2xl font-bold tracking-tight">
              Become a Business Actor
            </h1>
            <p className="text-muted-foreground">
              Complete your professional profile to unlock business management
              tools.
            </p>
          </div>
          <BusinessActorForm
            onSuccessAction={handleSuccessAction}
            mode={"create"}
          />
        </>
      )}
    </div>
  );
}
