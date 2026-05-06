"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Check,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  Mail,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getStoredAccessToken, login } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

type LoginFieldErrors = {
  email?: string;
  password?: string;
};

function validateLoginForm(email: string, password: string) {
  const errors: LoginFieldErrors = {};

  if (!email.trim()) {
    errors.email = "Institutional email is required.";
  } else if (!/^\S+@\S+\.\S+$/.test(email)) {
    errors.email = "Enter a valid institutional email.";
  }

  if (!password) {
    errors.password = "Password is required.";
  }

  return errors;
}

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<LoginFieldErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (getStoredAccessToken()) {
      router.replace("/dashboard");
    }
  }, [router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError(null);

    const errors = validateLoginForm(email, password);
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      await login(
        {
          email: email.trim(),
          password,
        },
        { persist: rememberMe },
      );
      router.push("/dashboard");
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Unable to sign in. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="mt-9 space-y-6" onSubmit={handleSubmit} noValidate>
      {submitError ? (
        <div className="flex items-start gap-3 rounded-md border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm font-medium text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{submitError}</span>
        </div>
      ) : null}

      <div className="space-y-2">
        <label
          className="text-base font-semibold text-foreground"
          htmlFor="institutional-email"
        >
          Institutional Email
        </label>
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-md bg-muted text-muted-foreground">
            <Mail className="h-5 w-5" />
          </span>
          <Input
            id="institutional-email"
            type="email"
            autoComplete="email"
            value={email}
            aria-invalid={Boolean(fieldErrors.email)}
            aria-describedby={
              fieldErrors.email ? "institutional-email-error" : undefined
            }
            className="h-16 rounded-md pl-16 text-lg"
            placeholder="researcher@university.edu"
            onChange={(event) => {
              setEmail(event.target.value);
              setFieldErrors((current) => ({ ...current, email: undefined }));
            }}
          />
        </div>
        {fieldErrors.email ? (
          <p
            id="institutional-email-error"
            className="text-sm font-medium text-destructive"
          >
            {fieldErrors.email}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-4">
          <label
            className="text-base font-semibold text-foreground"
            htmlFor="password"
          >
            Password
          </label>
          <Link
            className="text-sm font-semibold text-primary hover:text-primary-dark"
            href="mailto:lab-admin@example.edu?subject=ScholarFlow%20AI%20password%20reset"
          >
            Forgot password?
          </Link>
        </div>
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-md bg-muted text-muted-foreground">
            <LockKeyhole className="h-5 w-5" />
          </span>
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            value={password}
            aria-invalid={Boolean(fieldErrors.password)}
            aria-describedby={fieldErrors.password ? "password-error" : undefined}
            className="h-16 rounded-md px-16 text-lg"
            placeholder="Enter your password"
            onChange={(event) => {
              setPassword(event.target.value);
              setFieldErrors((current) => ({
                ...current,
                password: undefined,
              }));
            }}
          />
          <button
            type="button"
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            onClick={() => setShowPassword((current) => !current)}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>
        {fieldErrors.password ? (
          <p id="password-error" className="text-sm font-medium text-destructive">
            {fieldErrors.password}
          </p>
        ) : null}
      </div>

      <label className="flex w-fit cursor-pointer items-center gap-3 text-base font-medium text-muted-foreground">
        <input
          type="checkbox"
          className="peer sr-only"
          checked={rememberMe}
          onChange={(event) => setRememberMe(event.target.checked)}
        />
        <span
          className={cn(
            "flex h-5 w-5 items-center justify-center rounded-[5px] border border-border bg-white text-white transition-colors",
            "peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2",
            rememberMe && "border-primary-dark bg-primary-dark",
          )}
        >
          <Check className="h-3.5 w-3.5" />
        </span>
        Remember me
      </label>

      <Button
        type="submit"
        size="lg"
        className="h-16 w-full rounded-md bg-gradient-to-b from-[#006589] to-[#00577f] text-xl shadow-[0_14px_24px_rgba(0,82,128,0.2)] hover:from-[#005f83] hover:to-[#004b73]"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Signing in
          </>
        ) : (
          "Sign In"
        )}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Need an account?{" "}
        <Link
          className="font-semibold text-primary hover:text-primary-dark"
          href="mailto:lab-admin@example.edu?subject=ScholarFlow%20AI%20account%20request"
        >
          Contact your lab administrator.
        </Link>
      </p>
    </form>
  );
}
