// FILE: components/auth/signup-form.tsx
"use client";

import React, { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
// import bcrypt from 'bcrypt'; // Use on backend only!

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

const SignUpSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters." }),
});

type SignUpFormValues = z.infer<typeof SignUpSchema>;

export const SignUpForm = () => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(SignUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = (values: SignUpFormValues) => {
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      // !!! IMPORTANT: Replace this with an API call to your backend !!!
      // Your backend should:
      // 1. Check if the email already exists.
      // 2. Hash the password using bcrypt.
      // 3. Save the new user to the database.
      console.log("Simulating sign up for:", values.email);
      try {
          // --- Start Placeholder ---
          // Simulate network delay and potential errors
          await new Promise(resolve => setTimeout(resolve, 1000));
          const emailExists = values.email === "existing@example.com"; // Simulate existing user

          if (emailExists) {
              setError("An account with this email already exists.");
              return;
          }
          // Simulate success
          console.log("Simulated signup successful for:", values.email);
          // --- End Placeholder ---

          setSuccess("Account created successfully! Redirecting to login...");

          // Redirect to login page after a short delay
          setTimeout(() => {
              router.push("/login");
          }, 2000);

      } catch (err) {
          console.error("Signup Simulation Error:", err);
          setError("Something went wrong during sign up. Please try again.");
      }
      // !!! END OF REPLACEMENT BLOCK !!!
    });
  };

  return (
    <AuthCardWrapper
      title="Create an Account"
      description="Enter your details to get started"
      backButtonLabel="Already have an account? Sign In"
      backButtonHref="/login"
      showSocial={false}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="John Doe"
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
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
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="password"
                      placeholder="••••••••"
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
              <AlertTitle>Sign Up Failed</AlertTitle>
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
            {isPending ? "Creating Account..." : "Create Account"}
          </Button>
        </form>
      </Form>
    </AuthCardWrapper>
  );
};