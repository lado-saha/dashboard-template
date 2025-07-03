"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface Step {
  id: string;
  name: string;
  icon: React.ElementType;
}

interface FormWizardProps {
  steps: Step[];
  currentStepIndex: number;
  onStepClick: (stepIndex: number) => void;
  className?: string;
}

export function FormWizard({
  steps,
  currentStepIndex,
  onStepClick,
  className,
}: FormWizardProps) {
  return (
    <nav aria-label="Progress" className={cn("pb-4", className)}>
      <ol
        role="list"
        className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-8"
      >
        {steps.map((step, index) => {
          const isCompleted = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;

          return (
            <li key={step.name} className="md:flex-1">
              <div
                onClick={() => isCompleted && onStepClick(index)}
                className={cn(
                  "group flex w-full flex-col border-l-4 py-2 pl-4 transition-colors md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4",
                  // Dynamic border color based on state
                  isCurrent && "border-primary",
                  isCompleted
                    ? "border-primary/50 hover:border-primary cursor-pointer"
                    : "border-border"
                )}
                aria-current={isCurrent ? "step" : undefined}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-all duration-300",
                      // Dynamic background, border, and scale for the icon circle
                      isCurrent && "scale-110 ring-4 ring-primary/20 bg-primary text-primary-foreground",
                      isCompleted
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground group-hover:bg-accent"
                    )}
                  >
                    {isCompleted ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>
                  <div>
                    <span
                      className={cn(
                        "text-sm font-semibold transition-colors",
                        // Dynamic text color for the step name
                        isCompleted
                          ? "text-foreground group-hover:text-primary"
                          : "text-muted-foreground",

                        isCurrent && "text-primary",
                      )}
                    >
                      {step.name}
                    </span>
                    {/* Sub-label to clearly indicate status */}
                    {/* <p className="text-xs font-medium text-muted-foreground">
                      {isCurrent ? "Current Step" : isCompleted ? "Completed" : "Upcoming"}
                    </p> */}
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}