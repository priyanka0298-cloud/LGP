"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check, Sparkles, ArrowLeft, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PRICING_PLANS } from "@/types";
import { formatCurrency, cn } from "@/lib/utils";
import { toast } from "sonner";

const stripeReady = !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY &&
  !process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.startsWith("pk_test_your-");

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [loading, setLoading] = useState<string | null>(null);

  async function handleUpgrade(planId: string) {
    setLoading(planId);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: billingCycle === "yearly" ? "premium_yearly" : "premium_monthly",
        }),
      });
      const { url, error } = await res.json();
      if (error) {
        if (res.status === 401) {
          toast.error("You need to be signed in to upgrade.");
        } else {
          toast.error(error);
        }
        return;
      }
      if (url) window.location.href = url;
    } catch {
      toast.error("Something went wrong. Try again?");
    }
    setLoading(null);
  }

  const displayPlans = PRICING_PLANS.filter((p) =>
    billingCycle === "yearly" ? p.id !== "premium_monthly" : p.id !== "premium_yearly"
  );

  return (
    <div className="min-h-screen bg-gradient-soft">
      {/* Nav */}
      <div className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <Link href="/" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>
        <Link href="/dashboard" className="text-sm font-medium text-primary hover:underline">
          Go to app →
        </Link>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <Badge variant="soft" className="mb-4 gap-1.5">
            <Sparkles className="h-3.5 w-3.5" />
            Simple, honest pricing
          </Badge>
          <h1 className="font-display text-4xl font-bold mb-4 sm:text-5xl">
            Plan your soft life,{" "}
            <span className="gradient-text">your way</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-lg mx-auto">
            Start free forever. Upgrade when you're ready — no pressure, no hustle.
          </p>

          {/* Billing toggle */}
          <div className="mt-8 inline-flex items-center gap-3 rounded-2xl bg-muted/50 p-1.5">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={cn(
                "rounded-xl px-5 py-2 text-sm font-medium transition-all",
                billingCycle === "monthly"
                  ? "bg-background shadow-soft text-foreground"
                  : "text-muted-foreground"
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={cn(
                "flex items-center gap-2 rounded-xl px-5 py-2 text-sm font-medium transition-all",
                billingCycle === "yearly"
                  ? "bg-background shadow-soft text-foreground"
                  : "text-muted-foreground"
              )}
            >
              Yearly
              <Badge variant="sage" className="text-[10px] py-0">Save 33%</Badge>
            </button>
          </div>
        </motion.div>

        {/* Plans */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {displayPlans.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={cn(
                "relative rounded-3xl border p-6 flex flex-col",
                plan.highlighted
                  ? "border-primary/40 bg-gradient-to-br from-rose-50 to-purple-50 dark:from-rose-950/30 dark:to-purple-950/20 shadow-card"
                  : "border-border/50 bg-card"
              )}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge variant="default" className="bg-gradient-to-r from-rose-500 to-pink-500 text-white border-0 shadow-glow">
                    {plan.badge}
                  </Badge>
                </div>
              )}

              <div className="mb-6">
                <h2 className="font-semibold text-lg mb-1">{plan.name}</h2>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
                <div className="mt-4">
                  <span className="text-4xl font-bold">
                    {plan.price === 0 ? "Free" : `$${plan.price}`}
                  </span>
                  {plan.period && (
                    <span className="text-muted-foreground text-sm ml-1">/{plan.period}</span>
                  )}
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-2.5 flex-1 mb-6">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-sm">
                    <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/15">
                      <Check className="h-2.5 w-2.5 text-primary" />
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>

              {plan.price === 0 ? (
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/signup">{plan.cta}</Link>
                </Button>
              ) : stripeReady ? (
                <Button
                  variant="gradient"
                  className="w-full shadow-glow"
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={!!loading}
                >
                  {loading === plan.id ? "Loading..." : plan.cta}
                </Button>
              ) : (
                <Button variant="outline" className="w-full" disabled>
                  Premium — Coming Soon ✨
                </Button>
              )}
            </motion.div>
          ))}
        </div>

        {/* FAQ / reassurance */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-16 text-center space-y-4"
        >
          <h3 className="font-display text-xl font-semibold">Questions? 🌸</h3>
          <div className="grid sm:grid-cols-3 gap-4 text-sm text-muted-foreground">
            {[
              { q: "Can I cancel anytime?", a: "Yes, absolutely. No questions asked, no guilt trips. Your data stays with you." },
              { q: "Is there really a free tier?", a: "Yes! The free plan is genuinely useful and never time-limited." },
              { q: "What happens when I upgrade?", a: "You get instant access to all premium features. It's like unlocking your whole planning potential." },
            ].map(({ q, a }) => (
              <div key={q} className="rounded-2xl bg-muted/30 p-4 text-left">
                <p className="font-medium text-foreground mb-1">{q}</p>
                <p>{a}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
