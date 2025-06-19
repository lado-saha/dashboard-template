"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useActiveOrganization } from "@/contexts/active-organization-context";
import {
  Loader2,
  PlusCircle,
  ArrowRight,
  Landmark,
  Users2,
  Wallet,
  AreaChart,
  Combine,
  Briefcase,
  Layers,
  ClipboardList,
  Target,
  Users,
  UsersRound,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

// --- Reusable Promotional Components ---

const FeatureShowcase = ({
  icon: Icon,
  title,
  description,
  imagePlaceholder,
  imagePosition = "right",
  delay,
}: {
  icon: React.ElementType;
  title: React.ReactNode;
  description: string;
  imagePlaceholder: React.ReactNode;
  imagePosition?: "left" | "right";
  delay?: string;
}) => (
  <div className={cn("mx-auto max-w-6xl animate-fade-in-up", delay)}>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-16 items-center">
      <div
        className={cn("space-y-4", imagePosition === "left" && "lg:order-last")}
      >
        <div className="inline-flex items-center gap-3 rounded-full bg-primary/10 text-primary p-3">
          <Icon className="h-7 w-7" />
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
          {title}
        </h2>
        <p className="text-base sm:text-lg text-muted-foreground">
          {description}
        </p>
      </div>
      <div className="rounded-xl bg-muted/40 p-4 border shadow-inner">
        {imagePlaceholder}
      </div>
    </div>
  </div>
);

const IconGridFeature = ({
  icon: Icon,
  title,
}: {
  icon: React.ElementType;
  title: string;
}) => (
  <div className="flex flex-col items-center text-center gap-3 p-4 rounded-lg bg-card/40 border">
    <Icon className="h-8 w-8 text-primary" />
    <p className="font-medium text-sm text-foreground">{title}</p>
  </div>
);

// --- Main Page Component ---

export default function BusinessActorLandingPage() {
  const {
    activeOrganizationId,
    userOrganizations,
    isOrgContextInitialized,
    setActiveOrganization,
  } = useActiveOrganization();
  const router = useRouter();

  // This core logic remains unchanged. It handles redirection for existing users.
  useEffect(() => {
    if (!isOrgContextInitialized) return;
    if (activeOrganizationId) {
      router.replace(`/business-actor/org/dashboard`);
      return;
    }
    if (userOrganizations.length > 0) {
      const firstOrg = userOrganizations[0];
      if (firstOrg?.organization_id) {
        setActiveOrganization(firstOrg.organization_id, firstOrg as any).then(
          () => {
            router.replace(`/business-actor/org/dashboard`);
          }
        );
      }
    }
  }, [
    isOrgContextInitialized,
    activeOrganizationId,
    userOrganizations,
    router,
    setActiveOrganization,
  ]);

  // Loading states
  if (
    !isOrgContextInitialized ||
    (isOrgContextInitialized && userOrganizations.length > 0)
  ) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-muted-foreground">Loading your workspace...</p>
      </div>
    );
  }

  // The Promotional Page for new users
  return (
    <div className="w-full relative overflow-hidden">
      {/* Background Gradient */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-[800px] w-full -z-10 bg-gradient-to-br from-primary/10 via-background to-background"
      ></div>

      <div className="space-y-24 sm:space-y-32 py-12 sm:py-20">
        {/* --- Hero Section --- */}
        <section className="text-center px-4 animate-fade-in-up">
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tighter bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-transparent mb-6 pb-1">
            Your Organization.
            <br />
            Perfectly Orchestrated.
          </h1>
          <p className="max-w-2xl mx-auto text-lg sm:text-xl text-muted-foreground mb-10 [animation-delay:200ms]">
            Step into your command center. Create an organization to unify your
            teams, products, finances, and client relationships with
            unprecedented clarity and control.
          </p>
          <div className="[animation-delay:400ms]">
            <Button
              size="lg"
              asChild
              className="group text-lg py-7 px-8 rounded-full shadow-lg hover:shadow-primary/30 transition-all duration-300 hover:scale-105"
            >
              <Link href="/business-actor/organization/create">
                <PlusCircle className="mr-2 h-5 w-5" />
                Build Your Organization
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </section>

        {/* --- Showcase Sections --- */}
        <div className="space-y-24 sm:space-y-32">
          <FeatureShowcase
            icon={Landmark}
            title={
              <>
                Empower Your <span className="text-primary">Structure</span>
              </>
            }
            description="From a single headquarters to a network of agencies, define your organization's hierarchy. Manage personnel, assign roles, and build a scalable foundation for growth."
            imagePosition="right"
            delay="[animation-delay:600ms]"
            imagePlaceholder={
              <div className="h-64 w-full bg-gradient-to-br from-background to-muted rounded-lg flex items-center justify-center p-4">
                <p className="text-muted-foreground italic text-sm">
                  Visual of an org chart
                </p>
              </div>
            }
          />

          <FeatureShowcase
            icon={Combine}
            title={
              <>
                Master Your <span className="text-primary">Offerings</span>
              </>
            }
            description="Define and manage your entire catalog. Whether you offer tangible products or complex services, our platform provides the tools to track inventory, set pricing, and manage availability."
            imagePosition="left"
            delay="[animation-delay:200ms]"
            imagePlaceholder={
              <div className="h-64 w-full bg-gradient-to-br from-background to-muted rounded-lg flex items-center justify-center p-4">
                <p className="text-muted-foreground italic text-sm">
                  Visual of product/service cards
                </p>
              </div>
            }
          />

          <FeatureShowcase
            icon={Wallet}
            title={
              <>
                Command Your <span className="text-primary">Finances</span>
              </>
            }
            description="Keep a pulse on your financial health. Manage your wallet, track transactions, configure bonus systems for your clients, and handle invoicing with ease."
            imagePosition="right"
            delay="[animation-delay:200ms]"
            imagePlaceholder={
              <div className="h-64 w-full bg-gradient-to-br from-background to-muted rounded-lg flex items-center justify-center p-4">
                <p className="text-muted-foreground italic text-sm">
                  Visual of a financial graph
                </p>
              </div>
            }
          />

          <FeatureShowcase
            icon={AreaChart}
            title={
              <>
                Act with <span className="text-primary">Intelligence</span>
              </>
            }
            description="Go beyond simple management. Leverage a powerful, context-aware dashboard that summarizes performance across your entire organization or drills down into a specific agency."
            imagePosition="left"
            delay="[animation-delay:200ms]"
            imagePlaceholder={
              <div className="h-64 w-full bg-gradient-to-br from-background to-muted rounded-lg flex items-center justify-center p-4">
                <p className="text-muted-foreground italic text-sm">
                  Visual of a dashboard with charts
                </p>
              </div>
            }
          />
        </div>

        {/* --- All-in-One Grid --- */}
        <section className="px-4 max-w-5xl mx-auto animate-fade-in-up [animation-delay:200ms]">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12 tracking-tight">
            A Complete Toolkit for Success
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            <IconGridFeature icon={Users2} title="Agency Management" />
            <IconGridFeature icon={Users} title="Employee Rosters" />
            <IconGridFeature icon={UsersRound} title="Customer CRM" />
            <IconGridFeature icon={Target} title="Prospect Tracking" />
            <IconGridFeature icon={Truck} title="Supplier Relations" />
            <IconGridFeature icon={Briefcase} title="Third-Party Partners" />
            <IconGridFeature icon={ClipboardList} title="Service Catalog" />
            <IconGridFeature icon={Layers} title="Product Inventory" />
          </div>
        </section>

        {/* --- Final CTA --- */}
        <section className="text-center px-4 animate-fade-in-up [animation-delay:400ms]">
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
            Begin Your Journey.
          </h2>
          <p className="max-w-xl mx-auto text-lg text-muted-foreground mb-8">
            Create your organization now and instantly unlock a new level of
            clarity and control over your business.
          </p>
          <Button
            size="lg"
            asChild
            className="group text-lg py-7 px-8 rounded-full"
          >
            <Link href="/business-actor/organization/create">
              Get Started for Free
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </section>
      </div>
    </div>
  );
}
