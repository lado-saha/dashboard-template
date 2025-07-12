"use client";

import React, { useState, useTransition } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";

const LoginSchema = z.object({
  username: z
    .string()
    .min(1, { message: "Username, email or phone is required." }),
  password: z.string().min(1, { message: "Password is required." }),
});

type LoginFormValues = z.infer<typeof LoginSchema>;

export const LoginForm = () => {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const isNewUser = searchParams.get("new_user") === "true";

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { username: "", password: "" },
  });

  const onSubmit: SubmitHandler<LoginFormValues> = (values) => {
    setError(null);
    startTransition(async () => {
      try {
        const result = await signIn("credentials", {
          redirect: false,
          username: values.username,
          password: values.password,
        });

        if (result?.error) {
          const errorMessage =
            result.error === "CredentialsSignin"
              ? "Invalid username or password."
              : result.error;
          setError(errorMessage);
          toast.error(errorMessage);
        } else if (result?.ok) {
          toast.success("Login successful! Redirecting...");
          const destination = isNewUser
            ? "/welcome"
            : callbackUrl || "/dashboard";
          window.location.href =destination
        } else {
          setError("An unexpected error occurred during login.");
          toast.error("An unexpected login error occurred.");
        }
      } catch (err) {
        setError("An unexpected error occurred. Please try again.");
        toast.error("An unexpected error occurred.");
      }
    });
  };

  return (
    <AuthCardWrapper
      title="Welcome Back"
      description="Sign in to access your dashboard"
      backButtonLabel="Don't have an account? Sign Up"
      backButtonHref="/signup"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username, Email or Phone</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="yourusername"
                      {...field}
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
                  <div className="flex justify-between items-center">
                    <FormLabel>Password</FormLabel>
                    <Button
                      size="sm"
                      variant="link"
                      asChild
                      className="px-0 font-normal text-xs h-auto text-muted-foreground hover:text-primary"
                    >
                      <Link href="/forgot-password" tabIndex={-1}>
                        Forgot password?
                      </Link>
                    </Button>
                  </div>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        {...field}
                        disabled={isPending}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                        onClick={() => setShowPassword(!showPassword)}
                        tabIndex={-1}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
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
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isPending ? "Signing In..." : "Sign In"}
          </Button>
        </form>
      </Form>
    </AuthCardWrapper>
  );
};
