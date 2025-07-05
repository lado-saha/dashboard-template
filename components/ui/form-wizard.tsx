"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Step {
  id: string;
  name: string;
  icon: React.ElementType;
}

interface FormWizardProps {
  steps: Step[];
  currentStepIndex: number;
  onStepClick: (stepIndex: number) => void;
  mode: "create" | "edit";
  className?: string;
}

export function FormWizard({
  steps,
  currentStepIndex,
  onStepClick,
  mode,
  className,
}: FormWizardProps) {
  // --- EDIT MODE: Use standard Tabs for free navigation ---
  const stepCount = steps.length;
  if (mode === "edit") {
    return (
      <Tabs
        value={steps[currentStepIndex].id}
        onValueChange={(value) => {
          const newIndex = steps.findIndex((step) => step.id === value);
          if (newIndex !== -1) {
            onStepClick(newIndex);
          }
        }}
        className={cn("w-full", className)}
      >
        <TabsList className={`grid w-full grid-cols-${stepCount}`}>
          {steps.map((step) => (
            <TabsTrigger key={step.id} value={step.id}>
              <step.icon className="mr-2 h-4 w-4" />
              {step.name}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    );
  }

  // --- CREATE MODE: Use the sequential wizard layout ---
  return (
    <nav aria-label="Progress" className={cn("pb-4", className)}>
      <ol
        role="list"
        className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-8"
      >
        {steps.map((step, index) => {
          const isCurrent = index === currentStepIndex;
          const isCompleted = index < currentStepIndex;
          const isClickable = index < currentStepIndex; // Only completed steps are clickable in create mode

          return (
            <li key={step.name} className="md:flex-1">
              <div
                onClick={() => isClickable && onStepClick(index)}
                className={cn(
                  "group flex w-full flex-col border-l-4 py-2 pl-4 transition-colors md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4",
                  isClickable ? "cursor-pointer" : "cursor-default",
                  isCurrent && "border-primary",
                  isCompleted
                    ? "border-primary/50 hover:border-primary"
                    : "border-border"
                )}
                aria-current={isCurrent ? "step" : undefined}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-all duration-300",
                      isCurrent &&
                        "scale-110 ring-4 ring-primary/20 bg-primary text-primary-foreground",
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
                        isCurrent ? "text-primary" : "text-muted-foreground",
                        isClickable && "group-hover:text-foreground"
                      )}
                    >
                      {step.name}
                    </span>
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
