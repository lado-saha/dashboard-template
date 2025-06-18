import "./globals.css"; // Ensure globals are imported first
import { Montserrat } from "next/font/google"; // Change here
import type React from "react";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner"; // Sonner Toaster for notifications

import { TooltipProvider } from "@/components/ui/tooltip";
import { SettingsProvider } from "@/contexts/settings-context";
import { SessionProvider } from "@/components/providers/session-provider";
import { ModeToggle } from "@/components/mode-toggle";

// Initialize Montserrat font (adjust subsets and weights as needed)
// const montserrat = Montserrat({
//   subsets: ["latin"],
//   display: "swap", 
//   variable: "--font-montserrat", 
// });

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
      <body
        className={` antialiased min-h-screen flex flex-col`}
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
