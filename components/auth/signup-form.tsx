"use client";

import React, { useState, useTransition } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
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
import { AlertTriangle, CheckCircle, Eye, EyeOff, Loader2 } from "lucide-react";
import { authRepository } from "@/lib/data-repo/auth";
import { CreateUserRequest } from "@/types/auth";
import { toast } from "sonner";

const SignUpSchema = z
  .object({
    username: z.string().min(3, { message: "Username must be at least 3 characters." }),
    email: z.string().email({ message: "Please enter a valid email address." }).optional().or(z.literal("")),
    password: z.string().min(6, { message: "Password must be at least 6 characters." }),
    confirmPassword: z.string().min(6, { message: "Please confirm your password." }),
    first_name: z.string().min(3, { message: "First name must be at least 3 characters." }).max(50),
    last_name: z.string().max(50).optional().or(z.literal("")),
    phone_number: z.string().optional().or(z.literal("")),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

type SignUpFormValues = z.infer<typeof SignUpSchema>;

export const SignUpForm = () => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(SignUpSchema),
    defaultValues: {
      username: "", email: "", password: "", confirmPassword: "", first_name: "", last_name: "", phone_number: "",
    },
  });

  const onSubmit: SubmitHandler<SignUpFormValues> = (values) => {
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      try {
        const requestPayload: CreateUserRequest = {
          username: values.username,
          password: values.password,
          first_name: values.first_name,
          ...(values.email && { email: values.email }),
          ...(values.last_name && { last_name: values.last_name }),
          ...(values.phone_number && { phone_number: values.phone_number }),
        };

        const registeredUser = await authRepository.register(requestPayload);
        toast.success(`Account for ${registeredUser.username} created! Redirecting to login...`);
        setSuccess(`Account created successfully! Please proceed to login.`);

        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } catch (err: any) {
        const apiErrorMessage = err.message || "An unknown error occurred during sign up.";
        setError(apiErrorMessage);
        toast.error(apiErrorMessage);
      }
    });
  };

  return (
    <AuthCardWrapper
      title="Create an Account"
      description="Enter your details to get started"
      backButtonLabel="Already have an account? Sign In"
      backButtonHref="/login"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField control={form.control} name="first_name" render={({ field }) => (<FormItem><FormLabel>First Name <span className="text-destructive">*</span></FormLabel><FormControl><Input placeholder="John" {...field} disabled={isPending} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="last_name" render={({ field }) => (<FormItem><FormLabel>Last Name</FormLabel><FormControl><Input placeholder="Doe" {...field} disabled={isPending} /></FormControl><FormMessage /></FormItem>)} />
          </div>
          <FormField control={form.control} name="username" render={({ field }) => (<FormItem><FormLabel>Username <span className="text-destructive">*</span></FormLabel><FormControl><Input placeholder="johndoe" {...field} disabled={isPending} /></FormControl><FormMessage /></FormItem>)} />
          <FormField control={form.control} name="email" render={({ field }) => (<FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" placeholder="you@example.com" {...field} disabled={isPending} /></FormControl><FormMessage /></FormItem>)} />
          <FormField control={form.control} name="phone_number" render={({ field }) => (<FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input type="tel" placeholder="+1234567890" {...field} disabled={isPending} /></FormControl><FormMessage /></FormItem>)} />
          <FormField control={form.control} name="password" render={({ field }) => (<FormItem><FormLabel>Password <span className="text-destructive">*</span></FormLabel><FormControl><div className="relative"><Input type={showPassword ? "text" : "password"} placeholder="••••••••" {...field} disabled={isPending} /><Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setShowPassword(!showPassword)} tabIndex={-1}>{showPassword ? (<EyeOff className="h-4 w-4" />) : (<Eye className="h-4 w-4" />)}</Button></div></FormControl><FormMessage /></FormItem>)} />
          <FormField control={form.control} name="confirmPassword" render={({ field }) => (<FormItem><FormLabel>Confirm Password <span className="text-destructive">*</span></FormLabel><FormControl><div className="relative"><Input type={showConfirmPassword ? "text" : "password"} placeholder="••••••••" {...field} disabled={isPending} /><Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setShowConfirmPassword(!showConfirmPassword)} tabIndex={-1}>{showConfirmPassword ? (<EyeOff className="h-4 w-4" />) : (<Eye className="h-4 w-4" />)}</Button></div></FormControl><FormMessage /></FormItem>)} />
          {error && (<Alert variant="destructive"><AlertTriangle className="h-4 w-4" /><AlertTitle>Sign Up Failed</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>)}
          {success && (<Alert variant="default" className="bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700"><CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" /><AlertTitle className="text-green-800 dark:text-green-300">Success!</AlertTitle><AlertDescription className="text-green-700 dark:text-green-400">{success}</AlertDescription></Alert>)}
          <Button type="submit" className="w-full transition-all hover:brightness-110 active:scale-[0.98]" disabled={isPending || !!success}>{isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{isPending ? "Creating Account..." : "Create Account"}</Button>
        </form>
      </Form>
    </AuthCardWrapper>
  );
};
