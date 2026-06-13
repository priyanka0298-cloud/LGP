import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Task, Habit, Mood } from "@/types";

interface PlannerStore {
  // Offline/cached data
  cachedTasks: Task[];
  cachedHabits: Habit[];
  todaysMood: Mood | null;
  // UI state
  sidebarCollapsed: boolean;
  activeView: "day" | "week" | "month";
  // Actions
  setCachedTasks: (tasks: Task[]) => void;
  setCachedHabits: (habits: Habit[]) => void;
  setTodaysMood: (mood: Mood | null) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setActiveView: (view: "day" | "week" | "month") => void;
  clearCache: () => void;
}

export const usePlannerStore = create<PlannerStore>()(
  persist(
    (set) => ({
      cachedTasks: [],
      cachedHabits: [],
      todaysMood: null,
      sidebarCollapsed: false,
      activeView: "week",
      setCachedTasks: (tasks) => set({ cachedTasks: tasks }),
      setCachedHabits: (habits) => set({ cachedHabits: habits }),
      setTodaysMood: (mood) => set({ todaysMood: mood }),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      setActiveView: (view) => set({ activeView: view }),
      clearCache: () => set({ cachedTasks: [], cachedHabits: [], todaysMood: null }),
    }),
    {
      name: "lazy-girl-planner",
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        activeView: state.activeView,
      }),
    }
  )
);
