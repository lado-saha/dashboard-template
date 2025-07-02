// FILE: components/not-found-buttons.tsx
"use client"; // <-- Mark as Client Component

import Link from 'next/link';
import { useRouter } from 'next/navigation'; // Use App Router router
import { ArrowLeft } from 'lucide-react'; // Add ArrowLeft icon

import { Button } from '@/components/ui/button';
import { DashboardIcon } from '@radix-ui/react-icons';

interface NotFoundButtonsProps {
  isAuthenticated: boolean;
  primaryLinkHref: string;
  primaryLinkText: string;
}

export function NotFoundButtons({
  primaryLinkHref,
  primaryLinkText,
}: NotFoundButtonsProps) {
  const router = useRouter();

  const handleGoBack = () => {
    router.back(); // Use router.back() for navigation
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6">
      {/* Go Back Button */}
      <Button
        variant="outline" // Style as secondary action
        size="lg"
        onClick={handleGoBack}
        className="transition-transform hover:scale-105"
      >
        <ArrowLeft className="mr-2 h-5 w-5" />
        Go Back
      </Button>

      {/* Primary Action Button (Dashboard/Homepage) */}
      <Button asChild size="lg" className="transition-transform hover:scale-105">
        <Link href={primaryLinkHref} className="inline-flex items-center gap-2">
          <DashboardIcon className="h-5 w-5" />
          {primaryLinkText}
        </Link>
      </Button>
    </div>
  );
}