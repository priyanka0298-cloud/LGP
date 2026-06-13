"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format, parseISO } from "date-fns";
import {
  BookOpen, Sparkles, Plus, Calendar, Brain, Heart,
  List, Star, ChevronRight, Save,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { JournalEntry } from "@/types";
import { MOOD_EMOJIS } from "@/types";

interface JournalViewProps {
  userId: string;
  todayEntry: JournalEntry | null;
  recentEntries: Partial<JournalEntry>[];
}

const DAILY_PROMPTS = [
  { key: "morning_intention", label: "Morning intention", emoji: "🌅", placeholder: "What's one intention I'm carrying into today?" },
  { key: "top_priorities", label: "Top 3 priorities", emoji: "🎯", placeholder: "What absolutely must happen today? (max 3)" },
  { key: "brain_dump", label: "Brain dump", emoji: "🧠", placeholder: "Everything on your mind... just let it out here" },
  { key: "gratitude", label: "Gratitude", emoji: "💜", placeholder: "3 tiny things I'm grateful for, even on hard days..." },
  { key: "what_can_wait", label: "What can wait?", emoji: "🌿", placeholder: "What am I giving myself permission to NOT do today?" },
  { key: "evening_reflection", label: "Evening reflection", emoji: "🌙", placeholder: "How did today actually go? (be honest, be kind)" },
];

const REFLECTION_PROMPTS = [
  { key: "what_drained", q: "What drained me this week?", cat: "energy" },
  { key: "what_helped", q: "What made life easier?", cat: "wellbeing" },
  { key: "avoiding", q: "What am I avoiding?", cat: "growth" },
  { key: "actually_mattered", q: "What actually mattered this week?", cat: "reflection" },
  { key: "tiny_wins", q: "My tiny wins (list everything, even getting out of bed)", cat: "gratitude" },
  { key: "self_care", q: "Self-care check: what did my body and mind need?", cat: "wellbeing" },
  { key: "carry_forward", q: "What am I carrying into next week?", cat: "growth" },
  { key: "release", q: "What am I releasing? (guilt, expectations, resentment)", cat: "growth" },
];

type Tab = "daily" | "reflection" | "free" | "history";

export function JournalView({ userId, todayEntry, recentEntries }: JournalViewProps) {
  const [activeTab, setActiveTab] = useState<Tab>("daily");
  const [content, setContent] = useState<Record<string, string>>(
    (todayEntry?.content as Record<string, string>) ?? {}
  );
  const [saving, setSaving] = useState(false);
  const [freeWrite, setFreeWrite] = useState("");
  const supabase = createClient();

  async function saveDailyEntry() {
    setSaving(true);
    const today = format(new Date(), "yyyy-MM-dd");
    const { error } = await supabase.from("journal_entries").upsert({
      user_id: userId,
      entry_date: today,
      entry_type: "daily",
      content: content,
    }, { onConflict: "user_id,entry_date,entry_type" });

    setSaving(false);
    if (error) {
      toast.error("Couldn't save. Try again?");
    } else {
      toast.success("Journal saved 💜 Great job checking in with yourself.");
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Journal</h1>
          <p className="text-sm text-muted-foreground">{format(new Date(), "EEEE, MMMM d, yyyy")}</p>
        </div>
        <Button variant="gradient" size="sm" className="gap-1.5" onClick={saveDailyEntry} disabled={saving}>
          <Save className="h-3.5 w-3.5" />
          {saving ? "Saving..." : "Save"}
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-muted/50 rounded-2xl">
        {[
          { id: "daily" as Tab, label: "Daily Page", emoji: "📔" },
          { id: "reflection" as Tab, label: "Reflection", emoji: "💭" },
          { id: "free" as Tab, label: "Free Write", emoji: "✍️" },
          { id: "history" as Tab, label: "History", emoji: "📚" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-sm font-medium transition-all",
              activeTab === tab.id
                ? "bg-background shadow-soft text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <span className="hidden sm:inline">{tab.emoji}</span>
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Daily page */}
        {activeTab === "daily" && (
          <motion.div
            key="daily"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2"
          >
            {DAILY_PROMPTS.map((prompt) => (
              <div key={prompt.key} className={cn(
                "rounded-2xl border border-border/50 bg-card p-4 space-y-2",
                prompt.key === "brain_dump" && "sm:col-span-2"
              )}>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{prompt.emoji}</span>
                  <p className="text-sm font-semibold">{prompt.label}</p>
                </div>
                <Textarea
                  placeholder={prompt.placeholder}
                  value={content[prompt.key] ?? ""}
                  onChange={(e) => setContent({ ...content, [prompt.key]: e.target.value })}
                  className={cn(
                    "text-sm resize-none border-0 bg-muted/30 focus-visible:ring-1",
                    prompt.key === "brain_dump" ? "min-h-[120px]" : "min-h-[80px]"
                  )}
                />
              </div>
            ))}

            {/* Meal + water tracker */}
            <div className="rounded-2xl border border-border/50 bg-card p-4 space-y-3">
              <p className="text-sm font-semibold">🥗 Nourishment today</p>
              <div className="grid grid-cols-2 gap-2">
                {["Breakfast", "Lunch", "Dinner", "Snacks"].map((meal) => (
                  <input
                    key={meal}
                    placeholder={meal}
                    value={content[`meal_${meal.toLowerCase()}`] ?? ""}
                    onChange={(e) => setContent({ ...content, [`meal_${meal.toLowerCase()}`]: e.target.value })}
                    className="rounded-lg border border-input bg-muted/30 px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                ))}
              </div>
              <div className="flex items-center gap-2">
                <p className="text-xs text-muted-foreground">💧 Water glasses:</p>
                <div className="flex gap-1">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setContent({ ...content, water: String(i + 1) })}
                      className={cn(
                        "h-6 w-6 rounded-full text-xs transition-all",
                        Number(content.water) > i
                          ? "bg-sky-400 text-white"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Reflection */}
        {activeTab === "reflection" && (
          <motion.div
            key="reflection"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div className="rounded-2xl bg-gradient-to-r from-purple-50 to-sky-50 dark:from-purple-950/30 dark:to-sky-950/20 border border-border/40 p-4">
              <h2 className="font-display text-lg font-semibold mb-1">Weekly Reflection 💭</h2>
              <p className="text-sm text-muted-foreground">
                Take your time with these. There are no right answers — just honest ones.
              </p>
            </div>
            {REFLECTION_PROMPTS.map((prompt) => (
              <div key={prompt.key} className="rounded-2xl border border-border/50 bg-card p-4 space-y-2">
                <p className="text-sm font-semibold">{prompt.q}</p>
                <Textarea
                  placeholder="Take your time..."
                  value={content[`refl_${prompt.key}`] ?? ""}
                  onChange={(e) => setContent({ ...content, [`refl_${prompt.key}`]: e.target.value })}
                  className="min-h-[80px] text-sm resize-none border-0 bg-muted/30"
                />
              </div>
            ))}
          </motion.div>
        )}

        {/* Free write */}
        {activeTab === "free" && (
          <motion.div
            key="free"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="rounded-2xl border border-border/50 bg-card p-6 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">Free Write ✍️</h2>
                <p className="text-xs text-muted-foreground">This is just for you. No prompts. No judgment.</p>
              </div>
              <Textarea
                placeholder="Just write. Stream of consciousness. Thoughts, feelings, dreams, frustrations... it's all welcome here."
                value={freeWrite}
                onChange={(e) => setFreeWrite(e.target.value)}
                className="min-h-[400px] text-sm resize-none border-0 bg-muted/20 focus-visible:ring-1"
              />
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">{freeWrite.split(/\s+/).filter(Boolean).length} words</p>
                <Button variant="gradient" size="sm" onClick={async () => {
                  setSaving(true);
                  const today = format(new Date(), "yyyy-MM-dd");
                  await supabase.from("journal_entries").insert({
                    user_id: userId,
                    entry_date: today,
                    entry_type: "free_write",
                    content: { text: freeWrite },
                  });
                  setSaving(false);
                  toast.success("Free write saved 💜");
                  setFreeWrite("");
                }}>
                  Save entry
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* History */}
        {activeTab === "history" && (
          <motion.div
            key="history"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-2"
          >
            {recentEntries.length === 0 ? (
              <div className="empty-state">
                <p className="text-3xl mb-2">📔</p>
                <p className="font-medium">No entries yet</p>
                <p className="text-sm text-muted-foreground">Start writing today!</p>
              </div>
            ) : (
              recentEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between rounded-2xl border border-border/50 bg-card px-4 py-3 hover:bg-muted/30 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">
                      {entry.entry_type === "daily" ? "📔" : entry.entry_type === "weekly_reflection" ? "💭" : "✍️"}
                    </span>
                    <div>
                      <p className="text-sm font-medium">
                        {entry.entry_date && format(parseISO(entry.entry_date), "EEEE, MMM d")}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {entry.entry_type?.replace("_", " ")}
                        {entry.mood_snapshot && ` · ${MOOD_EMOJIS[entry.mood_snapshot as keyof typeof MOOD_EMOJIS]?.emoji}`}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
