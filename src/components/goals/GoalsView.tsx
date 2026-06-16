"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Target, Sparkles, Check, Trash2, Pin, Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { Database } from "@/types/database";

type Goal = Database["public"]["Tables"]["goals"]["Row"];
type AiStep = { title: string; done: boolean };

const CATEGORIES = [
  { value: "personal", label: "Personal", emoji: "🌱" },
  { value: "career", label: "Career", emoji: "💼" },
  { value: "health", label: "Health", emoji: "💚" },
  { value: "financial", label: "Financial", emoji: "💰" },
  { value: "relationships", label: "Relationships", emoji: "🫶" },
  { value: "learning", label: "Learning", emoji: "📚" },
  { value: "creative", label: "Creative", emoji: "🎨" },
  { value: "other", label: "Other", emoji: "✨" },
];

const HORIZONS = [
  { value: "weekly", label: "This week" },
  { value: "monthly", label: "This month" },
  { value: "quarterly", label: "This quarter" },
  { value: "yearly", label: "This year" },
  { value: "long_term", label: "Long term" },
];

const STATUS_COLORS: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  paused: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  achieved: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  released: "bg-muted text-muted-foreground",
};

export function GoalsView({ userId, initialGoals }: { userId: string; initialGoals: Goal[] }) {
  const [goals, setGoals] = useState<Goal[]>(initialGoals);
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loadingAI, setLoadingAI] = useState<string | null>(null);
  const supabase = createClient();

  // New goal form state
  const [title, setTitle] = useState("");
  const [why, setWhy] = useState("");
  const [category, setCategory] = useState("personal");
  const [horizon, setHorizon] = useState("monthly");
  const [saving, setSaving] = useState(false);

  async function createGoal() {
    if (!title.trim()) return;
    setSaving(true);

    const catEmoji = CATEGORIES.find(c => c.value === category)?.emoji ?? "✨";

    const { data, error } = await supabase
      .from("goals")
      .insert({ user_id: userId, title: title.trim(), why: why.trim() || null, category, time_horizon: horizon, emoji: catEmoji })
      .select()
      .single();

    if (error || !data) {
      toast.error("Couldn't save goal. Try again?");
      setSaving(false);
      return;
    }

    setGoals(prev => [data, ...prev]);
    setTitle("");
    setWhy("");
    setCategory("personal");
    setHorizon("monthly");
    setShowForm(false);
    setSaving(false);
    setExpandedId(data.id);

    // Auto-trigger AI breakdown
    breakdownGoal(data);
  }

  async function breakdownGoal(goal: Goal) {
    setLoadingAI(goal.id);
    try {
      const res = await fetch("/api/ai/goal-breakdown", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goalId: goal.id, title: goal.title, why: goal.why, timeHorizon: goal.time_horizon }),
      });
      const data = await res.json();
      if (data.steps) {
        setGoals(prev => prev.map(g => g.id === goal.id ? { ...g, ai_steps: data.steps, description: data.reframed_goal ?? g.description } : g));
        toast.success("AI broke down your goal into steps ✨");
      }
    } catch {
      toast.error("Couldn't generate steps. You can add them manually.");
    }
    setLoadingAI(null);
  }

  async function toggleStep(goal: Goal, idx: number) {
    const steps = (goal.ai_steps as AiStep[] | null) ?? [];
    const updated = steps.map((s, i) => i === idx ? { ...s, done: !s.done } : s);
    const doneCount = updated.filter(s => s.done).length;
    const progress = steps.length > 0 ? Math.round((doneCount / steps.length) * 100) : 0;

    setGoals(prev => prev.map(g => g.id === goal.id ? { ...g, ai_steps: updated, progress_percent: progress } : g));

    await supabase.from("goals").update({ ai_steps: updated, progress_percent: progress }).eq("id", goal.id);
  }

  async function markAchieved(goal: Goal) {
    setGoals(prev => prev.map(g => g.id === goal.id ? { ...g, status: "achieved", progress_percent: 100 } : g));
    await supabase.from("goals").update({ status: "achieved", progress_percent: 100, achieved_at: new Date().toISOString() }).eq("id", goal.id);
    toast.success("You did it! 🎉 Goal marked as achieved.");
  }

  async function deleteGoal(id: string) {
    setGoals(prev => prev.filter(g => g.id !== id));
    await supabase.from("goals").delete().eq("id", id);
  }

  async function togglePin(goal: Goal) {
    const pinned = !goal.is_pinned;
    setGoals(prev => prev.map(g => g.id === goal.id ? { ...g, is_pinned: pinned } : g));
    await supabase.from("goals").update({ is_pinned: pinned }).eq("id", goal.id);
  }

  const active = goals.filter(g => g.status === "active" || g.status === "paused");
  const achieved = goals.filter(g => g.status === "achieved");

  return (
    <div className="min-h-screen p-6 md:p-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Goals ✨</h1>
          <p className="mt-1 text-muted-foreground text-sm">Big dreams, broken into tiny steps. No pressure.</p>
        </div>
        <Button variant="gradient" size="sm" className="gap-2 shadow-glow shrink-0" onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4" /> New Goal
        </Button>
      </div>

      {/* New goal form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
            className="mb-6"
          >
            <Card className="border-primary/20 shadow-soft">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" /> What do you want to achieve?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <input
                  autoFocus
                  placeholder="e.g. Launch my Etsy shop, Run a 5K, Read 12 books..."
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && createGoal()}
                  className="w-full rounded-xl border border-input bg-muted/30 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <textarea
                  placeholder="Why does this matter to you? (optional — but it helps the AI give better steps)"
                  value={why}
                  onChange={e => setWhy(e.target.value)}
                  rows={2}
                  className="w-full rounded-xl border border-input bg-muted/30 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                />
                <div className="flex gap-2 flex-wrap">
                  {CATEGORIES.map(c => (
                    <button
                      key={c.value}
                      onClick={() => setCategory(c.value)}
                      className={cn(
                        "rounded-full px-3 py-1 text-xs font-medium border transition-all",
                        category === c.value
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-muted border-border text-muted-foreground hover:border-primary/50"
                      )}
                    >
                      {c.emoji} {c.label}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2 flex-wrap">
                  {HORIZONS.map(h => (
                    <button
                      key={h.value}
                      onClick={() => setHorizon(h.value)}
                      className={cn(
                        "rounded-full px-3 py-1 text-xs font-medium border transition-all",
                        horizon === h.value
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-muted border-border text-muted-foreground hover:border-primary/50"
                      )}
                    >
                      {h.label}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2 pt-1">
                  <Button variant="gradient" size="sm" onClick={createGoal} disabled={saving || !title.trim()} className="gap-1.5">
                    <Sparkles className="h-3.5 w-3.5" />
                    {saving ? "Saving..." : "Save & get AI steps"}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state */}
      {goals.length === 0 && !showForm && (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🌱</div>
          <h2 className="font-display text-xl font-semibold mb-2">No goals yet</h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
            Add a goal and the AI will break it into tiny, doable steps. No hustle required.
          </p>
          <Button variant="gradient" onClick={() => setShowForm(true)} className="gap-2 shadow-glow">
            <Plus className="h-4 w-4" /> Set your first goal
          </Button>
        </div>
      )}

      {/* Active goals */}
      {active.length > 0 && (
        <div className="space-y-4 mb-8">
          {active.map(goal => (
            <GoalCard
              key={goal.id}
              goal={goal}
              expanded={expandedId === goal.id}
              loadingAI={loadingAI === goal.id}
              onToggleExpand={() => setExpandedId(expandedId === goal.id ? null : goal.id)}
              onToggleStep={idx => toggleStep(goal, idx)}
              onBreakdown={() => breakdownGoal(goal)}
              onAchieve={() => markAchieved(goal)}
              onDelete={() => deleteGoal(goal.id)}
              onPin={() => togglePin(goal)}
            />
          ))}
        </div>
      )}

      {/* Achieved */}
      {achieved.length > 0 && (
        <div>
          <h2 className="font-display text-lg font-semibold mb-3 flex items-center gap-2">
            <Trophy className="h-4 w-4 text-amber-500" /> Achieved
          </h2>
          <div className="space-y-3">
            {achieved.map(goal => (
              <GoalCard
                key={goal.id}
                goal={goal}
                expanded={expandedId === goal.id}
                loadingAI={false}
                onToggleExpand={() => setExpandedId(expandedId === goal.id ? null : goal.id)}
                onToggleStep={idx => toggleStep(goal, idx)}
                onBreakdown={() => {}}
                onAchieve={() => {}}
                onDelete={() => deleteGoal(goal.id)}
                onPin={() => togglePin(goal)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function GoalCard({
  goal, expanded, loadingAI,
  onToggleExpand, onToggleStep, onBreakdown, onAchieve, onDelete, onPin,
}: {
  goal: Goal;
  expanded: boolean;
  loadingAI: boolean;
  onToggleExpand: () => void;
  onToggleStep: (idx: number) => void;
  onBreakdown: () => void;
  onAchieve: () => void;
  onDelete: () => void;
  onPin: () => void;
}) {
  const steps = (goal.ai_steps as AiStep[] | null) ?? [];
  const doneCount = steps.filter(s => s.done).length;
  const isAchieved = goal.status === "achieved";

  return (
    <motion.div layout transition={{ duration: 0.2 }}>
      <Card className={cn("overflow-hidden transition-shadow hover:shadow-soft", isAchieved && "opacity-75")}>
        {/* Progress bar strip at top */}
        {steps.length > 0 && (
          <div className="h-1 bg-muted">
            <div
              className="h-full bg-gradient-to-r from-rose-400 to-pink-500 transition-all duration-500"
              style={{ width: `${goal.progress_percent}%` }}
            />
          </div>
        )}

        <CardContent className="p-4">
          {/* Main row */}
          <div className="flex items-start gap-3">
            <button
              onClick={onToggleExpand}
              className="flex-1 flex items-start gap-3 text-left"
            >
              <span className="text-2xl mt-0.5 shrink-0">{goal.emoji ?? "✨"}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={cn("font-semibold", isAchieved && "line-through text-muted-foreground")}>
                    {goal.title}
                  </span>
                  {goal.is_pinned && <Pin className="h-3 w-3 text-primary shrink-0" />}
                  <span className={cn("text-xs rounded-full px-2 py-0.5 font-medium", STATUS_COLORS[goal.status])}>
                    {goal.status}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                  <span>{HORIZONS.find(h => h.value === goal.time_horizon)?.label}</span>
                  {steps.length > 0 && <span>{doneCount}/{steps.length} steps</span>}
                  {goal.progress_percent > 0 && <span>{goal.progress_percent}%</span>}
                </div>
              </div>
            </button>

            {/* Actions */}
            <div className="flex items-center gap-1 shrink-0">
              {!isAchieved && goal.progress_percent === 100 && (
                <Button variant="soft" size="sm" className="h-7 px-2 text-xs" onClick={onAchieve}>
                  <Trophy className="h-3 w-3 mr-1" /> Done!
                </Button>
              )}
              <button onClick={onPin} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-primary transition-colors">
                <Pin className="h-3.5 w-3.5" />
              </button>
              <button onClick={onDelete} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-red-500 transition-colors">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Expanded steps */}
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="mt-4 space-y-3">
                  {goal.why && (
                    <p className="text-xs text-muted-foreground italic border-l-2 border-primary/30 pl-3">
                      "{goal.why}"
                    </p>
                  )}

                  {loadingAI && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground py-3">
                      <Sparkles className="h-4 w-4 animate-pulse text-primary" />
                      Breaking this down for you...
                    </div>
                  )}

                  {steps.length > 0 && !loadingAI && (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-muted-foreground">Steps</p>
                      {steps.map((step, i) => (
                        <button
                          key={i}
                          onClick={() => onToggleStep(i)}
                          className="flex items-start gap-2.5 w-full text-left group"
                        >
                          <div className={cn(
                            "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-all",
                            step.done
                              ? "bg-primary border-primary"
                              : "border-border group-hover:border-primary/60"
                          )}>
                            {step.done && <Check className="h-2.5 w-2.5 text-white" />}
                          </div>
                          <span className={cn("text-sm leading-snug", step.done && "line-through text-muted-foreground")}>
                            {step.title}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  {steps.length === 0 && !loadingAI && !isAchieved && (
                    <Button variant="soft" size="sm" className="gap-1.5" onClick={onBreakdown}>
                      <Sparkles className="h-3.5 w-3.5" />
                      Generate AI steps
                    </Button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}
