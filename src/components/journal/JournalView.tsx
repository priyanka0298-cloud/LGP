"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import {
  ChevronRight, ChevronDown, Save, Trash2, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { JournalEntry } from "@/types";
import { MOOD_EMOJIS } from "@/types";

interface JournalViewProps {
  userId: string;
  todayEntry: JournalEntry | null;
  recentEntries: Partial<JournalEntry>[];
}

const DAILY_PROMPTS = [
  { key: "morning_intention", label: "Morning intention", emoji: "🌅", placeholder: "What's one intention I'm carrying into today?" },
  { key: "top_priorities", label: "Top 3 priorities", emoji: "🎯", placeholder: "What absolutely must happen today? (max 3)" },
  { key: "brain_dump", label: "Brain dump", emoji: "🧠", placeholder: "Everything on your mind... just let it out here" },
  { key: "gratitude", label: "Gratitude", emoji: "💜", placeholder: "3 tiny things I'm grateful for, even on hard days..." },
  { key: "what_can_wait", label: "What can wait?", emoji: "🌿", placeholder: "What am I giving myself permission to NOT do today?" },
  { key: "evening_reflection", label: "Evening reflection", emoji: "🌙", placeholder: "How did today actually go? (be honest, be kind)" },
];

const REFLECTION_PROMPTS = [
  { key: "what_drained", q: "What drained me this week?" },
  { key: "what_helped", q: "What made life easier?" },
  { key: "avoiding", q: "What am I avoiding?" },
  { key: "actually_mattered", q: "What actually mattered this week?" },
  { key: "tiny_wins", q: "My tiny wins (list everything, even getting out of bed)" },
  { key: "self_care", q: "Self-care check: what did my body and mind need?" },
  { key: "carry_forward", q: "What am I carrying into next week?" },
  { key: "release", q: "What am I releasing? (guilt, expectations, resentment)" },
];

interface FoodEntry {
  id: string;
  time: string;
  meal: string;
  what: string;
}

type Tab = "daily" | "reflection" | "free" | "history";

export function JournalView({ userId, todayEntry, recentEntries }: JournalViewProps) {
  const [activeTab, setActiveTab] = useState<Tab>("daily");
  const [content, setContent] = useState<Record<string, unknown>>(
    (todayEntry?.content as Record<string, unknown>) ?? {}
  );
  const [saving, setSaving] = useState(false);
  const [freeWrite, setFreeWrite] = useState("");

  // History state
  const [entries, setEntries] = useState(recentEntries);
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());
  const [expandedEntryId, setExpandedEntryId] = useState<string | null>(null);
  const [loadedEntries, setLoadedEntries] = useState<Record<string, Record<string, unknown>>>({});
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const supabase = createClient();
  const router = useRouter();

  // Sync entries when server re-fetches (after router.refresh())
  useEffect(() => { setEntries(recentEntries); }, [recentEntries]);

  // Accordion state — open the ones that already have content on load
  const [openPrompts, setOpenPrompts] = useState<Set<string>>(() => {
    const initial = (todayEntry?.content as Record<string, unknown>) ?? {};
    return new Set(
      [...DAILY_PROMPTS.map((p) => p.key), ...REFLECTION_PROMPTS.map((p) => `refl_${p.key}`)]
        .filter((k) => initial[k])
    );
  });

  function togglePrompt(key: string) {
    setOpenPrompts((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function toggleDate(date: string) {
    setExpandedDates((prev) => {
      const next = new Set(prev);
      if (next.has(date)) { next.delete(date); setExpandedEntryId(null); }
      else next.add(date);
      return next;
    });
    setConfirmDeleteId(null);
  }

  async function openEntry(id: string) {
    if (expandedEntryId === id) { setExpandedEntryId(null); return; }
    if (loadedEntries[id]) { setExpandedEntryId(id); return; }
    setLoadingId(id);
    const { data } = await supabase
      .from("journal_entries")
      .select("content, entry_type")
      .eq("id", id)
      .single();
    setLoadingId(null);
    if (data) {
      setLoadedEntries((prev) => ({ ...prev, [id]: (data.content as Record<string, unknown>) ?? {} }));
    }
    setExpandedEntryId(id);
  }

  async function deleteEntry(id: string) {
    // Optimistic remove
    setEntries((prev) => prev.filter((e) => e.id !== id));
    if (expandedEntryId === id) setExpandedEntryId(null);
    setConfirmDeleteId(null);

    const res = await fetch(`/api/journal/${id}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Couldn't delete entry. Try again?");
      // Restore on failure
      setEntries(recentEntries);
      return;
    }
    toast.success("Entry deleted.");
    router.refresh();
  }

  // Group entries by date for consolidated history view
  const entriesByDate = entries.reduce<Record<string, typeof entries>>((acc, e) => {
    const date = e.entry_date ?? "unknown";
    if (!acc[date]) acc[date] = [];
    acc[date].push(e);
    return acc;
  }, {});
  const sortedDates = Object.keys(entriesByDate).sort((a, b) => b.localeCompare(a));

  async function saveDailyEntry() {
    setSaving(true);
    const today = format(new Date(), "yyyy-MM-dd");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const contentToSave = content as any;

    // Check-then-insert/update — avoids needing a unique constraint on the table
    const { data: existing } = await supabase
      .from("journal_entries")
      .select("id")
      .eq("user_id", userId)
      .eq("entry_date", today)
      .eq("entry_type", "daily")
      .maybeSingle();

    const { error } = existing
      ? await supabase
          .from("journal_entries")
          .update({ content: contentToSave })
          .eq("id", existing.id)
      : await supabase.from("journal_entries").insert({
          user_id: userId,
          entry_date: today,
          entry_type: "daily",
          content: contentToSave,
        });

    setSaving(false);
    if (error) {
      toast.error("Couldn't save. Try again?");
    } else {
      toast.success("Journal saved 💜 Great job checking in with yourself.");
      router.refresh();
    }
  }

  const tabs = [
    { id: "daily" as Tab, label: "Daily Page", emoji: "📔" },
    { id: "reflection" as Tab, label: "Reflection", emoji: "💭" },
    { id: "free" as Tab, label: "Free Write", emoji: "✍️" },
    { id: "history" as Tab, label: "History", emoji: "📚" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Journal</h1>
          <p className="text-sm text-muted-foreground">{format(new Date(), "EEEE, MMMM d, yyyy")}</p>
        </div>
        {(activeTab === "daily" || activeTab === "reflection") && (
          <Button variant="gradient" size="sm" className="gap-1.5" onClick={saveDailyEntry} disabled={saving}>
            <Save className="h-3.5 w-3.5" />
            {saving ? "Saving..." : "Save"}
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-muted/50 rounded-2xl overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex shrink-0 items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-all",
              activeTab === tab.id
                ? "bg-background shadow-soft text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <span className="hidden sm:inline">{tab.emoji}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Daily page — accordion */}
      {activeTab === "daily" && (
        <div className="space-y-2">
          {DAILY_PROMPTS.map((prompt) => {
            const isOpen = openPrompts.has(prompt.key);
            const val = (content[prompt.key] as string) ?? "";
            return (
              <div key={prompt.key} className="rounded-2xl border border-border/50 bg-card overflow-hidden">
                <button
                  onClick={() => togglePrompt(prompt.key)}
                  className="flex w-full items-center justify-between px-4 py-3.5 hover:bg-muted/30 transition-colors text-left"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-lg shrink-0">{prompt.emoji}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold">{prompt.label}</p>
                      {!isOpen && val && (
                        <p className="text-xs text-muted-foreground truncate mt-0.5">{val}</p>
                      )}
                      {!isOpen && !val && (
                        <p className="text-xs text-muted-foreground/60 mt-0.5">{prompt.placeholder}</p>
                      )}
                    </div>
                  </div>
                  {isOpen
                    ? <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 ml-3" />
                    : <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 ml-3" />}
                </button>
                {isOpen && (
                  <div className="px-4 pb-4">
                    <Textarea
                      autoFocus
                      placeholder={prompt.placeholder}
                      value={val}
                      onChange={(e) => setContent({ ...content, [prompt.key]: e.target.value })}
                      className={cn(
                        "text-sm resize-none border-0 bg-muted/30 focus-visible:ring-1 w-full",
                        prompt.key === "brain_dump" ? "min-h-[140px]" : "min-h-[100px]"
                      )}
                    />
                  </div>
                )}
              </div>
            );
          })}

        </div>
      )}

      {/* Reflection — accordion */}
      {activeTab === "reflection" && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground px-1">
            Open the ones you feel like sitting with today. No pressure to do all of them.
          </p>
          {REFLECTION_PROMPTS.map((prompt) => {
            const stateKey = `refl_${prompt.key}`;
            const isOpen = openPrompts.has(stateKey);
            const val = (content[stateKey] as string) ?? "";
            return (
              <div key={prompt.key} className="rounded-2xl border border-border/50 bg-card overflow-hidden">
                <button
                  onClick={() => togglePrompt(stateKey)}
                  className="flex w-full items-center justify-between px-4 py-3.5 hover:bg-muted/30 transition-colors text-left"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">{prompt.q}</p>
                    {!isOpen && val && (
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{val}</p>
                    )}
                  </div>
                  {isOpen
                    ? <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 ml-3" />
                    : <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 ml-3" />}
                </button>
                {isOpen && (
                  <div className="px-4 pb-4">
                    <Textarea
                      autoFocus
                      placeholder="Take your time..."
                      value={val}
                      onChange={(e) => setContent({ ...content, [stateKey]: e.target.value })}
                      className="min-h-[100px] text-sm resize-none border-0 bg-muted/30 focus-visible:ring-1 w-full"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Free write */}
      {activeTab === "free" && (
        <div className="rounded-2xl border border-border/50 bg-card p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Free Write ✍️</h2>
            <p className="text-xs text-muted-foreground">This is just for you. No prompts. No judgment.</p>
          </div>
          <Textarea
            placeholder="Just write. Stream of consciousness. Thoughts, feelings, dreams, frustrations... it's all welcome here."
            value={freeWrite}
            onChange={(e) => setFreeWrite(e.target.value)}
            className="min-h-[400px] text-sm resize-none border-0 bg-muted/20 focus-visible:ring-1"
          />
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">{freeWrite.split(/\s+/).filter(Boolean).length} words</p>
            <Button variant="gradient" size="sm" onClick={async () => {
              if (!freeWrite.trim()) return;
              setSaving(true);
              const today = format(new Date(), "yyyy-MM-dd");
              const { error } = await supabase.from("journal_entries").insert({
                user_id: userId,
                entry_date: today,
                entry_type: "free_write",
                content: { text: freeWrite },
              });
              setSaving(false);
              if (error) {
                toast.error("Couldn't save. Try again?");
              } else {
                toast.success("Free write saved 💜");
                setFreeWrite("");
                router.refresh();
              }
            }} disabled={saving || !freeWrite.trim()}>
              {saving ? "Saving..." : "Save entry"}
            </Button>
          </div>
        </div>
      )}

      {/* History — grouped by date */}
      {activeTab === "history" && (
        <div className="space-y-2">
          {sortedDates.length === 0 ? (
            <div className="empty-state">
              <p className="text-3xl mb-2">📔</p>
              <p className="font-medium">No entries yet</p>
              <p className="text-sm text-muted-foreground">Start writing today!</p>
            </div>
          ) : (
            sortedDates.map((date) => {
              const dayEntries = entriesByDate[date];
              const isDateOpen = expandedDates.has(date);
              const typeLabels: Record<string, string> = {
                daily: "📔 Daily",
                free_write: "✍️ Free write",
                weekly_reflection: "💭 Reflection",
                food_log: "🥗 Food log",
              };
              const typeSummary = dayEntries
                .map((e) => typeLabels[e.entry_type ?? ""] ?? "📄 Entry")
                .join(" · ");

              return (
                <div key={date} className="rounded-2xl border border-border/50 bg-card overflow-hidden">
                  {/* Date row */}
                  <button
                    onClick={() => toggleDate(date)}
                    className="flex w-full items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors text-left"
                  >
                    <div>
                      <p className="text-sm font-semibold">
                        {format(parseISO(date), "EEEE, MMMM d")}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">{typeSummary}</p>
                    </div>
                    {isDateOpen
                      ? <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                      : <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />}
                  </button>

                  {/* Sub-entries */}
                  {isDateOpen && (
                    <div className="border-t border-border/40 divide-y divide-border/30">
                      {dayEntries.map((entry) => {
                        const id = entry.id as string;
                        const isOpen = expandedEntryId === id;
                        const isLoading = loadingId === id;
                        const isConfirming = confirmDeleteId === id;
                        const entryContent = loadedEntries[id] ?? {};
                        const label = typeLabels[entry.entry_type ?? ""] ?? "📄 Entry";

                        return (
                          <div key={id}>
                            {/* Entry row */}
                            <div className="flex items-center bg-muted/10">
                              <button
                                onClick={() => openEntry(id)}
                                className="flex flex-1 items-center gap-2 px-5 py-2.5 hover:bg-muted/20 transition-colors text-left text-sm"
                              >
                                <span>{label}</span>
                                {isLoading
                                  ? <Loader2 className="h-3 w-3 animate-spin text-muted-foreground ml-auto" />
                                  : isOpen
                                  ? <ChevronDown className="h-3 w-3 text-muted-foreground ml-auto" />
                                  : <ChevronRight className="h-3 w-3 text-muted-foreground ml-auto" />}
                              </button>

                              {/* Delete */}
                              <div className="flex items-center gap-1 pr-3 shrink-0">
                                {isConfirming ? (
                                  <>
                                    <button
                                      onClick={() => deleteEntry(id)}
                                      className="rounded-lg bg-red-500 px-2 py-0.5 text-xs font-medium text-white hover:bg-red-600 transition-colors"
                                    >
                                      Delete
                                    </button>
                                    <button
                                      onClick={() => setConfirmDeleteId(null)}
                                      className="text-xs text-muted-foreground hover:text-foreground px-1"
                                    >
                                      Cancel
                                    </button>
                                  </>
                                ) : (
                                  <button
                                    onClick={() => setConfirmDeleteId(id)}
                                    className="p-1.5 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors"
                                    title="Delete this entry"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Entry content */}
                            {isOpen && (
                              <div className="px-5 py-4 space-y-3 bg-background/50">
                                {entry.entry_type === "free_write" && (
                                  <p className="text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed">
                                    {(entryContent.text as string) || "No content"}
                                  </p>
                                )}

                                {entry.entry_type === "daily" && (() => {
                                  const foodLogEntries = Array.isArray(entryContent.food_log)
                                    ? (entryContent.food_log as FoodEntry[]) : [];
                                  return (
                                    <div className="space-y-3">
                                      {DAILY_PROMPTS.map((prompt) => {
                                        const val = entryContent[prompt.key] as string | undefined;
                                        if (!val) return null;
                                        return (
                                          <div key={prompt.key}>
                                            <p className="text-xs font-semibold text-muted-foreground mb-1">{prompt.emoji} {prompt.label}</p>
                                            <p className="text-sm whitespace-pre-wrap leading-relaxed">{val}</p>
                                          </div>
                                        );
                                      })}
                                      {foodLogEntries.length > 0 && (
                                        <div>
                                          <p className="text-xs font-semibold text-muted-foreground mb-1">🥗 Food log</p>
                                          {foodLogEntries.map((f, i) => (
                                            <p key={i} className="text-sm">
                                              <span className="text-muted-foreground">{f.time} · {f.meal}: </span>{f.what}
                                            </p>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })()}

                                {entry.entry_type === "weekly_reflection" && (
                                  <div className="space-y-3">
                                    {REFLECTION_PROMPTS.map((prompt) => {
                                      const val = entryContent[`refl_${prompt.key}`] as string | undefined;
                                      if (!val) return null;
                                      return (
                                        <div key={prompt.key}>
                                          <p className="text-xs font-semibold text-muted-foreground mb-1">{prompt.q}</p>
                                          <p className="text-sm whitespace-pre-wrap leading-relaxed">{val}</p>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}

                                {entry.entry_type === "food_log" && (() => {
                                  const foodEntries = Array.isArray(entryContent.entries)
                                    ? (entryContent.entries as FoodEntry[]) : [];
                                  const waterCount = entryContent.water ? Number(entryContent.water) : 0;
                                  return (
                                    <div className="space-y-2">
                                      {waterCount > 0 && (
                                        <p className="text-sm text-muted-foreground">💧 {waterCount} glasses of water</p>
                                      )}
                                      {foodEntries.length > 0 && (
                                        <div className="space-y-1">
                                          {foodEntries.map((f, i) => (
                                            <p key={i} className="text-sm">
                                              <span className="text-muted-foreground">{f.time} · {f.meal}: </span>{f.what}
                                            </p>
                                          ))}
                                        </div>
                                      )}
                                      {!waterCount && !foodEntries.length && (
                                        <p className="text-sm text-muted-foreground">Nothing logged</p>
                                      )}
                                    </div>
                                  );
                                })()}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
