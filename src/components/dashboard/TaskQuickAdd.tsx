"use client";

import React, { useState } from "react";
import { Plus, X } from "lucide-react";
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

type Context = "work" | "personal" | null;

const CONTEXT_OPTIONS: { value: Context; emoji: string; label: string }[] = [
  { value: "work", emoji: "💼", label: "Work" },
  { value: "personal", emoji: "🏠", label: "Personal" },
];

export function TaskQuickAdd({ userId, onAdded }: TaskQuickAddProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<TaskCategory>("must_do");
  const [context, setContext] = useState<Context>(null);
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  async function handleAdd() {
    if (!title.trim()) return;
    setSaving(true);

    const tags: string[] = [];
    if (context) tags.push(context);

    const { data, error } = await supabase
      .from("tasks")
      .insert({
        user_id: userId,
        title: title.trim(),
        category,
        tags: tags.length ? tags : undefined,
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
    setContext(null);
    setOpen(false);
    toast.success("Task added! You've got this 🌸");
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleAdd();
    if (e.key === "Escape") setOpen(false);
  }

  if (!open) {
    return (
      <div className="mt-2">
        <button
          onClick={() => setOpen(true)}
          className="flex w-full items-center gap-2 rounded-xl border border-dashed border-border/60 px-3 py-2.5 text-sm text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors group"
        >
          <Plus className="h-4 w-4 group-hover:text-primary" />
          Add a task
        </button>
      </div>
    );
  }

  return (
    <div className="mt-2">
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

        {/* Work / personal context */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground mr-1">Context:</span>
          {CONTEXT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setContext(context === opt.value ? null : opt.value)}
              className={cn(
                "rounded-full border px-2.5 py-0.5 text-xs font-medium transition-all",
                context === opt.value
                  ? "bg-primary/10 text-primary border-primary/40"
                  : "border-border text-muted-foreground hover:border-primary/30"
              )}
            >
              {opt.emoji} {opt.label}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => setOpen(false)}>
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
    </div>
  );
}
