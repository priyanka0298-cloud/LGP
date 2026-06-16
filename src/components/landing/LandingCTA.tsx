"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LandingCTA() {
  return (
    <section className="py-24 px-6">
      <div className="mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-500 via-pink-500 to-purple-600 p-12 text-center text-white shadow-card"
        >
          {/* Decorative circles */}
          <div className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-2xl" />

          <div className="relative">
            <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
              <Sparkles className="h-7 w-7 text-white" />
            </div>

            <h2 className="font-display text-4xl font-bold mb-4 sm:text-5xl text-balance">
              Your softer, simpler life starts today
            </h2>

            <p className="text-xl text-white/80 mb-8 max-w-xl mx-auto text-balance">
              Free forever. No credit card. No hustle. Just you, your plans, and a gentle system that actually works.
            </p>

            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button
                size="xl"
                className="bg-white text-rose-600 hover:bg-white/90 font-bold w-full sm:w-auto shadow-lg"
                asChild
              >
                <Link href="/signup">
                  Start planning for free
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="xl"
                variant="ghost"
                className="text-white hover:bg-white/10 w-full sm:w-auto"
                asChild
              >
                <Link href="/pricing">View premium plans</Link>
              </Button>
            </div>

          </div>
        </motion.div>
      </div>
    </section>
  );
}
