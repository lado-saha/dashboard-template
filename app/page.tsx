"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { ArrowRight, ShieldCheck, Zap, Layers, Building2, User, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { AppFooter } from "@/components/app-footer";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-background text-foreground overflow-x-hidden">
      <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <Image src={"/logo.svg"} width={32} height={32} alt="Logo" />
            <span>YowYob</span>
          </Link>
          <div className="flex items-center gap-2">
            <ModeToggle />
            <Button asChild variant="ghost">
              <Link href="/login">Log In</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="absolute inset-0 -z-10 h-full w-full bg-white dark:bg-black bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:32px_32px]">
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[410px] w-[410px] rounded-full bg-primary/10 blur-3xl dark:bg-primary/20"></div>
      </div>

      <main className="w-full">
        <section className="container mx-auto mt-16 px-4 pt-20 text-center">
          <div className="flex flex-col items-center justify-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl max-w-4xl">
              The Command Center for
              <span className="block bg-gradient-to-br from-primary via-primary/80 to-blue-400 bg-clip-text text-transparent">
                Your Entire Business
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              Stop juggling multiple apps. YowYob integrates your entire business—from organization management and customer relations to secure administration—into one intelligent, unified platform.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" asChild>
                <Link href="/signup">
                  Get Started For Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <section id="features" className="container mx-auto mt-24 max-w-6xl px-4 md:mt-32 scroll-mt-20">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight">A Dashboard for Every Role</h2>
            <p className="mt-2 text-muted-foreground">Powerful tools tailored to your specific needs.</p>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <FeatureCard
              icon={Building2}
              title="For Business Actors"
              description="The ultimate toolkit to build and grow. Manage your organization, define products, oversee agencies, and track performance."
            />
            <FeatureCard
              icon={User}
              title="For Customers"
              description="A simple, elegant portal to engage with services, track transactions and rewards, and manage your personal profile with ease."
            />
            <FeatureCard
              icon={ShieldAlert}
              title="For Super Admins"
              description="The eagle-eye view. Oversee all platform activity, manage users and roles, and ensure the system's security and integrity."
            />
          </div>
        </section>

        <section id="unified-workspace" className="container mx-auto mt-24 max-w-6xl px-4 md:mt-32 scroll-mt-20">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight">One Unified Workspace</h2>
            <p className="mt-2 text-muted-foreground">
              Manage your entire business lifecycle from a single, secure environment.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <InfoCard icon={Layers} title="Manage & Organize" description="Structure your business with tools for creating organizations, defining agencies, and managing employees." />
            <InfoCard icon={Zap} title="Engage & Transact" description="Connect with your customers, manage prospects, and handle sales with integrated CRM-like features." />
            <InfoCard icon={ShieldCheck} title="Secure & Administer" description="Your data privacy is paramount. Robust security protocols protect your business at every level." />
          </div>
        </section>

        <section className="container mx-auto mt-24 max-w-4xl px-4 md:mt-32">
          <div className="relative overflow-hidden rounded-2xl bg-primary/90 p-8 text-center shadow-2xl shadow-primary/20 sm:p-12">
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
            <div className="relative z-10">
              <h2 className="text-3xl font-bold text-primary-foreground">Ready to Unify Your Business?</h2>
              <p className="mt-2 text-primary-foreground/80">Join businesses building their future on YowYob. Create your account today.</p>
              <Button size="lg" variant="secondary" asChild className="mt-6">
                <Link href="/signup">Sign Up Now <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <AppFooter className="mt-32" />
    </div>
  );
}

// --- Helper Components ---
interface FeatureCardProps { icon: React.ElementType; title: string; description: string; }
const FeatureCard = ({ icon: Icon, title, description }: FeatureCardProps) => (
  <div className="flex flex-col items-center text-center p-6 border rounded-lg bg-card/50">
    <div className="flex h-12 w-12 items-center justify-center rounded-full border bg-muted">
      <Icon className="h-6 w-6 text-primary" />
    </div>
    <h3 className="mt-4 text-xl font-semibold">{title}</h3>
    <p className="mt-2 text-muted-foreground">{description}</p>
  </div>
);

interface InfoCardProps { icon: React.ElementType; title: string; description: string; }
const InfoCard = ({ icon: Icon, title, description }: InfoCardProps) => (
  <div className="rounded-xl border bg-card/50 p-6 text-center shadow-sm">
    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
      <Icon className="h-6 w-6 text-primary" />
    </div>
    <h3 className="mt-4 text-xl font-semibold">{title}</h3>
    <p className="mt-2 text-muted-foreground">{description}</p>
  </div>
);
