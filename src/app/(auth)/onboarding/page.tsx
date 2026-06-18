"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight, ArrowLeft, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface OnboardingData {
  display_name: string;
  pronouns: string;
  planning_style: "minimal" | "balanced" | "detailed";
  goals: string[];
  accent_color: "rose" | "lavender" | "peach" | "sage" | "sky";
  challenges: string[];
}

const PLANNING_STYLES = [
  {
    id: "minimal" as const,
    label: "Minimal",
    description: "3 tasks a day, that's enough",
    emoji: "🌿",
  },
  {
    id: "balanced" as const,
    label: "Balanced",
    description: "Structure with flexibility",
    emoji: "🌸",
  },
  {
    id: "detailed" as const,
    label: "Detailed",
    description: "I like knowing every step",
    emoji: "📋",
  },
];

const LIFE_GOALS = [
  "Less overwhelm", "Better habits", "Work-life balance", "Burnout recovery",
  "Study better", "Track my mood", "ADHD management", "Morning routines",
  "Creative goals", "Health & wellness", "Career growth", "More rest",
];

const ACCENT_COLORS = [
  { id: "rose" as const, label: "Rose", class: "bg-rose-400" },
  { id: "lavender" as const, label: "Lavender", class: "bg-purple-400" },
  { id: "peach" as const, label: "Peach", class: "bg-orange-300" },
  { id: "sage" as const, label: "Sage", class: "bg-emerald-400" },
  { id: "sky" as const, label: "Sky", class: "bg-sky-400" },
];

const STEPS = 4;

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<OnboardingData>({
    display_name: "",
    pronouns: "",
    planning_style: "balanced",
    goals: [],
    accent_color: "rose",
    challenges: [],
  });

  const progress = ((step + 1) / STEPS) * 100;

  async function handleFinish() {
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("profiles").update({
      display_name: data.display_name || undefined,
      pronouns: data.pronouns || undefined,
      planning_style: data.planning_style,
      accent_color: data.accent_color,
      onboarding_goals: data.goals,
      onboarding_completed: true,
      onboarding_step: STEPS,
    }).eq("id", user.id);

    if (error) {
      toast.error("Couldn't save your preferences. Try again?");
      setSaving(false);
      return;
    }

    toast.success("Your space is ready! 🌸");
    router.push("/dashboard");
  }

  const steps = [
    // Step 0: Welcome
    <motion.div key="welcome" className="text-center">
      <motion.div
        animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
        className="mx-auto mb-6 text-6xl"
      >
        🌸
      </motion.div>
      <h1 className="font-display text-3xl font-bold mb-3">Welcome to your soft space</h1>
      <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
        Let's take 2 minutes to personalize your planning experience. No wrong answers — this is all about you.
      </p>
      <div className="space-y-4 text-left max-w-sm mx-auto">
        <div>
          <label className="text-sm font-medium mb-1.5 block">What should we call you?</label>
          <Input
            placeholder="Your name or nickname"
            value={data.display_name}
            onChange={(e) => setData({ ...data, display_name: e.target.value })}
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-1.5 block">
            Pronouns <span className="text-muted-foreground font-normal">(optional)</span>
          </label>
          <Input
            placeholder="e.g. she/her, they/them"
            value={data.pronouns}
            onChange={(e) => setData({ ...data, pronouns: e.target.value })}
          />
        </div>
      </div>
    </motion.div>,

    // Step 1: Planning style
    <motion.div key="style" className="text-center">
      <div className="mx-auto mb-6 text-5xl">🧠</div>
      <h2 className="font-display text-2xl font-bold mb-2">How do you like to plan?</h2>
      <p className="text-muted-foreground mb-8">No judgment — choose what feels right in your body.</p>
      <div className="grid grid-cols-1 gap-3 max-w-sm mx-auto">
        {PLANNING_STYLES.map((style) => (
          <button
            key={style.id}
            onClick={() => setData({ ...data, planning_style: style.id })}
            className={cn(
              "flex items-center gap-4 rounded-2xl border-2 p-4 text-left transition-all duration-200",
              data.planning_style === style.id
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            )}
          >
            <span className="text-2xl">{style.emoji}</span>
            <div>
              <p className="font-semibold">{style.label}</p>
              <p className="text-sm text-muted-foreground">{style.description}</p>
            </div>
            {data.planning_style === style.id && (
              <div className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                <Check className="h-3 w-3 text-white" />
              </div>
            )}
          </button>
        ))}
      </div>
    </motion.div>,

    // Step 2: Goals
    <motion.div key="goals" className="text-center">
      <div className="mx-auto mb-6 text-5xl">✨</div>
      <h2 className="font-display text-2xl font-bold mb-2">What are you here for?</h2>
      <p className="text-muted-foreground mb-8">Pick all that apply — we'll customize your experience.</p>
      <div className="flex flex-wrap justify-center gap-2 max-w-md mx-auto">
        {LIFE_GOALS.map((goal) => (
          <button
            key={goal}
            onClick={() => {
              const selected = data.goals.includes(goal)
                ? data.goals.filter((g) => g !== goal)
                : [...data.goals, goal];
              setData({ ...data, goals: selected });
            }}
            className={cn(
              "rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200",
              data.goals.includes(goal)
                ? "border-primary bg-primary/10 text-primary"
                : "border-border hover:border-primary/50 text-muted-foreground"
            )}
          >
            {goal}
          </button>
        ))}
      </div>
    </motion.div>,

    // Step 3: Accent color
    <motion.div key="color" className="text-center">
      <div className="mx-auto mb-6 text-5xl">🎨</div>
      <h2 className="font-display text-2xl font-bold mb-2">Pick your vibe</h2>
      <p className="text-muted-foreground mb-8">Choose your accent color — you can always change it in settings.</p>
      <div className="flex justify-center gap-4">
        {ACCENT_COLORS.map((color) => (
          <button
            key={color.id}
            onClick={() => setData({ ...data, accent_color: color.id })}
            className="flex flex-col items-center gap-2 group"
          >
            <div
              className={cn(
                "h-12 w-12 rounded-full transition-all duration-200 group-hover:scale-110",
                color.class,
                data.accent_color === color.id ? "ring-4 ring-primary ring-offset-2 ring-offset-background scale-110" : ""
              )}
            />
            <span className="text-xs font-medium text-muted-foreground">{color.label}</span>
          </button>
        ))}
      </div>

      {/* Ready message */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-10 rounded-2xl bg-muted/50 p-4 max-w-sm mx-auto"
      >
        <p className="text-sm text-muted-foreground">
          💜 You're all set! Remember: this app is designed to be kind to you. No guilt, no pressure — just gentle progress.
        </p>
      </motion.div>
    </motion.div>,
  ];

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-soft px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">Step {step + 1} of {STEPS}</span>
          </div>
          {/* Progress */}
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-rose-400 to-pink-500"
              initial={{ width: `${((step) / STEPS) * 100}%` }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </div>

        {/* Step content */}
        <div className="rounded-3xl border border-border/50 bg-card/80 backdrop-blur-sm p-8 shadow-card min-h-[400px] flex flex-col justify-between">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="flex-1"
            >
              {steps[step]}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            <Button
              variant="ghost"
              onClick={() => setStep(Math.max(0, step - 1))}
              disabled={step === 0}
              className="gap-1"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>

            {step < STEPS - 1 ? (
              <Button
                variant="gradient"
                onClick={() => setStep(step + 1)}
                className="gap-1"
              >
                Continue
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                variant="gradient"
                onClick={handleFinish}
                disabled={saving}
                className="gap-1"
              >
                {saving ? "Setting up..." : "Enter my space 🌸"}
                <Sparkles className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {step < STEPS - 1 && (
          <button
            onClick={handleFinish}
            className="mt-4 w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Skip setup — I'll customize later
          </button>
        )}
      </div>
    </div>
  );
}
