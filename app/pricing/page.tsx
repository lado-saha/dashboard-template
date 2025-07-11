"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check, X, ArrowRight, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { ModeToggle } from "@/components/mode-toggle";
import Image from "next/image";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("fr-CM", {
    style: "currency",
    currency: "XAF",
    minimumFractionDigits: 0,
  }).format(amount);
};

const pricingTiers = [
  {
    name: "Free",
    price: 0,
    priceSuffix: "/ month",
    description: "For individuals and teams just getting started.",
    features: [
      { text: "1 Organization", included: true },
      { text: "Up to 5 Employees", included: true },
      { text: "Basic Product Management", included: true },
      { text: "Standard Analytics", included: true },
      { text: "Community Support", included: true },
      { text: "AI Insights Engine", included: false },
      { text: "Advanced Workflow Automation", included: false },
      { text: "Dedicated Support", included: false },
    ],
    cta: "Start for Free",
    href: "/signup",
    isPopular: false,
  },
  {
    name: "Pro",
    price: 15000,
    priceSuffix: "/ month",
    description: "For growing businesses that need more power and support.",
    features: [
      { text: "Up to 5 Organizations", included: true },
      { text: "Up to 50 Employees per Org", included: true },
      { text: "Advanced Product & Service Mgmt", included: true },
      { text: "Advanced Analytics & Reporting", included: true },
      { text: "Priority Email Support", included: true },
      { text: "AI Insights Engine", included: true },
      { text: "Advanced Workflow Automation", included: true },
      { text: "Dedicated Support", included: false },
    ],
    cta: "Upgrade to Pro",
    href: "/business-actor/subscription",
    isPopular: true,
  },
  {
    name: "Ultra",
    price: 45000,
    priceSuffix: "/ month",
    description:
      "For large-scale enterprises requiring advanced features and dedicated support.",
    features: [
      { text: "Unlimited Organizations", included: true },
      { text: "Unlimited Employees", included: true },
      { text: "Full Product & Service Suite", included: true },
      { text: "Enterprise-Grade Analytics", included: true },
      { text: "24/7 Dedicated Support & SLA", included: true },
      { text: "AI Insights Engine", included: true },
      { text: "Advanced Workflow Automation", included: true },
      { text: "Dedicated Account Manager", included: true },
    ],
    cta: "Contact Sales",
    href: "/contact-sales",
    isPopular: false,
  },
];

const faqData = [
  {
    q: "Can I change my plan later?",
    a: "Yes, you can upgrade, downgrade, or cancel your plan at any time from your subscription settings. Changes will be prorated.",
  },
  {
    q: "Is there a discount for yearly billing?",
    a: "Yes! We offer a 20% discount on all plans when you choose to be billed annually. Contact our sales team to set up an annual plan.",
  },
  {
    q: "What happens if I exceed the limits of my plan?",
    a: "If you exceed plan limits, we'll notify you. You'll have a grace period to upgrade your plan before any services are restricted.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept all major credit cards, as well as mobile money payments for certain regions. For enterprise plans, we also support bank transfers.",
  },
];

export default function PricingPage() {
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
              href="/"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              Landing Page
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

      <main className="container mt-32 mx-auto">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
            The Right Plan for Your Business
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            Choose the plan that best fits your needs. All plans are flexible
            and can be upgraded as you grow.
          </p>
        </div>

        {/* Pricing Tiers Section */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:items-start">
          {pricingTiers.map((tier) => (
            <Card
              key={tier.name}
              className={cn(
                "flex flex-col h-full transition-all duration-300",
                tier.isPopular
                  ? "border-primary shadow-2xl shadow-primary/10 -translate-y-4"
                  : "border-border"
              )}
            >
              {tier.isPopular && (
                <Badge
                  variant="default"
                  className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1"
                >
                  <Star className="h-4 w-4 fill-yellow-300 text-yellow-300" />
                  Most Popular
                </Badge>
              )}
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-semibold">
                  {tier.name}
                </CardTitle>
                <CardDescription>{tier.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col justify-between">
                <div>
                  <div className="mb-8 text-center">
                    <span className="text-4xl font-bold">
                      {formatCurrency(tier.price)}
                    </span>
                    <span className="text-muted-foreground">
                      {tier.priceSuffix}
                    </span>
                  </div>
                  <ul className="space-y-4">
                    {tier.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-3">
                        {feature.included ? (
                          <Check className="h-5 w-5 text-green-500" />
                        ) : (
                          <X className="h-5 w-5 text-muted-foreground" />
                        )}
                        <span
                          className={cn(
                            !feature.included &&
                              "text-muted-foreground line-through"
                          )}
                        >
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  asChild
                  size="lg"
                  className="w-full"
                  variant={tier.isPopular ? "default" : "outline"}
                >
                  <Link href={tier.href}>
                    {tier.cta}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto mt-24">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold tracking-tight">
              Frequently Asked Questions
            </h2>
          </div>
          <Accordion type="single" collapsible className="w-full">
            {faqData.map((item, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-lg text-left">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-base">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </main>
    </div>
  );
}
