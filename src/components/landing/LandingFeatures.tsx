"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  CalendarDays, Brain, Sparkles, Heart, BarChart3,
  ShoppingBag, Target, BookOpen, Flame, RefreshCw,
} from "lucide-react";

const FEATURES = [
  {
    icon: CalendarDays,
    title: "Weekly Planner",
    description: "Plan your week with the Softlivi method: Must Do, Should Do, and If I Have Energy — finally, a system that respects your limits.",
    gradient: "from-rose-400 to-pink-500",
    bg: "from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/20",
  },
  {
    icon: Heart,
    title: "Habit Tracker",
    description: "Track 5 keystone habits (free) or unlimited (premium). No shame streaks — a missed day just means tomorrow is fresh start.",
    gradient: "from-purple-400 to-violet-500",
    bg: "from-purple-50 to-violet-50 dark:from-purple-950/30 dark:to-violet-950/20",
  },
  {
    icon: Brain,
    title: "AI Planner Assistant",
    description: "Dump your brain, get back an organized, realistic plan. Our AI uses compassionate, ADHD-aware prompting to help you actually get things done.",
    gradient: "from-sky-400 to-blue-500",
    bg: "from-sky-50 to-blue-50 dark:from-sky-950/30 dark:to-blue-950/20",
    badge: "Most loved",
  },
  {
    icon: BookOpen,
    title: "Journal & Reflection",
    description: "Daily pages and weekly Sunday Resets with prompts like 'what drained me?' and 'what actually mattered this week?' Free write when you just need to let it out.",
    gradient: "from-emerald-400 to-teal-500",
    bg: "from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/20",
  },
  {
    icon: Target,
    title: "Goal Setting",
    description: "Set goals with your 'why' front and center. AI breaks them into steps so tiny they're impossible to procrastinate on.",
    gradient: "from-orange-400 to-peach-500",
    bg: "from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/20",
  },
  {
    icon: BarChart3,
    title: "Mood Analytics",
    description: "See how your mood correlates with productivity, spot burnout before it hits, and celebrate your consistency without the pressure.",
    gradient: "from-pink-400 to-rose-500",
    bg: "from-pink-50 to-rose-50 dark:from-pink-950/30 dark:to-rose-950/20",
  },
  {
    icon: Sparkles,
    title: "Daily Affirmations",
    description: "Context-aware, genuinely meaningful affirmations — not cheesy platitudes. Your AI-generated morning message that actually resonates.",
    gradient: "from-amber-400 to-yellow-500",
    bg: "from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/20",
  },
  {
    icon: RefreshCw,
    title: "Soft Reset",
    description: "Bad week? Use the Soft Reset to clear your task list and start fresh — no judgment, no guilt. A blank slate whenever you need one.",
    gradient: "from-cyan-400 to-sky-500",
    bg: "from-cyan-50 to-sky-50 dark:from-cyan-950/30 dark:to-sky-950/20",
  },
  {
    icon: ShoppingBag,
    title: "Template Marketplace",
    description: "Download gorgeous digital planner templates — weekly resets, goal journals, habit kits — many completely free.",
    gradient: "from-rose-400 to-purple-500",
    bg: "from-rose-50 to-purple-50 dark:from-rose-950/20 dark:to-purple-950/20",
  },
];

export function LandingFeatures() {
  return (
    <section id="features" className="py-24 px-6">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <p className="text-sm font-medium text-primary mb-3">Everything you need ✨</p>
          <h2 className="font-display text-4xl font-bold mb-4 sm:text-5xl">
            Built for the way{" "}
            <span className="gradient-text">you actually work</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
            Not the way productivity gurus say you should. Real features for real women who are doing their best.
          </p>
        </motion.div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.07 }}
              className={`relative rounded-2xl bg-gradient-to-br ${feature.bg} border border-border/40 p-6 overflow-hidden group hover:shadow-soft transition-shadow duration-300`}
            >
              {feature.badge && (
                <span className="absolute top-4 right-4 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                  {feature.badge}
                </span>
              )}
              <div className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.gradient} shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="h-5 w-5 text-white" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Callout banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-12 rounded-3xl bg-gradient-to-r from-rose-100 via-purple-50 to-sky-100 dark:from-rose-950/40 dark:via-purple-950/20 dark:to-sky-950/30 p-8 text-center border border-border/30"
        >
          <Flame className="mx-auto mb-3 h-8 w-8 text-rose-500" />
          <h3 className="font-display text-2xl font-bold mb-2">
            "Progress over perfection, always."
          </h3>
          <p className="text-muted-foreground max-w-lg mx-auto">
            This app is built on one core belief: you don't have to be perfectly productive to deserve rest, celebration, and joy. Small steps still count.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
