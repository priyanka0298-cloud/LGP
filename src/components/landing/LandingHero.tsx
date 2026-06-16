"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const FLOATING_ELEMENTS = [
  { emoji: "🌸", delay: 0, x: "10%", y: "20%" },
  { emoji: "✨", delay: 0.5, x: "85%", y: "15%" },
  { emoji: "🌿", delay: 1, x: "5%", y: "65%" },
  { emoji: "💜", delay: 1.5, x: "90%", y: "60%" },
  { emoji: "🌙", delay: 0.3, x: "75%", y: "80%" },
  { emoji: "🦋", delay: 0.8, x: "15%", y: "80%" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export function LandingHero() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-gradient-hero pt-24 pb-20">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-rose-200/30 blur-3xl dark:bg-rose-900/20" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-[600px] w-[600px] rounded-full bg-purple-200/30 blur-3xl dark:bg-purple-900/20" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[400px] rounded-full bg-peach-200/20 blur-3xl dark:bg-orange-900/10" />

      {/* Floating emojis */}
      {FLOATING_ELEMENTS.map((el, i) => (
        <motion.div
          key={i}
          className="pointer-events-none absolute hidden text-2xl lg:block"
          style={{ left: el.x, top: el.y }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: 1,
            scale: 1,
            y: [0, -12, 0],
          }}
          transition={{
            opacity: { delay: el.delay + 0.8, duration: 0.5 },
            scale: { delay: el.delay + 0.8, duration: 0.5 },
            y: { delay: el.delay + 0.8, duration: 3, repeat: Infinity, ease: "easeInOut" },
          }}
        >
          {el.emoji}
        </motion.div>
      ))}

      <div className="relative mx-auto max-w-5xl px-6 text-center">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center gap-6"
        >
          {/* Badge */}
          <motion.div variants={itemVariants}>
            <Badge variant="soft" className="gap-1.5 px-4 py-1.5 text-sm font-medium rounded-full">
              <Sparkles className="h-3.5 w-3.5" />
              Anti-hustle planning for ambitious women
            </Badge>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={itemVariants}
            className="max-w-3xl text-5xl font-display font-bold leading-[1.1] tracking-tight text-balance sm:text-6xl lg:text-7xl"
          >
            Plan softly.{" "}
            <span className="gradient-text">Live fully.</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            variants={itemVariants}
            className="max-w-2xl text-xl text-muted-foreground leading-relaxed text-balance"
          >
            A digital planning sanctuary for overwhelmed, ambitious women.
            Weekly plans, habit tracking, journaling, and AI-powered
            productivity — without the guilt or hustle culture.
          </motion.p>

          {/* Values row */}
          <motion.div
            variants={itemVariants}
            className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground"
          >
            {[
              "🎯 Progress over perfection",
              "💤 Rest is productive",
              "🧠 ADHD-friendly design",
              "✨ Good enough counts",
            ].map((val) => (
              <span key={val} className="flex items-center gap-1.5 rounded-full bg-background/60 px-3 py-1.5 backdrop-blur-sm border border-border/40">
                {val}
              </span>
            ))}
          </motion.div>

          {/* CTAs */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col items-center gap-4 sm:flex-row"
          >
            <Button size="xl" variant="gradient" asChild className="shadow-glow w-full sm:w-auto">
              <Link href="/signup">
                Start for free — no credit card
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button size="xl" variant="outline" asChild className="w-full sm:w-auto bg-background/60 backdrop-blur-sm">
              <Link href="/pricing">See pricing</Link>
            </Button>
          </motion.div>


          {/* App preview */}
          <motion.div
            variants={itemVariants}
            className="relative mt-8 w-full max-w-4xl"
          >
            <div className="relative rounded-3xl border border-border/50 bg-background/80 p-2 shadow-card backdrop-blur-sm overflow-hidden">
              {/* Mock dashboard preview */}
              <div className="rounded-2xl bg-muted/30 p-6 min-h-[280px]">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {/* Today's focus card */}
                  <div className="rounded-2xl bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/30 p-4 border border-rose-100/50 dark:border-rose-900/30">
                    <p className="text-xs font-medium text-rose-600 mb-2">🎯 Today's Focus</p>
                    <p className="text-sm font-semibold mb-3">3 things, that's it</p>
                    {["Finish client proposal", "30 min walk", "Call mom"].map((task, i) => (
                      <div key={i} className="flex items-center gap-2 mb-1.5">
                        <div className={`h-3.5 w-3.5 rounded-full border-2 ${i === 0 ? "bg-rose-400 border-rose-400" : "border-muted-foreground/30"}`} />
                        <span className={`text-xs ${i === 0 ? "line-through text-muted-foreground/50" : ""}`}>{task}</span>
                      </div>
                    ))}
                  </div>

                  {/* Mood tracker */}
                  <div className="rounded-2xl bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/30 dark:to-violet-950/30 p-4 border border-purple-100/50 dark:border-purple-900/30">
                    <p className="text-xs font-medium text-purple-600 mb-2">💜 Mood Today</p>
                    <div className="flex gap-2 flex-wrap">
                      {["😞", "😔", "😐", "🙂", "😊", "😄", "🌟"].map((emoji, i) => (
                        <button
                          key={i}
                          className={`text-xl transition-transform hover:scale-110 ${i === 4 ? "scale-125" : "opacity-50"}`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">Feeling good today ✨</p>
                  </div>

                  {/* AI suggestion */}
                  <div className="rounded-2xl bg-gradient-to-br from-sky-50 to-blue-50 dark:from-sky-950/30 dark:to-blue-950/30 p-4 border border-sky-100/50 dark:border-sky-900/30">
                    <p className="text-xs font-medium text-sky-600 mb-2 flex items-center gap-1"><Sparkles className="h-3 w-3" /> AI Suggestion</p>
                    <p className="text-xs leading-relaxed text-foreground/80">
                      "Your energy is highest mid-morning. Consider tackling the client proposal first, then rewarding yourself with that walk 🌸"
                    </p>
                  </div>
                </div>

                {/* Habit tracker row */}
                <div className="mt-4 rounded-2xl bg-background/60 p-4 border border-border/30">
                  <p className="text-xs font-medium text-muted-foreground mb-3">🌿 Habits — Week 3 of 4</p>
                  <div className="flex gap-3 flex-wrap">
                    {[
                      { name: "Morning water", emoji: "💧", done: true },
                      { name: "Movement", emoji: "🧘", done: true },
                      { name: "Journal", emoji: "📔", done: false },
                      { name: "Screen limit", emoji: "📱", done: true },
                      { name: "Vitamins", emoji: "💊", done: false },
                    ].map((habit) => (
                      <div key={habit.name} className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${habit.done ? "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400" : "bg-muted text-muted-foreground"}`}>
                        {habit.emoji} {habit.name}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Glow effect under card */}
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 h-20 w-3/4 bg-rose-300/20 blur-2xl rounded-full" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
