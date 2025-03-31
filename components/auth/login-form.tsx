// FILE: components/auth/login-form.tsx
"use client";

import React, { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // For errors
import { AlertTriangle, CheckCircle } from "lucide-react";

const LoginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
});

type LoginFormValues = z.infer<typeof LoginSchema>;

export const LoginForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl"); // Get redirect URL if exists
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (values: LoginFormValues) => {
    setError(null); // Clear previous errors

    startTransition(async () => {
      try {
        const result = await signIn("credentials", {
          redirect: false, // Handle redirect manually
          email: values.email,
          password: values.password,
        });

        if (result?.error) {
          // Handle specific errors or show a generic message
          // Note: NextAuth might return generic errors like "CredentialsSignin"
          console.error("SignIn Error:", result.error);
          setError("Invalid email or password. Please try again.");
        } else if (result?.ok) {
          // Successful login
          // Redirect to dashboard or the callbackUrl if provided
          router.push(callbackUrl || "/business-actor/dashboard"); // Default redirect
          // Optionally refresh to ensure session state is updated everywhere
          router.refresh();
        } else {
          setError("An unexpected error occurred. Please try again.");
        }

      } catch (err) {
        console.error("Login Submit Error:", err);
        setError("An unexpected error occurred. Please try again.");
      }
    });
  };

  return (
    <AuthCardWrapper
      title="Welcome Back"
      description="Sign in to access your dashboard"
      backButtonLabel="Don't have an account? Sign Up"
      backButtonHref="/signup"
      showSocial={false} // Enable later if needed
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
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
                  <Button size="sm" variant="link" asChild className="px-0 font-normal text-xs h-auto py-0 mt-1">
                    <Link href="/forgot-password">
                      Forgot password?
                    </Link>
                  </Button>
                </FormItem>
              )}
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Login Failed</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Signing In..." : "Sign In"}
          </Button>
        </form>
      </Form>
    </AuthCardWrapper>
  );
};