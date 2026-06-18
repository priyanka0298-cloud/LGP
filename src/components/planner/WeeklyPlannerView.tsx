"use client";

import React, { useState } from "react";
import { format, addWeeks, subWeeks } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DayColumn } from "./DayColumn";
import { PlannerAIAssistant } from "./PlannerAIAssistant";
import type { Task, WeeklyPlan, Goal } from "@/types";
import { cn } from "@/lib/utils";
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

  function handleTaskDeleted(dateStr: string, taskId: string) {
    setTasksByDate((prev) => ({
      ...prev,
      [dateStr]: (prev[dateStr] ?? []).filter(t => t.id !== taskId),
    }));
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-xl md:text-2xl font-bold">Planner</h1>
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
              onTaskDeleted={(id) => handleTaskDeleted(dateStr, id)}
            />
          );
        })}
      </div>

      {/* AI Planning Assistant */}
      <PlannerAIAssistant
        tasks={Object.values(tasksByDate).flat()}
        goals={goals}
      />
    </div>
  );
}
