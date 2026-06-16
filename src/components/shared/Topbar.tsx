"use client";

import React, { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { Sun, Moon, Bell, Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { getDayGreeting } from "@/lib/utils";
import { CommandPalette } from "./CommandPalette";
import type { Profile } from "@/types";

interface TopbarProps {
  profile: Profile | null;
}

export function Topbar({ profile }: TopbarProps) {
  const { theme, setTheme } = useTheme();
  const [cmdOpen, setCmdOpen] = useState(false);
  const router = useRouter();
  const greeting = getDayGreeting();
  const displayName = profile?.display_name ?? profile?.full_name ?? "you";

  // Cmd+K / Ctrl+K shortcut
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCmdOpen(prev => !prev);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border/50 bg-background/80 backdrop-blur-md px-6">
        {/* Greeting */}
        <div className="flex flex-col">
          <p className="text-sm text-muted-foreground">{greeting},</p>
          <p className="font-semibold leading-tight capitalize">{displayName} ✨</p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Search — opens command palette */}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-xl"
            aria-label="Search"
            onClick={() => setCmdOpen(true)}
          >
            <Search className="h-4 w-4" />
          </Button>

          {/* Notifications — goes to Reminders */}
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl" aria-label="Reminders" onClick={() => router.push("/reminders")}>
            <Bell className="h-4 w-4" />
          </Button>

          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-xl"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-xl p-0">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={profile?.avatar_url ?? ""} alt={displayName} />
                  <AvatarFallback className="bg-gradient-to-br from-rose-400 to-purple-500 text-white text-xs font-semibold">
                    {displayName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2">
              <div className="px-2 py-1.5">
                <p className="font-medium text-sm">{displayName}</p>
                <p className="text-xs text-muted-foreground truncate">{profile?.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild className="rounded-xl cursor-pointer">
                <Link href="/settings">Profile Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="rounded-xl cursor-pointer">
                <Link href="/settings#subscription">
                  <Sparkles className="mr-2 h-4 w-4 text-rose-500" />
                  Upgrade to Premium
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="rounded-xl cursor-pointer">
                <Link href="/contact">Contact Us</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="rounded-xl cursor-pointer text-muted-foreground" asChild>
                <Link href="/" onClick={async () => {
                  const { createClient } = await import("@/lib/supabase/client");
                  await createClient().auth.signOut();
                  window.location.href = "/";
                }}>
                  Sign Out
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <CommandPalette open={cmdOpen} onOpenChange={setCmdOpen} />
    </>
  );
}
