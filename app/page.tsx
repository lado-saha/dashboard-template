// ===============================================
// FILE: app/page.tsx
// PATH: /home/sih/Documents/GI/l4_s2/networks/projects/dashboard-template/app/page.tsx
// ===============================================
"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import {
    ArrowRight, BarChartBig, Palette, ShieldCheck, Zap,
    Workflow, Building2, User, ShieldAlert, Cpu, MessagesSquare, Layers
} from "lucide-react";
import { useMousePosition } from "@/hooks/use-mouse-position"; // Assuming this hook exists
import { cn } from "@/lib/utils";

export default function LandingPage() {
   const { x, y } = useMousePosition();

  // Define delays for staggered animation simulation
  const delay = {
      logo: "delay-[100ms]",
      headline: "delay-[200ms]",
      subheadline: "delay-[300ms]",
      buttons: "delay-[400ms]",
      showcase: "delay-[500ms]", // Dashboard showcase placeholder
      featuresTitle: "delay-[600ms]", // Title before feature cards
      featureCards: "delay-[700ms]", // Start delay for feature cards group
      rolesTitle: "delay-[800ms]", // Title before role cards
      roleCards: "delay-[900ms]", // Start delay for role cards group
      footer: "delay-[1000ms]"
  };


  return (
    // Background using theme colors
    <div className={cn(
        "relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden p-6 text-center",
        "bg-gradient-to-br from-background via-background to-muted/30 dark:from-slate-950 dark:via-background dark:to-primary/5" // Use theme vars via classes
    )}>

       {/* Background Elements: Adjusted opacity for better light mode visibility */}
       <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 opacity-80 dark:opacity-40 transition-opacity duration-500">
            {/* Interactive Mouse Glow - Using Primary Color */}
            <div
                className={cn(
                    "absolute h-[350px] w-[350px] rounded-full bg-primary/30 dark:bg-primary/25 blur-3xl", // More visible primary glow
                    "transition-transform duration-300 ease-out"
                 )}
                style={{
                    transform: `translate(${x ? x - 175 : -9999}px, ${y ? y - 175 : -9999}px)`,
                    left: x ? '0' : '-9999px', top: y ? '0' : '-9999px'
                 }}
            ></div>

            {/* Animated Shapes - Using Theme Colors */}
            <div className="absolute top-[-25%] left-[-15%] h-[550px] w-[550px] rounded-full bg-gradient-radial from-primary/15 via-primary/5 to-transparent dark:from-primary/10 dark:via-primary/5 blur-3xl animate-spin [animation-duration:30s] [animation-timing-function:linear]"></div>
            <div className="absolute bottom-[-35%] right-[-20%] h-[650px] w-[650px] rounded-full bg-gradient-radial from-secondary/20 via-secondary/10 to-transparent dark:from-secondary/15 dark:via-secondary/5 blur-3xl opacity-80 animate-pulse [animation-duration:9s]"></div>
            <div className="absolute top-[5%] right-[10%] h-[400px] w-[400px] rounded-lg bg-gradient-to-br from-muted/20 via-transparent to-transparent dark:from-muted/10 blur-2xl opacity-70 animate-spin [animation-duration:40s] [animation-timing-function:linear]"></div>
        </div>


      {/* Main content container */}
      <main className="z-10 flex w-full max-w-5xl flex-col items-center pt-16 pb-20">

        {/* Logo */}
        <div className={`mb-10 animate-fade-in-up ${delay.logo}`}>
          <div className="relative group cursor-pointer">
              <Image
                src="/logo.svg" alt="App Logo" width={100} height={100} priority
                className="transition-transform duration-300 group-hover:scale-110 drop-shadow-lg"
              />
              <div className={cn(
                  "absolute inset-[-12px] -z-10 rounded-full bg-primary/50 dark:bg-primary/40 blur-2xl", // More visible glow base
                  "animate-pulse opacity-80 [animation-duration:3s]",
                  "group-hover:opacity-100 group-hover:scale-110 group-hover:[animation-duration:1.5s]",
                  "transition-all duration-300"
              )}></div>
          </div>
        </div>

        {/* Headline: Gradient Text adjusted for light mode */}
        <h1 className={`text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl mb-6 animate-fade-in-up ${delay.headline} leading-tight drop-shadow-sm`}>
            <span className="text-foreground">Unified Control.</span> {/* Use foreground for better contrast */}
            <br className="hidden sm:block" />
            {/* Gradient needs to be strong enough for light bg */}
            <span className="bg-gradient-to-r from-primary via-primary/90 to-secondary/90 dark:to-secondary bg-clip-text text-transparent">
                Unmatched Insight.
            </span>
        </h1>

        {/* Subheading */}
        <p className={`max-w-2xl mx-auto text-lg text-muted-foreground sm:text-xl md:text-2xl mb-12 animate-fade-in-up ${delay.subheadline}`}>
          The complete dashboard suite built for peak performance. Seamlessly manage operations, engage customers, and administer your platform—all in one place. Ready when you are.
        </p>

        {/* Call to Action Buttons */}
        <div className={`flex flex-col sm:flex-row gap-5 mb-24 animate-fade-in-up ${delay.buttons}`}>
          <Button
              size="lg" asChild
              className={cn(
                  "transition-all duration-500 hover:scale-105 shadow-lg hover:shadow-primary/50 group",
                  "bg-primary hover:bg-primary/85", // Solid primary bg
                  "text-primary-foreground px-8 py-3 text-base rounded-full font-semibold"
              )}>
            <Link href="/login">
              Explore Dashboards <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
          <Button
             size="lg" variant="outline" asChild
             className={cn(
                 "transition-all duration-300 hover:scale-105 hover:bg-accent hover:text-accent-foreground", // Use accent hover from theme
                 "border-border dark:border-foreground/30", // Use border color from theme
                 "px-8 py-3 text-base rounded-full font-semibold backdrop-blur-sm bg-background/50 dark:bg-slate-900/50"
              )}>
            <Link href="/signup">Create Free Account</Link>
          </Button>
        </div>


         {/* --- Dashboard Showcase --- */}
         {/* This section appears slightly later */}
         <div className={`w-full max-w-4xl mb-24 animate-fade-in-up ${delay.showcase}`}>
            <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-foreground">See It In Action</h2>
             <div className={cn(
                 "aspect-video w-full rounded-xl p-4 relative overflow-hidden backdrop-blur-md",
                 "bg-gradient-to-br from-muted/50 via-background/70 to-muted/60 dark:from-slate-800/60 dark:via-slate-900/80 dark:to-slate-950/90", // Lighter gradient for light mode
                 "border border-border dark:border-white/10 shadow-xl" // Use theme border
                )}>
                <div className="absolute inset-0 bg-grid-pattern opacity-10 dark:opacity-5"></div>
                 <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground italic text-lg">
                       [ Dashboard Animation / Screenshot Placeholder ]
                     </p>
                     <div className="absolute top-4 left-4 h-8 w-32 rounded bg-primary/30 dark:bg-primary/20 animate-pulse [animation-delay:0.5s]"></div>
                     <div className="absolute bottom-4 right-4 h-16 w-48 rounded bg-secondary/30 dark:bg-secondary/20 animate-pulse [animation-delay:0.8s]"></div>
                 </div>
             </div>
             <p className="text-center text-muted-foreground text-sm mt-4">Experience the streamlined interface firsthand.</p>
         </div>


        {/* Feature Showcase Section */}
        {/* Appears later than showcase */}
        <div className={`w-full mb-24 animate-fade-in-up ${delay.featuresTitle}`}>
             <h2 className="text-2xl sm:text-3xl font-bold mb-10 text-center text-foreground">Packed with Power</h2>
            {/* Add a subtle delay to the container of the cards */}
            <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8 animate-fade-in-up ${delay.featureCards}`}>
                {/* Feature Cards - Updated Styling */}
                <FeatureCard icon={Cpu} title="AI Predictive Analysis" description="Anticipate trends and make data-driven decisions." />
                <FeatureCard icon={Workflow} title="Workflow Automation" description="Streamline repetitive tasks and boost efficiency." />
                <FeatureCard icon={Layers} title="Multi-Role Architecture" description="Tailored experiences for BAs, Customers & Admins." />
                <FeatureCard icon={Palette} title="Custom Dashboards" description="Tailor your view with widgets and KPIs that matter." />
                <FeatureCard icon={MessagesSquare} title="Unified Messaging" description="Communicate easily with teams and customers." />
                <FeatureCard icon={BarChartBig} title="Advanced Analytics" description="Deep dive into performance metrics & reports." />
                <FeatureCard icon={ShieldCheck} title="Robust Security" description="Secure authentication and data protection." />
                <FeatureCard icon={Zap} title="Blazing Fast UI" description="Optimized for a smooth and responsive experience." />
            </div>
        </div>

        {/* Role Focus Section */}
        {/* Appears after features */}
        <div className={`w-full mb-20 animate-fade-in-up ${delay.rolesTitle}`}>
             <h2 className="text-2xl sm:text-3xl font-bold mb-10 text-center">Dashboards Designed for <span className="text-primary">You</span></h2>
            {/* Add subtle delay */}
            <div className={`grid grid-cols-1 md:grid-cols-3 gap-8 animate-fade-in-up ${delay.roleCards}`}>
                 {/* Role Cards - Updated Styling */}
                <RoleCard icon={Building2} title="Business Actors" description="Manage your organization, products, transactions, scheduling, bonuses, and customer interactions." />
                <RoleCard icon={User} title="Customers" description="View services, track transactions, manage your profile, check bonus points, and interact easily." />
                <RoleCard icon={ShieldAlert} title="Super Admins" description="Oversee platforms, manage users (BAs & Customers), configure system settings, and monitor overall health." />
            </div>
        </div>

      </main>

      {/* Footer */}
      <footer className={`absolute bottom-6 text-xs text-muted-foreground/70 z-10 animate-fade-in-up ${delay.footer}`}>
        © {new Date().getFullYear()} YowYob Inc. Powering Connections.
      </footer>

    </div>
  );
}

// --- Helper Components - Refined Styling ---

const FeatureCard: React.FC<FeatureCardProps> = ({ icon: Icon, title, description }) => (
    <div className={cn(
        "flex flex-col items-center text-center p-4 rounded-lg",
        "bg-background/60 dark:bg-slate-900/60 backdrop-blur-sm", // Use background with opacity
        "border border-border dark:border-white/10", // Use theme border
        "hover:border-primary/50 dark:hover:border-primary/40", // Use primary border on hover
        "transition-all duration-300 group",
        "transform-gpu hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10 dark:hover:shadow-primary/5" // Lift and themed shadow
    )}>
        <div className="p-3 rounded-full bg-primary/10 dark:bg-primary/15 mb-3 group-hover:bg-primary/20 transition-colors duration-300">
            <Icon className="h-6 w-6 text-primary" />
        </div>
        <h3 className="font-semibold mb-1 text-sm sm:text-base text-foreground">{title}</h3>
        <p className="text-xs sm:text-sm text-muted-foreground">{description}</p>
    </div>
);
interface FeatureCardProps { icon: React.ElementType; title: string; description: string;}


const RoleCard: React.FC<RoleCardProps> = ({ icon: Icon, title, description }) => (
     <div className={cn(
        "flex flex-col items-center text-center p-6 rounded-xl",
        "bg-card/80 dark:bg-card/70", // Use card color with opacity
        "backdrop-blur-sm border border-border dark:border-white/10 shadow-md", // Theme border
        "transition-all duration-300 transform-gpu hover:scale-[1.03] hover:shadow-lg"
     )}>
        <Icon className="h-10 w-10 text-primary mb-4" />
        <h3 className="font-bold text-lg mb-2 text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
    </div>
);
interface RoleCardProps { icon: React.ElementType; title: string; description: string;}

/*

*/

// END OF FILE: app/page.tsx/ END OF FILE: app/page.tsx