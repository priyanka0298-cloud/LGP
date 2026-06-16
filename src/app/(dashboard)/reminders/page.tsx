import { createClient } from "@/lib/supabase/server";
import { RemindersView } from "@/components/reminders/RemindersView";

export const metadata = { title: "Reminders" };

export default async function RemindersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: reminders } = await supabase
    .from("reminders")
    .select("*")
    .eq("user_id", user.id)
    .order("scheduled_time", { ascending: true });

  return <RemindersView userId={user.id} initialReminders={reminders ?? []} />;
}
