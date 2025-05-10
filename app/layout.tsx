import "./globals.css"; // Ensure globals are imported first
import { Inter } from "next/font/google";
import type React from "react";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner" // Import Sonner Toaster for notifications

import { TooltipProvider } from "@/components/ui/tooltip";
import { SettingsProvider } from "@/contexts/settings-context";
import { SessionProvider } from "@/components/providers/session-provider";
import { ModeToggle } from "@/components/mode-toggle";

const inter = Inter({ subsets: ["latin"] });

// Metadata remains the same
export const metadata = {
  title: "Dashboard Template",
  description: "A modern, adaptable responsive dashboard",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // Add 'dark' class handling for ThemeProvider
    <html lang="en" suppressHydrationWarning>
      {/* Apply base font and ensure full height */}
      <body className={`${inter.className} antialiased min-h-screen flex flex-col`}>
        {/* SessionProvider wraps everything needing session access */}
        <SessionProvider>
          {/* ThemeProvider enables light/dark/system themes */}
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {/* SettingsProvider manages user display preferences */}
            <SettingsProvider>
              {/* TooltipProvider enables tooltips across the app */}
              <TooltipProvider delayDuration={0}>
                 {/* Main container */}
                <div className="relative flex-1">
                   {/* ModeToggle positioned globally */}
                   <div className="fixed top-4 right-4 z-50 print:hidden"> {/* Hide toggle when printing */}
                    {/* <ModeToggle /> */}
                  </div>

                  {/* Render the active page content */}
                  {children}
                </div>

                {/* Sonner Toaster for displaying brief notifications */}
                 <Toaster position="top-right" richColors closeButton />
              </TooltipProvider>
            </SettingsProvider>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}