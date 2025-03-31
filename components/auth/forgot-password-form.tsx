// FILE: components/auth/forgot-password-form.tsx
"use client";

import React, { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { AuthCardWrapper } from "./auth-card-wrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, CheckCircle } from "lucide-react";

const ForgotPasswordSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
});

type ForgotPasswordFormValues = z.infer<typeof ForgotPasswordSchema>;

export const ForgotPasswordForm = () => {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = (values: ForgotPasswordFormValues) => {
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      // !!! IMPORTANT: Replace this with an API call to your backend !!!
      // Your backend should:
      // 1. Check if the email exists.
      // 2. Generate a secure password reset token.
      // 3. Store the token (with expiry) associated with the user.
      // 4. Send an email to the user with a link containing the token.
      console.log("Simulating password reset request for:", values.email);
      try {
        // --- Start Placeholder ---
        await new Promise(resolve => setTimeout(resolve, 1000));
        // Simulate success
        console.log("Simulated password reset email sent to:", values.email);
        // --- End Placeholder ---

        setSuccess("Password reset email sent! Please check your inbox.");

      } catch (err) {
        console.error("Forgot Password Simulation Error:", err);
        setError("Something went wrong. Please try again.");
      }
      // !!! END OF REPLACEMENT BLOCK !!!
    });
  };

  return (
    <AuthCardWrapper
      title="Forgot Your Password?"
      description="Enter your email to receive reset instructions"
      backButtonLabel="Back to Sign In"
      backButtonHref="/login"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      placeholder="you@example.com"
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert variant="default" className="bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertTitle className="text-green-800 dark:text-green-300">Success!</AlertTitle>
              <AlertDescription className="text-green-700 dark:text-green-400">
                {success}
              </AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full" disabled={isPending || !!success}>
            {isPending ? "Sending..." : "Send Reset Instructions"}
          </Button>
        </form>
      </Form>
    </AuthCardWrapper>
  );
};