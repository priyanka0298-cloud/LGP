"use client";

import React from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";

const TESTIMONIALS = [
  {
    name: "Priya K.",
    role: "Software engineer",
    avatar: "💜",
    quote: "okay so I've tried like every productivity app and they all just made me feel behind. this one actually has an 'if I have energy' category and I don't know who made that decision but THANK YOU",
    stars: 5,
  },
  {
    name: "Mia T.",
    role: "Grad student",
    avatar: "🌸",
    quote: "I did the brain dump at like midnight when I was spiraling and it just... gave me three small things to do tomorrow. didn't lecture me. didn't tell me to journal more. just three things. I actually slept.",
    stars: 5,
  },
  {
    name: "Jordan L.",
    role: "Freelance creative",
    avatar: "✨",
    quote: "took a full week off, came back, hit soft reset. no guilt, no backlog shame, just a blank slate. I've never had a planning app let me do that without it feeling like I failed",
    stars: 5,
  },
  {
    name: "Alexis M.",
    role: "Mom of two",
    avatar: "🌿",
    quote: "the mood tracking finally helped me notice I crash every month around the same time. I actually plan less that week now and get way more done. it sounds backwards but it works",
    stars: 5,
  },
  {
    name: "Sam H.",
    role: "PhD candidate",
    avatar: "🦋",
    quote: "I rolled my eyes at 'anti-hustle planner' but genuinely the way this app talks to you is different. like it's not pretending productivity is the point. anyway I use it every day now so",
    stars: 5,
  },
  {
    name: "Chloe R.",
    role: "Marketing",
    avatar: "🌙",
    quote: "the affirmation one morning said something like 'rest is not the enemy of progress' and I genuinely teared up because I needed to hear it and I didn't know I needed to hear it",
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
