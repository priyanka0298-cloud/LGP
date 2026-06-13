"use client";

import React from "react";
import { motion } from "framer-motion";
import { Plus, Flame, Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn, pluralize } from "@/lib/utils";
import type { Habit, Subscription } from "@/types";

interface HabitListProps {
  habits: Array<Habit & { completedToday: boolean }>;
  onToggle: (habitId: string, completed: boolean) => Promise<void>;
  subscription: Subscription | null;
}

const FREE_LIMIT = 5;

export function HabitList({ habits, onToggle, subscription }: HabitListProps) {
  const isPremium = subscription?.plan !== "free";
  const completedCount = habits.filter((h) => h.completedToday).length;
  const progress = habits.length ? (completedCount / habits.length) * 100 : 0;

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
          <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs">
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
          habits.map((habit, i) => (
            <motion.div
              key={habit.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <HabitItem habit={habit} onToggle={onToggle} />
            </motion.div>
          ))
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
  habit,
  onToggle,
}: {
  habit: Habit & { completedToday: boolean };
  onToggle: (id: string, completed: boolean) => Promise<void>;
}) {
  const [loading, setLoading] = React.useState(false);

  async function handleToggle() {
    setLoading(true);
    await onToggle(habit.id, habit.completedToday);
    setLoading(false);
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={cn(
        "flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-all duration-200 group",
        habit.completedToday
          ? "border-emerald-200 bg-emerald-50 dark:border-emerald-900/30 dark:bg-emerald-950/20"
          : "border-border hover:border-primary/30 hover:bg-muted/50"
      )}
    >
      {/* Checkbox */}
      <div
        className={cn(
          "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200",
          habit.completedToday
            ? "border-emerald-500 bg-emerald-500"
            : "border-muted-foreground/30 group-hover:border-primary/50"
        )}
      >
        {habit.completedToday && (
          <svg className="h-2.5 w-2.5 text-white" viewBox="0 0 8 8" fill="none">
            <path d="M1.5 4L3 5.5L6.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>

      {/* Emoji + name */}
      <span className="text-base shrink-0">{habit.emoji ?? "✨"}</span>
      <span className={cn(
        "flex-1 text-sm font-medium truncate",
        habit.completedToday && "line-through text-muted-foreground"
      )}>
        {habit.name}
      </span>

      {/* Streak */}
      {habit.streak_current > 1 && (
        <span className="flex items-center gap-0.5 text-xs text-orange-500 font-semibold shrink-0">
          <Flame className="h-3 w-3" />
          {habit.streak_current}
        </span>
      )}
    </button>
  );
}
