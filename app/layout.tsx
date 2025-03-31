// FILE: app/layout.tsx
import "./globals.css";
import { Inter } from "next/font/google";
import type React from "react";
import { ThemeProvider } from "next-themes";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SettingsProvider } from "@/contexts/settings-context";
import { SessionProvider } from "@/components/providers/session-provider";
import { ModeToggle } from "@/components/mode-toggle";
// No longer need headers here
// import { headers } from 'next/headers';

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Dashboard Template",
  description: "A modern, adaptable responsive dashboard",
};

// No longer needs to be async
export default function RootLayout({ children }: { children: React.ReactNode }) {
  // const headersList = headers();
  // const pathnameHeader = headersList.get('x-pathname') || headersList.get('pathname');
  // const pathname = pathnameHeader || '/';
  // const noDashboardLayoutPaths = ["/", "/login", "/signup", "/forgot-password"];
  // const isNoDashboardPath = noDashboardLayoutPaths.some(path => pathname === path);
  // const showDashboardLayout = !isNoDashboardPath;

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <SessionProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <SettingsProvider>
              <TooltipProvider delayDuration={0}>
                <div className="relative min-h-screen">
                  {/* Always visible Theme Toggle */}
                  <div className="fixed top-4 right-4 z-50">
                    <ModeToggle />
                    {/* <LanguageSwitcher /> */}
                  </div>

                  {/* Children will be the landing page, auth pages, OR the dashboard layout */}
                  {/* No conditional rendering here anymore */}
                  {children}

                </div>
              </TooltipProvider>
            </SettingsProvider>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}