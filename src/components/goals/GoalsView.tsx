"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Target, Sparkles, Check, Trash2, Pin, Trophy, ChevronDown, ChevronUp, PenLine, CalendarDays, Pencil, X } from "lucide-react";
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
  const [targetDate, setTargetDate] = useState("");
  const [saving, setSaving] = useState(false);
  // AI detail step in the form
  const [showAIDetail, setShowAIDetail] = useState(false);
  const [aiDetail, setAiDetail] = useState("");
  const [aiDetailDeadline, setAiDetailDeadline] = useState("");

  function resetForm() {
    setTitle("");
    setWhy("");
    setCategory("personal");
    setHorizon("monthly");
    setTargetDate("");
    setShowAIDetail(false);
    setAiDetail("");
    setAiDetailDeadline("");
    setShowForm(false);
  }

  async function saveAndGenerateSteps() {
    if (!title.trim()) return;
    setSaving(true);

    const catEmoji = CATEGORIES.find(c => c.value === category)?.emoji ?? "✨";
    const finalDeadline = aiDetailDeadline || targetDate || null;
    const { data, error } = await supabase
      .from("goals")
      .insert({ user_id: userId, title: title.trim(), why: why.trim() || null, category, time_horizon: horizon, emoji: catEmoji, target_date: finalDeadline })
      .select()
      .single();

    if (error || !data) {
      toast.error("Couldn't save goal. Try again?");
      setSaving(false);
      return;
    }

    setGoals(prev => [data, ...prev]);
    resetForm();
    setSaving(false);
    setExpandedId(data.id);
    breakdownGoal(data, aiDetail);
  }

  async function saveManual() {
    if (!title.trim()) return;
    setSaving(true);

    const catEmoji = CATEGORIES.find(c => c.value === category)?.emoji ?? "✨";
    const { data, error } = await supabase
      .from("goals")
      .insert({ user_id: userId, title: title.trim(), why: why.trim() || null, category, time_horizon: horizon, emoji: catEmoji, target_date: targetDate || null })
      .select()
      .single();

    if (error || !data) {
      toast.error("Couldn't save goal. Try again?");
      setSaving(false);
      return;
    }

    setGoals(prev => [data, ...prev]);
    resetForm();
    setSaving(false);
    setExpandedId(data.id);
  }

  async function updateGoal(id: string, updates: { title?: string; why?: string | null; category?: string; time_horizon?: string; target_date?: string | null; emoji?: string }) {
    setGoals(prev => prev.map(g => g.id === id ? { ...g, ...updates } : g));
    await supabase.from("goals").update(updates).eq("id", id);
    toast.success("Goal updated");
  }

  async function breakdownGoal(goal: Goal, extraDetail = "", deadline = "") {
    // If a deadline was provided in the detail step, save it first
    const effectiveDeadline = deadline || goal.target_date || null;
    if (deadline && deadline !== goal.target_date) {
      setGoals(prev => prev.map(g => g.id === goal.id ? { ...g, target_date: deadline } : g));
      await supabase.from("goals").update({ target_date: deadline }).eq("id", goal.id);
    }
    setLoadingAI(goal.id);
    try {
      const res = await fetch("/api/ai/goal-breakdown", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goalId: goal.id,
          title: goal.title,
          why: goal.why,
          timeHorizon: goal.time_horizon,
          targetDate: effectiveDeadline,
          extraDetail: extraDetail.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (data.steps) {
        setGoals(prev => prev.map(g => g.id === goal.id ? { ...g, ai_steps: data.steps, description: data.reframed_goal ?? g.description } : g));
        toast.success("Your steps are ready ✨");
      }
    } catch {
      toast.error("Couldn't generate steps. You can add them manually.");
    }
    setLoadingAI(null);
  }

  async function addManualStep(goal: Goal, stepTitle: string) {
    const steps = (goal.ai_steps as AiStep[] | null) ?? [];
    const updated = [...steps, { title: stepTitle.trim(), done: false }];
    setGoals(prev => prev.map(g => g.id === goal.id ? { ...g, ai_steps: updated } : g));
    await supabase.from("goals").update({ ai_steps: updated }).eq("id", goal.id);
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
                  <Target className="h-4 w-4 text-primary" />
                  {showAIDetail ? "A little more detail..." : "What do you want to achieve?"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {!showAIDetail ? (
                  <>
                    <input
                      autoFocus
                      placeholder="e.g. Launch my Etsy shop, Run a 5K, Read 12 books..."
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      className="w-full rounded-xl border border-input bg-muted/30 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <textarea
                      placeholder="Why does this matter to you? (optional)"
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
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-muted-foreground shrink-0" />
                      <input
                        type="date"
                        value={targetDate}
                        onChange={e => setTargetDate(e.target.value)}
                        min={new Date().toISOString().split("T")[0]}
                        className="rounded-xl border border-input bg-muted/30 px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-muted-foreground [&:not([value=''])]:text-foreground"
                      />
                      <span className="text-xs text-muted-foreground">Deadline (optional)</span>
                    </div>
                    <div className="pt-1 space-y-2">
                      <p className="text-xs text-muted-foreground">How do you want to build out your steps?</p>
                      <div className="flex gap-2 flex-wrap">
                        <Button
                          variant="gradient"
                          size="sm"
                          onClick={() => setShowAIDetail(true)}
                          disabled={!title.trim()}
                          className="gap-1.5"
                        >
                          <Sparkles className="h-3.5 w-3.5" />
                          Generate my steps
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={saveManual}
                          disabled={saving || !title.trim()}
                          className="gap-1.5"
                        >
                          <PenLine className="h-3.5 w-3.5" />
                          {saving ? "Saving..." : "I'll add steps myself"}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={resetForm}>Cancel</Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-xs text-muted-foreground">
                      The more context you give, the more accurate your steps will be.
                    </p>
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-muted-foreground shrink-0" />
                      <input
                        type="date"
                        value={aiDetailDeadline || targetDate}
                        onChange={e => setAiDetailDeadline(e.target.value)}
                        min={new Date().toISOString().split("T")[0]}
                        className="rounded-xl border border-input bg-muted/30 px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-muted-foreground [&:not([value=''])]:text-foreground"
                      />
                      <span className="text-xs text-muted-foreground">Deadline (if any)</span>
                    </div>
                    <textarea
                      autoFocus
                      placeholder="e.g. I have about 30 minutes a day, mostly evenings. I work full time and want to take this slowly without burning out."
                      value={aiDetail}
                      onChange={e => setAiDetail(e.target.value)}
                      rows={3}
                      className="w-full rounded-xl border border-input bg-muted/30 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                    />
                    <div className="flex gap-2">
                      <Button
                        variant="gradient"
                        size="sm"
                        onClick={saveAndGenerateSteps}
                        disabled={saving}
                        className="gap-1.5"
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        {saving ? "Generating..." : "Generate my steps"}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setShowAIDetail(false)}>Back</Button>
                    </div>
                  </>
                )}
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
            Add a goal and break it into steps — with AI or on your own. No hustle required.
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
              onBreakdown={(detail, deadline) => breakdownGoal(goal, detail, deadline)}
              onAddStep={stepTitle => addManualStep(goal, stepTitle)}
              onUpdate={updates => updateGoal(goal.id, updates)}
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
                onAddStep={() => {}}
                onUpdate={() => {}}
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
  onToggleExpand, onToggleStep, onBreakdown, onAddStep, onUpdate, onAchieve, onDelete, onPin,
}: {
  goal: Goal;
  expanded: boolean;
  loadingAI: boolean;
  onToggleExpand: () => void;
  onToggleStep: (idx: number) => void;
  onBreakdown: (detail: string, deadline: string) => void;
  onAddStep: (title: string) => void;
  onUpdate: (updates: { title?: string; why?: string | null; category?: string; time_horizon?: string; target_date?: string | null; emoji?: string }) => void;
  onAchieve: () => void;
  onDelete: () => void;
  onPin: () => void;
}) {
  const steps = (goal.ai_steps as AiStep[] | null) ?? [];
  const doneCount = steps.filter(s => s.done).length;
  const isAchieved = goal.status === "achieved";
  const progress = steps.length > 0 ? goal.progress_percent : 0;

  const [newStep, setNewStep] = useState("");
  const [showStepInput, setShowStepInput] = useState(false);
  const [showAIDetail, setShowAIDetail] = useState(false);
  const [aiDetail, setAiDetail] = useState("");
  const [aiDeadline, setAiDeadline] = useState(goal.target_date ?? "");
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(goal.title);
  const [editWhy, setEditWhy] = useState(goal.why ?? "");
  const [editCategory, setEditCategory] = useState(goal.category);
  const [editHorizon, setEditHorizon] = useState(goal.time_horizon);
  const [editDeadline, setEditDeadline] = useState(goal.target_date ?? "");

  function submitStep() {
    if (!newStep.trim()) return;
    onAddStep(newStep);
    setNewStep("");
  }

  function submitAI() {
    onBreakdown(aiDetail, aiDeadline);
    setShowAIDetail(false);
    setAiDetail("");
  }

  function saveEdit() {
    if (!editTitle.trim()) return;
    const catEmoji = CATEGORIES.find(c => c.value === editCategory)?.emoji ?? goal.emoji ?? "✨";
    onUpdate({
      title: editTitle.trim(),
      why: editWhy.trim() || null,
      category: editCategory,
      time_horizon: editHorizon,
      target_date: editDeadline || null,
      emoji: catEmoji,
    });
    setIsEditing(false);
  }

  return (
    <motion.div layout transition={{ duration: 0.2 }}>
      <Card className={cn("overflow-hidden transition-shadow hover:shadow-soft", isAchieved && "opacity-75")}>
        {/* Progress bar */}
        <div className="h-1.5 bg-muted">
          <div
            className="h-full bg-gradient-to-r from-rose-400 to-pink-500 transition-all duration-500"
            style={{ width: `${isAchieved ? 100 : progress}%` }}
          />
        </div>

        <CardContent className="p-4">
          {/* Main row */}
          <div className="flex items-start gap-3">
            <button onClick={onToggleExpand} className="flex-1 flex items-start gap-3 text-left">
              <span className="text-2xl mt-0.5 shrink-0">{goal.emoji ?? "✨"}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={cn("font-semibold", isAchieved && "line-through text-muted-foreground")}>
                    {goal.title}
                  </span>
                  {goal.is_pinned && <Pin className="h-3 w-3 text-primary shrink-0" />}
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                  <span>{HORIZONS.find(h => h.value === goal.time_horizon)?.label}</span>
                  {goal.target_date && !isAchieved && (
                    <span className={cn(
                      "flex items-center gap-1",
                      new Date(goal.target_date) < new Date() ? "text-red-400" : "text-muted-foreground"
                    )}>
                      <CalendarDays className="h-3 w-3" />
                      {new Date(goal.target_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                  )}
                  {steps.length > 0
                    ? <span>{doneCount}/{steps.length} steps · {progress}%</span>
                    : !isAchieved && <span className="text-primary/70">tap to add steps</span>
                  }
                  {isAchieved && <span className="text-purple-500 font-medium">✓ achieved</span>}
                </div>
              </div>
              <div className="mt-1 shrink-0 text-muted-foreground">
                {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </div>
            </button>

            <div className="flex items-center gap-1 shrink-0 ml-1">
              <button onClick={onPin} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-primary transition-colors">
                <Pin className="h-3.5 w-3.5" />
              </button>
              <button onClick={() => setIsEditing(v => !v)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-primary transition-colors">
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button onClick={onDelete} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-red-500 transition-colors">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Inline edit form */}
          <AnimatePresence>
            {isEditing && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="mt-3 pt-3 border-t border-border/40 space-y-2">
                  <input
                    autoFocus
                    value={editTitle}
                    onChange={e => setEditTitle(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") saveEdit(); if (e.key === "Escape") setIsEditing(false); }}
                    className="w-full rounded-xl border border-input bg-muted/30 px-3 py-2 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <textarea
                    placeholder="Why does this matter? (optional)"
                    value={editWhy}
                    onChange={e => setEditWhy(e.target.value)}
                    rows={2}
                    className="w-full rounded-xl border border-input bg-muted/30 px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                  />
                  <div className="flex gap-1.5 flex-wrap">
                    {CATEGORIES.map(c => (
                      <button key={c.value} onClick={() => setEditCategory(c.value)}
                        className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium border transition-all",
                          editCategory === c.value ? "bg-primary text-primary-foreground border-primary" : "bg-muted border-border text-muted-foreground hover:border-primary/50")}>
                        {c.emoji} {c.label}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-1.5 flex-wrap">
                    {HORIZONS.map(h => (
                      <button key={h.value} onClick={() => setEditHorizon(h.value)}
                        className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium border transition-all",
                          editHorizon === h.value ? "bg-primary text-primary-foreground border-primary" : "bg-muted border-border text-muted-foreground hover:border-primary/50")}>
                        {h.label}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-muted-foreground shrink-0" />
                    <input type="date" value={editDeadline} onChange={e => setEditDeadline(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                      className="rounded-xl border border-input bg-muted/30 px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-muted-foreground [&:not([value=''])]:text-foreground" />
                    {editDeadline && <button onClick={() => setEditDeadline("")} className="text-xs text-muted-foreground hover:text-red-400"><X className="h-3.5 w-3.5" /></button>}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="gradient" onClick={saveEdit} disabled={!editTitle.trim()} className="h-7 px-3 text-xs">Save</Button>
                    <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)} className="h-7 px-3 text-xs">Cancel</Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Expanded detail */}
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
                      &quot;{goal.why}&quot;
                    </p>
                  )}

                  {loadingAI && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground py-3">
                      <Sparkles className="h-4 w-4 animate-pulse text-primary" />
                      Building your steps...
                    </div>
                  )}

                  {/* Steps list */}
                  {steps.length > 0 && !loadingAI && (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Steps</p>
                      {steps.map((step, i) => (
                        <button
                          key={i}
                          onClick={() => onToggleStep(i)}
                          className="flex items-start gap-2.5 w-full text-left group"
                        >
                          <div className={cn(
                            "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-all",
                            step.done ? "bg-primary border-primary" : "border-border group-hover:border-primary/60"
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

                  {/* No steps — AI detail prompt or option buttons */}
                  {steps.length === 0 && !loadingAI && !isAchieved && (
                    <>
                      {showAIDetail ? (
                        <div className="space-y-2 rounded-xl bg-muted/40 border border-border/50 p-3">
                          <p className="text-xs text-muted-foreground">
                            The more context you give, the more accurate your steps will be.
                          </p>
                          <div className="flex items-center gap-2">
                            <CalendarDays className="h-4 w-4 text-muted-foreground shrink-0" />
                            <input
                              type="date"
                              value={aiDeadline}
                              onChange={e => setAiDeadline(e.target.value)}
                              min={new Date().toISOString().split("T")[0]}
                              className="rounded-xl border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-muted-foreground [&:not([value=''])]:text-foreground"
                            />
                            <span className="text-xs text-muted-foreground">Deadline (if any)</span>
                          </div>
                          <textarea
                            autoFocus
                            placeholder="e.g. I have 20 mins a day, weekday evenings only. I want to take this slowly."
                            value={aiDetail}
                            onChange={e => setAiDetail(e.target.value)}
                            rows={3}
                            className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                          />
                          <div className="flex gap-2">
                            <Button variant="gradient" size="sm" className="gap-1.5" onClick={submitAI}>
                              <Sparkles className="h-3.5 w-3.5" /> Generate my steps
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => { setShowAIDetail(false); setAiDetail(""); }}>
                              Back
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-2 flex-wrap">
                          <Button variant="soft" size="sm" className="gap-1.5" onClick={() => setShowAIDetail(true)}>
                            <Sparkles className="h-3.5 w-3.5" />
                            Generate my steps
                          </Button>
                          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setShowStepInput(true)}>
                            <PenLine className="h-3.5 w-3.5" />
                            Add steps myself
                          </Button>
                        </div>
                      )}
                    </>
                  )}

                  {/* Manual step input */}
                  {!isAchieved && (steps.length > 0 || showStepInput) && !loadingAI && (
                    <div className="flex gap-2">
                      <input
                        autoFocus={showStepInput && steps.length === 0}
                        placeholder="Add a step..."
                        value={newStep}
                        onChange={e => setNewStep(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === "Enter") submitStep();
                          if (e.key === "Escape") { setShowStepInput(false); setNewStep(""); }
                        }}
                        className="flex-1 rounded-xl border border-input bg-muted/30 px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                      <Button size="sm" variant="soft" onClick={submitStep} disabled={!newStep.trim()}>Add</Button>
                    </div>
                  )}

                  {/* Mark achieved */}
                  {!isAchieved && (
                    <div className="pt-1 border-t border-border/40 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Finished this goal?</span>
                      <Button variant="soft" size="sm" className="h-7 px-3 text-xs gap-1.5" onClick={onAchieve}>
                        <Trophy className="h-3 w-3" /> Mark achieved
                      </Button>
                    </div>
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
