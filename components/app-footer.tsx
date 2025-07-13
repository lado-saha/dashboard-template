"use client";

import React from "react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { Globe, Shield, FileText, MessageSquareHeart } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface AppFooterProps {
  className?: string;
}

export function AppFooter({ className }: AppFooterProps) {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    { name: "Privacy Policy", href: "/privacy-policy" },
    { name: "Terms of Service", href: "/terms-of-service" },
    { name: "Help Center", href: "/help" },
  ];

  return (
    <footer className={cn("bg-background border-t text-muted-foreground print:hidden", className)}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8 grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <Image src="/logo.svg" alt="YowYob Logo" width={28} height={28} />
            <span className="text-lg font-semibold text-foreground">YowYob</span>
          </div>
          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 md:col-span-1">
            {footerLinks.map((item) => (
              <Link key={item.name} href={item.href} className="text-sm hover:text-primary transition-colors">
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
        <Separator className="mb-6" />
        <div className="py-6 flex flex-col sm:flex-row justify-between items-center text-xs">
          <p>© {currentYear} YowYob Inc. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
