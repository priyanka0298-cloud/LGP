"use client";

import React, { useState } from "react";
import { format, isToday } from "date-fns";
import { Plus, MoreHorizontal, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { Task, TaskCategory } from "@/types";
import { TASK_CATEGORY_CONFIG } from "@/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface DayColumnProps {
  date: Date;
  tasks: Task[];
  userId: string;
  onTaskUpdate: (task: Task) => void;
  onTaskAdded: (task: Task) => void;
}

export function DayColumn({ date, tasks, userId, onTaskUpdate, onTaskAdded }: DayColumnProps) {
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [selectedCat, setSelectedCat] = useState<TaskCategory>("should_do");
  const supabase = createClient();
  const dateStr = format(date, "yyyy-MM-dd");
  const isCurrentDay = isToday(date);
  const doneTasks = tasks.filter((t) => t.status === "done").length;
  const isWeekend = date.getDay() === 0 || date.getDay() === 6;

  async function addTask() {
    if (!newTitle.trim()) return;
    const { data, error } = await supabase
      .from("tasks")
      .insert({
        user_id: userId,
        title: newTitle.trim(),
        category: selectedCat,
        scheduled_date: dateStr,
        status: "pending",
      })
      .select()
      .single();

    if (!error && data) {
      onTaskAdded(data as Task);
      setNewTitle("");
      setAdding(false);
      toast.success("Task added!");
    }
  }

  async function toggleTask(task: Task) {
    const newStatus = task.status === "done" ? "pending" : "done";
    const { error } = await supabase
      .from("tasks")
      .update({ status: newStatus, completed_at: newStatus === "done" ? new Date().toISOString() : null })
      .eq("id", task.id);
    if (!error) {
      onTaskUpdate({ ...task, status: newStatus as Task["status"] });
    }
  }

  return (
    <div className={cn(
      "flex flex-col rounded-2xl border border-border/50 overflow-hidden min-h-[200px]",
      isCurrentDay && "ring-2 ring-primary/30 border-primary/30",
      isWeekend && "bg-muted/20"
    )}>
      {/* Header */}
      <div className={cn(
        "px-3 py-2.5 text-center border-b border-border/30",
        isCurrentDay && "bg-primary/5"
      )}>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {format(date, "EEE")}
        </p>
        <p className={cn(
          "text-lg font-bold leading-tight",
          isCurrentDay && "text-primary"
        )}>
          {format(date, "d")}
        </p>
        {tasks.length > 0 && (
          <p className="text-[10px] text-muted-foreground">
            {doneTasks}/{tasks.length}
          </p>
        )}
      </div>

      {/* Tasks */}
      <div className="flex-1 p-2 space-y-1.5 overflow-y-auto">
        <AnimatePresence>
          {tasks.map((task) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <button
                onClick={() => toggleTask(task)}
                className={cn(
                  "w-full flex items-start gap-1.5 rounded-lg px-2 py-1.5 text-left text-xs transition-all group",
                  task.status === "done"
                    ? "opacity-50 line-through"
                    : "hover:bg-muted/60",
                  // Category color accent
                  task.category === "must_do" && "border-l-2 border-rose-400",
                  task.category === "should_do" && "border-l-2 border-purple-400",
                  task.category === "if_energy" && "border-l-2 border-sky-400",
                )}
              >
                <div className={cn(
                  "mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border transition-all",
                  task.status === "done"
                    ? "border-emerald-500 bg-emerald-500"
                    : "border-muted-foreground/40 group-hover:border-primary"
                )}>
                  {task.status === "done" && <Check className="h-2 w-2 text-white" />}
                </div>
                <span className="leading-tight line-clamp-2 flex-1">{task.emoji} {task.title}</span>
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        {tasks.length === 0 && !adding && (
          <div className="py-4 text-center">
            <p className="text-xs text-muted-foreground/50">
              {isWeekend ? "Rest day 🌿" : "Empty"}
            </p>
          </div>
        )}
      </div>

      {/* Add task */}
      <div className="p-2 border-t border-border/30">
        <AnimatePresence mode="wait">
          {adding ? (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-1.5"
            >
              <Input
                autoFocus
                placeholder="Add task..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") addTask();
                  if (e.key === "Escape") setAdding(false);
                }}
                className="h-7 text-xs px-2"
              />
              <div className="flex gap-1">
                {(["must_do", "should_do", "if_energy"] as TaskCategory[]).map((cat) => {
                  const config = TASK_CATEGORY_CONFIG[cat];
                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCat(cat)}
                      className={cn(
                        "flex-1 rounded-md py-0.5 text-[10px] font-medium transition-all border",
                        selectedCat === cat ? `${config.color} ${config.bgColor} border-current` : "border-border text-muted-foreground"
                      )}
                    >
                      {config.emoji}
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-1">
                <Button variant="gradient" size="sm" className="flex-1 h-6 text-xs" onClick={addTask}>Add</Button>
                <Button variant="ghost" size="sm" className="h-6 text-xs px-2" onClick={() => setAdding(false)}>✕</Button>
              </div>
            </motion.div>
          ) : (
            <motion.button
              key="trigger"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setAdding(true)}
              className="flex w-full items-center justify-center gap-1 rounded-lg py-1.5 text-xs text-muted-foreground hover:text-primary hover:bg-muted/50 transition-colors"
            >
              <Plus className="h-3 w-3" />
              Add
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
