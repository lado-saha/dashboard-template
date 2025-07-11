import "./globals.css"; // Ensure globals are imported first
import type React from "react";
import { Montserrat } from "next/font/google"; // 1. Import the font
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SettingsProvider } from "@/contexts/settings-context";
import { SessionProvider } from "@/components/providers/session-provider";
import { cn } from "@/lib/utils";

// 2. Initialize Montserrat font
const montserrat = Montserrat({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-montserrat", // This name will be used in tailwind.config.js
});

export const metadata = {
  title: "YowYob Dashboard",
  description: "A modern, adaptable responsive dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* 3. Apply the font's CSS variable to the body */}
      <body
        className={cn(
          "antialiased min-h-screen flex flex-col font-sans", // Use font-sans as the base
          montserrat.variable // Apply the custom font variable
        )}
      >
        <SessionProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <SettingsProvider>
              <TooltipProvider delayDuration={0}>
                <div className="relative flex-1">
                  <div className="fixed top-4 right-4 z-50 print:hidden">
                    {/* <ModeToggle /> */}
                  </div>
                  {children}
                </div>
                <Toaster position="top-right" richColors closeButton />
              </TooltipProvider>
            </SettingsProvider>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
