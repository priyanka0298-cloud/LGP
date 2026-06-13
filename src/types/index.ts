import type { Database } from "./database";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Task = Database["public"]["Tables"]["tasks"]["Row"];
export type Habit = Database["public"]["Tables"]["habits"]["Row"];
export type HabitCompletion = Database["public"]["Tables"]["habit_completions"]["Row"];
export type Mood = Database["public"]["Tables"]["moods"]["Row"];
export type JournalEntry = Database["public"]["Tables"]["journal_entries"]["Row"];
export type Goal = Database["public"]["Tables"]["goals"]["Row"];
export type WeeklyPlan = Database["public"]["Tables"]["weekly_plans"]["Row"];
export type Subscription = Database["public"]["Tables"]["subscriptions"]["Row"];
export type PlannerTemplate = Database["public"]["Tables"]["planner_templates"]["Row"];

export type TaskCategory = "must_do" | "should_do" | "if_energy" | "someday";
export type TaskStatus = "pending" | "in_progress" | "done" | "skipped" | "rolled_over";
export type MoodLabel = "terrible" | "rough" | "meh" | "okay" | "good" | "great" | "amazing";
export type SubscriptionPlan = "free" | "premium" | "lifetime";
export type AccentColor = "rose" | "lavender" | "peach" | "sage" | "sky";

export interface PeriodLog {
  id: string;
  user_id: string;
  start_date: string;
  end_date: string | null;
  flow_intensity: "spotting" | "light" | "medium" | "heavy" | null;
  symptoms: string[];
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type CyclePhase = "menstrual" | "follicular" | "ovulatory" | "luteal";

export interface DashboardData {
  todaysTasks: Task[];
  weeklyGoals: Task[];
  habits: Array<Habit & { completedToday: boolean }>;
  todaysMood: Mood | null;
  affirmation: string;
  streak: number;
  completionRate: number;
  aiSuggestion: string;
}

export interface WeeklyViewData {
  weekStart: Date;
  weekEnd: Date;
  plan: WeeklyPlan | null;
  tasksByDay: Record<string, Task[]>;
}

export interface ReflectionPrompt {
  id: string;
  question: string;
  category: "energy" | "productivity" | "wellbeing" | "growth" | "gratitude";
  placeholder: string;
}

export interface AIGenerationRequest {
  type: string;
  input: Record<string, unknown>;
  context?: {
    userProfile?: Partial<Profile>;
    recentMoods?: Mood[];
    energyLevel?: number;
  };
}

export interface AIGenerationResponse {
  output: Record<string, unknown>;
  tokensUsed: number;
}

export interface MoodEntry {
  score: number;
  emoji: string;
  label: MoodLabel;
  energyLevel: number;
  note?: string;
}

export const MOOD_EMOJIS: Record<number, { emoji: string; label: MoodLabel; color: string }> = {
  1: { emoji: "😞", label: "terrible", color: "#6b7280" },
  2: { emoji: "😔", label: "rough", color: "#9ca3af" },
  3: { emoji: "😐", label: "meh", color: "#d1d5db" },
  4: { emoji: "🙂", label: "okay", color: "#93c5fd" },
  5: { emoji: "😊", label: "good", color: "#6ee7b7" },
  6: { emoji: "😄", label: "great", color: "#fde68a" },
  7: { emoji: "🌟", label: "amazing", color: "#f9a8d4" },
};

export const TASK_CATEGORY_CONFIG: Record<TaskCategory, {
  label: string;
  description: string;
  color: string;
  bgColor: string;
  emoji: string;
}> = {
  must_do: {
    label: "Must Do",
    description: "Non-negotiables for today",
    color: "text-rose-600",
    bgColor: "bg-rose-50 dark:bg-rose-950/30",
    emoji: "🎯",
  },
  should_do: {
    label: "Should Do",
    description: "Important but flexible",
    color: "text-purple-600",
    bgColor: "bg-purple-50 dark:bg-purple-950/30",
    emoji: "✨",
  },
  if_energy: {
    label: "If I Have Energy",
    description: "Nice to do, no pressure",
    color: "text-sky-600",
    bgColor: "bg-sky-50 dark:bg-sky-950/30",
    emoji: "🌸",
  },
  someday: {
    label: "Someday / Maybe",
    description: "Ideas and future plans",
    color: "text-sage-600",
    bgColor: "bg-green-50 dark:bg-green-950/30",
    emoji: "🌿",
  },
};

export const PRICING_PLANS = [
  {
    id: "free",
    name: "Free",
    price: 0,
    period: null,
    description: "Start your soft life journey",
    features: [
      "Weekly planner (current week)",
      "5 active habits",
      "Daily mood tracking",
      "3 goals",
      "Basic AI suggestions (5/month)",
      "Access to free templates",
    ],
    limitations: ["Limited AI features", "No analytics", "Basic export"],
    cta: "Get Started Free",
    highlighted: false,
  },
  {
    id: "premium_monthly",
    name: "Premium",
    price: 9.99,
    period: "month",
    description: "Your complete planning sanctuary",
    features: [
      "Everything in Free",
      "Unlimited everything",
      "Full AI assistant (unlimited)",
      "Advanced analytics & insights",
      "Mood × productivity correlation",
      "Burnout risk indicators",
      "Cycle-aware planning",
      "Calendar sync",
      "PDF export",
      "Priority support",
      "All premium templates",
    ],
    limitations: [],
    cta: "Start 7-Day Free Trial",
    highlighted: true,
    badge: "Most Popular",
  },
  {
    id: "premium_yearly",
    name: "Premium Annual",
    price: 79.99,
    period: "year",
    description: "Best value for committed planners",
    features: [
      "Everything in Premium Monthly",
      "2 months free (save $40)",
      "Early access to new features",
      "Community challenges access",
      "Body doubling rooms",
    ],
    limitations: [],
    cta: "Get Annual Access",
    highlighted: false,
    badge: "Best Value",
  },
];
