import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, Search } from 'lucide-react'; // Using Home icon for button

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8 text-center">
      <div className="max-w-lg rounded-xl bg-card p-10 shadow-xl border border-border space-y-6 animate-fade-in-up"> {/* Added card style and animation */}

        {/* Optional: A subtle icon or graphic */}
        {/* You could place an SVG component here */}
        <Search className="mx-auto h-16 w-16 text-primary opacity-50" />

        {/* Title */}
        <h1 className="text-6xl font-extrabold tracking-tighter text-primary lg:text-8xl">
          404
        </h1>

        {/* Subtitle */}
        <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Page Not Found
        </h2>

        {/* Informative Message */}
        <p className="text-base text-muted-foreground">
          Sorry, we couldn't find the page you're looking for. It might have been moved, deleted,
          or perhaps you mistyped the URL.
        </p>

        {/* Call to Action Button */}
        <Button asChild size="lg" className="mt-4 transition-transform hover:scale-105">
          {/* Use asChild to make the Button behave like the Link */}
          <Link href="/" className="inline-flex items-center gap-2">
            <Home className="h-5 w-5" />
            Return to Dashboard
          </Link>
        </Button>
      </div>
      {/* Add a subtle footer if desired */}
      <p className="mt-12 text-xs text-muted-foreground">
        If you believe this is an error, please contact support.
      </p>
    </div>
  );
}

// Optional: Add a simple keyframe animation in globals.css if you don't have tw-animate-css setup properly for this specific animation
/* Add this to app/globals.css if needed:
@layer utilities {
  @keyframes fade-in-up {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  .animate-fade-in-up {
    animation: fade-in-up 0.5s ease-out forwards;
  }
}
*/