"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Sparkles, Check, Wand2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getAllHabitSuggestions, type HabitSuggestion } from "@/lib/template-configs";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const CATEGORY_LABELS: Record<string, { label: string; emoji: string }> = {
  wellness:      { label: "Wellness",      emoji: "💚" },
  mindset:       { label: "Mindset",       emoji: "🧠" },
  self_care:     { label: "Self Care",     emoji: "🛁" },
  planning:      { label: "Planning",      emoji: "📅" },
  goals:         { label: "Goals",         emoji: "🎯" },
  focus:         { label: "Focus",         emoji: "⏱️" },
  growth:        { label: "Growth",        emoji: "📚" },
  home:          { label: "Home",          emoji: "🏠" },
  relationships: { label: "Relationships", emoji: "🫂" },
  finance:       { label: "Finance",       emoji: "💰" },
};

const PREMIUM_HABITS: HabitSuggestion[] = [
  { name: "AI morning brief (review AI plan for the day)", emoji: "🤖", frequency: "daily", category: "planning" },
  { name: "Cycle-aware planning (adjust tasks to energy phase)", emoji: "🌙", frequency: "daily", category: "wellness" },
  { name: "Weekly AI goal check-in", emoji: "✨", frequency: "weekly", category: "goals" },
  { name: "Deep work block (2 hrs, no interruptions)", emoji: "🧠", frequency: "daily", category: "focus" },
  { name: "Monthly vision board review", emoji: "🖼️", frequency: "weekly", category: "goals" },
  { name: "Weekly finance check-in (spending + savings)", emoji: "💰", frequency: "weekly", category: "finance" },
  { name: "Habit streak review with AI insights", emoji: "📊", frequency: "weekly", category: "growth" },
  { name: "Stress + energy pattern tracking", emoji: "🔋", frequency: "daily", category: "wellness" },
];

interface Props {
  onClose: () => void;
  isPremium: boolean;
}

export function CustomBundleBuilder({ onClose, isPremium }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [applying, setApplying] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const grouped = getAllHabitSuggestions();

  useEffect(() => { setMounted(true); }, []);

  function toggle(name: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  }

  const allFreeHabits = Object.values(grouped).flat();
  const selectedHabits = [
    ...allFreeHabits.filter((h) => selected.has(h.name)),
    ...PREMIUM_HABITS.filter((h) => selected.has(h.name)),
  ];

  async function handleApply() {
    if (!selectedHabits.length) return;
    setApplying(true);
    try {
      const res = await fetch("/api/templates/apply-custom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ habits: selectedHabits }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Something went wrong 🌸"); return; }
      toast.success(data.message, { duration: 5000 });
      onClose();
      setTimeout(() => router.push("/dashboard"), 1500);
    } catch {
      toast.error("Couldn't save your bundle. Try again 🌸");
    } finally {
      setApplying(false);
    }
  }

  const panel = (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="fixed inset-x-0 bottom-0 z-[201] flex flex-col max-h-[90vh] rounded-t-3xl bg-background border-t border-border shadow-2xl sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-2xl sm:bottom-auto sm:top-[5vh] sm:rounded-2xl sm:border">
        {/* Drag handle (mobile) */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden shrink-0">
          <div className="h-1 w-10 rounded-full bg-muted-foreground/30" />
        </div>

        {/* Header */}
        <div className="flex items-start justify-between gap-3 px-6 py-4 border-b border-border/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-400 to-purple-500 shrink-0">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-base">Build Your Own Bundle</h2>
              <p className="text-xs text-muted-foreground">Pick any habits — mix and match your perfect routine</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-xl p-1.5 hover:bg-muted transition-colors shrink-0 mt-0.5">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable habit list */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6 min-h-0">
          {/* Free habits grouped by category */}
          {Object.entries(grouped).map(([cat, habits]) => {
            const meta = CATEGORY_LABELS[cat] ?? { label: cat, emoji: "🌸" };
            return (
              <div key={cat}>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  {meta.emoji} {meta.label}
                </p>
                <div className="flex flex-wrap gap-2">
                  {habits.map((h) => {
                    const isSelected = selected.has(h.name);
                    return (
                      <button
                        key={h.name}
                        onClick={() => toggle(h.name)}
                        className={cn(
                          "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-all",
                          isSelected
                            ? "border-primary bg-primary/10 text-primary font-medium"
                            : "border-border/60 text-muted-foreground hover:border-primary/40 hover:text-foreground"
                        )}
                      >
                        <span>{h.emoji}</span>
                        <span>{h.name}</span>
                        <Badge variant="outline" className={cn("text-[10px] ml-0.5 border-0 px-1", isSelected ? "bg-primary/10" : "bg-muted")}>
                          {h.frequency}
                        </Badge>
                        {isSelected && <Check className="h-3 w-3 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Premium habits section */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                ✨ Premium Habits
              </p>
              {!isPremium && <Badge variant="soft" className="text-[10px]">Premium only</Badge>}
            </div>
            <div className="flex flex-wrap gap-2">
              {PREMIUM_HABITS.map((h) => {
                const isSelected = selected.has(h.name);
                const locked = !isPremium;
                return (
                  <button
                    key={h.name}
                    onClick={() => !locked && toggle(h.name)}
                    title={locked ? "Upgrade to Premium to unlock" : undefined}
                    className={cn(
                      "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-all",
                      locked && "opacity-50 cursor-not-allowed border-border/40 text-muted-foreground",
                      !locked && isSelected && "border-primary bg-primary/10 text-primary font-medium",
                      !locked && !isSelected && "border-border/60 text-muted-foreground hover:border-primary/40 hover:text-foreground"
                    )}
                  >
                    {locked ? <Lock className="h-3 w-3 shrink-0" /> : <span>{h.emoji}</span>}
                    <span>{h.name}</span>
                    {!locked && (
                      <Badge variant="outline" className={cn("text-[10px] ml-0.5 border-0 px-1", isSelected ? "bg-primary/10" : "bg-muted")}>
                        {h.frequency}
                      </Badge>
                    )}
                    {!locked && isSelected && <Check className="h-3 w-3 shrink-0" />}
                  </button>
                );
              })}
            </div>
            {!isPremium && (
              <p className="text-xs text-muted-foreground mt-2">
                <a href="/pricing" className="text-primary hover:underline">Upgrade to Premium</a> to unlock AI-powered habits and cycle-aware planning.
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 px-6 py-4 border-t border-border/40 bg-background rounded-b-2xl">
          {selected.size === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-1">Tap any habit above to add it to your bundle</p>
          ) : (
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">{selected.size}</span> habit{selected.size !== 1 ? "s" : ""} selected
              </p>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => setSelected(new Set())} className="text-muted-foreground">
                  Clear
                </Button>
                <Button variant="gradient" size="sm" className="gap-1.5" onClick={handleApply} disabled={applying}>
                  {applying ? <><span className="animate-spin">✨</span> Saving...</> : <><Wand2 className="h-3.5 w-3.5" /> Add {selected.size} habit{selected.size !== 1 ? "s" : ""}</>}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );

  if (!mounted) return null;
  return createPortal(panel, document.body);
}
