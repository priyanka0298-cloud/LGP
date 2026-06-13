"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-background/90 backdrop-blur-md border-b border-border/50 shadow-soft"
          : "bg-transparent"
      )}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-rose-400 to-pink-500 shadow-glow">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="font-display text-lg font-semibold leading-none block">
              Lazy Girl
            </span>
            <span className="text-xs text-muted-foreground leading-none">Planner</span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 md:flex">
          {["Features", "Pricing", "Templates", "Blog"].map((item) => (
            <Link
              key={item}
              href={item === "Pricing" ? "/pricing" : `/#${item.toLowerCase()}`}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {item}
            </Link>
          ))}
        </nav>

        {/* CTA */}
        <div className="hidden items-center gap-3 md:flex">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/login">Sign in</Link>
          </Button>
          <Button size="sm" variant="gradient" asChild className="shadow-glow">
            <Link href="/signup">Start Free ✨</Link>
          </Button>
        </div>

        {/* Mobile toggle */}
        <button
          className="rounded-xl p-2 hover:bg-muted md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-t border-border/50 bg-background/95 backdrop-blur-md px-6 py-4 md:hidden"
        >
          <div className="flex flex-col gap-3">
            {["Features", "Pricing", "Templates"].map((item) => (
              <Link
                key={item}
                href={item === "Pricing" ? "/pricing" : `/#${item.toLowerCase()}`}
                className="py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                onClick={() => setMobileOpen(false)}
              >
                {item}
              </Link>
            ))}
            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" asChild>
                <Link href="/login">Sign in</Link>
              </Button>
              <Button variant="gradient" className="flex-1" asChild>
                <Link href="/signup">Start Free</Link>
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </motion.header>
  );
}
