"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { motion } from "framer-motion";
import { Sparkles, Eye, EyeOff, Check } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const signupSchema = z.object({
  full_name: z.string().min(2, "Please enter your name"),
  email: z.string().email("Please enter a valid email"),
  password: z
    .string()
    .min(8, "Password needs at least 8 characters")
    .regex(/[A-Z]/, "Include at least one uppercase letter")
    .regex(/[0-9]/, "Include at least one number"),
});

type SignupForm = z.infer<typeof signupSchema>;

const PERKS = [
  "Free forever — no credit card needed",
  "Weekly planner + habit tracking",
  "AI brain dump to task list",
  "Daily mood tracker",
  "Beautiful templates included",
];

function SignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const checkEmail = searchParams.get("check-email");
  const [showPassword, setShowPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);
  const supabase = createClient();

  if (checkEmail) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-soft px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="rounded-3xl border border-border/50 bg-card/80 backdrop-blur-sm p-10 shadow-card text-center">
            <div className="text-5xl mb-4">📧</div>
            <h1 className="font-display text-2xl font-bold mb-2">Check your email</h1>
            <p className="text-sm text-muted-foreground mb-6">
              We sent you a confirmation link. Click it to activate your account and start planning your soft life.
            </p>
            <Link href="/login">
              <Button variant="outline">Back to sign in</Button>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignupForm>({ resolver: zodResolver(signupSchema) });

  const password = watch("password", "");
  const passwordStrength = getPasswordStrength(password);

  async function onSubmit(data: SignupForm) {
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: { full_name: data.full_name },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/onboarding`,
      },
    });

    if (error) {
      toast.error(
        error.message.includes("already registered")
          ? "This email is already in use. Try signing in instead!"
          : error.message
      );
      return;
    }

    // If session exists, email confirmation is off — go straight to onboarding
    if (authData.session) {
      router.push("/onboarding");
    } else {
      // Email confirmation required — show check-your-email state
      router.push("/signup?check-email=1");
    }
  }

  async function signUpWithGoogle() {
    setGoogleLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/onboarding`,
      },
    });
    if (error) {
      toast.error("Couldn't connect with Google. Try again?");
      setGoogleLoading(false);
    }
  }

  async function signUpWithApple() {
    setAppleLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "apple",
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/onboarding`,
      },
    });
    if (error) {
      toast.error("Couldn't connect with Apple. Try again?");
      setAppleLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-gradient-soft">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-5/12 flex-col items-start justify-center px-12 bg-gradient-to-br from-rose-500/10 via-purple-500/5 to-background border-r border-border/30">
        <Link href="/" className="flex items-center gap-2.5 mb-10">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-400 to-pink-500 shadow-glow">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <span className="font-display text-xl font-semibold">Softlivi</span>
        </Link>

        <h2 className="font-display text-4xl font-bold mb-4 leading-tight">
          Your planning
          <br />
          sanctuary awaits 🌸
        </h2>
        <p className="text-muted-foreground mb-8 leading-relaxed">
          No hustle. No shame. Just a gentle system that works with your brain, not against it.
        </p>

        <div className="space-y-3">
          {PERKS.map((perk) => (
            <div key={perk} className="flex items-center gap-3">
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15">
                <Check className="h-3 w-3 text-primary" />
              </div>
              <span className="text-sm">{perk}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="mb-8 text-center lg:hidden">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-400 to-pink-500 shadow-glow">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="font-display text-xl font-semibold">Softlivi</span>
            </Link>
          </div>

          <div className="rounded-3xl border border-border/50 bg-card/80 backdrop-blur-sm p-8 shadow-card">
            <div className="mb-6">
              <h1 className="font-display text-2xl font-bold">Create your free account ✨</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                No credit card needed. No hustle required.
              </p>
            </div>

            {/* OAuth buttons */}
            <div className="space-y-3 mb-6">
              <Button
                variant="outline"
                className="w-full gap-2.5 h-11 rounded-xl"
                onClick={signUpWithGoogle}
                disabled={googleLoading}
              >
                <GoogleIcon />
                {googleLoading ? "Connecting..." : "Sign up with Google"}
              </Button>
              <Button
                variant="outline"
                className="w-full gap-2.5 h-11 rounded-xl"
                onClick={signUpWithApple}
                disabled={appleLoading}
              >
                <AppleIcon />
                {appleLoading ? "Connecting..." : "Sign up with Apple"}
              </Button>
            </div>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-card px-2 text-muted-foreground">or with email</span>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="full_name">Your name</Label>
                <Input
                  id="full_name"
                  placeholder="How should we call you?"
                  autoComplete="name"
                  {...register("full_name")}
                  className={errors.full_name ? "border-destructive" : ""}
                />
                {errors.full_name && (
                  <p className="text-xs text-destructive">{errors.full_name.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  {...register("email")}
                  className={errors.email ? "border-destructive" : ""}
                />
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="8+ characters, 1 uppercase, 1 number"
                    autoComplete="new-password"
                    {...register("password")}
                    className={errors.password ? "border-destructive pr-10" : "pr-10"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {/* Password strength */}
                {password && (
                  <div className="space-y-1.5">
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4].map((level) => (
                        <div
                          key={level}
                          className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                            passwordStrength >= level
                              ? level <= 1
                                ? "bg-destructive"
                                : level <= 2
                                ? "bg-orange-400"
                                : level <= 3
                                ? "bg-yellow-400"
                                : "bg-emerald-500"
                              : "bg-muted"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {["", "Weak", "Fair", "Good", "Strong"][passwordStrength]} password
                    </p>
                  </div>
                )}
                {errors.password && (
                  <p className="text-xs text-destructive">{errors.password.message}</p>
                )}
              </div>

              <Button
                type="submit"
                variant="gradient"
                className="w-full h-11 font-semibold"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating your space..." : "Start planning softly 🌸"}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="font-medium text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </div>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            By signing up, you agree to our{" "}
            <Link href="#" className="hover:underline">Terms</Link> &{" "}
            <Link href="#" className="hover:underline">Privacy Policy</Link>.
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense>
      <SignupContent />
    </Suspense>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
    </svg>
  );
}

function getPasswordStrength(password: string): number {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
}
