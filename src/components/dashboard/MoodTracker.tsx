"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { Mood } from "@/types";
import { MOOD_EMOJIS } from "@/types";

interface MoodTrackerProps {
  mood: Mood | null;
  userId: string;
  onMoodSaved: (mood: Mood) => void;
}

const ENERGY_LEVELS = [
  { level: 1, label: "Exhausted", emoji: "😴" },
  { level: 2, label: "Low", emoji: "🥱" },
  { level: 3, label: "Okay", emoji: "😌" },
  { level: 4, label: "Good", emoji: "😊" },
  { level: 5, label: "Thriving", emoji: "⚡" },
];

export function MoodTracker({ mood, userId, onMoodSaved }: MoodTrackerProps) {
  const [selectedMood, setSelectedMood] = useState<number>(mood?.mood_score ?? 0);
  const [energyLevel, setEnergyLevel] = useState<number>(mood?.energy_level ?? 0);
  const [note, setNote] = useState(mood?.note ?? "");
  const [saving, setSaving] = useState(false);
  const [showNote, setShowNote] = useState(false);
  const supabase = createClient();

  const alreadyTracked = !!mood?.mood_score;
  const today = format(new Date(), "yyyy-MM-dd");

  async function saveMood() {
    if (!selectedMood) {
      toast.error("Pick a mood first 🌸");
      return;
    }
    setSaving(true);

    const moodData = {
      user_id: userId,
      date: today,
      mood_score: selectedMood,
      mood_emoji: MOOD_EMOJIS[selectedMood as keyof typeof MOOD_EMOJIS]?.emoji,
      mood_label: MOOD_EMOJIS[selectedMood as keyof typeof MOOD_EMOJIS]?.label,
      energy_level: energyLevel || null,
      note: note || null,
    };

    const { data, error } = await supabase
      .from("moods")
      .upsert(moodData, { onConflict: "user_id,date" })
      .select()
      .single();

    setSaving(false);
    if (error) {
      toast.error("Couldn't save mood. Try again?");
      return;
    }
    onMoodSaved(data as Mood);
    toast.success(
      selectedMood >= 5
        ? "Love that energy! 🌟"
        : selectedMood >= 3
        ? "Thanks for checking in 🌸"
        : "Sending you gentle vibes 💜"
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">💜 How are you feeling?</CardTitle>
        {alreadyTracked && (
          <p className="text-xs text-muted-foreground">Already logged today — you can update it</p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Mood selector */}
        <div>
          <p className="text-xs text-muted-foreground mb-2">Mood</p>
          <div className="flex justify-between">
            {Object.entries(MOOD_EMOJIS).map(([score, { emoji, label }]) => {
              const s = Number(score);
              return (
                <button
                  key={score}
                  onClick={() => setSelectedMood(s)}
                  title={label}
                  className={cn(
                    "mood-btn relative",
                    selectedMood === s && "scale-125"
                  )}
                  aria-label={label}
                  aria-pressed={selectedMood === s}
                >
                  {selectedMood === s && (
                    <motion.div
                      layoutId="mood-selected"
                      className="absolute inset-0 rounded-full bg-primary/10 ring-2 ring-primary"
                      transition={{ type: "spring", duration: 0.3 }}
                    />
                  )}
                  <span className="relative">{emoji}</span>
                </button>
              );
            })}
          </div>
          {selectedMood > 0 && (
            <p className="text-center text-xs text-muted-foreground mt-1 capitalize">
              {MOOD_EMOJIS[selectedMood as keyof typeof MOOD_EMOJIS]?.label}
            </p>
          )}
        </div>

        {/* Energy level */}
        <div>
          <p className="text-xs text-muted-foreground mb-2">Energy level</p>
          <div className="flex justify-between gap-1">
            {ENERGY_LEVELS.map(({ level, label, emoji }) => (
              <button
                key={level}
                onClick={() => setEnergyLevel(level)}
                title={label}
                className={cn(
                  "flex flex-1 flex-col items-center gap-1 rounded-xl py-2 text-xs transition-all duration-200",
                  energyLevel === level
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                <span>{emoji}</span>
                <span className="hidden sm:block">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Optional note */}
        <div>
          <button
            onClick={() => setShowNote(!showNote)}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {showNote ? "− Hide" : "+ Add"} a note (optional)
          </button>
          <AnimatePresence>
            {showNote && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <Textarea
                  className="mt-2 text-xs min-h-[60px]"
                  placeholder="What's on your mind? No judgment here 🌸"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Button
          variant="gradient"
          size="sm"
          className="w-full"
          onClick={saveMood}
          disabled={saving || !selectedMood}
        >
          {saving ? "Saving..." : alreadyTracked ? "Update mood" : "Save mood ✨"}
        </Button>
      </CardContent>
    </Card>
  );
}
