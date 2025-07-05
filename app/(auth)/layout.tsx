"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { status: sessionStatus } = useSession();
  const router = useRouter();

  useEffect(() => {
    // If the session has been determined and the user is authenticated...
    if (sessionStatus === "authenticated") {
      // ...redirect them away from the auth pages to their main dashboard.
      router.replace("/dashboard");
    }
  }, [sessionStatus, router]);

  // While the session is being checked, show a loading state.
  // This prevents a "flash" of the login form before the redirect happens.
  if (sessionStatus === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  // If the user is not authenticated, render the login/signup page.
  // The check `sessionStatus !== 'authenticated'` ensures that the login form is shown
  // only after the check is complete and the user is confirmed to be unauthenticated.
  return <>{sessionStatus !== "authenticated" && children}</>;
}
