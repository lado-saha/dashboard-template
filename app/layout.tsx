import "./globals.css"
import { Inter } from "next/font/google"
import { Sidebar } from "@/components/sidebar"
import { TopNav } from "@/components/top-nav"
import { TooltipProvider } from "@/components/ui/tooltip"
import { SettingsProvider } from "@/contexts/settings-context"
import type React from "react"
import { ThemeProvider } from "next-themes"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Flowers&Saints Dashboard",
  description: "A modern, responsive financial dashboard",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <SettingsProvider>
            <TooltipProvider delayDuration={0}>
              <div className="max-h-screen flex">
                <Sidebar />
                <div className="flex-1 overflow-auto">
                  <TopNav />
                  <div className="container mx-auto p-6">
                    <main className="w-full">{children}</main>
                  </div>
                </div>
              </div>
            </TooltipProvider>
          </SettingsProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
