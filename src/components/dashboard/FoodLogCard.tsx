"use client";

import React, { useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import { Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

interface FoodItem {
  id: string;
  text: string;
}

export function FoodLogCard({ userId }: { userId: string }) {
  const [items, setItems] = useState<FoodItem[]>([]);
  const [water, setWater] = useState(0);
  const [entryId, setEntryId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
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
        // Support both new format (items) and old format (entries with time/meal/what)
        if (c?.items) {
          setItems(c.items);
        } else if (c?.entries) {
          setItems(c.entries.map((e: { id: string; what: string }) => ({ id: e.id, text: e.what })));
        }
        setWater(c?.water ?? 0);
      }
      setLoading(false);
    }
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  async function persist(nextItems: FoodItem[], waterCount: number) {
    setSaving(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payload = { items: nextItems, water: waterCount } as any;
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

  async function addItem() {
    if (!input.trim()) return;
    const next = [...items, { id: Date.now().toString(), text: input.trim() }];
    setItems(next);
    setInput("");
    inputRef.current?.focus();
    await persist(next, water);
  }

  async function removeItem(id: string) {
    const next = items.filter((i) => i.id !== id);
    setItems(next);
    await persist(next, water);
  }

  async function setWaterCount(n: number) {
    const next = water === n ? 0 : n;
    setWater(next);
    await persist(items, next);
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

          {/* Items list */}
          {items.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="group flex items-center gap-1 rounded-full bg-muted/60 px-3 py-1"
                >
                  <span className="text-xs">{item.text}</span>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-muted-foreground/50 hover:text-red-500 transition-colors ml-0.5"
                    aria-label="Remove"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {items.length === 0 && (
            <p className="text-xs text-muted-foreground mb-3">Nothing logged yet today</p>
          )}

          {/* Quick-add */}
          <div className="flex gap-1.5">
            <input
              ref={inputRef}
              placeholder="What did you eat? (press Enter)"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addItem()}
              disabled={saving}
              className="flex-1 rounded-xl border border-input bg-muted/30 px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
