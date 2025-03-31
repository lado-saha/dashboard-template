// FILE: app/page.tsx
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background via-background to-muted/50 dark:to-muted/20 p-6 text-center">
      <div className="mb-12">
        <Image src="/logo.svg" alt="App Logo" width={80} height={80} priority />
      </div>
      <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl mb-4 animate-fade-in-up">
        Welcome to <span className="text-primary">YourApp</span>
      </h1>
      <p className="max-w-xl mx-auto text-lg text-muted-foreground sm:text-xl md:text-2xl mb-10 animate-fade-in-up [animation-delay:0.2s]">
        The ultimate dashboard solution for Business Actors, Customers, and Admins. Streamline your operations effortlessly.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up [animation-delay:0.4s]">
        <Button size="lg" asChild className="transition-transform hover:scale-105">
          <Link href="/login">Sign In</Link>
        </Button>
        <Button size="lg" variant="outline" asChild className="transition-transform hover:scale-105">
          <Link href="/signup">Create Account</Link>
        </Button>
      </div>
      <p className="mt-16 text-xs text-muted-foreground animate-fade-in-up [animation-delay:0.6s]">
        © {new Date().getFullYear()} i All rights reserved.
      </p>
    </div>
  );
}