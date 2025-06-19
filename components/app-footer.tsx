"use client";

import React from "react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import {
  Globe,
  Shield,
  FileText,
  MessageSquareHeart,
  Github,
  Linkedin,
  Twitter,
} from "lucide-react"; // Example icons
import { cn } from "@/lib/utils";

interface AppFooterProps {
  className?: string;
  showSocialLinks?: boolean;
  appName?: string;
  companyName?: string;
}

export function AppFooter({
  className,
  showSocialLinks = true,
  appName = "YowYob Platform",
  companyName = "YowYob Inc.",
}: AppFooterProps) {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    { name: "Privacy Policy", href: "/privacy-policy", icon: Shield },
    { name: "Terms of Service", href: "/terms-of-service", icon: FileText },
    { name: "Support", href: "/help", icon: MessageSquareHeart }, // Links to existing help page
  ];

  const socialLinks = [
    {
      name: "GitHub",
      href: "https://github.com",
      icon: Github,
      ariaLabel: "Our GitHub profile",
    },
    {
      name: "LinkedIn",
      href: "https://linkedin.com",
      icon: Linkedin,
      ariaLabel: "Our LinkedIn profile",
    },
    {
      name: "Twitter",
      href: "https://twitter.com",
      icon: Twitter,
      ariaLabel: "Our Twitter profile",
    },
  ];

  return (
    <footer
      className={cn(
        "bg-background border-t border-border/60 text-muted-foreground print:hidden",
        className
      )}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top section with links and optional social media */}
        {(footerLinks.length > 0 || showSocialLinks) && (
          <div className="py-8 grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            {/* Logo and App Name (Optional) */}
            <div className="flex items-center justify-center md:justify-start">
              {/* You can use your main app logo here if desired */}
              {/* <Image src="/logo.svg" alt={`${appName} Logo`} width={32} height={32} className="mr-2" /> */}
              <Globe className="h-7 w-7 mr-2 text-primary" />
              <span className="text-lg font-semibold text-foreground">
                {appName}
              </span>
            </div>

            {/* Footer Navigation Links */}
            <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 md:col-span-1">
              {footerLinks.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-sm hover:text-primary transition-colors duration-150"
                >
                  {/* <item.icon className="inline h-4 w-4 mr-1 opacity-70" /> */}
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Social Media Links */}
            {showSocialLinks && (
              <div className="flex justify-center md:justify-end space-x-5">
                {socialLinks.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={item.ariaLabel}
                    className="text-muted-foreground hover:text-primary transition-colors duration-150"
                  >
                    <span className="sr-only">{item.name}</span>
                    <item.icon className="h-5 w-5" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        <Separator
          className={cn((footerLinks.length > 0 || showSocialLinks) && "mb-6")}
        />

        {/* Bottom section with copyright and version */}
        <div className="py-6 flex flex-col sm:flex-row justify-between items-center text-xs">
          <p>
            © {currentYear} {companyName}. All rights reserved.
          </p>
          <p className="mt-2 sm:mt-0">
            {/* Optional: App Version or Environment Indicator */}
            {process.env.NODE_ENV === "development" && (
              <span className="bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded-full text-[10px] font-semibold">
                DEV MODE
              </span>
            )}
            {/* <span className="ml-2">Version 1.0.0</span> */}
          </p>
        </div>
      </div>
    </footer>
  );
}
