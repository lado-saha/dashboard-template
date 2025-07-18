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
  showSocial?: boolean;
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
    // Added slightly more padding (py-8) and refined shadow/border
    <Card className="shadow-lg border border-border/40 py-2 sm:py-4">
      <CardHeader className="text-center px-6 sm:px-8 pt-6 pb-4">
        {" "}
        {/* Adjusted padding */}
        <div className="mx-auto mb-4">
          <Image src="/logo.svg" alt="Logo" width={48} height={48} />
        </div>
        <CardTitle className="text-2xl font-semibold tracking-tight">
          {title}
        </CardTitle>
        {description && (
          <CardDescription className="text-sm text-muted-foreground pt-1">
            {description}
          </CardDescription>
        )}
      </CardHeader>
      {/* Adjusted content padding */}
      <CardContent className="px-6 sm:px-8">{children}</CardContent>
      {showSocial && (
        // Keep social section padding consistent
        <CardFooter className="flex-col px-6 sm:px-8 pt-4 pb-0">
          <div className="w-full">
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/60" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>
            {/* Placeholder for Social Buttons */}
            <p className="text-center text-sm text-muted-foreground py-4">
              Social logins coming soon!
            </p>
          </div>
        </CardFooter>
      )}
      {/* Adjusted footer padding and button style */}
      <CardFooter className="flex justify-center px-6 sm:px-8 pt-2 pb-6">
        <Button
          variant="link"
          className="px-0 font-normal text-sm text-muted-foreground hover:text-primary"
          size="sm"
          asChild
        >
          <Link href={backButtonHref}>{backButtonLabel}</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};
