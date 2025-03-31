// FILE: app/not-found.tsx

import { getServerSession } from 'next-auth/next';
import { Home, Search, LogIn } from 'lucide-react';

// No longer need Link or Button here directly, moved to client component
// import Link from 'next/link';
// import { Button } from '@/components/ui/button';

import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { NotFoundButtons } from '@/components/not-found-buttons'; // Import the new client component

export default async function NotFound() {
  const session = await getServerSession(authOptions);
  const isAuthenticated = !!session;

  // Determine primary link props on the server
  const primaryLinkHref = isAuthenticated ? '/business-actor/dashboard' : '/'; // Adjust if needed
  const primaryLinkText = isAuthenticated ? 'Return to Dashboard' : 'Go to Homepage';
  const PrimaryLinkIcon = isAuthenticated ? Home : LogIn;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-background to-muted/30 dark:to-muted/10">
      <div className="max-w-lg rounded-xl bg-card p-10 shadow-xl border border-border space-y-6 animate-fade-in-up">

        <Search className="mx-auto h-16 w-16 text-primary opacity-50" />

        <h1 className="text-6xl font-extrabold tracking-tighter text-primary lg:text-8xl">
          404
        </h1>

        <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Page Not Found
        </h2>

        <p className="text-base text-muted-foreground">
          Sorry, we couldn't find the page you're looking for. It might have been moved, deleted,
          or perhaps you mistyped the URL.
        </p>

        {/* Use the Client Component for buttons */}
        <NotFoundButtons
          isAuthenticated={isAuthenticated}
          primaryLinkHref={primaryLinkHref}
          primaryLinkText={primaryLinkText}
        />

      </div>
      <p className="mt-12 text-xs text-muted-foreground">
        If you believe this is an error, please contact support.
      </p>
    </div>
  );
}
