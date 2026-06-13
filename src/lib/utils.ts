import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, startOfWeek, endOfWeek, addDays, isToday, isTomorrow, isYesterday } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string, formatStr = "MMM d, yyyy") {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, formatStr);
}

export function formatRelativeDate(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date;
  if (isToday(d)) return "Today";
  if (isTomorrow(d)) return "Tomorrow";
  if (isYesterday(d)) return "Yesterday";
  return format(d, "MMM d");
}

export function getWeekRange(date = new Date()) {
  const start = startOfWeek(date, { weekStartsOn: 1 }); // Monday
  const end = endOfWeek(date, { weekStartsOn: 1 });
  return { start, end };
}

export function getWeekDays(weekStart: Date) {
  return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
}

export function formatTime(minutes: number) {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function calculateStreak(completions: string[], today = new Date()): number {
  if (!completions.length) return 0;
  const sorted = [...completions].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  let streak = 0;
  let checkDate = new Date(today);
  checkDate.setHours(0, 0, 0, 0);

  for (const completion of sorted) {
    const completionDate = new Date(completion);
    completionDate.setHours(0, 0, 0, 0);
    const diff = Math.round((checkDate.getTime() - completionDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diff === 0 || diff === streak) {
      streak++;
      checkDate = new Date(completionDate);
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

export function getCompletionRate(tasks: Array<{ status: string }>): number {
  if (!tasks.length) return 0;
  const done = tasks.filter((t) => t.status === "done").length;
  return Math.round((done / tasks.length) * 100);
}

export function truncate(str: string, maxLength: number) {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + "...";
}

export function generateReferralCode(userId: string): string {
  return userId.slice(0, 8).toUpperCase();
}

export function pluralize(count: number, singular: string, plural?: string) {
  return count === 1 ? `${count} ${singular}` : `${count} ${plural ?? singular + "s"}`;
}

export function getDayGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 21) return "Good evening";
  return "Hey you";
}

export function getEnergyLabel(level: number): string {
  const labels = ["", "Exhausted", "Low energy", "Moderate", "Good energy", "Thriving"];
  return labels[level] ?? "Unknown";
}

export function getMoodColor(score: number): string {
  const colors = ["", "#6b7280", "#9ca3af", "#d1d5db", "#93c5fd", "#6ee7b7", "#fde68a", "#f9a8d4"];
  return colors[Math.min(score, 7)] ?? "#d1d5db";
}

export function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function formatCurrency(cents: number, currency = "USD"): string {
  if (cents === 0) return "Free";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(cents / 100);
}

export function isWithinFreeLimit(
  plan: string,
  resourceType: string,
  currentCount: number
): boolean {
  if (plan !== "free") return true;
  const limits: Record<string, number> = {
    habits: 5,
    goals: 3,
    ai_generations_monthly: 5,
  };
  return currentCount < (limits[resourceType] ?? Infinity);
}

// ADHD-friendly: break large text into bite-sized chunks
export function chunkText(text: string, chunkSize = 80): string[] {
  const words = text.split(" ");
  const chunks: string[] = [];
  let current = "";

  for (const word of words) {
    if ((current + " " + word).trim().length > chunkSize) {
      if (current) chunks.push(current.trim());
      current = word;
    } else {
      current = current ? current + " " + word : word;
    }
  }
  if (current) chunks.push(current.trim());
  return chunks;
}

export function getDayOfWeekName(date: Date): string {
  return format(date, "EEEE");
}

export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}
