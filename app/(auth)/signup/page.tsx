// FILE: app/signup/page.tsx
import { SignUpForm } from "@/components/auth/signup-form";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-br from-background to-muted/30 dark:to-muted/10">
      <SignUpForm />
    </div>
  );
}