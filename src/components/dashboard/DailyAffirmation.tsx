"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Mood, Profile } from "@/types";

interface DailyAffirmationProps {
  mood: Mood | null;
  profile: Profile | null;
}

const DEFAULT_AFFIRMATIONS = [
  "You don't need to earn your rest. You deserve it simply because you exist.",
  "Progress isn't always visible, but every small step still counts.",
  "Good enough is genuinely productive. You're doing better than you think.",
  "Your worth isn't measured by your output today. You are enough, full stop.",
  "It's okay if today looks different from what you planned. You're still moving forward.",
  "Rest is not a reward for finishing. Rest is part of the work.",
  "Three small things done with care beat ten things half-done any day.",
  "You're not behind. You're exactly where you need to be right now.",
];

export function DailyAffirmation({ mood, profile }: DailyAffirmationProps) {
  const [affirmation, setAffirmation] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // Pick a deterministic affirmation based on day of year
  useEffect(() => {
    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
    );
    setAffirmation(DEFAULT_AFFIRMATIONS[dayOfYear % DEFAULT_AFFIRMATIONS.length]);
  }, []);

  async function refreshAffirmation() {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/affirmation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          moodScore: mood?.mood_score,
          energyLevel: mood?.energy_level,
          displayName: profile?.display_name ?? profile?.full_name,
        }),
      });
      const data = await res.json();
      if (data.affirmation) setAffirmation(data.affirmation);
    } catch {
      const random = DEFAULT_AFFIRMATIONS[Math.floor(Math.random() * DEFAULT_AFFIRMATIONS.length)];
      setAffirmation(random);
    }
    setLoading(false);
  }

  return (
    <motion.div
      className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-rose-50 via-purple-50 to-sky-50 dark:from-rose-950/30 dark:via-purple-950/20 dark:to-sky-950/30 border border-border/40 px-5 py-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-rose-400 to-pink-500">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <p className="text-sm font-medium leading-relaxed italic text-foreground/80">
            &ldquo;{affirmation}&rdquo;
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 shrink-0 rounded-lg"
          onClick={refreshAffirmation}
          disabled={loading}
          aria-label="Get new affirmation"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>
    </motion.div>
  );
}
