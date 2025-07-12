"use client";

import React, { useState } from "react";
import { UseFormReturn, FieldValues, Path } from "react-hook-form";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { FormWizard } from "./form-wizard"; // We will use the stepper version

interface Step {
  id: string;
  name: string;
  icon: React.ElementType;
  fields?: string[];
}

interface FormWrapperProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  onFormSubmit: (data: T) => void;
  isLoading: boolean;
  title: string;
  description: string;
  steps?: Step[];
  children: (currentStep: number) => React.ReactNode;
  submitButtonText?: string;
  className?: string;
}

export function FormWrapper<T extends FieldValues>({
  form,
  onFormSubmit,
  isLoading,
  title,
  description,
  steps,
  children,
  submitButtonText = "Submit",
  className,
}: FormWrapperProps<T>) {
  const [currentStep, setCurrentStep] = useState(0);
  const isMultiStep = steps && steps.length > 1;

  const handleNextStep = async () => {
    // Import Path from react-hook-form
    // import { UseFormReturn, FieldValues, Path } from "react-hook-form";
    const fieldsToValidate = steps?.[currentStep]?.fields as
      | import("react-hook-form").Path<T>[]
      | undefined;
    const isStepValid = fieldsToValidate
      ? await form.trigger(fieldsToValidate)
      : true;

    if (isStepValid && isMultiStep && currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleFinalSubmit = form.handleSubmit(onFormSubmit);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key === "Enter") {
      // Prevents accidental submission from any input field
      e.preventDefault();
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={(e) => e.preventDefault()} // Prevent default form submission
        onKeyDown={handleKeyDown}
        className={cn("w-full", className)}
      >
        <Card className="shadow-lg border">
          <CardHeader>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>

          {isMultiStep && (
            <div className="px-6 pb-4 border-b">
              <FormWizard
                steps={steps}
                currentStepIndex={currentStep}
                onStepClick={setCurrentStep}
                mode="create" // Always use stepper visual for clarity
              />
            </div>
          )}

          <CardContent className="pt-6">{children(currentStep)}</CardContent>

          <CardFooter className="flex justify-between border-t pt-6">
            <div>
              {isMultiStep && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep((p) => p - 1)}
                  disabled={currentStep === 0 || isLoading}
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
              )}
            </div>

            <div>
              {isMultiStep && currentStep < steps.length - 1 ? (
                <Button type="button" onClick={handleNextStep}>
                  Next
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleFinalSubmit}
                  disabled={isLoading}
                >
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {submitButtonText}
                </Button>
              )}
            </div>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
