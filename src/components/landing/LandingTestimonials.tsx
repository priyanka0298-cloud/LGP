"use client";

import React from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";

const TESTIMONIALS = [
  {
    name: "Priya K.",
    role: "Software Engineer & ADHD girlie",
    avatar: "💜",
    quote: "I've tried every productivity app and they all made me feel worse about myself. Lazy Girl Planner is the first one that actually gets me. The 'if I have energy' category changed my life.",
    stars: 5,
  },
  {
    name: "Mia T.",
    role: "Student & burnout survivor",
    avatar: "🌸",
    quote: "The AI brain dump feature is insane. I dump all my anxious thoughts and it hands me back three gentle tasks. I cried the first time I used it because it felt so understanding.",
    stars: 5,
  },
  {
    name: "Jordan L.",
    role: "Freelance designer",
    avatar: "✨",
    quote: "I love that it never guilt trips me. I took a whole week off, hit the 'soft reset,' and came back to zero shame and a fresh start. That's what I needed.",
    stars: 5,
  },
  {
    name: "Alexis M.",
    role: "Mom of 2, remote worker",
    avatar: "🌿",
    quote: "The mood + productivity correlation charts helped me realize I was overcommitting every week before my period. Now I plan lighter and actually get MORE done.",
    stars: 5,
  },
  {
    name: "Samira H.",
    role: "PhD student",
    avatar: "🦋",
    quote: "I was skeptical about another planning app but the anti-hustle philosophy hooked me. The language in this app is so refreshing — 'good enough is productive too' should be on a t-shirt.",
    stars: 5,
  },
  {
    name: "Chloe R.",
    role: "Marketing manager",
    avatar: "🌙",
    quote: "The daily affirmations don't feel generic — they actually match my mood and what I'm working on. One day it said 'your worth isn't in your output' and I needed that SO much.",
    stars: 5,
  },
];

export function LandingTestimonials() {
  return (
    <section className="py-24 px-6 bg-muted/30">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <p className="text-sm font-medium text-primary mb-3">Love notes 💌</p>
          <h2 className="font-display text-4xl font-bold mb-4 sm:text-5xl">
            Real women,{" "}
            <span className="gradient-text">real results</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-xl mx-auto">
            No hustle success stories here. Just people finding their version of enough.
          </p>
        </motion.div>

        {/* Testimonials grid */}
        <div className="columns-1 gap-6 sm:columns-2 lg:columns-3 space-y-6">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="break-inside-avoid rounded-2xl bg-card border border-border/50 p-6 shadow-soft"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-3">
                {Array.from({ length: t.stars }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-sm leading-relaxed text-foreground/80 mb-4">
                &ldquo;{t.quote}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-rose-100 to-purple-100 text-lg dark:from-rose-900/40 dark:to-purple-900/40">
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
