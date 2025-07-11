import "./globals.css";
import type { Metadata } from "next"; // [ADD] Import Metadata type
import type React from "react";
import { Montserrat } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SettingsProvider } from "@/contexts/settings-context";
import { SessionProvider } from "@/components/providers/session-provider";
import { cn } from "@/lib/utils";

const montserrat = Montserrat({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-montserrat",
});

// [ADD] Add root metadata object
export const metadata: Metadata = {
  title: {
    default: "YowYob Dashboard",
    template: "%s | YowYob",
  },
  description:
    "The Command Center for Your Business. Unify organization management, customer relations, and secure administration on one platform.",
  keywords: [
    "business management",
    "CRM",
    "organization tool",
    "SaaS",
    "YowYob",
    "agency management",
  ],
  openGraph: {
    title: "YowYob Dashboard",
    description: "The Command Center for Your Business.",
    url: process.env.NEXT_PUBLIC_URL || "http://localhost:3000",
    siteName: "YowYob",
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_URL}/og-image.png`, // It's conventional to have an OG image in /public
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "YowYob Dashboard",
    description: "The Command Center for Your Business.",
    images: [`${process.env.NEXT_PUBLIC_URL}/og-image.png`],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "antialiased min-h-screen flex flex-col font-sans",
          montserrat.variable
        )}
      >
        <SessionProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <SettingsProvider>
              <TooltipProvider delayDuration={0}>
                <div className="relative flex-1">{children}</div>
                <Toaster position="top-right" richColors closeButton />
              </TooltipProvider>
            </SettingsProvider>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
