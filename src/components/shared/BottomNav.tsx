"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, CalendarDays, BookOpen, Target,
  BarChart3, Heart, Bell, ShoppingBag, Settings,
  Sparkles, MoreHorizontal, X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const PRIMARY = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/planner", label: "Planner", icon: CalendarDays },
  { href: "/journal", label: "Journal", icon: BookOpen },
  { href: "/goals", label: "Goals", icon: Target },
];

const MORE_ITEMS = [
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/cycle", label: "Cycle", icon: Heart },
  { href: "/reminders", label: "Reminders", icon: Bell },
  { href: "/marketplace", label: "Marketplace", icon: ShoppingBag },
  { href: "/dashboard#ai-assistant", label: "AI Assistant", icon: Sparkles },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  const isMoreActive = MORE_ITEMS.some((i) => i.href !== "/dashboard#ai-assistant" && pathname.startsWith(i.href));

  return (
    <>
      {/* Backdrop */}
      {moreOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm md:hidden"
          onClick={() => setMoreOpen(false)}
        />
      )}

      {/* More sheet — slides up from above the nav bar */}
      {moreOpen && (
      <div
        className="fixed left-0 right-0 z-50 md:hidden bg-card border border-border/50 rounded-t-2xl shadow-xl animate-in slide-in-from-bottom-4 duration-200"
        style={{ bottom: "calc(4rem + env(safe-area-inset-bottom, 0px))" }}
      >
        <div className="flex items-center justify-between px-5 py-3 border-b border-border/30">
          <p className="text-sm font-semibold">Menu</p>
          <button onClick={() => setMoreOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="grid grid-cols-3 gap-1 p-3">
          {MORE_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = item.href !== "/dashboard#ai-assistant" && pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMoreOpen(false)}
                className={cn(
                  "flex flex-col items-center gap-1.5 rounded-xl px-2 py-3 text-center transition-colors",
                  active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-[11px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
      )}

      {/* Bottom bar */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 md:hidden border-t border-border/50 bg-card/90 backdrop-blur-md"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <div className="flex items-center justify-around px-2 h-16">
          {PRIMARY.map((item) => {
            const Icon = item.icon;
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors",
                  active ? "text-primary" : "text-muted-foreground"
                )}
              >
                <Icon className={cn("h-5 w-5", active && "stroke-[2.5px]")} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}

          {/* More */}
          <button
            onClick={() => setMoreOpen(!moreOpen)}
            className={cn(
              "flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors",
              isMoreActive || moreOpen ? "text-primary" : "text-muted-foreground"
            )}
          >
            <MoreHorizontal className={cn("h-5 w-5", (isMoreActive || moreOpen) && "stroke-[2.5px]")} />
            <span className="text-[10px] font-medium">Menu</span>
          </button>
        </div>
      </nav>
    </>
  );
}
