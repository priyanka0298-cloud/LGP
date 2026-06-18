"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  CalendarDays,
  BookOpen,
  BarChart3,
  ShoppingBag,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Heart,
  Target,
  Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  badge?: string;
  gradient?: string;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, gradient: "from-rose-400 to-pink-500" },
  { href: "/planner", label: "Planner", icon: CalendarDays, gradient: "from-purple-400 to-violet-500" },
  { href: "/journal", label: "Journal", icon: BookOpen, gradient: "from-sky-400 to-blue-500" },
  { href: "/analytics", label: "Analytics", icon: BarChart3, gradient: "from-emerald-400 to-teal-500" },
  { href: "/goals", label: "Goals", icon: Target, gradient: "from-amber-400 to-orange-500" },
  { href: "/reminders", label: "Reminders", icon: Bell, gradient: "from-violet-400 to-purple-500" },
  { href: "/marketplace", label: "Marketplace", icon: ShoppingBag, gradient: "from-orange-400 to-amber-500", badge: "New" },
  { href: "/cycle", label: "Cycle", icon: Heart, gradient: "from-pink-400 to-rose-500" },
];

const BOTTOM_ITEMS: NavItem[] = [];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const touchStartX = useRef<number | null>(null);

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 40) setCollapsed(true);
    if (diff < -40) setCollapsed(false);
    touchStartX.current = null;
  }

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <aside
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className={cn(
        "relative flex h-screen flex-col border-r border-border/50 bg-card/80 backdrop-blur-sm",
        "transition-[width] duration-200 ease-out overflow-hidden",
        collapsed ? "w-[72px]" : "w-60"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-border/50 px-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-rose-400 to-pink-500 shadow-glow">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <span
          className={cn(
            "overflow-hidden whitespace-nowrap font-display text-sm font-semibold leading-tight",
            "transition-all duration-200 ease-out",
            collapsed ? "max-w-0 opacity-0" : "max-w-xs opacity-100"
          )}
        >
          Softlivi
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
        {NAV_ITEMS.map((item) => (
          <NavLink key={item.href} item={item} collapsed={collapsed} active={pathname.startsWith(item.href)} />
        ))}

        <div className="my-2 border-t border-border/30" />
        <NavLink
          item={{ href: "/dashboard#ai-assistant", label: "AI Assistant", icon: Sparkles, gradient: "from-rose-400 to-purple-500" }}
          collapsed={collapsed}
          active={false}
        />
      </nav>

      {/* Bottom */}
      <div className="border-t border-border/50 p-3 space-y-1">
        {BOTTOM_ITEMS.map((item) => (
          <NavLink key={item.href} item={item} collapsed={collapsed} active={pathname.startsWith(item.href)} />
        ))}
        <button
          onClick={handleSignOut}
          className={cn(
            "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
            collapsed && "justify-center px-0"
          )}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <span className={cn(
            "overflow-hidden whitespace-nowrap transition-all duration-200 ease-out",
            collapsed ? "max-w-0 opacity-0" : "max-w-xs opacity-100"
          )}>
            Sign Out
          </span>
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-card shadow-soft transition-all hover:bg-muted"
      >
        {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </button>
    </aside>
  );
}

function NavLink({ item, collapsed, active }: { item: NavItem; collapsed: boolean; active: boolean }) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      className={cn(
        "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-150",
        active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted/80 hover:text-foreground",
        collapsed && "justify-center px-0"
      )}
    >
      {active && (
        <motion.div
          layoutId="nav-active"
          className="absolute inset-0 rounded-xl bg-primary/10"
          transition={{ type: "spring", duration: 0.3 }}
        />
      )}
      <div className={cn(
        "relative flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
        active ? `bg-gradient-to-br ${item.gradient} shadow-sm` : "bg-muted group-hover:bg-muted-foreground/10"
      )}>
        <Icon className={cn("h-4 w-4", active ? "text-white" : "")} />
      </div>

      <span className={cn(
        "overflow-hidden whitespace-nowrap transition-all duration-200 ease-out",
        collapsed ? "max-w-0 opacity-0" : "max-w-xs opacity-100"
      )}>
        {item.label}
        {item.badge && (
          <span className="ml-2 inline-flex items-center rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
            {item.badge}
          </span>
        )}
      </span>

      {/* Tooltip when collapsed */}
      {collapsed && (
        <div className="pointer-events-none absolute left-full ml-2 whitespace-nowrap rounded-lg bg-foreground px-2 py-1 text-xs text-background opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
          {item.label}
        </div>
      )}
    </Link>
  );
}
