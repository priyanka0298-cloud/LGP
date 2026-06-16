"use client";

import React, { useState } from "react";
import { format, parseISO, subDays, startOfWeek, addDays, isToday, isFuture } from "date-fns";
import { Heart, Flame, Target, AlertTriangle, Sparkles, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TASK_CATEGORY_CONFIG } from "@/types";

const MOOD_META: Record<number, { emoji: string; label: string; bg: string; ring: string }> = {
  1: { emoji: "😞", label: "Really rough", bg: "bg-red-100 dark:bg-red-950/60",    ring: "ring-red-300 dark:ring-red-700" },
  2: { emoji: "😕", label: "Struggling",   bg: "bg-orange-100 dark:bg-orange-950/60", ring: "ring-orange-300 dark:ring-orange-700" },
  3: { emoji: "😐", label: "Meh",          bg: "bg-yellow-100 dark:bg-yellow-950/60", ring: "ring-yellow-300 dark:ring-yellow-600" },
  4: { emoji: "🙂", label: "Okay",         bg: "bg-lime-100 dark:bg-lime-950/60",   ring: "ring-lime-300 dark:ring-lime-600" },
  5: { emoji: "😊", label: "Good",         bg: "bg-green-100 dark:bg-green-950/60", ring: "ring-green-300 dark:ring-green-600" },
  6: { emoji: "😄", label: "Great",        bg: "bg-teal-100 dark:bg-teal-950/60",   ring: "ring-teal-300 dark:ring-teal-600" },
  7: { emoji: "🌟", label: "Amazing",      bg: "bg-violet-100 dark:bg-violet-950/60", ring: "ring-violet-300 dark:ring-violet-600" },
};

const ENERGY_COLOR = [
  "",
  "bg-sky-200 dark:bg-sky-800",
  "bg-sky-300 dark:bg-sky-700",
  "bg-sky-400 dark:bg-sky-600",
  "bg-sky-500",
  "bg-sky-600",
];

function taskDotColor(count: number) {
  if (count === 0) return "bg-muted";
  if (count === 1) return "bg-emerald-200 dark:bg-emerald-800";
  if (count <= 3) return "bg-emerald-400 dark:bg-emerald-600";
  return "bg-emerald-600 dark:bg-emerald-400";
}

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface AnalyticsViewProps {
  moods: Array<{ date: string; mood_score: number | null; energy_level: number | null; mood_label: string | null; note?: string | null }>;
  tasks: Array<{ scheduled_date: string | null; status: string; category: string; title?: string | null; emoji?: string | null; completed_at?: string | null }>;
  habits: Array<{ id: string; name: string; emoji: string | null; streak_current: number; streak_longest: number; total_completions: number }>;
  completions: Array<{ habit_id: string; completed_date: string }>;
}

type Tab = "trends" | "mood-log";

export function AnalyticsView({ moods, tasks, habits, completions }: AnalyticsViewProps) {
  const [tab, setTab] = useState<Tab>("trends");
  const [hoveredDay, setHoveredDay] = useState<string | null>(null);

  // Build a 5-week grid (35 cells) starting from Monday of ~5 weeks ago
  const gridStart = startOfWeek(subDays(new Date(), 34), { weekStartsOn: 1 });
  const gridDays = Array.from({ length: 35 }, (_, i) => addDays(gridStart, i));

  // Index mood & task data by date string
  const moodByDate: Record<string, typeof moods[0]> = {};
  moods.forEach((m) => { moodByDate[m.date] = m; });

  const tasksByDate: Record<string, typeof tasks> = {};
  tasks.forEach((t) => {
    if (!t.scheduled_date) return;
    tasksByDate[t.scheduled_date] ??= [];
    tasksByDate[t.scheduled_date].push(t);
  });

  // Stats
  const moodsWithScore = moods.filter((m) => m.mood_score);
  const avgMood = moodsWithScore.length
    ? moodsWithScore.reduce((a, b) => a + (b.mood_score ?? 0), 0) / moodsWithScore.length
    : 0;
  const moodsWithEnergy = moods.filter((m) => m.energy_level);
  const avgEnergy = moodsWithEnergy.length
    ? moodsWithEnergy.reduce((a, b) => a + (b.energy_level ?? 0), 0) / moodsWithEnergy.length
    : 0;
  const doneTasks = tasks.filter((t) => t.status === "done");
  const overallCompletion = tasks.length ? Math.round((doneTasks.length / tasks.length) * 100) : 0;
  const topStreak = Math.max(...habits.map((h) => h.streak_current), 0);

  // Burnout check — last 7 days
  const recent7 = Array.from({ length: 7 }, (_, i) => format(subDays(new Date(), i), "yyyy-MM-dd"));
  const lowMoodDays = recent7.filter((d) => { const m = moodByDate[d]; return m && (m.mood_score ?? 10) <= 3; }).length;
  const lowTaskDays = recent7.filter((d) => {
    const day = tasksByDate[d] ?? [];
    return day.length > 0 && day.filter((t) => t.status === "done").length / day.length < 0.3;
  }).length;
  const burnoutRisk = lowMoodDays >= 3 && lowTaskDays >= 3;

  // Category stats
  const catStats = (["must_do", "should_do", "if_energy"] as const).map((cat) => {
    const catTasks = tasks.filter((t) => t.category === cat);
    const catDone = catTasks.filter((t) => t.status === "done");
    return { cat, total: catTasks.length, done: catDone.length };
  });

  // Completed tasks sorted newest first
  const recentDone = doneTasks
    .filter((t) => t.scheduled_date)
    .slice()
    .sort((a, b) => (b.scheduled_date ?? "").localeCompare(a.scheduled_date ?? ""))
    .slice(0, 20);

  // Group completed tasks by date
  const doneByDate: Record<string, typeof doneTasks> = {};
  recentDone.forEach((t) => {
    const d = t.scheduled_date!;
    doneByDate[d] ??= [];
    doneByDate[d].push(t);
  });
  const doneDates = Object.keys(doneByDate).sort((a, b) => b.localeCompare(a));

  // Mood log sorted newest first
  const moodLog = moodsWithScore.slice().sort((a, b) => b.date.localeCompare(a.date));

  const hovered = hoveredDay ? moodByDate[hoveredDay] : null;
  const hoveredTasks = hoveredDay ? (tasksByDate[hoveredDay] ?? []) : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Your Wellness Analytics ✨</h1>
        <p className="text-sm text-muted-foreground">35-day overview — patterns without pressure</p>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 p-1 bg-muted/50 rounded-2xl w-fit">
        {([
          { id: "trends" as Tab, label: "Trends", emoji: "📊" },
          { id: "mood-log" as Tab, label: "Mood History", emoji: "💜" },
        ] as const).map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium transition-all",
              tab === t.id ? "bg-background shadow-soft text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t.emoji} {t.label}
          </button>
        ))}
      </div>

      {tab === "trends" && (
        <>
          {burnoutRisk && (
            <div className="rounded-2xl border border-orange-200 bg-orange-50 dark:border-orange-800/30 dark:bg-orange-950/20 p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-orange-700 dark:text-orange-400">Gentle check-in 🌿</p>
                  <p className="text-sm text-orange-600/80 dark:text-orange-400/80 mt-0.5">
                    Your recent patterns suggest you might be running low. That&apos;s okay — rest is not a reward, it&apos;s a requirement.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: "Avg Mood", value: avgMood ? `${avgMood.toFixed(1)}/7` : "—", icon: Heart, color: "text-rose-500", bg: "from-rose-50 to-pink-50 dark:from-rose-950/30" },
              { label: "Avg Energy", value: avgEnergy ? `${avgEnergy.toFixed(1)}/5` : "—", icon: Sparkles, color: "text-purple-500", bg: "from-purple-50 to-violet-50 dark:from-purple-950/30" },
              { label: "Task Rate", value: `${overallCompletion}%`, icon: Target, color: "text-emerald-500", bg: "from-emerald-50 to-teal-50 dark:from-emerald-950/30" },
              { label: "Top Streak", value: topStreak ? `${topStreak} days` : "—", icon: Flame, color: "text-orange-500", bg: "from-orange-50 to-amber-50 dark:from-orange-950/30" },
            ].map((stat) => (
              <div key={stat.label} className={cn("rounded-2xl bg-gradient-to-br border border-border/40 p-4", stat.bg)}>
                <stat.icon className={cn("h-5 w-5 mb-2", stat.color)} />
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Mood + Energy calendar */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">💜 How you&apos;ve been feeling</CardTitle>
              <p className="text-xs text-muted-foreground">Tap any day to peek at the details</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Day-of-week headers */}
              <div className="grid grid-cols-7 gap-1">
                {DAY_LABELS.map((d) => (
                  <p key={d} className="text-center text-xs text-muted-foreground font-medium">{d}</p>
                ))}
              </div>

              {/* Mood grid — energy shown as a bar at the bottom of each cell */}
              <div className="grid grid-cols-7 gap-1">
                {gridDays.map((day) => {
                  const dateStr = format(day, "yyyy-MM-dd");
                  const mood = moodByDate[dateStr];
                  const score = mood?.mood_score ?? null;
                  const energy = mood?.energy_level ?? null;
                  const meta = score ? MOOD_META[score] : null;
                  const future = isFuture(day) && !isToday(day);
                  const isHovered = hoveredDay === dateStr;

                  return (
                    <button
                      key={dateStr}
                      onMouseEnter={() => !future && setHoveredDay(dateStr)}
                      onMouseLeave={() => setHoveredDay(null)}
                      onClick={() => setHoveredDay(isHovered ? null : dateStr)}
                      disabled={future}
                      title={format(day, "MMM d")}
                      className={cn(
                        "relative rounded-xl flex flex-col items-center justify-center pt-1.5 pb-1 gap-0.5 transition-all overflow-hidden",
                        "aspect-square",
                        future && "opacity-20 cursor-default",
                        !future && !meta && "bg-muted/50 hover:bg-muted",
                        meta && meta.bg,
                        isHovered && "ring-2 scale-110",
                        isHovered && meta && meta.ring,
                        isToday(day) && !meta && "ring-2 ring-primary/50"
                      )}
                    >
                      <span className="text-base leading-none">{meta ? meta.emoji : (isToday(day) ? "·" : "")}</span>
                      {/* Energy bar at the bottom */}
                      {energy && (
                        <div className="absolute bottom-0 left-0 h-1 bg-sky-400/70 dark:bg-sky-400/50 rounded-b-xl transition-all"
                          style={{ width: `${(energy / 5) * 100}%` }} />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Hover tooltip */}
              {hoveredDay && (
                <div className="rounded-xl bg-muted/40 px-4 py-3 space-y-1">
                  <p className="text-sm font-semibold">{format(parseISO(hoveredDay), "EEEE, MMMM d")}</p>
                  {hovered?.mood_score ? (
                    <>
                      <p className="text-sm">
                        {MOOD_META[hovered.mood_score].emoji} {MOOD_META[hovered.mood_score].label}
                        {hovered.energy_level && <span className="text-muted-foreground ml-2">· Energy {hovered.energy_level}/5</span>}
                      </p>
                      {hovered.note && <p className="text-xs text-muted-foreground italic">&ldquo;{hovered.note}&rdquo;</p>}
                    </>
                  ) : (
                    <p className="text-xs text-muted-foreground">No mood logged</p>
                  )}
                  {hoveredTasks.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {hoveredTasks.filter((t) => t.status === "done").length}/{hoveredTasks.length} tasks done
                    </p>
                  )}
                </div>
              )}

              {/* Mood legend */}
              <div className="flex flex-wrap gap-x-3 gap-y-1.5 pt-1">
                {Object.entries(MOOD_META).map(([score, meta]) => (
                  <div key={score} className="flex items-center gap-1">
                    <span className="text-sm">{meta.emoji}</span>
                    <span className="text-xs text-muted-foreground">{meta.label}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">⚡ The blue bar at the bottom of each cell shows your energy level that day</p>
            </CardContent>
          </Card>

          {/* Task activity */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">✅ What you&apos;ve been getting done</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Contribution heatmap */}
              <div>
                <div className="grid grid-cols-7 gap-1 mb-1">
                  {DAY_LABELS.map((d) => (
                    <p key={d} className="text-center text-xs text-muted-foreground font-medium">{d}</p>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {gridDays.map((day) => {
                    const dateStr = format(day, "yyyy-MM-dd");
                    const dayTasks = tasksByDate[dateStr] ?? [];
                    const doneCount = dayTasks.filter((t) => t.status === "done").length;
                    const future = isFuture(day) && !isToday(day);
                    return (
                      <div
                        key={dateStr}
                        title={dayTasks.length ? `${format(day, "MMM d")}: ${doneCount}/${dayTasks.length} done` : format(day, "MMM d")}
                        className={cn(
                          "aspect-square rounded-xl flex items-center justify-center text-xs font-bold transition-all",
                          future ? "opacity-20" : taskDotColor(doneCount),
                          doneCount > 0 && "text-white"
                        )}
                      >
                        {!future && doneCount > 0 ? doneCount : ""}
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <p className="text-xs text-muted-foreground">0</p>
                  {["bg-muted", "bg-emerald-200 dark:bg-emerald-800", "bg-emerald-400 dark:bg-emerald-600", "bg-emerald-600 dark:bg-emerald-400"].map((c, i) => (
                    <div key={i} className={cn("h-2.5 w-5 rounded-full", c)} />
                  ))}
                  <p className="text-xs text-muted-foreground">4+ tasks</p>
                </div>
              </div>

              {/* Category breakdown */}
              {tasks.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">By priority</p>
                  {catStats.map(({ cat, total, done }) => {
                    const config = TASK_CATEGORY_CONFIG[cat];
                    const rate = total ? Math.round((done / total) * 100) : 0;
                    return (
                      <div key={cat} className="flex items-center gap-3">
                        <span className="text-sm w-4">{config.emoji}</span>
                        <span className="text-xs text-muted-foreground w-20 shrink-0">{config.label}</span>
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={cn("h-full rounded-full transition-all duration-700", config.bgColor)}
                            style={{ width: `${rate}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground w-16 text-right shrink-0">{done}/{total} done</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Completed tasks log */}
              {doneDates.length > 0 && (
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Recent completions</p>
                  {doneDates.map((date) => (
                    <div key={date}>
                      <p className="text-xs font-medium text-muted-foreground mb-1.5">
                        {format(parseISO(date), "EEE, MMM d")}
                      </p>
                      <div className="space-y-1">
                        {doneByDate[date].map((task, i) => (
                          <div key={i} className="flex items-center gap-2 rounded-xl bg-muted/30 px-3 py-2">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                            <span className="text-xs">{task.emoji} {task.title ?? "Task"}</span>
                            <span className={cn("text-xs ml-auto shrink-0", TASK_CATEGORY_CONFIG[task.category as keyof typeof TASK_CATEGORY_CONFIG]?.color)}>
                              {TASK_CATEGORY_CONFIG[task.category as keyof typeof TASK_CATEGORY_CONFIG]?.emoji}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {doneTasks.length === 0 && (
                <div className="empty-state py-6">
                  <p className="text-2xl mb-2">🌱</p>
                  <p className="text-sm text-muted-foreground">No completed tasks yet — you&apos;re just getting started</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Habit consistency */}
          {habits.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">🌿 Habit Consistency</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {habits.slice(0, 6).map((habit) => {
                    const habitCompletions = completions.filter((c) => c.habit_id === habit.id);
                    const rate = Math.round((habitCompletions.length / 35) * 100);
                    return (
                      <div key={habit.id} className="flex items-center gap-3">
                        <span className="w-6 text-center">{habit.emoji ?? "✨"}</span>
                        <span className="text-sm font-medium w-32 truncate">{habit.name}</span>
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all duration-700"
                            style={{ width: `${rate}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground w-10 text-right">{rate}%</span>
                        {habit.streak_current > 0 && (
                          <span className="text-xs text-orange-500 font-semibold w-12 text-right">
                            🔥 {habit.streak_current}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Gentle insights */}
          <Card className="bg-gradient-to-br from-rose-50/80 to-purple-50/80 dark:from-rose-950/20 dark:to-purple-950/20 border-border/30">
            <CardContent className="pt-5">
              <div className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-semibold">Your pattern this month</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {avgMood >= 5
                      ? "Your mood has been beautifully stable. Whatever you're doing — keep doing it."
                      : avgMood >= 3
                      ? "You've had a mix of good and challenging days. That's just being human. You're still here, and that counts."
                      : avgMood > 0
                      ? "It looks like you've been carrying something heavy lately. Please be extra gentle with yourself."
                      : "Start logging your mood daily — even just an emoji. You'll start to see your own patterns."}{" "}
                    {tasks.length > 0 && (overallCompletion >= 70
                      ? `You completed ${overallCompletion}% of your tasks — that's genuinely impressive.`
                      : `You completed ${overallCompletion}% of planned tasks. The goal isn't 100%, it's sustainable.`)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {tab === "mood-log" && (
        <div className="space-y-3">
          {moodLog.length === 0 ? (
            <div className="empty-state py-12">
              <p className="text-4xl mb-3">💜</p>
              <p className="font-medium">No mood entries yet</p>
              <p className="text-sm text-muted-foreground mt-1">Start tracking from your dashboard</p>
            </div>
          ) : (
            moodLog.map((entry) => {
              const score = entry.mood_score as number;
              const meta = MOOD_META[score];
              return (
                <div
                  key={entry.date}
                  className={cn("rounded-2xl border border-border/40 px-4 py-3 space-y-2", meta?.bg)}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{meta?.emoji ?? "💜"}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold">{meta?.label ?? entry.mood_label}</p>
                        <p className="text-xs text-muted-foreground">{format(parseISO(entry.date), "EEE, MMMM d")}</p>
                      </div>
                      {entry.energy_level && (
                        <div className="flex items-center gap-1.5 mt-1">
                          <p className="text-xs text-muted-foreground">Energy</p>
                          <div className="flex gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <div
                                key={i}
                                className={cn(
                                  "h-2 w-4 rounded-full",
                                  i < (entry.energy_level ?? 0) ? ENERGY_COLOR[entry.energy_level ?? 0] : "bg-muted"
                                )}
                              />
                            ))}
                          </div>
                          <p className="text-xs text-muted-foreground">{entry.energy_level}/5</p>
                        </div>
                      )}
                    </div>
                    {/* Score bars */}
                    <div className="flex items-end gap-0.5 shrink-0">
                      {Array.from({ length: 7 }).map((_, i) => (
                        <div
                          key={i}
                          className={cn(
                            "w-1.5 rounded-full transition-all",
                            i < score ? "bg-current opacity-70" : "bg-muted"
                          )}
                          style={{ height: `${(i + 1) * 4}px` }}
                        />
                      ))}
                    </div>
                  </div>
                  {entry.note && (
                    <p className="text-xs text-muted-foreground/80 italic pl-9">&ldquo;{entry.note}&rdquo;</p>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
