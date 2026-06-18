"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, BellOff, Plus, Trash2, Clock, Check, Pencil, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { Database } from "@/types/database";

type Reminder = Database["public"]["Tables"]["reminders"]["Row"];

const REPEAT_OPTIONS = [
  { value: "daily", label: "Every day" },
  { value: "weekdays", label: "Weekdays" },
  { value: "weekends", label: "Weekends" },
  { value: "weekly", label: "Weekly" },
  { value: "once", label: "Once" },
];

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const QUICK_TITLES = [
  "💧 Drink water",
  "🧘 Take a breath",
  "💊 Take vitamins",
  "📖 Read for 10 min",
  "🌿 Step outside",
  "🎯 Check your goals",
];

// Times are stored as UTC in the DB so the server-side cron can match them correctly.
function localTimeToUTC(localTime: string): string {
  const [h, m] = localTime.split(":").map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return `${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")}`;
}

function utcTimeToLocal(utcTime: string): string {
  const [h, m] = utcTime.split(":").map(Number);
  const d = new Date();
  d.setUTCHours(h, m, 0, 0);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function RemindersView({ userId, initialReminders }: { userId: string; initialReminders: Reminder[] }) {
  const [reminders, setReminders] = useState<Reminder[]>(initialReminders);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [permissionState, setPermissionState] = useState<NotificationPermission>("default");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  // New reminder form state
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("09:00");
  const [repeat, setRepeat] = useState("daily");
  const [weekDays, setWeekDays] = useState<number[]>([1]);
  const [date, setDate] = useState("");

  // Edit state
  const [editId, setEditId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editTime, setEditTime] = useState("09:00");
  const [editRepeat, setEditRepeat] = useState("daily");
  const [editWeekDays, setEditWeekDays] = useState<number[]>([1]);
  const [editDate, setEditDate] = useState("");

  useEffect(() => {
    if (typeof Notification === "undefined") return;
    setPermissionState(Notification.permission);
    checkPushSubscription();
  }, []);

  // Client-side notification scheduling — fires when app is open
  useEffect(() => {
    if (permissionState !== "granted" || reminders.length === 0) return;

    const timers: ReturnType<typeof setTimeout>[] = [];
    const now = new Date();

    reminders.filter(r => r.is_active).forEach(r => {
      const localTime = utcTimeToLocal(r.scheduled_time as string);
      const [h, m] = localTime.split(":").map(Number);
      const next = new Date();
      next.setHours(h, m, 0, 0);
      if (next <= now) next.setDate(next.getDate() + 1);

      const delay = next.getTime() - now.getTime();
      if (delay < 86_400_000) {
        const t = setTimeout(() => {
          new Notification("Softlivi Reminder", { body: r.title, icon: "/icon-192.png" });
        }, delay);
        timers.push(t);
      }
    });

    return () => timers.forEach(clearTimeout);
  }, [reminders, permissionState]);

  async function checkPushSubscription() {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    setPushEnabled(!!sub);
  }

  async function enablePush() {
    if (!("Notification" in window)) {
      toast.error("Your browser doesn't support notifications.");
      return;
    }

    const permission = await Notification.requestPermission();
    setPermissionState(permission);

    if (permission !== "granted") {
      toast.error("Notification permission denied. Enable it in your browser settings.");
      return;
    }

    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      toast.success("Notifications enabled! They'll fire when the app is open.");
      return;
    }

    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      });

      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sub.toJSON()),
      });

      setPushEnabled(true);
      toast.success("Push notifications enabled! Reminders will arrive even when the app is closed. 🔔");
    } catch {
      toast.success("Notifications enabled for when the app is open ✓");
    }
  }

  async function disablePush() {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (sub) {
      await fetch("/api/push/subscribe", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint: sub.endpoint }),
      });
      await sub.unsubscribe();
    }
    setPushEnabled(false);
    toast.success("Push notifications disabled.");
  }

  async function createReminder() {
    if (!title.trim() || !time) return;
    setSaving(true);

    const payload: Database["public"]["Tables"]["reminders"]["Insert"] = {
      user_id: userId,
      title: title.trim(),
      scheduled_time: localTimeToUTC(time),
      repeat_type: repeat as "once" | "daily" | "weekdays" | "weekends" | "weekly",
      repeat_days: repeat === "weekly" ? weekDays : null,
      scheduled_date: repeat === "once" && date ? date : null,
    };

    const { data, error } = await supabase.from("reminders").insert(payload).select().single();
    if (error || !data) {
      toast.error("Couldn't save reminder.");
      setSaving(false);
      return;
    }

    setReminders(prev => [data, ...prev]);
    setTitle("");
    setTime("09:00");
    setRepeat("daily");
    setWeekDays([1]);
    setDate("");
    setShowForm(false);
    setSaving(false);
    toast.success("Reminder set! 🔔");
  }

  function startEdit(r: Reminder) {
    setEditId(r.id);
    setEditTitle(r.title);
    setEditTime(utcTimeToLocal(r.scheduled_time as string));
    setEditRepeat(r.repeat_type);
    setEditWeekDays(r.repeat_days ?? [1]);
    setEditDate(r.scheduled_date ?? "");
  }

  async function saveEdit() {
    if (!editId || !editTitle.trim()) return;
    setSaving(true);

    const { data, error } = await supabase
      .from("reminders")
      .update({
        title: editTitle.trim(),
        scheduled_time: localTimeToUTC(editTime),
        repeat_type: editRepeat as Reminder["repeat_type"],
        repeat_days: editRepeat === "weekly" ? editWeekDays : null,
        scheduled_date: editRepeat === "once" && editDate ? editDate : null,
      })
      .eq("id", editId)
      .select()
      .single();

    setSaving(false);
    if (error || !data) { toast.error("Couldn't update reminder."); return; }

    setReminders(prev => prev.map(r => r.id === editId ? data : r));
    setEditId(null);
    toast.success("Reminder updated ✓");
  }

  async function toggleActive(r: Reminder) {
    const updated = !r.is_active;
    setReminders(prev => prev.map(x => x.id === r.id ? { ...x, is_active: updated } : x));
    await supabase.from("reminders").update({ is_active: updated }).eq("id", r.id);
  }

  async function deleteReminder(id: string) {
    setReminders(prev => prev.filter(r => r.id !== id));
    await supabase.from("reminders").delete().eq("id", id);
  }

  const active = reminders.filter(r => r.is_active);
  const inactive = reminders.filter(r => !r.is_active);

  const reminderForm = (
    opts: {
      formTitle: string;
      titleVal: string; setTitleVal: (v: string) => void;
      timeVal: string; setTimeVal: (v: string) => void;
      repeatVal: string; setRepeatVal: (v: string) => void;
      weekDaysVal: number[]; setWeekDaysVal: (v: number[]) => void;
      dateVal: string; setDateVal: (v: string) => void;
      onSave: () => void;
      onCancel: () => void;
    }
  ) => (
    <Card className="border-primary/20 shadow-soft">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary" /> {opts.formTitle}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <input
          autoFocus
          placeholder="Reminder title..."
          value={opts.titleVal}
          onChange={e => opts.setTitleVal(e.target.value)}
          className="w-full rounded-xl border border-input bg-muted/30 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
        />

        <div className="flex gap-1.5 flex-wrap">
          {QUICK_TITLES.map(t => (
            <button
              key={t}
              onClick={() => opts.setTitleVal(t)}
              className="rounded-full bg-muted px-2.5 py-1 text-xs hover:bg-primary/10 hover:text-primary transition-colors"
            >
              {t}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <div className="flex-1">
            <label className="text-xs text-muted-foreground mb-1 block">Time</label>
            <input
              type="time"
              value={opts.timeVal}
              onChange={e => opts.setTimeVal(e.target.value)}
              className="w-full rounded-xl border border-input bg-muted/30 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="flex-1">
            <label className="text-xs text-muted-foreground mb-1 block">Repeat</label>
            <select
              value={opts.repeatVal}
              onChange={e => opts.setRepeatVal(e.target.value)}
              className="w-full rounded-xl border border-input bg-muted/30 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {REPEAT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        {opts.repeatVal === "weekly" && (
          <div className="flex gap-1.5">
            {DAYS.map((d, i) => (
              <button
                key={d}
                onClick={() => opts.setWeekDaysVal(
                  opts.weekDaysVal.includes(i)
                    ? opts.weekDaysVal.filter(x => x !== i)
                    : [...opts.weekDaysVal, i]
                )}
                className={cn(
                  "flex-1 rounded-lg py-1 text-xs font-medium border transition-all",
                  opts.weekDaysVal.includes(i)
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-muted border-border text-muted-foreground"
                )}
              >
                {d}
              </button>
            ))}
          </div>
        )}

        {opts.repeatVal === "once" && (
          <input
            type="date"
            value={opts.dateVal}
            onChange={e => opts.setDateVal(e.target.value)}
            className="w-full rounded-xl border border-input bg-muted/30 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
        )}

        <div className="flex gap-2 pt-1">
          <Button variant="gradient" size="sm" onClick={opts.onSave} disabled={saving || !opts.titleVal.trim()}>
            {saving ? "Saving..." : "Save"}
          </Button>
          <Button variant="ghost" size="sm" onClick={opts.onCancel}>Cancel</Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen p-6 md:p-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-xl md:text-3xl font-bold">Reminders 🔔</h1>
          <p className="mt-1 text-muted-foreground text-sm">Gentle nudges, on your schedule.</p>
        </div>
        <Button variant="gradient" size="sm" className="gap-2 shadow-glow shrink-0" onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4" /> New
        </Button>
      </div>

      {/* Push toggle banner */}
      <Card className={cn("mb-6 border-dashed", pushEnabled ? "border-emerald-400/50 bg-emerald-50/50 dark:bg-emerald-950/20" : "border-primary/30")}>
        <CardContent className="flex items-center justify-between gap-4 p-4">
          <div className="flex items-center gap-3">
            {pushEnabled
              ? <Bell className="h-5 w-5 text-emerald-600 shrink-0" />
              : <BellOff className="h-5 w-5 text-muted-foreground shrink-0" />
            }
            <div>
              <p className="text-sm font-medium">
                {pushEnabled ? "Push notifications on" : "Enable push notifications"}
              </p>
              <p className="text-xs text-muted-foreground">
                {pushEnabled
                  ? "Reminders will arrive even when the app is closed"
                  : "Get reminders even when the app isn't open"}
              </p>
            </div>
          </div>
          {pushEnabled ? (
            <Button variant="outline" size="sm" onClick={disablePush} className="shrink-0">Turn off</Button>
          ) : (
            <Button variant="soft" size="sm" onClick={enablePush} className="shrink-0 gap-1.5">
              <Bell className="h-3.5 w-3.5" /> Enable
            </Button>
          )}
        </CardContent>
      </Card>

      {/* New reminder form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="mb-6"
          >
            {reminderForm({
              formTitle: "New reminder",
              titleVal: title, setTitleVal: setTitle,
              timeVal: time, setTimeVal: setTime,
              repeatVal: repeat, setRepeatVal: setRepeat,
              weekDaysVal: weekDays, setWeekDaysVal: setWeekDays,
              dateVal: date, setDateVal: setDate,
              onSave: createReminder,
              onCancel: () => setShowForm(false),
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state */}
      {reminders.length === 0 && !showForm && (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🔔</div>
          <h2 className="font-display text-xl font-semibold mb-2">No reminders yet</h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto">
            Set a gentle nudge and we'll remind you — without the anxiety.
          </p>
          <Button variant="gradient" onClick={() => setShowForm(true)} className="gap-2 shadow-glow">
            <Plus className="h-4 w-4" /> Add your first reminder
          </Button>
        </div>
      )}

      {/* Active reminders */}
      {active.length > 0 && (
        <div className="space-y-3 mb-6">
          {active.map(r => editId === r.id ? (
            <motion.div key={r.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {reminderForm({
                formTitle: "Edit reminder",
                titleVal: editTitle, setTitleVal: setEditTitle,
                timeVal: editTime, setTimeVal: setEditTime,
                repeatVal: editRepeat, setRepeatVal: setEditRepeat,
                weekDaysVal: editWeekDays, setWeekDaysVal: setEditWeekDays,
                dateVal: editDate, setDateVal: setEditDate,
                onSave: saveEdit,
                onCancel: () => setEditId(null),
              })}
            </motion.div>
          ) : (
            <ReminderRow
              key={r.id}
              reminder={r}
              onToggle={() => toggleActive(r)}
              onEdit={() => startEdit(r)}
              onDelete={() => deleteReminder(r.id)}
            />
          ))}
        </div>
      )}

      {/* Inactive */}
      {inactive.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Paused</p>
          <div className="space-y-2 opacity-60">
            {inactive.map(r => editId === r.id ? (
              <motion.div key={r.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {reminderForm({
                  formTitle: "Edit reminder",
                  titleVal: editTitle, setTitleVal: setEditTitle,
                  timeVal: editTime, setTimeVal: setEditTime,
                  repeatVal: editRepeat, setRepeatVal: setEditRepeat,
                  weekDaysVal: editWeekDays, setWeekDaysVal: setEditWeekDays,
                  dateVal: editDate, setDateVal: setEditDate,
                  onSave: saveEdit,
                  onCancel: () => setEditId(null),
                })}
              </motion.div>
            ) : (
              <ReminderRow
                key={r.id}
                reminder={r}
                onToggle={() => toggleActive(r)}
                onEdit={() => startEdit(r)}
                onDelete={() => deleteReminder(r.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ReminderRow({
  reminder,
  onToggle,
  onEdit,
  onDelete,
}: {
  reminder: Reminder;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const repeatLabel = REPEAT_OPTIONS.find(o => o.value === reminder.repeat_type)?.label ?? "";
  const localTime = utcTimeToLocal(reminder.scheduled_time as string);
  const [h, m] = localTime.split(":").map(Number);
  const timeStr = new Date(0, 0, 0, h, m).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

  return (
    <Card className="shadow-sm">
      <CardContent className="flex items-center gap-3 p-4">
        <button
          onClick={onToggle}
          className={cn(
            "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all",
            reminder.is_active ? "border-primary bg-primary" : "border-border"
          )}
        >
          {reminder.is_active && <Check className="h-3 w-3 text-white" />}
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{reminder.title}</p>
          <p className="text-xs text-muted-foreground">{timeStr} · {repeatLabel}</p>
        </div>
        <button onClick={onEdit} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-primary transition-colors shrink-0">
          <Pencil className="h-3.5 w-3.5" />
        </button>
        <button onClick={onDelete} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-red-500 transition-colors shrink-0">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </CardContent>
    </Card>
  );
}
