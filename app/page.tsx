"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import {
  ArrowRight,
  ShieldCheck,
  Zap,
  Workflow,
  Building2,
  User,
  ShieldAlert,
  Cpu,
  Layers,
  BarChart3,
  GlobeLock,
  MessageCircleCode,
  Sparkles,
  ChevronRight,
  HeartHandshake,
  LayoutTemplate,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

// Main Landing Page Component
export default function LandingPage() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-background text-foreground overflow-x-hidden">
      {/* --- TOP NAVIGATION BAR --- */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <Image src={"/logo.svg"} width={32} height={32} alt="Logo" />
            <span>YowYob</span>
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            <Link
              href="/pricing"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              Pricing
            </Link>

          </nav>
          <div className="flex items-center gap-2">
            <ModeToggle />
            <Button asChild className="hidden sm:flex">
              <Link href="/login">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Background Grid Pattern */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-white dark:bg-black bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:32px_32px]">
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[410px] w-[410px] rounded-full bg-primary/10 blur-3xl dark:bg-primary/20"></div>
      </div>

      <main className="w-full">
        {/* --- HERO SECTION --- */}
        <section className="container mx-auto mt-16 px-4 pt-20 text-center md:pt-32 md:text-left">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
            <div className="flex flex-col items-center justify-center md:items-start">
              <Image src={"/logo.svg"} width={120} height={120} alt="Logo" />
              <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                The Command Center
                <br />
                <span className="bg-gradient-to-br from-primary via-primary/80 to-blue-400 bg-clip-text text-transparent">
                  for Your Business
                </span>
              </h1>
              <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground md:mx-0">
                Stop juggling multiple apps. YowYob integrates your entire
                business—from organization management and customer relations to
                secure administration—into one intelligent, unified platform.
              </p>

              <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row md:justify-start">
                <Button size="lg" asChild>
                  <Link href="/login">
                    Start Building Your Business
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>

            <div className="relative flex h-full min-h-[300px] items-center justify-center md:min-h-[400px]">
              <div
                className={cn(
                  "group relative h-full w-full max-w-md rounded-2xl p-4",
                  "bg-gradient-to-br from-muted/50 via-background/70 to-muted/60 dark:from-slate-900/60 dark:via-slate-950/80 dark:to-slate-950/90",
                  "border border-border/60 shadow-xl"
                )}
              >
                <div className="absolute top-0 left-0 h-full w-full overflow-hidden rounded-2xl">
                  <div className="absolute top-0 -left-60 h-full w-40 -skew-x-12 animate-[shine_5s_ease-in-out_infinite] bg-white/10 dark:bg-white/5"></div>
                </div>
                <div className="flex h-8 items-center justify-start gap-1.5 rounded-t-lg bg-background/50 px-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-red-500"></div>
                  <div className="h-2.5 w-2.5 rounded-full bg-yellow-400"></div>
                  <div className="h-2.5 w-2.5 rounded-full bg-green-400"></div>
                </div>
                <div className="mt-2 space-y-3 p-2">
                  <div className="h-6 w-3/4 rounded-md bg-primary/20"></div>
                  <div className="h-10 w-full rounded-md bg-muted"></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="h-16 rounded-md bg-muted"></div>
                    <div className="h-16 rounded-md bg-muted"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- NEW UNIFIED WORKSPACE SECTION --- */}
        <section
          id="platform"
          className="container mx-auto mt-24 max-w-8xl px-4 md:mt-32 scroll-mt-20"
        >
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight">
              One Unified Workspace
            </h2>
            <p className="mt-2 text-muted-foreground">
              Manage your entire business lifecycle from a single, secure
              environment.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <InfoCard
              icon={LayoutTemplate}
              title="Manage & Organize"
              description="Structure your business with tools for creating organizations, defining agencies, and managing employees. Control your entire operational hierarchy with ease."
            />
            <InfoCard
              icon={HeartHandshake}
              title="Engage & Transact"
              description="Connect with your customers, manage prospects, and handle sales. Our platform provides the tools to build relationships and close deals seamlessly."
            />
            <InfoCard
              icon={ShieldCheck}
              title="We Secure & Administer"
              description="Your data privacy is paramount. With Super Admin oversight and robust security protocols, your business environment is protected at every level."
            />
          </div>
        </section>

        {/* --- BENTO GRID FEATURE SECTION --- */}
        <section
          id="features"
          className="container mx-auto mt-24 max-w-8xl px-4 md:mt-32 scroll-mt-20"
        >
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight">
              Powerful Features, Intelligently Integrated
            </h2>
            <p className="mt-2 text-muted-foreground">
              Tools designed to scale with your ambition.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:grid-rows-3">
            <BentoCard
              className="lg:col-span-2 lg:row-span-2"
              title="Multi-Role Architecture"
              description="Dedicated, secure dashboards for Business Actors, Customers, and Super Admins. Provide the right tools and data to the right people, ensuring focus and security."
              icon={Layers}
              background={
                <div className="absolute -right-20 -bottom-20 opacity-20">
                  <div className="h-40 w-40 rounded-full bg-primary/50 blur-2xl"></div>
                  <div className="h-60 w-60 rounded-tl-full bg-secondary/50 blur-3xl"></div>
                </div>
              }
            />
            <BentoCard
              title="Advanced Analytics"
              description="From organization-wide revenue to agency-specific sales, get the insights you need with interactive charts."
              icon={BarChart3}
            />
            <BentoCard
              title="Blazing Fast UI"
              description="A highly responsive interface built on Next.js, optimized for speed and a seamless user experience."
              icon={Zap}
            />
            <BentoCard
              title="Custom Workflows"
              description="Automate repetitive tasks and create custom processes to fit your unique operational needs."
              icon={Workflow}
            />
            <BentoCard
              title="Centralized Security"
              description="Robust authentication, role-based access control, and platform-wide security protocols."
              icon={GlobeLock}
            />
            <BentoCard
              className="lg:col-span-2"
              title="AI-Powered Insights"
              description="Leverage machine learning to anticipate market trends, identify sales opportunities, and make smarter, data-driven decisions."
              icon={Cpu}
            />
          </div>
        </section>

        {/* --- ROLES SECTION --- */}
        <section
          id="roles"
          className="container mx-auto mt-24 max-w-8xl px-4 md:mt-32 scroll-mt-20"
        >
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight">
              A Dashboard for Every Need
            </h2>
            <p className="mt-2 text-muted-foreground">
              Powerful tools tailored to your specific role.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <RoleCard
              icon={Building2}
              title="For Business Actors"
              description="The ultimate toolkit to build and grow. Manage your organization, define products, oversee agencies, and track performance."
            />
            <RoleCard
              icon={User}
              title="For Customers"
              description="A simple, elegant portal to engage with services, track transactions and rewards, and manage your personal profile with ease."
            />
            <RoleCard
              icon={ShieldAlert}
              title="For Super Admins"
              description="The eagle-eye view. Oversee all platform activity, manage users and roles, and ensure the system's security and integrity."
            />
          </div>
        </section>

        {/* --- FINAL CTA --- */}
        <section className="container mx-auto mt-24 max-w-4xl px-4 md:mt-32">
          <div className="relative overflow-hidden rounded-2xl bg-primary/90 p-8 text-center shadow-2xl shadow-primary/20 sm:p-12">
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
            <div className="relative z-10">
              <h2 className="text-3xl font-bold text-primary-foreground">
                Ready to Unify Your Business?
              </h2>
              <p className="mt-2 text-primary-foreground/80">
                Join hundreds of businesses building their future on YowYob.
                Create your free account today.
              </p>
              <Button size="lg" variant="secondary" asChild className="mt-6">
                <Link href="/signup">
                  Sign Up Now <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* --- FOOTER --- */}
      <footer className="mt-32 w-full border-t">
        <div className="container mx-auto flex flex-col items-center justify-between gap-6 px-4 py-8 text-center text-sm text-muted-foreground md:flex-row">
          <p>© {new Date().getFullYear()} YowYob Inc. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="#" className="hover:text-primary">
              Terms
            </Link>
            <Link href="#" className="hover:text-primary">
              Privacy
            </Link>
            <Link href="#" className="hover:text-primary">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

// --- Helper Components ---

interface InfoCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
}
const InfoCard = ({ icon: Icon, title, description }: InfoCardProps) => (
  <div className="rounded-xl border bg-card/50 p-6 text-center shadow-sm">
    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
      <Icon className="h-6 w-6 text-primary" />
    </div>
    <h3 className="mt-4 text-xl font-semibold">{title}</h3>
    <p className="mt-2 text-muted-foreground">{description}</p>
  </div>
);

interface BentoCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  className?: string;
  background?: React.ReactNode;
}
const BentoCard = ({
  title,
  description,
  icon: Icon,
  className,
  background,
}: BentoCardProps) => (
  <div
    className={cn(
      "group relative flex flex-col justify-between overflow-hidden rounded-xl",
      "bg-card/60 p-6 shadow-lg backdrop-blur-sm",
      "border border-border/60 transition-all duration-300 hover:border-primary/80",
      className
    )}
  >
    <div>
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <h3 className="mb-1 text-lg font-semibold text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
    {background}
  </div>
);

interface RoleCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
}
const RoleCard = ({ icon: Icon, title, description }: RoleCardProps) => (
  <div className="flex flex-col items-center text-center">
    <div className="flex h-12 w-12 items-center justify-center rounded-full border bg-muted">
      <Icon className="h-6 w-6 text-primary" />
    </div>
    <h3 className="mt-4 text-xl font-semibold">{title}</h3>
    <p className="mt-2 text-muted-foreground">{description}</p>
  </div>
);
