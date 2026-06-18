"use client";

import React, { useState } from "react";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  User, Bell, Palette, CreditCard, Shield, LogOut,
  Sparkles, ExternalLink, Check, RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { cn, formatDate } from "@/lib/utils";
import type { Profile, Subscription, AccentColor } from "@/types";

const profileSchema = z.object({
  full_name: z.string().min(1, "Name is required"),
  display_name: z.string().optional(),
  pronouns: z.string().optional(),
  bio: z.string().max(200, "Bio must be under 200 characters").optional(),
  timezone: z.string().optional(),
});

type ProfileForm = z.infer<typeof profileSchema>;

const ACCENT_COLORS: Array<{ id: AccentColor; label: string; class: string }> = [
  { id: "rose", label: "Rose", class: "bg-rose-400" },
  { id: "lavender", label: "Lavender", class: "bg-purple-400" },
  { id: "peach", label: "Peach", class: "bg-orange-300" },
  { id: "sage", label: "Sage", class: "bg-emerald-400" },
  { id: "sky", label: "Sky", class: "bg-sky-400" },
];

const THEMES: Array<{ id: "light" | "dark" | "auto"; label: string; emoji: string }> = [
  { id: "light", label: "Light", emoji: "☀️" },
  { id: "dark", label: "Dark", emoji: "🌙" },
  { id: "auto", label: "System", emoji: "💻" },
];

type Section = "profile" | "appearance" | "notifications" | "subscription" | "privacy";

function formatTime(time: string) {
  const [h] = time.split(":").map(Number);
  if (h === 0) return "12:00 AM";
  if (h < 12) return `${h}:00 AM`;
  if (h === 12) return "12:00 PM";
  return `${h - 12}:00 PM`;
}

const stripeReady = !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY &&
  !process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.startsWith("pk_test_your-");

export function SettingsView({
  profile,
  subscription,
}: {
  profile: Profile | null;
  subscription: Subscription | null;
}) {
  const [activeSection, setActiveSection] = useState<Section>("profile");
  const [selectedColor, setSelectedColor] = useState<AccentColor>(profile?.accent_color ?? "rose");
  const [reminderEnabled, setReminderEnabled] = useState(profile?.daily_reminder_enabled ?? false);
  const [reminderTime, setReminderTime] = useState(profile?.daily_reminder_time ?? "08:00");
  const [reminderFrequency, setReminderFrequency] = useState<"daily" | "weekly">(profile?.reminder_frequency ?? "weekly");
  const [savingNotifications, setSavingNotifications] = useState(false);
  const isPremium = subscription?.plan !== "free";

  function applyAccentColor(color: AccentColor) {
    setSelectedColor(color);
    document.documentElement.setAttribute("data-accent", color);
  }
  const [selectedTheme, setSelectedTheme] = useState<"light" | "dark" | "auto">(profile?.theme ?? "light");
  const [portalLoading, setPortalLoading] = useState(false);
  const { setTheme } = useTheme();
  const supabase = createClient();

  function applyTheme(t: "light" | "dark" | "auto") {
    setSelectedTheme(t);
    const nextThemesValue = t === "auto" ? "system" : t;
    setTheme(nextThemesValue);
    // Also apply directly so the change is immediate regardless of React batch timing
    const resolved = t === "auto"
      ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
      : t;
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(resolved);
    try { localStorage.setItem("theme", nextThemesValue); } catch {}
  }

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: profile?.full_name ?? "",
      display_name: profile?.display_name ?? "",
      pronouns: profile?.pronouns ?? "",
      bio: profile?.bio ?? "",
      timezone: profile?.timezone ?? "America/New_York",
    },
  });

  async function onProfileSave(data: ProfileForm) {
    const { error } = await supabase
      .from("profiles")
      .update(data)
      .eq("id", profile!.id);

    if (error) {
      toast.error("Couldn't save profile. Try again?");
    } else {
      toast.success("Profile saved ✨");
    }
  }

  async function saveAppearance() {
    const { error } = await supabase
      .from("profiles")
      .update({ accent_color: selectedColor, theme: selectedTheme })
      .eq("id", profile!.id);

    if (error) {
      toast.error("Couldn't save appearance. Try again?");
    } else {
      toast.success("Appearance saved 🎨");
    }
  }

  async function saveNotifications() {
    setSavingNotifications(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        daily_reminder_enabled: reminderEnabled,
        daily_reminder_time: reminderTime,
        reminder_frequency: isPremium ? reminderFrequency : "weekly",
      })
      .eq("id", profile!.id);
    setSavingNotifications(false);
    if (error) toast.error("Couldn't save notification settings.");
    else if (!reminderEnabled) toast.success("Check-in notifications turned off.");
    else if (reminderFrequency === "weekly") toast.success("Weekly check-in set for Mondays 🌿");
    else toast.success(`Daily check-in set for ${formatTime(reminderTime)} 🌸`);
  }

  const [exportLoading, setExportLoading] = useState(false);

  async function downloadMyData() {
    if (!profile) return;
    setExportLoading(true);
    try {
      const [{ data: journal }, { data: goals }, { data: tasks }] = await Promise.all([
        supabase.from("journal_entries").select("*").eq("user_id", profile.id).order("entry_date", { ascending: false }),
        supabase.from("goals").select("*").eq("user_id", profile.id),
        supabase.from("tasks").select("*").eq("user_id", profile.id),
      ]);
      const blob = new Blob(
        [JSON.stringify({ exported_at: new Date().toISOString(), profile, journal: journal ?? [], goals: goals ?? [], tasks: tasks ?? [] }, null, 2)],
        { type: "application/json" }
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `softlivi-data-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Your data has been downloaded 🌿");
    } catch {
      toast.error("Couldn't export data. Try again?");
    }
    setExportLoading(false);
  }

  async function openBillingPortal() {
    setPortalLoading(true);
    const res = await fetch("/api/stripe/portal", { method: "POST" });
    const { url } = await res.json();
    if (url) window.location.href = url;
    setPortalLoading(false);
  }

  const SECTIONS = [
    { id: "profile" as Section, label: "Profile", icon: User },
    { id: "appearance" as Section, label: "Appearance", icon: Palette },
    { id: "notifications" as Section, label: "Notifications", icon: Bell },
    { id: "subscription" as Section, label: "Subscription", icon: CreditCard },
    { id: "privacy" as Section, label: "Privacy", icon: Shield },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-xl md:text-2xl font-bold">Settings ⚙️</h1>
        <p className="text-sm text-muted-foreground">Customize your planning experience</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        {/* Sidebar nav */}
        <div className="space-y-1">
          {SECTIONS.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all text-left",
                activeSection === section.id
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <section.icon className="h-4 w-4 shrink-0" />
              {section.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="md:col-span-3">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Profile */}
            {activeSection === "profile" && (
              <Card>
                <CardHeader>
                  <CardTitle>Profile</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit(onProfileSave)} className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label htmlFor="full_name">Full name</Label>
                        <Input id="full_name" {...register("full_name")} />
                        {errors.full_name && <p className="text-xs text-destructive">{errors.full_name.message}</p>}
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="display_name">Display name <span className="text-muted-foreground font-normal">(optional)</span></Label>
                        <Input id="display_name" placeholder="Nickname in the app" {...register("display_name")} />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="pronouns">Pronouns <span className="text-muted-foreground font-normal">(optional)</span></Label>
                        <Input id="pronouns" placeholder="e.g. she/her" {...register("pronouns")} />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="timezone">Timezone</Label>
                        <Input id="timezone" {...register("timezone")} />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="bio">Bio <span className="text-muted-foreground font-normal">(optional, max 200 chars)</span></Label>
                      <Input id="bio" placeholder="A little about yourself..." {...register("bio")} />
                    </div>
                    <Button type="submit" variant="gradient" disabled={isSubmitting}>
                      {isSubmitting ? "Saving..." : "Save profile"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Appearance */}
            {activeSection === "appearance" && (
              <Card>
                <CardHeader>
                  <CardTitle>Appearance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label className="mb-3 block">Theme</Label>
                    <div className="flex gap-2">
                      {THEMES.map((theme) => (
                        <button
                          key={theme.id}
                          onClick={() => applyTheme(theme.id)}
                          className={cn(
                            "flex flex-1 flex-col items-center gap-1.5 rounded-xl border-2 p-3 transition-all",
                            selectedTheme === theme.id ? "border-primary" : "border-border hover:border-primary/50"
                          )}
                        >
                          <span className="text-xl">{theme.emoji}</span>
                          <span className="text-xs font-medium">{theme.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <Label className="mb-3 block">Accent color</Label>
                    <div className="flex gap-3">
                      {ACCENT_COLORS.map((color) => (
                        <button
                          key={color.id}
                          onClick={() => applyAccentColor(color.id)}
                          className="flex flex-col items-center gap-1.5"
                        >
                          <div className={cn(
                            "h-10 w-10 rounded-full transition-all",
                            color.class,
                            selectedColor === color.id ? "ring-4 ring-offset-2 ring-offset-background scale-110" : "hover:scale-110"
                          )} />
                          <span className="text-xs">{color.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <Button variant="gradient" onClick={saveAppearance}>Save appearance</Button>
                </CardContent>
              </Card>
            )}

            {/* Subscription */}
            {activeSection === "subscription" && (
              <Card>
                <CardHeader>
                  <CardTitle>Subscription</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between rounded-2xl bg-muted/40 p-4">
                    <div>
                      <p className="font-semibold capitalize">{subscription?.plan ?? "Free"} Plan</p>
                      <p className="text-sm text-muted-foreground capitalize">{subscription?.status ?? "Active"}</p>
                      {subscription?.current_period_end && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Renews {formatDate(subscription.current_period_end)}
                        </p>
                      )}
                    </div>
                    <Badge variant={subscription?.plan !== "free" ? "default" : "outline"} className="capitalize">
                      {(subscription?.plan ?? "free").replace("_", " ")}
                    </Badge>
                  </div>

                  {subscription?.plan === "free" ? (
                    <div className="rounded-2xl bg-gradient-to-br from-rose-50 to-purple-50 dark:from-rose-950/30 dark:to-purple-950/20 border border-border/40 p-4">
                      <p className="font-semibold mb-1 flex items-center gap-1.5">
                        <Sparkles className="h-4 w-4 text-primary" />
                        Upgrade to Premium
                      </p>
                      <p className="text-sm text-muted-foreground mb-3">
                        Unlimited AI features, analytics, cycle tracking, and more. 7-day free trial.
                      </p>
                      <Button variant="gradient" asChild>
                        <a href="/pricing">See plans →</a>
                      </Button>
                    </div>
                  ) : stripeReady ? (
                    <Button
                      variant="outline"
                      className="gap-2"
                      onClick={openBillingPortal}
                      disabled={portalLoading}
                    >
                      <ExternalLink className="h-4 w-4" />
                      {portalLoading ? "Loading..." : "Manage billing"}
                    </Button>
                  ) : null}
                </CardContent>
              </Card>
            )}

            {/* Notifications */}
            {activeSection === "notifications" && (
              <Card>
                <CardHeader>
                  <CardTitle>Notifications</CardTitle>
                  <p className="text-sm text-muted-foreground">Get a gentle email to check in with your planner.</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Enable toggle */}
                  <div className="flex items-center justify-between rounded-xl border border-border p-4">
                    <div>
                      <p className="text-sm font-medium">Check-in emails</p>
                      <p className="text-xs text-muted-foreground mt-0.5">A soft nudge to open your planner</p>
                    </div>
                    <button
                      role="switch"
                      aria-checked={reminderEnabled}
                      onClick={() => setReminderEnabled(!reminderEnabled)}
                      className={cn(
                        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200",
                        reminderEnabled ? "bg-primary" : "bg-muted"
                      )}
                    >
                      <span className={cn(
                        "pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg transition-transform duration-200",
                        reminderEnabled ? "translate-x-5" : "translate-x-0"
                      )} />
                    </button>
                  </div>

                  {reminderEnabled && (
                    <div className="space-y-4">
                      {/* Frequency selector */}
                      <div className="space-y-2">
                        <Label>How often?</Label>
                        <div className="grid grid-cols-2 gap-3">
                          {/* Weekly — free */}
                          <button
                            onClick={() => setReminderFrequency("weekly")}
                            className={cn(
                              "rounded-xl border p-3 text-left transition-all",
                              reminderFrequency === "weekly"
                                ? "border-primary bg-primary/5"
                                : "border-border hover:border-primary/40"
                            )}
                          >
                            <p className="text-sm font-medium">🌿 Weekly</p>
                            <p className="text-xs text-muted-foreground mt-0.5">Every Monday morning</p>
                          </button>

                          {/* Daily — premium */}
                          <button
                            onClick={() => isPremium && setReminderFrequency("daily")}
                            className={cn(
                              "rounded-xl border p-3 text-left transition-all relative",
                              !isPremium && "opacity-60 cursor-not-allowed",
                              isPremium && reminderFrequency === "daily"
                                ? "border-primary bg-primary/5"
                                : "border-border",
                              isPremium && reminderFrequency !== "daily" && "hover:border-primary/40"
                            )}
                          >
                            <p className="text-sm font-medium">🌸 Daily</p>
                            <p className="text-xs text-muted-foreground mt-0.5">At your chosen time</p>
                            {!isPremium && (
                              <span className="absolute top-2 right-2 text-[10px] font-semibold bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                                Premium
                              </span>
                            )}
                          </button>
                        </div>
                        {!isPremium && (
                          <p className="text-xs text-muted-foreground">
                            Upgrade to Premium to get daily check-ins at your chosen time ✨
                          </p>
                        )}
                      </div>

                      {/* Time picker — daily + premium only */}
                      {isPremium && reminderFrequency === "daily" && (
                        <div className="space-y-2">
                          <Label htmlFor="reminder-time">What time?</Label>
                          <select
                            id="reminder-time"
                            value={reminderTime}
                            onChange={e => setReminderTime(e.target.value)}
                            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                          >
                            {Array.from({ length: 18 }, (_, i) => i + 5).map(hour => {
                              const val = `${String(hour).padStart(2, "0")}:00`;
                              const label = hour < 12 ? `${hour}:00 AM` : hour === 12 ? "12:00 PM" : `${hour - 12}:00 PM`;
                              return <option key={val} value={val}>{label}</option>;
                            })}
                          </select>
                          <p className="text-xs text-muted-foreground">Timezone: {profile?.timezone ?? "America/New_York"}</p>
                        </div>
                      )}
                    </div>
                  )}

                  <Button onClick={saveNotifications} disabled={savingNotifications} className="gap-2">
                    {savingNotifications ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                    Save notification settings
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Privacy */}
            {activeSection === "privacy" && (
              <Card>
                <CardHeader>
                  <CardTitle>Privacy & Data</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Your journal entries and personal data are private by default. We never sell your data.
                  </p>
                  <Button variant="outline" className="gap-2" onClick={downloadMyData} disabled={exportLoading}>
                    <Shield className="h-4 w-4" />
                    {exportLoading ? "Exporting..." : "Download my data"}
                  </Button>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
