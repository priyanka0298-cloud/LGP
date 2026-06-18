"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Droplets, CalendarDays, TrendingUp, Plus, ChevronDown, ChevronUp, Circle, Lock,
} from "lucide-react";
import type { PeriodLog, Subscription } from "@/types";
import {
  PHASE_CONFIG, SYMPTOMS, FLOW_OPTIONS,
  getPhaseInfo, getCycleLength, formatDate, formatShortDate,
} from "./cycleUtils";

interface Props {
  logs: PeriodLog[];
  avgCycleLength: number;
  avgPeriodLength: number;
  userId: string;
  subscription: Subscription | null;
}

type LoggingStep = "idle" | "logging" | "symptoms";

const STRIPE_READY = !!(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY &&
  !process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.startsWith("pk_test_your")
);

export function CycleView({ logs: initialLogs, avgCycleLength, userId, subscription }: Props) {
  const [logs, setLogs] = useState<PeriodLog[]>(initialLogs);
  const [loggingStep, setLoggingStep] = useState<LoggingStep>("idle");
  const [selectedFlow, setSelectedFlow] = useState<string>("medium");
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const today = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(today);
  const supabase = createClient();

  const isPremium = subscription?.plan !== "free";

  const phaseInfo = getPhaseInfo(logs, avgCycleLength);
  const phase = phaseInfo?.phase;
  const config = phase ? PHASE_CONFIG[phase] : null;
  const activeCycle = logs[0] && !logs[0].end_date ? logs[0] : null;
  const calculatedAvg = getCycleLength(logs);

  async function startPeriod() {
    setSaving(true);
    const { data, error } = await supabase
      .from("period_logs")
      .insert({ user_id: userId, start_date: selectedDate, flow_intensity: selectedFlow as PeriodLog["flow_intensity"] })
      .select()
      .single();

    if (error) { toast.error("Couldn't log period. Try again?"); setSaving(false); return; }
    setLogs([data as PeriodLog, ...logs]);
    setLoggingStep("symptoms");
    setSaving(false);
    toast.success("Period logged 🌹");
  }

  async function endPeriod() {
    if (!activeCycle) return;
    setSaving(true);
    const today = new Date().toISOString().split("T")[0];
    const { data, error } = await supabase
      .from("period_logs")
      .update({ end_date: today })
      .eq("id", activeCycle.id)
      .select()
      .single();

    if (error) { toast.error("Couldn't update. Try again?"); setSaving(false); return; }
    setLogs(logs.map(l => l.id === activeCycle.id ? data as PeriodLog : l));
    setSaving(false);
    toast.success("Period ended — rest up 🌙");
  }

  async function saveSymptoms() {
    if (!logs[0]) return;
    setSaving(true);
    await supabase
      .from("period_logs")
      .update({ symptoms: selectedSymptoms, notes: notes || null })
      .eq("id", logs[0].id);

    setLogs(logs.map((l, i) => i === 0 ? { ...l, symptoms: selectedSymptoms, notes } : l));
    setLoggingStep("idle");
    setSelectedSymptoms([]);
    setNotes("");
    setSaving(false);
    toast.success("Symptoms saved 💜");
  }

  function toggleSymptom(id: string) {
    setSelectedSymptoms(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  }

  const daysUntil = phaseInfo?.daysUntilNextPeriod;
  const nextDate = phaseInfo?.nextPeriodDate;

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="font-display text-xl md:text-2xl font-bold">Cycle Tracker 🌹</h1>
        <p className="text-sm text-muted-foreground">Track your cycle, understand your body, plan with kindness.</p>
      </div>

      {/* Current Phase Card */}
      {phaseInfo && config ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn("rounded-3xl border p-6", config.bg, config.border)}
        >
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">{config.emoji}</span>
                <Badge className={cn("text-xs font-semibold", config.color, config.bg, config.border)}>
                  {config.days}
                </Badge>
              </div>
              <h2 className={cn("font-display text-xl font-bold", config.color)}>
                {config.label} Phase
              </h2>
              <p className="text-sm text-muted-foreground mt-1 max-w-md">{config.description}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-3xl font-bold">Day {phaseInfo.dayOfCycle}</p>
              <p className="text-xs text-muted-foreground">of your cycle</p>
            </div>
          </div>

          <div className="mt-4 rounded-2xl bg-white/60 dark:bg-black/20 p-4 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Planning tip</p>
            <p className="text-sm">{config.planningTip}</p>
          </div>

          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-1.5">
              <Droplets className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Energy:</span>
              <span className={cn("font-medium", config.color)}>{config.energy}</span>
            </div>
            {nextDate && (
              <div className="flex items-center gap-1.5">
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Next period:</span>
                <span className="font-medium">
                  {daysUntil != null && daysUntil > 0
                    ? `${formatShortDate(nextDate)} (${daysUntil}d)`
                    : daysUntil === 0 ? "Today" : "Overdue"}
                </span>
              </div>
            )}
            {phaseInfo.ovulationDate && (
              <div className="flex items-center gap-1.5">
                <span className="text-muted-foreground">Ovulation ~</span>
                <span className="font-medium">{formatShortDate(phaseInfo.ovulationDate)}</span>
              </div>
            )}
          </div>
        </motion.div>
      ) : (
        <div className="rounded-3xl border border-border/50 bg-card p-8 text-center">
          <div className="text-4xl mb-3">🌹</div>
          <h2 className="font-display text-lg font-bold mb-1">No cycle data yet</h2>
          <p className="text-sm text-muted-foreground">Log your first period below to see your phase and predictions.</p>
        </div>
      )}

      {/* Phase Timeline */}
      {phaseInfo && (
        <div className="rounded-2xl border border-border/50 bg-card p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">Cycle timeline</p>
          <div className="flex gap-1">
            {(["menstrual", "follicular", "ovulatory", "luteal"] as const).map((p) => {
              const cfg = PHASE_CONFIG[p];
              const isActive = p === phase;
              const widths = { menstrual: "w-[18%]", follicular: "w-[29%]", ovulatory: "w-[11%]", luteal: "w-[42%]" };
              return (
                <div key={p} className={cn("relative rounded-xl h-8 flex items-center justify-center transition-all", widths[p], isActive ? cn(cfg.bg, cfg.border, "border") : "bg-muted/50")}>
                  <span className={cn("text-[10px] font-semibold truncate px-1", isActive ? cfg.color : "text-muted-foreground")}>
                    {cfg.emoji} {cfg.label}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground mt-1 px-0.5">
            <span>Day 1</span><span>Day 6</span><span>Day 14</span><span>Day 17</span><span>Day 28</span>
          </div>
        </div>
      )}

      {/* Premium gate */}
      {!isPremium && (
        <div className="rounded-3xl border border-primary/20 bg-primary/5 p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
            <Lock className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm">Premium feature</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Cycle tracking with history, phase predictions, and backdated logging is available on the Premium plan.
            </p>
          </div>
          <div className="shrink-0">
            {STRIPE_READY ? (
              <a href="/pricing">
                <button className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90">
                  Upgrade →
                </button>
              </a>
            ) : (
              <span className="rounded-xl bg-muted px-4 py-2 text-xs font-medium text-muted-foreground cursor-default">
                Coming soon ✨
              </span>
            )}
          </div>
        </div>
      )}

      {/* Logging Section */}
      <div className="rounded-3xl border border-border/50 bg-card p-6 space-y-4">
        <h3 className="font-semibold flex items-center gap-2">
          <Droplets className="h-4 w-4 text-primary" />
          Log your cycle
          {!isPremium && <span className="ml-1 text-[10px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">Premium</span>}
        </h3>

        <AnimatePresence mode="wait">
          {loggingStep === "idle" && (
            <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
              {activeCycle ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                    Period in progress since {formatDate(activeCycle.start_date)}
                    {activeCycle.flow_intensity && <Badge variant="outline" className="capitalize">{activeCycle.flow_intensity}</Badge>}
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Button variant="outline" onClick={endPeriod} disabled={saving}>
                      Period ended today
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setLoggingStep("symptoms")}>
                      Update symptoms
                    </Button>
                  </div>
                </div>
              ) : (
                <div className={cn("space-y-4", !isPremium && "opacity-50 pointer-events-none select-none")}>
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">When did it start?</p>
                    <input
                      type="date"
                      value={selectedDate}
                      max={today}
                      min={(() => { const d = new Date(); d.setDate(d.getDate() - 30); return d.toISOString().split("T")[0]; })()}
                      onChange={e => setSelectedDate(e.target.value)}
                      className="rounded-xl border border-border bg-background px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 w-full sm:w-auto"
                    />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Flow intensity</p>
                    <div className="flex gap-2 flex-wrap">
                      {FLOW_OPTIONS.map(f => (
                        <button
                          key={f.id}
                          onClick={() => setSelectedFlow(f.id)}
                          className={cn(
                            "flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-medium transition-all",
                            selectedFlow === f.id ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/50"
                          )}
                        >
                          <span className="flex gap-0.5">
                            {Array.from({ length: f.dots }).map((_, i) => (
                              <Circle key={i} className="h-2 w-2 fill-current" />
                            ))}
                          </span>
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <Button variant="gradient" onClick={() => setLoggingStep("logging")} className="gap-2">
                    <Plus className="h-4 w-4" />
                    {selectedDate === today ? "Period started today" : `Log period from ${formatDate(selectedDate)}`}
                  </Button>
                </div>
              )}
            </motion.div>
          )}

          {loggingStep === "logging" && (
            <motion.div key="logging" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Log period starting{" "}
                <span className="font-medium text-foreground">
                  {selectedDate === today ? "today" : formatDate(selectedDate)}
                </span>{" "}
                with <span className="font-medium text-foreground capitalize">{selectedFlow}</span> flow?
              </p>
              <div className="flex gap-2">
                <Button variant="gradient" onClick={startPeriod} disabled={saving}>
                  {saving ? "Logging..." : "Yes, log it 🌹"}
                </Button>
                <Button variant="ghost" onClick={() => setLoggingStep("idle")}>Back</Button>
              </div>
            </motion.div>
          )}

          {loggingStep === "symptoms" && (
            <motion.div key="symptoms" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
              <p className="text-sm text-muted-foreground">How are you feeling? (optional)</p>
              <div className="flex flex-wrap gap-2">
                {SYMPTOMS.map(s => (
                  <button
                    key={s.id}
                    onClick={() => toggleSymptom(s.id)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-all",
                      selectedSymptoms.includes(s.id)
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:border-primary/50 text-muted-foreground"
                    )}
                  >
                    {s.emoji} {s.label}
                  </button>
                ))}
              </div>
              <Textarea
                placeholder="Any notes? (optional)"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="text-sm resize-none"
                rows={2}
              />
              <div className="flex gap-2">
                <Button variant="gradient" onClick={saveSymptoms} disabled={saving}>
                  {saving ? "Saving..." : "Save"}
                </Button>
                <Button variant="ghost" onClick={() => setLoggingStep("idle")}>Skip</Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Cycle stats */}
      {logs.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { label: "Avg cycle", value: calculatedAvg ? `${calculatedAvg} days` : `~${avgCycleLength} days`, icon: TrendingUp },
            { label: "Cycles logged", value: `${logs.length}`, icon: CalendarDays },
            { label: "Last period", value: formatDate(logs[0].start_date), icon: Droplets },
          ].map(stat => (
            <div key={stat.label} className="rounded-2xl border border-border/50 bg-card p-4">
              <stat.icon className="h-4 w-4 text-muted-foreground mb-2" />
              <p className="text-lg font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* History */}
      {logs.length > 0 && (
        <div className="rounded-3xl border border-border/50 bg-card overflow-hidden">
          <button
            onClick={() => setShowHistory(v => !v)}
            className="w-full flex items-center justify-between p-5 hover:bg-muted/30 transition-colors"
          >
            <h3 className="font-semibold">Cycle history ({logs.length})</h3>
            {showHistory ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
          </button>

          {showHistory && (
            <div className="px-5 pb-5 space-y-2">
              {logs.map((log, i) => {
                const len = log.end_date
                  ? Math.round((new Date(log.end_date).getTime() - new Date(log.start_date).getTime()) / 86400000) + 1
                  : null;
                return (
                  <div key={log.id} className="flex items-center justify-between rounded-xl bg-muted/40 px-4 py-3 text-sm">
                    <div>
                      <span className="font-medium">{formatDate(log.start_date)}</span>
                      {log.end_date && <span className="text-muted-foreground"> → {formatDate(log.end_date)}</span>}
                    </div>
                    <div className="flex items-center gap-2">
                      {len && <Badge variant="outline">{len}d</Badge>}
                      {log.flow_intensity && <Badge variant="outline" className="capitalize">{log.flow_intensity}</Badge>}
                      {!log.end_date && i === 0 && <Badge className="bg-rose-500 text-white text-[10px]">Active</Badge>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
