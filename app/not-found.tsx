import { getServerSession } from "next-auth/next";
import { AlertTriangle } from "lucide-react"; // Using a more relevant icon

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NotFoundButtons } from "@/components/not-found-buttons";

export default async function NotFound() {
  const session = await getServerSession(authOptions);
  const isAuthenticated = !!session;

  // Determine primary link props (remains same)
  const primaryLinkHref = isAuthenticated ? "/business-actor/dashboard" : "/";
  const primaryLinkText = isAuthenticated
    ? "Return to Dashboard"
    : "Go to Homepage";

  return (
    // Consistent background with auth pages
    <div className="flex min-h-screen flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-background via-background to-muted/30 dark:to-muted/10">
      {/* Card styling similar to AuthCardWrapper, apply animation */}
      <div className="max-w-lg w-full rounded-xl bg-card p-8 sm:p-10 shadow-xl border border-border/60 space-y-6 animate-fade-in-up">
        <AlertTriangle className="mx-auto h-16 w-16 text-destructive opacity-70" />{" "}
        {/* Changed Icon and color */}
        <h1 className="text-6xl font-extrabold tracking-tighter text-destructive lg:text-8xl">
          404
        </h1>
        <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Page Not Found
        </h2>
        <p className="text-base text-muted-foreground">
          Sorry, the page you requested could not be found. It might have been
          moved, deleted, or the URL might be incorrect.
        </p>
        {/* Use the Client Component for buttons */}
        <NotFoundButtons
          isAuthenticated={isAuthenticated}
          primaryLinkHref={primaryLinkHref}
          primaryLinkText={primaryLinkText}
        />
      </div>
      <p className="mt-12 text-xs text-muted-foreground animate-fade-in-up [animation-delay:0.2s]">
        If you believe this is an error, please{" "}
        <a href="/help" className="underline hover:text-primary">
          contact support
        </a>
        . {/* Added link */}
      </p>
    </div>
  );
}
