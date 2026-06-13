"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Area, AreaChart, Legend,
} from "recharts";
import { format, parseISO, subDays } from "date-fns";
import { TrendingUp, Heart, Flame, Target, AlertTriangle, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface AnalyticsViewProps {
  moods: Array<{ date: string; mood_score: number | null; energy_level: number | null; mood_label: string | null }>;
  tasks: Array<{ scheduled_date: string | null; status: string; category: string }>;
  habits: Array<{ id: string; name: string; emoji: string | null; streak_current: number; streak_longest: number; total_completions: number }>;
  completions: Array<{ habit_id: string; completed_date: string }>;
}

export function AnalyticsView({ moods, tasks, habits, completions }: AnalyticsViewProps) {
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

  // Stats
  const avgMood = moods.filter((m) => m.mood_score).reduce((a, b) => a + (b.mood_score ?? 0), 0) / (moods.filter((m) => m.mood_score).length || 1);
  const avgEnergy = moods.filter((m) => m.energy_level).reduce((a, b) => a + (b.energy_level ?? 0), 0) / (moods.filter((m) => m.energy_level).length || 1);
  const totalDone = tasks.filter((t) => t.status === "done").length;
  const totalTasks = tasks.length;
  const overallCompletion = totalTasks ? Math.round((totalDone / totalTasks) * 100) : 0;
  const topStreak = Math.max(...habits.map((h) => h.streak_current), 0);

  // Burnout detection: look for 5+ days of low mood + low completion
  const recentData = chartData.slice(-7);
  const lowMoodDays = recentData.filter((d) => d.mood !== null && d.mood <= 3).length;
  const lowCompletionDays = recentData.filter((d) => d.taskCompletion !== null && d.taskCompletion < 30).length;
  const burnoutRisk = lowMoodDays >= 3 && lowCompletionDays >= 3;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Your Wellness Analytics ✨</h1>
        <p className="text-sm text-muted-foreground">30-day overview — patterns without pressure</p>
      </div>

      {/* Burnout alert (gentle) */}
      {burnoutRisk && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-orange-200 bg-orange-50 dark:border-orange-800/30 dark:bg-orange-950/20 p-4"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-orange-700 dark:text-orange-400">Gentle check-in 🌿</p>
              <p className="text-sm text-orange-600/80 dark:text-orange-400/80 mt-0.5">
                Your recent patterns suggest you might be running low on energy. That's okay — it happens. Consider scheduling some rest time this week. You don't need to earn it.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Stats row */}
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
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false}
                interval={6} />
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
    </div>
  );
}
