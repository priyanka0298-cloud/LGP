"use client";

import React, { useState } from "react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import { format, parseISO, subDays } from "date-fns";
import { TrendingUp, Heart, Flame, Target, AlertTriangle, Sparkles, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const MOOD_LABELS: Record<number, { emoji: string; label: string; color: string }> = {
  1: { emoji: "😞", label: "Really rough", color: "text-red-500" },
  2: { emoji: "😕", label: "Struggling", color: "text-orange-500" },
  3: { emoji: "😐", label: "Meh", color: "text-yellow-500" },
  4: { emoji: "🙂", label: "Okay", color: "text-lime-500" },
  5: { emoji: "😊", label: "Good", color: "text-green-500" },
  6: { emoji: "😄", label: "Great", color: "text-teal-500" },
  7: { emoji: "🌟", label: "Amazing", color: "text-purple-500" },
};

interface AnalyticsViewProps {
  moods: Array<{ date: string; mood_score: number | null; energy_level: number | null; mood_label: string | null; note?: string | null }>;
  tasks: Array<{ scheduled_date: string | null; status: string; category: string }>;
  habits: Array<{ id: string; name: string; emoji: string | null; streak_current: number; streak_longest: number; total_completions: number }>;
  completions: Array<{ habit_id: string; completed_date: string }>;
}

type Tab = "trends" | "mood-log";

export function AnalyticsView({ moods, tasks, habits, completions }: AnalyticsViewProps) {
  const [tab, setTab] = useState<Tab>("trends");

  // Build 30-day chart data
  const chartData = Array.from({ length: 30 }, (_, i) => {
    const date = subDays(new Date(), 29 - i);
    const dateStr = format(date, "yyyy-MM-dd");
    const mood = moods.find((m) => m.date === dateStr);
    const dayTasks = tasks.filter((t) => t.scheduled_date === dateStr);
    const doneTasks = dayTasks.filter((t) => t.status === "done");
    const dayCompletions = completions.filter((c) => c.completed_date === dateStr);
    const habitRate = habits.length ? Math.round((dayCompletions.length / habits.length) * 100) : 0;

    return {
      date: format(date, "MMM d"),
      fullDate: dateStr,
      mood: mood?.mood_score ?? null,
      energy: mood?.energy_level ?? null,
      taskCompletion: dayTasks.length ? Math.round((doneTasks.length / dayTasks.length) * 100) : null,
      habitsCompleted: dayCompletions.length,
      habitRate,
    };
  });

  const avgMood = moods.filter((m) => m.mood_score).reduce((a, b) => a + (b.mood_score ?? 0), 0) / (moods.filter((m) => m.mood_score).length || 1);
  const avgEnergy = moods.filter((m) => m.energy_level).reduce((a, b) => a + (b.energy_level ?? 0), 0) / (moods.filter((m) => m.energy_level).length || 1);
  const totalDone = tasks.filter((t) => t.status === "done").length;
  const totalTasks = tasks.length;
  const overallCompletion = totalTasks ? Math.round((totalDone / totalTasks) * 100) : 0;
  const topStreak = Math.max(...habits.map((h) => h.streak_current), 0);

  const recentData = chartData.slice(-7);
  const lowMoodDays = recentData.filter((d) => d.mood !== null && d.mood <= 3).length;
  const lowCompletionDays = recentData.filter((d) => d.taskCompletion !== null && d.taskCompletion < 30).length;
  const burnoutRisk = lowMoodDays >= 3 && lowCompletionDays >= 3;

  // Mood log: sorted newest first
  const moodLog = moods
    .filter((m) => m.mood_score !== null)
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Your Wellness Analytics ✨</h1>
        <p className="text-sm text-muted-foreground">30-day overview — patterns without pressure</p>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 p-1 bg-muted/50 rounded-2xl w-fit">
        {[
          { id: "trends" as Tab, label: "Trends", emoji: "📊" },
          { id: "mood-log" as Tab, label: "Mood History", emoji: "💜" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium transition-all",
              tab === t.id
                ? "bg-background shadow-soft text-foreground"
                : "text-muted-foreground hover:text-foreground"
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
                    Your recent patterns suggest you might be running low on energy. That&apos;s okay — it happens. Consider scheduling some rest time this week. You don&apos;t need to earn it.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: "Avg Mood", value: `${avgMood.toFixed(1)}/7`, icon: Heart, color: "text-rose-500", bg: "from-rose-50 to-pink-50 dark:from-rose-950/30" },
              { label: "Avg Energy", value: `${avgEnergy.toFixed(1)}/5`, icon: Sparkles, color: "text-purple-500", bg: "from-purple-50 to-violet-50 dark:from-purple-950/30" },
              { label: "Task Rate", value: `${overallCompletion}%`, icon: Target, color: "text-emerald-500", bg: "from-emerald-50 to-teal-50 dark:from-emerald-950/30" },
              { label: "Top Streak", value: `${topStreak} days`, icon: Flame, color: "text-orange-500", bg: "from-orange-50 to-amber-50 dark:from-orange-950/30" },
            ].map((stat) => (
              <div key={stat.label} className={cn("rounded-2xl bg-gradient-to-br border border-border/40 p-4", stat.bg)}>
                <stat.icon className={cn("h-5 w-5 mb-2", stat.color)} />
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Mood + energy trend */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">💜 Mood & Energy — 30 Days</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} interval={6} />
                  <YAxis domain={[0, 7]} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "12px",
                      fontSize: "12px",
                    }}
                  />
                  <defs>
                    <linearGradient id="moodGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f6e" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f43f6e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="mood" stroke="#f43f6e" strokeWidth={2} fill="url(#moodGrad)" name="Mood" connectNulls />
                  <Area type="monotone" dataKey="energy" stroke="#8b5cf6" strokeWidth={2} fill="none" name="Energy" connectNulls />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Productivity chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">🎯 Task Completion — 30 Days</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={chartData.filter((d) => d.taskCompletion !== null)} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} interval={6} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} unit="%" />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "12px",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="taskCompletion" fill="#f43f6e" radius={[4, 4, 0, 0]} name="Completion %" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Habit consistency */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">🌿 Habit Consistency</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {habits.slice(0, 6).map((habit) => {
                  const habitCompletions = completions.filter((c) => c.habit_id === habit.id);
                  const rate = Math.round((habitCompletions.length / 30) * 100);
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

          {/* Gentle insights */}
          <Card className="bg-gradient-to-br from-rose-50/80 to-purple-50/80 dark:from-rose-950/20 dark:to-purple-950/20 border-border/30">
            <CardContent className="pt-5">
              <div className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-semibold">Your pattern this month</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {avgMood >= 5
                      ? "Your mood has been beautifully stable this month. Whatever you're doing — keep doing it."
                      : avgMood >= 3
                      ? "You've had a mix of good and challenging days. That's just being human. You're still here, and that counts."
                      : "It looks like you've been carrying something heavy lately. Please be extra gentle with yourself. Consistency doesn't have to happen every day."}
                    {" "}
                    {overallCompletion >= 70
                      ? `You completed ${overallCompletion}% of your tasks — that's genuinely impressive.`
                      : `You completed ${overallCompletion}% of planned tasks. Remember: the goal isn't 100%, it's sustainable.`}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {tab === "mood-log" && (
        <div className="space-y-4">
          <div className="rounded-2xl bg-gradient-to-r from-rose-50 to-purple-50 dark:from-rose-950/30 dark:to-purple-950/20 border border-border/40 p-4">
            <h2 className="font-display text-lg font-semibold mb-1">💜 Mood History</h2>
            <p className="text-sm text-muted-foreground">
              A log of how you&apos;ve been feeling. No judgment — just patterns to understand yourself better.
            </p>
          </div>

          {moodLog.length === 0 ? (
            <div className="empty-state py-12">
              <p className="text-4xl mb-3">💜</p>
              <p className="font-medium">No mood entries yet</p>
              <p className="text-sm text-muted-foreground mt-1">Start tracking from your dashboard</p>
            </div>
          ) : (
            <div className="space-y-2">
              {moodLog.map((entry) => {
                const score = entry.mood_score as number;
                const moodInfo = MOOD_LABELS[score];
                return (
                  <div
                    key={entry.date}
                    className="flex items-center gap-4 rounded-xl border border-border/50 bg-card px-4 py-3"
                  >
                    <div className="flex items-center gap-1 shrink-0">
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground w-24">
                        {format(parseISO(entry.date), "EEE, MMM d")}
                      </span>
                    </div>
                    <span className="text-xl shrink-0">{moodInfo?.emoji ?? "💜"}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={cn("text-sm font-medium", moodInfo?.color)}>{moodInfo?.label ?? entry.mood_label}</p>
                        {entry.energy_level && (
                          <span className="text-xs text-muted-foreground">· Energy {entry.energy_level}/5</span>
                        )}
                      </div>
                      {entry.note && (
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">{entry.note}</p>
                      )}
                    </div>
                    {/* Mood score bar */}
                    <div className="flex items-center gap-1 shrink-0">
                      {Array.from({ length: 7 }).map((_, i) => (
                        <div
                          key={i}
                          className={cn(
                            "h-3 w-1.5 rounded-full transition-all",
                            i < score ? "bg-primary" : "bg-muted"
                          )}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
