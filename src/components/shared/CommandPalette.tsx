"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { AnimatePresence, motion } from "framer-motion";
import {
  LayoutDashboard, CalendarDays, BookOpen, BarChart3,
  ShoppingBag, Settings, Heart, Target, Bell, Sparkles,
} from "lucide-react";

const NAV = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Planner", href: "/planner", icon: CalendarDays },
  { label: "Journal", href: "/journal", icon: BookOpen },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Cycle", href: "/cycle", icon: Heart },
  { label: "Goals", href: "/goals", icon: Target },
  { label: "Reminders", href: "/reminders", icon: Bell },
  { label: "Marketplace", href: "/marketplace", icon: ShoppingBag },
  { label: "Settings", href: "/settings", icon: Settings },
  { label: "AI Assistant", href: "/dashboard#ai", icon: Sparkles },
];

export function CommandPalette({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const router = useRouter();

  function go(href: string) {
    onOpenChange(false);
    router.push(href);
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={() => onOpenChange(false)}
          />
          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -8 }}
            transition={{ duration: 0.15 }}
            className="fixed left-1/2 top-[20%] z-50 w-full max-w-md -translate-x-1/2 overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
          >
            <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground">
              <div className="flex items-center border-b px-3">
                <Sparkles className="mr-2 h-4 w-4 shrink-0 text-primary" />
                <Command.Input
                  autoFocus
                  placeholder="Where do you want to go?"
                  className="flex h-12 w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
                />
                <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] text-muted-foreground ml-2 shrink-0">
                  ESC
                </kbd>
              </div>
              <Command.List className="max-h-72 overflow-y-auto p-2">
                <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
                  Nothing found.
                </Command.Empty>
                <Command.Group heading="Navigate">
                  {NAV.map(item => (
                    <Command.Item
                      key={item.href}
                      value={item.label}
                      onSelect={() => go(item.href)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm cursor-pointer aria-selected:bg-primary/10 aria-selected:text-primary"
                    >
                      <item.icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                      {item.label}
                    </Command.Item>
                  ))}
                </Command.Group>
              </Command.List>
            </Command>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
