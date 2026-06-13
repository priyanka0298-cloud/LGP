"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { format, addWeeks, subWeeks, isToday } from "date-fns";
import { ChevronLeft, ChevronRight, Sparkles, Plus, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { DayColumn } from "./DayColumn";
import type { Task, WeeklyPlan, Goal } from "@/types";
import { TASK_CATEGORY_CONFIG } from "@/types";
import { cn, formatDate } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface WeeklyPlannerViewProps {
  userId: string;
  weekStart: Date;
  weekEnd: Date;
  tasksByDate: Record<string, Task[]>;
  weeklyPlan: WeeklyPlan | null;
  goals: Goal[];
}

export function WeeklyPlannerView({
  userId,
  weekStart: initialWeekStart,
  weekEnd: initialWeekEnd,
  tasksByDate: initialTasksByDate,
  weeklyPlan,
  goals,
}: WeeklyPlannerViewProps) {
  const [weekStart, setWeekStart] = useState(initialWeekStart);
  const [weekEnd, setWeekEnd] = useState(initialWeekEnd);
  const [tasksByDate, setTasksByDate] = useState(initialTasksByDate);
  const [intention, setIntention] = useState(weeklyPlan?.intention ?? "");
  const [theme, setTheme] = useState(weeklyPlan?.theme ?? "");
  const [editingMeta, setEditingMeta] = useState(false);
  const supabase = createClient();

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  const totalTasks = Object.values(tasksByDate).flat().length;
  const doneTasks = Object.values(tasksByDate).flat().filter((t) => t.status === "done").length;

  function handleTaskUpdate(dateStr: string, updated: Task) {
    setTasksByDate((prev) => ({
      ...prev,
      [dateStr]: prev[dateStr].map((t) => t.id === updated.id ? updated : t),
    }));
  }

  function handleTaskAdded(dateStr: string, task: Task) {
    setTasksByDate((prev) => ({
      ...prev,
      [dateStr]: [...(prev[dateStr] ?? []), task],
    }));
  }

  async function saveMeta() {
    const weekStartStr = format(weekStart, "yyyy-MM-dd");
    const weekEndStr = format(weekEnd, "yyyy-MM-dd");
    await supabase.from("weekly_plans").upsert({
      user_id: userId,
      week_start: weekStartStr,
      week_end: weekEndStr,
      intention: intention || null,
      theme: theme || null,
    }, { onConflict: "user_id,week_start" });
    setEditingMeta(false);
    toast.success("Week intention saved 🌸");
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">Weekly Planner</h1>
          <p className="text-sm text-muted-foreground">
            {format(weekStart, "MMM d")} – {format(weekEnd, "MMM d, yyyy")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl"
            onClick={() => { setWeekStart(subWeeks(weekStart, 1)); setWeekEnd(subWeeks(weekEnd, 1)); }}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" className="rounded-xl"
            onClick={() => { setWeekStart(initialWeekStart); setWeekEnd(initialWeekEnd); }}>
            This week
          </Button>
          <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl"
            onClick={() => { setWeekStart(addWeeks(weekStart, 1)); setWeekEnd(addWeeks(weekEnd, 1)); }}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Week meta */}
      <div className="rounded-2xl bg-gradient-to-r from-rose-50 to-purple-50 dark:from-rose-950/30 dark:to-purple-950/20 border border-border/40 p-4">
        {editingMeta ? (
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              placeholder="Weekly theme (e.g. 'Slow down')"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="text-sm"
            />
            <Input
              placeholder="Intention / mantra for the week"
              value={intention}
              onChange={(e) => setIntention(e.target.value)}
              className="text-sm"
            />
            <Button variant="gradient" size="sm" onClick={saveMeta}>Save</Button>
            <Button variant="ghost" size="sm" onClick={() => setEditingMeta(false)}>Cancel</Button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div>
              {theme && <p className="text-sm font-semibold">Week of: {theme}</p>}
              {intention ? (
                <p className="text-sm text-muted-foreground italic">&ldquo;{intention}&rdquo;</p>
              ) : (
                <p className="text-sm text-muted-foreground">Set a weekly intention to guide your week</p>
              )}
            </div>
            <Button variant="ghost" size="sm" onClick={() => setEditingMeta(true)} className="text-xs">
              {intention ? "Edit" : "+ Add intention"}
            </Button>
          </div>
        )}
      </div>

      {/* Progress bar */}
      {totalTasks > 0 && (
        <div className="flex items-center gap-3 text-sm">
          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-rose-400 to-pink-500 transition-all duration-500"
              style={{ width: `${(doneTasks / totalTasks) * 100}%` }}
            />
          </div>
          <span className="text-muted-foreground text-xs shrink-0">{doneTasks}/{totalTasks} done</span>
        </div>
      )}

      {/* Day columns */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
        {weekDays.map((day) => {
          const dateStr = format(day, "yyyy-MM-dd");
          return (
            <DayColumn
              key={dateStr}
              date={day}
              tasks={tasksByDate[dateStr] ?? []}
              userId={userId}
              onTaskUpdate={(t) => handleTaskUpdate(dateStr, t)}
              onTaskAdded={(t) => handleTaskAdded(dateStr, t)}
            />
          );
        })}
      </div>

      {/* AI suggestion */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Sparkles className="h-4 w-4 text-primary" />
            AI Weekly Planning Assistant
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">
            Let AI help you plan a realistic, gentle week based on your goals and energy.
          </p>
          <Button variant="soft" size="sm" className="gap-1.5">
            <Sparkles className="h-3.5 w-3.5" />
            Generate gentle week plan
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
