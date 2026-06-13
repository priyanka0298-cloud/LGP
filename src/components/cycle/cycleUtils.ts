import type { CyclePhase, PeriodLog } from "@/types";

export interface PhaseInfo {
  phase: CyclePhase;
  dayOfCycle: number;
  daysUntilNextPeriod: number | null;
  nextPeriodDate: Date | null;
  ovulationDate: Date | null;
}

export const PHASE_CONFIG: Record<CyclePhase, {
  label: string;
  emoji: string;
  days: string;
  color: string;
  bg: string;
  border: string;
  description: string;
  energy: string;
  planningTip: string;
}> = {
  menstrual: {
    label: "Menstrual",
    emoji: "🌹",
    days: "Days 1–5",
    color: "text-rose-600 dark:text-rose-400",
    bg: "bg-rose-50 dark:bg-rose-950/30",
    border: "border-rose-200 dark:border-rose-800",
    description: "Your body is working hard. This is a time for deep rest and reflection.",
    energy: "Low — be gentle",
    planningTip: "Schedule only essentials. Cancel what you can. Warm baths, heating pads, comfort food.",
  },
  follicular: {
    label: "Follicular",
    emoji: "🌱",
    days: "Days 6–13",
    color: "text-yellow-600 dark:text-yellow-400",
    bg: "bg-yellow-50 dark:bg-yellow-950/30",
    border: "border-yellow-200 dark:border-yellow-800",
    description: "Energy is rising. Your brain is at its sharpest for learning and starting new things.",
    energy: "Rising — lean in",
    planningTip: "Great time to start projects, book meetings, try new workouts, be social.",
  },
  ovulatory: {
    label: "Ovulatory",
    emoji: "✨",
    days: "Days 14–16",
    color: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-50 dark:bg-purple-950/30",
    border: "border-purple-200 dark:border-purple-800",
    description: "Peak energy, peak confidence. You're magnetic right now — use it.",
    energy: "Peak — shine",
    planningTip: "Schedule your most important meetings, presentations, and social events today.",
  },
  luteal: {
    label: "Luteal",
    emoji: "🌙",
    days: "Days 17–28",
    color: "text-indigo-600 dark:text-indigo-400",
    bg: "bg-indigo-50 dark:bg-indigo-950/30",
    border: "border-indigo-200 dark:border-indigo-800",
    description: "Energy tapering. Your intuition is heightened — great for finishing, not starting.",
    energy: "Declining — cozy up",
    planningTip: "Wrap up projects, do deep solo work, set boundaries, prep your nest for bleed week.",
  },
};

export const SYMPTOMS = [
  { id: "cramps",     label: "Cramps",       emoji: "😣" },
  { id: "bloating",   label: "Bloating",     emoji: "🫧" },
  { id: "headache",   label: "Headache",     emoji: "🤕" },
  { id: "fatigue",    label: "Fatigue",      emoji: "😴" },
  { id: "mood_swings",label: "Mood swings",  emoji: "🌊" },
  { id: "cravings",   label: "Cravings",     emoji: "🍫" },
  { id: "back_pain",  label: "Back pain",    emoji: "🦴" },
  { id: "acne",       label: "Acne",         emoji: "🫦" },
  { id: "breast_tenderness", label: "Tenderness", emoji: "💗" },
  { id: "insomnia",   label: "Insomnia",     emoji: "🌃" },
  { id: "anxiety",    label: "Anxiety",      emoji: "😰" },
  { id: "nausea",     label: "Nausea",       emoji: "🤢" },
];

export const FLOW_OPTIONS = [
  { id: "spotting", label: "Spotting", dots: 1 },
  { id: "light",    label: "Light",    dots: 2 },
  { id: "medium",   label: "Medium",   dots: 3 },
  { id: "heavy",    label: "Heavy",    dots: 4 },
] as const;

export function getPhaseInfo(logs: PeriodLog[], avgCycleLength: number): PhaseInfo | null {
  const lastLog = logs[0];
  if (!lastLog) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const startDate = new Date(lastLog.start_date);
  startDate.setHours(0, 0, 0, 0);

  const dayOfCycle = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  const nextPeriodDate = new Date(startDate);
  nextPeriodDate.setDate(nextPeriodDate.getDate() + avgCycleLength);

  const ovulationDate = new Date(startDate);
  ovulationDate.setDate(ovulationDate.getDate() + 14);

  const daysUntilNextPeriod = Math.ceil(
    (nextPeriodDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  let phase: CyclePhase;
  if (dayOfCycle <= 5) phase = "menstrual";
  else if (dayOfCycle <= 13) phase = "follicular";
  else if (dayOfCycle <= 16) phase = "ovulatory";
  else phase = "luteal";

  return { phase, dayOfCycle, daysUntilNextPeriod, nextPeriodDate, ovulationDate };
}

export function getCycleLength(logs: PeriodLog[]): number | null {
  if (logs.length < 2) return null;
  const lengths: number[] = [];
  for (let i = 0; i < logs.length - 1; i++) {
    const a = new Date(logs[i].start_date);
    const b = new Date(logs[i + 1].start_date);
    const diff = Math.round((a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24));
    if (diff > 0 && diff < 60) lengths.push(diff);
  }
  if (!lengths.length) return null;
  return Math.round(lengths.reduce((s, n) => s + n, 0) / lengths.length);
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function formatShortDate(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
