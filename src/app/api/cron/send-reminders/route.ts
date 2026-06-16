import { NextResponse } from "next/server";
import webpush from "web-push";
import { createClient } from "@/lib/supabase/server";

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT ?? "mailto:hello@softlivi.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "",
  process.env.VAPID_PRIVATE_KEY ?? ""
);

export async function GET(request: Request) {
  // Verify cron secret to prevent unauthorized calls
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createClient();
  const now = new Date();
  const currentTime = `${String(now.getUTCHours()).padStart(2, "0")}:${String(now.getUTCMinutes()).padStart(2, "0")}`;
  const currentDay = now.getUTCDay(); // 0=Sun..6=Sat
  const isWeekday = currentDay >= 1 && currentDay <= 5;
  const isWeekend = currentDay === 0 || currentDay === 6;
  const todayStr = now.toISOString().split("T")[0];

  // Find reminders due within the current hour
  const hourStart = `${String(now.getUTCHours()).padStart(2, "0")}:00`;
  const hourEnd = `${String(now.getUTCHours()).padStart(2, "0")}:59`;

  const { data: reminders } = await supabase
    .from("reminders")
    .select("id, user_id, title, repeat_type, repeat_days, scheduled_date")
    .eq("is_active", true)
    .gte("scheduled_time", hourStart)
    .lte("scheduled_time", hourEnd);

  if (!reminders?.length) return NextResponse.json({ sent: 0 });

  let sent = 0;
  for (const reminder of reminders) {
    const { repeat_type, repeat_days, scheduled_date } = reminder;

    // Check if this reminder should fire today
    const shouldFire =
      repeat_type === "daily" ||
      (repeat_type === "weekdays" && isWeekday) ||
      (repeat_type === "weekends" && isWeekend) ||
      (repeat_type === "weekly" && repeat_days?.includes(currentDay)) ||
      (repeat_type === "once" && scheduled_date === todayStr);

    if (!shouldFire) continue;

    // Get all push subscriptions for this user
    const { data: subs } = await supabase
      .from("push_subscriptions")
      .select("endpoint, p256dh, auth")
      .eq("user_id", reminder.user_id);

    for (const sub of subs ?? []) {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          JSON.stringify({ title: "Softlivi Reminder", body: reminder.title, url: "/dashboard" })
        );
        sent++;
      } catch {
        // Subscription expired — clean it up
        await supabase.from("push_subscriptions").delete().eq("endpoint", sub.endpoint);
      }
    }

    await supabase.from("reminders").update({ last_sent_at: now.toISOString() }).eq("id", reminder.id);
  }

  return NextResponse.json({ sent, time: currentTime });
}
