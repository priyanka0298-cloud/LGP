"use client";

import React, { useState } from "react";
import { Plus, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { format } from "date-fns";
import { toast } from "sonner";
import type { Task, TaskCategory } from "@/types";
import { TASK_CATEGORY_CONFIG } from "@/types";
import { cn } from "@/lib/utils";

interface TaskQuickAddProps {
  userId: string;
  onAdded: (task: Task) => void;
}

export function TaskQuickAdd({ userId, onAdded }: TaskQuickAddProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<TaskCategory>("must_do");
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  async function handleAdd() {
    if (!title.trim()) return;
    setSaving(true);

    const { data, error } = await supabase
      .from("tasks")
      .insert({
        user_id: userId,
        title: title.trim(),
        category,
        scheduled_date: format(new Date(), "yyyy-MM-dd"),
        status: "pending",
      })
      .select()
      .single();

    setSaving(false);
    if (error) {
      toast.error("Couldn't add task. Try again?");
      return;
    }

    onAdded(data as Task);
    setTitle("");
    setOpen(false);
    toast.success("Task added! You've got this 🌸");
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleAdd();
    if (e.key === "Escape") setOpen(false);
  }

  return (
    <div className="mt-2">
      <AnimatePresence mode="wait">
        {!open ? (
          <motion.button
            key="trigger"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(true)}
            className="flex w-full items-center gap-2 rounded-xl border border-dashed border-border/60 px-3 py-2.5 text-sm text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors group"
          >
            <Plus className="h-4 w-4 group-hover:text-primary" />
            Add a task
          </motion.button>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="rounded-xl border border-primary/30 bg-muted/30 p-3 space-y-2">
              <Input
                autoFocus
                placeholder="What do you need to do?"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={handleKeyDown}
                className="border-0 bg-transparent p-0 h-auto text-sm focus-visible:ring-0 placeholder:text-muted-foreground/60"
              />

              {/* Category selector */}
              <div className="flex gap-1.5 flex-wrap">
                {(["must_do", "should_do", "if_energy"] as TaskCategory[]).map((cat) => {
                  const config = TASK_CATEGORY_CONFIG[cat];
                  return (
                    <button
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={cn(
                        "rounded-full border px-2.5 py-0.5 text-xs font-medium transition-all",
                        category === cat ? `${config.color} ${config.bgColor} border-current` : "border-border text-muted-foreground"
                      )}
                    >
                      {config.emoji} {config.label}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2"
                  onClick={() => setOpen(false)}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="gradient"
                  size="sm"
                  className="h-7"
                  onClick={handleAdd}
                  disabled={saving || !title.trim()}
                >
                  {saving ? "Adding..." : "Add task"}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
