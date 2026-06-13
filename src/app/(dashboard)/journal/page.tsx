import { createClient } from "@/lib/supabase/server";
import { JournalView } from "@/components/journal/JournalView";
import { format } from "date-fns";

export const metadata = { title: "Journal" };

export default async function JournalPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const today = format(new Date(), "yyyy-MM-dd");

  const [{ data: todayEntry }, { data: recentEntries }] = await Promise.all([
    supabase
      .from("journal_entries")
      .select("*")
      .eq("user_id", user.id)
      .eq("entry_date", today)
      .eq("entry_type", "daily")
      .single(),
    supabase
      .from("journal_entries")
      .select("id, entry_date, entry_type, title, mood_snapshot, tags, created_at")
      .eq("user_id", user.id)
      .order("entry_date", { ascending: false })
      .limit(20),
  ]);

  return (
    <JournalView
      userId={user.id}
      todayEntry={todayEntry ?? null}
      recentEntries={recentEntries ?? []}
    />
  );
}
