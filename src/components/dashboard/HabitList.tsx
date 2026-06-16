"use client";

import React, { useState, useRef } from "react";
import { Plus, Flame, Lock, X, Pencil, Trash2, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn, pluralize } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { Habit, Subscription } from "@/types";

interface HabitListProps {
  habits: Array<Habit & { completedToday: boolean }>;
  onToggle: (habitId: string, completed: boolean) => Promise<void>;
  onAdded?: (habit: Habit & { completedToday: boolean }) => void;
  onUpdated?: (habit: Habit & { completedToday: boolean }) => void;
  onDeleted?: (habitId: string) => void;
  subscription: Subscription | null;
  userId: string;
}

const FREE_LIMIT = 5;

const QUICK_EMOJIS = ["✨", "💧", "🏃", "📚", "🧘", "🥗", "😴", "🌿", "💪", "🎯"];

export function HabitList({ habits, onToggle, onAdded, onUpdated, onDeleted, subscription, userId }: HabitListProps) {
  const isPremium = subscription?.plan !== "free";
  const completedCount = habits.filter((h) => h.completedToday).length;
  const progress = habits.length ? (completedCount / habits.length) * 100 : 0;
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("✨");
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const canAdd = isPremium || habits.length < FREE_LIMIT;

  async function saveHabit() {
    if (!name.trim()) return;
    setSaving(true);
    const { data, error } = await supabase
      .from("habits")
      .insert({ user_id: userId, name: name.trim(), emoji, frequency: "daily", color: "#f43f5e" })
      .select()
      .single();

    if (error) { toast.error("Couldn't save habit. Try again?"); setSaving(false); return; }
    onAdded?.({ ...(data as Habit), completedToday: false });
    setName("");
    setEmoji("✨");
    setAdding(false);
    setSaving(false);
    toast.success("Habit added 🌿");
  }

  function openForm() {
    if (!canAdd) { toast.error("Upgrade to add more than 5 habits ✨"); return; }
    setAdding(true);
    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 50);
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">🌿 Habits</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              {completedCount} of {habits.length} today
            </p>
          </div>
          <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs" onClick={openForm}>
            <Plus className="h-3 w-3" />
            Add
          </Button>
        </div>
        {habits.length > 0 && (
          <Progress
            value={progress}
            className="h-1.5 mt-2"
            indicatorClassName={cn(
              progress === 100
                ? "bg-gradient-to-r from-emerald-400 to-teal-500"
                : "bg-gradient-to-r from-rose-400 to-pink-500"
            )}
          />
        )}
      </CardHeader>
      <CardContent className="space-y-2">
        {habits.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-2xl mb-1">🌱</p>
            <p className="text-sm font-medium">No habits yet</p>
            <p className="text-xs text-muted-foreground">Start with just one small thing</p>
          </div>
        ) : (
          habits.map((habit) => (
            <div key={habit.id}>
              <HabitItem
                habit={habit}
                onToggle={onToggle}
                onUpdated={onUpdated}
                onDeleted={onDeleted}
              />
            </div>
          ))
        )}

        {/* Inline add form */}
        {adding && (
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 space-y-2">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") saveHabit(); if (e.key === "Escape") setAdding(false); }}
                placeholder="Habit name..."
                className="flex-1 rounded-lg border border-border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <button onClick={() => setAdding(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_EMOJIS.map(e => (
                <button
                  key={e}
                  onClick={() => setEmoji(e)}
                  className={cn("text-lg rounded-lg p-1 transition-all", emoji === e ? "bg-primary/20 ring-1 ring-primary" : "hover:bg-muted")}
                >
                  {e}
                </button>
              ))}
            </div>
            <Button size="sm" variant="gradient" onClick={saveHabit} disabled={saving || !name.trim()} className="w-full h-8 text-xs">
              {saving ? "Saving..." : "Add habit"}
            </Button>
          </div>
        )}

        {/* Free tier limit notice */}
        {!isPremium && habits.length >= FREE_LIMIT && (
          <div className="flex items-center gap-2 rounded-xl bg-muted/50 px-3 py-2.5 text-xs text-muted-foreground">
            <Lock className="h-3.5 w-3.5 shrink-0" />
            <span>Upgrade to track unlimited habits ✨</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function HabitItem({
  habit, onToggle, onUpdated, onDeleted,
}: {
  habit: Habit & { completedToday: boolean };
  onToggle: (id: string, completed: boolean) => Promise<void>;
  onUpdated?: (h: Habit & { completedToday: boolean }) => void;
  onDeleted?: (id: string) => void;
}) {
  const [loading, setLoading] = React.useState(false);
  const [editing, setEditing] = React.useState(false);
  const [editName, setEditName] = React.useState(habit.name);
  const [editEmoji, setEditEmoji] = React.useState(habit.emoji ?? "✨");
  const supabase = createClient();

  async function handleToggle() {
    setLoading(true);
    await onToggle(habit.id, habit.completedToday);
    setLoading(false);
  }

  async function saveEdit() {
    if (!editName.trim()) return;
    await supabase.from("habits").update({ name: editName.trim(), emoji: editEmoji }).eq("id", habit.id);
    onUpdated?.({ ...habit, name: editName.trim(), emoji: editEmoji });
    setEditing(false);
  }

  async function handleDelete() {
    await supabase.from("habits").delete().eq("id", habit.id);
    onDeleted?.(habit.id);
  }

  if (editing) {
    return (
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 space-y-2">
        <div className="flex gap-2">
          <input
            autoFocus
            value={editName}
            onChange={e => setEditName(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") saveEdit(); if (e.key === "Escape") setEditing(false); }}
            className="flex-1 rounded-lg border border-border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {QUICK_EMOJIS.map(e => (
            <button key={e} onClick={() => setEditEmoji(e)}
              className={cn("text-lg rounded-lg p-1 transition-all", editEmoji === e ? "bg-primary/20 ring-1 ring-primary" : "hover:bg-muted")}>
              {e}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button onClick={saveEdit} className="flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground">
            <Check className="h-3 w-3" /> Save
          </button>
          <button onClick={() => setEditing(false)} className="rounded-lg px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground">Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 transition-all duration-200 group",
      habit.completedToday
        ? "border-emerald-200 bg-emerald-50 dark:border-emerald-900/30 dark:bg-emerald-950/20"
        : "border-border hover:border-primary/30 hover:bg-muted/50"
    )}>
      <button onClick={handleToggle} disabled={loading}
        className={cn("flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200",
          habit.completedToday ? "border-emerald-500 bg-emerald-500" : "border-muted-foreground/30 group-hover:border-primary/50")}>
        {habit.completedToday && <svg className="h-2.5 w-2.5 text-white" viewBox="0 0 8 8" fill="none"><path d="M1.5 4L3 5.5L6.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
      </button>
      <span className="text-base shrink-0">{habit.emoji ?? "✨"}</span>
      <span className={cn("flex-1 text-sm font-medium truncate text-left", habit.completedToday && "line-through text-muted-foreground")}>
        {habit.name}
      </span>
      {habit.streak_current > 1 && (
        <span className="flex items-center gap-0.5 text-xs text-orange-500 font-semibold shrink-0">
          <Flame className="h-3 w-3" />{habit.streak_current}
        </span>
      )}
      <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <button onClick={() => setEditing(true)} className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-primary transition-colors">
          <Pencil className="h-3.5 w-3.5" />
        </button>
        <button onClick={handleDelete} className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-red-500 transition-colors">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
