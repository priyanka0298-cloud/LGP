"use client";

import { useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { format } from "date-fns";
import { toast } from "sonner";
import type { Task, TaskCategory } from "@/types";

export function useTasks(userId: string, date?: Date) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const dateStr = date ? format(date, "yyyy-MM-dd") : null;

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from("tasks")
      .select("*")
      .eq("user_id", userId)
      .order("sort_order");

    if (dateStr) {
      query = query.eq("scheduled_date", dateStr);
    }

    const { data } = await query;
    setTasks(data ?? []);
    setLoading(false);
  }, [userId, dateStr, supabase]);

  const addTask = useCallback(async (
    title: string,
    category: TaskCategory = "should_do",
    scheduledDate?: string
  ) => {
    const { data, error } = await supabase
      .from("tasks")
      .insert({
        user_id: userId,
        title,
        category,
        scheduled_date: scheduledDate ?? dateStr,
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      toast.error("Couldn't add task.");
      return null;
    }

    setTasks((prev) => [...prev, data as Task]);
    return data as Task;
  }, [userId, dateStr, supabase]);

  const completeTask = useCallback(async (taskId: string) => {
    const { error } = await supabase
      .from("tasks")
      .update({ status: "done", completed_at: new Date().toISOString() })
      .eq("id", taskId);

    if (!error) {
      setTasks((prev) =>
        prev.map((t) => t.id === taskId ? { ...t, status: "done" as const } : t)
      );
      toast.success("Task done! 🎉");
    }
  }, [supabase]);

  const deleteTask = useCallback(async (taskId: string) => {
    await supabase.from("tasks").delete().eq("id", taskId);
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  }, [supabase]);

  return { tasks, loading, fetchTasks, addTask, completeTask, deleteTask };
}
