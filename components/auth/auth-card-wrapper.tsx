// FILE: components/auth/auth-card-wrapper.tsx
import React from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface AuthCardWrapperProps {
  children: React.ReactNode;
  title: string;
  description?: string;
  backButtonLabel: string;
  backButtonHref: string;
  showSocial?: boolean; // To potentially add social logins later
}

export const AuthCardWrapper = ({
  children,
  title,
  description,
  backButtonLabel,
  backButtonHref,
  showSocial,
}: AuthCardWrapperProps) => {
  return (
    <Card className="w-full max-w-md shadow-xl border-border/60">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4">
          {/* You can reuse your main logo here */}
          <Image src="/logo.svg" alt="Logo" width={48} height={48} />
        </div>
        <CardTitle className="text-2xl font-semibold tracking-tight">{title}</CardTitle>
        {description && (
          <CardDescription className="text-sm text-muted-foreground pt-1">
            {description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>{children}</CardContent>
      {showSocial && (
        <CardFooter>
          {/* Placeholder for social login buttons */}
          <div className="w-full">
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>
            {/* Add Social Buttons Here */}
            <p className="text-center text-sm text-muted-foreground">Social logins coming soon!</p>
          </div>
        </CardFooter>
      )}
      <CardFooter className="flex justify-center">
        <Button variant="link" className="px-0 font-normal text-sm" size="sm" asChild>
          <Link href={backButtonHref}>{backButtonLabel}</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};