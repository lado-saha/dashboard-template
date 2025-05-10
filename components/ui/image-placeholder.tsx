import React from 'react';
import { Image as ImageIcon, Package, Combine } from 'lucide-react'; // Or any other generic icon
import { cn } from '@/lib/utils';

interface ImagePlaceholderProps {
  iconType?: 'resource' | 'service' | 'generic';
  className?: string;
  iconClassName?: string;
}

export function ImagePlaceholder({
  iconType = 'generic',
  className,
  iconClassName,
}: ImagePlaceholderProps) {
  let IconComponent;
  switch (iconType) {
    case 'resource':
      IconComponent = Package;
      break;
    case 'service':
      IconComponent = Combine;
      break;
    default:
      IconComponent = ImageIcon;
  }

  return (
    <div
      className={cn(
        "flex h-full w-full items-center justify-center rounded-md bg-muted aspect-square",
        className
      )}
    >
      <IconComponent
        className={cn("h-1/2 w-1/2 text-muted-foreground/50", iconClassName)}
        strokeWidth={1.5}
      />
    </div>
  );
}