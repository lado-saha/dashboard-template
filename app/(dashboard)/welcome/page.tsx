"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Briefcase, ShoppingBag } from "lucide-react";
import { useSession } from "next-auth/react";
import { PageHeader } from "@/components/ui/page-header";

export default function WelcomePage() {
  const router = useRouter();
  const { data: session } = useSession();

  const handleChoice = (path: string) => {
    router.push(path);
  };

  return (
    <div className="container mx-auto flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
      <PageHeader
        title={`Welcome, ${session?.user?.first_name || "User"}!`}
        description="Let's get you started. What would you like to do first?"
        className="text-center mb-12"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
        <Card className="hover:shadow-xl hover:border-primary/50 transition-all duration-300">
          <CardHeader>
            <ShoppingBag className="h-10 w-10 text-primary mb-4" />
            <CardTitle className="text-2xl">Explore Services</CardTitle>
            <CardDescription>
              I'm here to browse services, make reservations, and manage my
              personal account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full"
              onClick={() => handleChoice("/dashboard")}
            >
              Go to My Dashboard <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-xl hover:border-primary/50 transition-all duration-300">
          <CardHeader>
            <Briefcase className="h-10 w-10 text-primary mb-4" />
            <CardTitle className="text-2xl">Manage a Business</CardTitle>
            <CardDescription>
              I want to list my organization, manage agencies, add products, and
              access business tools.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full"
              onClick={() => handleChoice("/business-actor/onboarding")}
            >
              Set Up Business Profile <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
