"use client";

import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { Plus, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

interface FoodEntry {
  id: string;
  time: string;
  meal: string;
  what: string;
}

const MEAL_TYPES = ["Breakfast", "Lunch", "Dinner", "Snack", "Other"];

export function FoodLogCard({ userId }: { userId: string }) {
  const [foodLog, setFoodLog] = useState<FoodEntry[]>([]);
  const [water, setWater] = useState(0);
  const [entryId, setEntryId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [foodTime, setFoodTime] = useState(format(new Date(), "HH:mm"));
  const [foodMeal, setFoodMeal] = useState("Breakfast");
  const [foodWhat, setFoodWhat] = useState("");
  const [saving, setSaving] = useState(false);
  const supabase = createClient();
  const today = format(new Date(), "yyyy-MM-dd");

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("journal_entries")
        .select("id, content")
        .eq("user_id", userId)
        .eq("entry_date", today)
        .eq("entry_type", "food_log")
        .maybeSingle();

      if (data) {
        setEntryId(data.id as string);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const c = data.content as any;
        setFoodLog(c?.entries ?? []);
        setWater(c?.water ?? 0);
      }
      setLoading(false);
    }
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  async function persist(entries: FoodEntry[], waterCount: number) {
    setSaving(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payload = { entries, water: waterCount } as any;

    if (entryId) {
      await supabase.from("journal_entries").update({ content: payload }).eq("id", entryId);
    } else {
      const { data } = await supabase
        .from("journal_entries")
        .insert({ user_id: userId, entry_date: today, entry_type: "food_log", content: payload })
        .select("id")
        .single();
      if (data) setEntryId(data.id as string);
    }
    setSaving(false);
  }

  async function setWaterCount(n: number) {
    const next = water === n ? 0 : n; // clicking the same glass toggles it off
    setWater(next);
    await persist(foodLog, next);
  }

  async function addEntry() {
    if (!foodWhat.trim()) return;
    const entry: FoodEntry = { id: Date.now().toString(), time: foodTime, meal: foodMeal, what: foodWhat.trim() };
    const updated = [...foodLog, entry];
    setFoodLog(updated);
    setFoodWhat("");
    await persist(updated, water);
  }

  async function removeEntry(id: string) {
    const updated = foodLog.filter((e) => e.id !== id);
    setFoodLog(updated);
    await persist(updated, water);
  }

  if (loading) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">🌿 Daily Intake</CardTitle>
        <p className="text-xs text-muted-foreground">No suggestions, no judgments — just logging</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Water tracker */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground mb-2">💧 Water</p>
          <div className="flex gap-1 flex-wrap">
            {Array.from({ length: 8 }).map((_, i) => (
              <button
                key={i}
                onClick={() => setWaterCount(i + 1)}
                className={cn(
                  "h-7 w-7 rounded-full text-xs font-medium transition-all",
                  water > i
                    ? "bg-sky-400 text-white"
                    : "bg-muted text-muted-foreground hover:bg-sky-100 dark:hover:bg-sky-900/30"
                )}
              >
                {i + 1}
              </button>
            ))}
          </div>
          {water > 0 && (
            <p className="text-xs text-muted-foreground mt-1.5">{water} of 8 glasses 🎉</p>
          )}
        </div>

        <div className="border-t border-border/40" />

        {/* Food log */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground mb-2">🥗 Food</p>

          {foodLog.length > 0 && (
            <div className="space-y-1.5 mb-3">
              {foodLog
                .slice()
                .sort((a, b) => a.time.localeCompare(b.time))
                .map((entry) => (
                  <div key={entry.id} className="flex items-center gap-2 rounded-xl bg-muted/30 px-3 py-2">
                    <span className="text-xs text-muted-foreground w-10 shrink-0">{entry.time}</span>
                    <span className="text-xs font-medium text-primary shrink-0">{entry.meal}</span>
                    <span className="text-xs flex-1 truncate">{entry.what}</span>
                    <button
                      onClick={() => removeEntry(entry.id)}
                      className="text-muted-foreground hover:text-red-500 transition-colors shrink-0"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
            </div>
          )}

          {foodLog.length === 0 && (
            <p className="text-xs text-muted-foreground mb-3">Nothing logged yet today</p>
          )}

          {/* Quick-add form */}
          <div className="space-y-2">
            <div className="flex gap-1.5">
              <input
                type="time"
                value={foodTime}
                onChange={(e) => setFoodTime(e.target.value)}
                className="rounded-lg border border-input bg-muted/30 px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <select
                value={foodMeal}
                onChange={(e) => setFoodMeal(e.target.value)}
                className="flex-1 rounded-lg border border-input bg-muted/30 px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {MEAL_TYPES.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div className="flex gap-1.5">
              <input
                placeholder="What did you have?"
                value={foodWhat}
                onChange={(e) => setFoodWhat(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addEntry()}
                className="flex-1 rounded-lg border border-input bg-muted/30 px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <Button variant="soft" size="sm" className="h-8 px-2.5" onClick={addEntry} disabled={saving || !foodWhat.trim()}>
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
