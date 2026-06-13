"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { getPhaseInfo, PHASE_CONFIG, formatShortDate } from "@/components/cycle/cycleUtils";
import { cn } from "@/lib/utils";
import type { PeriodLog } from "@/types";

interface Props { userId: string }

export function CycleWidget({ userId }: Props) {
  const [log, setLog] = useState<PeriodLog | null | undefined>(undefined);
  const [avgCycle, setAvgCycle] = useState(28);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const [{ data: logs }, { data: profile }] = await Promise.all([
        supabase.from("period_logs").select("*").eq("user_id", userId)
          .order("start_date", { ascending: false }).limit(1),
        supabase.from("profiles").select("avg_cycle_length").eq("id", userId).single(),
      ]);
      setLog(logs?.[0] ?? null);
      if (profile?.avg_cycle_length) setAvgCycle(profile.avg_cycle_length);
    }
    load();
  }, [userId]);

  if (log === undefined) return null; // still loading

  if (!log) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Heart className="h-4 w-4 text-rose-500" /> Cycle Tracker
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground mb-3">Track your cycle for phase-aware planning.</p>
          <Button variant="outline" size="sm" className="w-full text-xs" asChild>
            <Link href="/cycle">Start tracking →</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const info = getPhaseInfo([log], avgCycle);
  if (!info) return null;
  const cfg = PHASE_CONFIG[info.phase];

  return (
    <Card className={cn("border", cfg.border)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Heart className="h-4 w-4 text-rose-500" /> Cycle Tracker
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className={cn("rounded-xl p-3", cfg.bg)}>
          <div className="flex items-center justify-between">
            <div>
              <p className={cn("text-sm font-semibold", cfg.color)}>
                {cfg.emoji} {cfg.label} Phase
              </p>
              <p className="text-xs text-muted-foreground">Day {info.dayOfCycle} of your cycle</p>
            </div>
            {info.nextPeriodDate && info.daysUntilNextPeriod != null && (
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Next period</p>
                <p className="text-xs font-medium">
                  {info.daysUntilNextPeriod > 0
                    ? `in ${info.daysUntilNextPeriod}d`
                    : info.daysUntilNextPeriod === 0 ? "today" : "overdue"}
                </p>
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{cfg.energy}</p>
        </div>
        <Button variant="ghost" size="sm" className="w-full text-xs" asChild>
          <Link href="/cycle">View cycle tracker →</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
