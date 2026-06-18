"use client";

import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { Sparkles, Flame, Target, Sun, TrendingUp, Plus, RefreshCw, Pencil, Trash2, X, Check as CheckIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { MoodTracker } from "./MoodTracker";
import { HabitList } from "./HabitList";
import { TaskQuickAdd } from "./TaskQuickAdd";
import { AIAssistantCard } from "./AIAssistantCard";
import { DailyAffirmation } from "./DailyAffirmation";
import { CycleWidget } from "./CycleWidget";
import { FoodLogCard } from "./FoodLogCard";
import type { Task, TaskCategory, Habit, Mood, Profile, Subscription, WeeklyPlan } from "@/types";
import { TASK_CATEGORY_CONFIG, MOOD_EMOJIS } from "@/types";
import { cn, getCompletionRate } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface DashboardContentProps {
  tasks: Task[];
  habits: Array<Habit & { completedToday: boolean }>;
  mood: Mood | null;
  profile: Profile | null;
  subscription: Subscription | null;
  weeklyPlan: WeeklyPlan | null;
}

type ContextFilter = "all" | "work" | "personal";

export function DashboardContent({
  tasks: initialTasks,
  habits: initialHabits,
  mood: initialMood,
  profile,
  subscription,
  weeklyPlan,
}: DashboardContentProps) {
  const [tasks, setTasks] = useState(initialTasks);
  const [habits, setHabits] = useState(initialHabits);
  const [mood, setMood] = useState(initialMood);
  const [contextFilter, setContextFilter] = useState<ContextFilter>("all");
  const supabase = createClient();
  const router = useRouter();
  const today = new Date();
  const todayStr = format(today, "yyyy-MM-dd");

  useEffect(() => {
    const uid = profile?.id;
    if (!uid) return;
    const channel = supabase
      .channel(`dashboard-tasks-${uid}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "tasks", filter: `user_id=eq.${uid}` }, (payload) => {
        const t = payload.new as Task;
        if (t.scheduled_date === todayStr) {
          setTasks((prev) => prev.find((x) => x.id === t.id) ? prev : [...prev, t]);
        }
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "tasks", filter: `user_id=eq.${uid}` }, (payload) => {
        const t = payload.new as Task;
        setTasks((prev) => {
          const exists = prev.find((x) => x.id === t.id);
          if (exists) {
            if (t.scheduled_date === todayStr) return prev.map((x) => x.id === t.id ? t : x);
            return prev.filter((x) => x.id !== t.id);
          }
          if (t.scheduled_date === todayStr) return [...prev, t];
          return prev;
        });
      })
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "tasks", filter: `user_id=eq.${uid}` }, (payload) => {
        const old = payload.old as { id?: string };
        if (old?.id) setTasks((prev) => prev.filter((x) => x.id !== old.id));
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id]);

  function getFilteredTasks() {
    if (contextFilter === "all") return tasks;
    return tasks.filter((t) => {
      const tags = (t.tags as string[] | null) ?? [];
      return tags.includes(contextFilter);
    });
  }

  const filteredTasks = getFilteredTasks();
  const mustDoTasks = filteredTasks.filter((t) => t.category === "must_do");
  const completionRate = tasks.length
    ? Math.round((tasks.filter((t) => t.status === "done").length / tasks.length) * 100)
    : 0;
  const habitCompletionRate = habits.length
    ? Math.round((habits.filter((h) => h.completedToday).length / habits.length) * 100)
    : 0;
  const streakDays = Math.max(...habits.map((h) => h.streak_current), 0);

  async function updateTask(taskId: string, updates: { title?: string; category?: TaskCategory }) {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updates } : t));
    await supabase.from("tasks").update(updates).eq("id", taskId);
  }

  async function deleteTask(taskId: string) {
    setTasks(prev => prev.filter(t => t.id !== taskId));
    await supabase.from("tasks").delete().eq("id", taskId);
  }

  async function completeTask(taskId: string) {
    const { error } = await supabase
      .from("tasks")
      .update({ status: "done", completed_at: new Date().toISOString() })
      .eq("id", taskId);

    if (!error) {
      setTasks((prev) => prev.map((t) => t.id === taskId ? { ...t, status: "done" as const } : t));
      toast.success("Task done! 🎉 You're doing great.");
      router.refresh();
    }
  }

  async function toggleHabit(habitId: string, completed: boolean) {
    if (completed) {
      const { error } = await supabase
        .from("habit_completions")
        .delete()
        .eq("habit_id", habitId)
        .eq("user_id", profile?.id ?? "")
        .eq("completed_date", todayStr);

      if (error) {
        toast.error("Couldn't update habit. Try again?");
        return;
      }
      setHabits((prev) =>
        prev.map((h) => h.id === habitId ? { ...h, completedToday: false } : h)
      );
    } else {
      const userId = profile?.id;
      if (!userId) return;

      // Check first to avoid duplicate insert
      const { data: existing } = await supabase
        .from("habit_completions")
        .select("id")
        .eq("habit_id", habitId)
        .eq("user_id", userId)
        .eq("completed_date", todayStr)
        .maybeSingle();

      if (!existing) {
        const { error } = await supabase.from("habit_completions").insert({
          habit_id: habitId,
          user_id: userId,
          completed_date: todayStr,
        });

        if (error) {
          toast.error("Couldn't log habit. Try again?");
          return;
        }
      }

      setHabits((prev) =>
        prev.map((h) => h.id === habitId ? { ...h, completedToday: true } : h)
      );
      toast.success("Habit logged! ✨ Keep it up!");
    }
  }

  return (
    <div className="space-y-6">
      {/* Header row */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-xl md:text-2xl font-bold">
            {format(today, "EEEE, MMMM d")} 🌸
          </h1>
          {weeklyPlan?.intention && (
            <p className="text-sm text-muted-foreground mt-1 italic">
              This week: &ldquo;{weeklyPlan.intention}&rdquo;
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {subscription?.plan === "free" && (
            <Badge variant="soft" className="hidden sm:flex">Free plan</Badge>
          )}
          <Button variant="soft" size="sm" className="gap-1.5" onClick={() => { setTasks([]); toast.success("Fresh start ✨ Your tasks are cleared for a gentle reset."); }}>
            <RefreshCw className="h-3.5 w-3.5" />
            Soft Reset
          </Button>
        </div>
      </div>

      {/* Daily Affirmation */}
      <DailyAffirmation mood={mood} profile={profile} />

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          {
            label: "Tasks done",
            value: `${tasks.filter((t) => t.status === "done").length}/${tasks.length}`,
            icon: Target,
            gradient: "from-rose-400 to-pink-500",
            bg: "from-rose-50 to-pink-50 dark:from-rose-950/30",
          },
          {
            label: "Habits today",
            value: `${habits.filter((h) => h.completedToday).length}/${habits.length}`,
            icon: Sun,
            gradient: "from-amber-400 to-orange-400",
            bg: "from-amber-50 to-orange-50 dark:from-amber-950/30",
          },
          {
            label: "Day streak",
            value: streakDays > 0 ? `${streakDays}🔥` : "Start one!",
            icon: Flame,
            gradient: "from-orange-400 to-red-400",
            bg: "from-orange-50 to-red-50 dark:from-orange-950/30",
          },
          {
            label: "Habit rate",
            value: `${habitCompletionRate}%`,
            icon: TrendingUp,
            gradient: "from-emerald-400 to-teal-500",
            bg: "from-emerald-50 to-teal-50 dark:from-emerald-950/30",
          },
        ].map((stat) => (
          <div key={stat.label} className={cn(
            "rounded-2xl bg-gradient-to-br border border-border/40 p-4",
            stat.bg
          )}>
            <div className={cn(
              "mb-2 inline-flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br",
              stat.gradient
            )}>
              <stat.icon className="h-4 w-4 text-white" />
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Tasks column (2/3 width) */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  🎯 Today&apos;s Focus
                  <Badge variant="soft" className="text-xs font-normal">
                    {mustDoTasks.length} must-do{mustDoTasks.length !== 1 ? "s" : ""}
                  </Badge>
                </CardTitle>
                {/* Work / Personal filter */}
                <div className="flex gap-1">
                  {(["all", "work", "personal"] as ContextFilter[]).map((f) => (
                    <button
                      key={f}
                      onClick={() => setContextFilter(f)}
                      className={cn(
                        "rounded-full px-2.5 py-0.5 text-xs font-medium transition-all capitalize",
                        contextFilter === f
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {f === "work" ? "💼 Work" : f === "personal" ? "🏠 Personal" : "All"}
                    </button>
                  ))}
                </div>
              </div>
              {tasks.length > 0 && (
                <div className="mt-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                    <span>{tasks.filter((t) => t.status === "done").length} of {tasks.length} done</span>
                    <span>{completionRate}%</span>
                  </div>
                  <Progress value={completionRate} className="h-1.5" />
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-2">
              {filteredTasks.length === 0 && tasks.length === 0 ? (
                <div className="empty-state py-8">
                  <p className="text-3xl mb-2">🌿</p>
                  <p className="text-sm font-medium">Nothing planned yet</p>
                  <p className="text-xs text-muted-foreground mt-1 mb-3">
                    Add a task below, or use the AI assistant to plan your day
                  </p>
                  <button
                    onClick={() => document.getElementById("ai-assistant")?.scrollIntoView({ behavior: "smooth" })}
                    className="text-xs text-primary hover:underline flex items-center gap-1 mx-auto"
                  >
                    <Sparkles className="h-3 w-3" /> Open AI assistant ↓
                  </button>
                </div>
              ) : filteredTasks.length === 0 ? (
                <div className="empty-state py-6">
                  <p className="text-sm text-muted-foreground">No {contextFilter} tasks today</p>
                </div>
              ) : (
                <>
                  {(["must_do", "should_do", "if_energy"] as const).map((cat) => {
                    const catTasks = filteredTasks.filter((t) => t.category === cat);
                    if (!catTasks.length) return null;
                    const config = TASK_CATEGORY_CONFIG[cat];
                    return (
                      <div key={cat} className="space-y-1.5">
                        <p className={cn("text-xs font-semibold uppercase tracking-wider", config.color)}>
                          {config.emoji} {config.label}
                        </p>
                        {catTasks.map((task) => (
                          <TaskItem
                            key={task.id}
                            task={task}
                            onComplete={() => completeTask(task.id)}
                            onUpdate={(updates) => updateTask(task.id, updates)}
                            onDelete={() => deleteTask(task.id)}
                          />
                        ))}
                      </div>
                    );
                  })}
                </>
              )}
              <TaskQuickAdd
                userId={profile?.id ?? ""}
                onAdded={(task) => {
                  setTasks((p) => [...p, task]);
                  router.refresh();
                }}
              />
            </CardContent>
          </Card>

          {/* AI Assistant */}
          <div id="ai-assistant">
            <AIAssistantCard profile={profile} tasks={tasks} mood={mood} />
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          <MoodTracker
            mood={mood}
            onMoodSaved={(newMood) => setMood(newMood)}
            userId={profile?.id ?? ""}
          />

          <HabitList
            habits={habits}
            onToggle={toggleHabit}
            onAdded={(habit) => setHabits((p) => [...p, habit])}
            onUpdated={(habit) => setHabits((p) => p.map(h => h.id === habit.id ? habit : h))}
            onDeleted={(id) => setHabits((p) => p.filter(h => h.id !== id))}
            subscription={subscription}
            userId={profile?.id ?? ""}
          />

          <FoodLogCard userId={profile?.id ?? ""} />

          {weeklyPlan && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">📅 This Week</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {weeklyPlan.theme && (
                  <p className="text-xs text-muted-foreground">Theme: <span className="font-medium text-foreground">{weeklyPlan.theme}</span></p>
                )}
                {weeklyPlan.big_three?.map((goal, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <span className="text-primary">✦</span>
                    <span>{goal}</span>
                  </div>
                ))}
                {!weeklyPlan.big_three?.length && (
                  <p className="text-xs text-muted-foreground italic">No weekly goals set yet</p>
                )}
                <Button variant="ghost" size="sm" className="w-full mt-2 text-xs" asChild>
                  <a href="/planner">View full week →</a>
                </Button>
              </CardContent>
            </Card>
          )}

          {profile?.id && <CycleWidget userId={profile.id} />}
        </div>
      </div>
    </div>
  );
}

function TaskItem({ task, onComplete, onUpdate, onDelete }: {
  task: Task;
  onComplete: () => void;
  onUpdate: (updates: { title?: string; category?: TaskCategory }) => void;
  onDelete: () => void;
}) {
  const isDone = task.status === "done";
  const tags = (task.tags as string[] | null) ?? [];
  const context = tags.includes("work") ? "💼" : tags.includes("personal") ? "🏠" : null;
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editCat, setEditCat] = useState(task.category as TaskCategory);

  function save() {
    if (!editTitle.trim()) return;
    onUpdate({ title: editTitle.trim(), category: editCat });
    setEditing(false);
  }

  if (editing) {
    return (
      <div className="rounded-xl border border-primary/20 bg-muted/30 p-3 space-y-2">
        <input
          autoFocus
          value={editTitle}
          onChange={e => setEditTitle(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") save(); if (e.key === "Escape") setEditing(false); }}
          className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <div className="flex gap-1.5 flex-wrap">
          {(["must_do", "should_do", "if_energy"] as TaskCategory[]).map(cat => {
            const config = TASK_CATEGORY_CONFIG[cat];
            return (
              <button key={cat} onClick={() => setEditCat(cat)}
                className={cn("rounded-full border px-2.5 py-0.5 text-xs font-medium transition-all",
                  editCat === cat ? `${config.color} ${config.bgColor} border-current` : "border-border text-muted-foreground")}>
                {config.emoji} {config.label}
              </button>
            );
          })}
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="gradient" onClick={save} disabled={!editTitle.trim()} className="h-7 px-3 text-xs gap-1"><CheckIcon className="h-3 w-3" /> Save</Button>
          <Button size="sm" variant="ghost" onClick={() => setEditing(false)} className="h-7 px-3 text-xs">Cancel</Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "flex items-center gap-3 rounded-xl p-3 transition-all group",
      isDone ? "opacity-50" : "hover:bg-muted/50"
    )}>
      <button
        onClick={onComplete}
        disabled={isDone}
        className={cn(
          "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all",
          isDone ? "border-primary bg-primary" : "border-muted-foreground/30 hover:border-primary group-hover:border-primary/50"
        )}
      >
        {isDone && <svg className="h-2.5 w-2.5 text-white" viewBox="0 0 8 8" fill="none"><path d="M1.5 4L3 5.5L6.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
      </button>
      <div className="flex-1 min-w-0">
        <p className={cn("text-sm font-medium truncate", isDone && "line-through text-muted-foreground")}>
          {task.emoji} {task.title}
        </p>
      </div>
      {context && <span className="text-sm shrink-0">{context}</span>}
      {!isDone && (
        <div className="flex gap-0.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
          <button onClick={() => setEditing(true)} className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-primary transition-colors">
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button onClick={onDelete} className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-red-500 transition-colors">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
