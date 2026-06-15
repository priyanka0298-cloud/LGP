import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getResendClient, FROM_EMAIL } from "@/lib/email/resend";
import { dailyCheckinEmail } from "@/lib/email/templates/daily-checkin";
import { weeklyCheckinEmail } from "@/lib/email/templates/weekly-checkin";
import type { Database } from "@/types/database";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getLocalHour(utcDate: Date, timezone: string): number {
  const str = utcDate.toLocaleTimeString("en-US", { timeZone: timezone, hour: "2-digit", hour12: false });
  return parseInt(str.split(":")[0]);
}

function getLocalDayOfWeek(utcDate: Date, timezone: string): number {
  // 0 = Sunday, 1 = Monday, ...
  const str = utcDate.toLocaleDateString("en-US", { timeZone: timezone, weekday: "short" });
  return ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].indexOf(str.slice(0, 3));
}

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const resend = getResendClient();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://lazy-girl-planner.vercel.app";
  const nowUtc = new Date();

  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("id, email, full_name, display_name, daily_reminder_time, reminder_frequency, timezone")
    .eq("daily_reminder_enabled", true);

  if (error) {
    console.error("Failed to fetch profiles:", error);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }

  let sent = 0;
  const errors: string[] = [];

  for (const profile of profiles ?? []) {
    try {
      const tz = profile.timezone ?? "America/New_York";
      const frequency = profile.reminder_frequency ?? "weekly";
      const localHour = getLocalHour(nowUtc, tz);
      const localDay = getLocalDayOfWeek(nowUtc, tz);
      const name = profile.display_name ?? profile.full_name ?? "friend";

      let shouldSend = false;
      let emailContent: { html: string; text: string; subject: string };

      if (frequency === "daily") {
        const [preferredHour] = (profile.daily_reminder_time ?? "08:00").split(":").map(Number);
        shouldSend = localHour === preferredHour;
        emailContent = dailyCheckinEmail({ name, appUrl });
      } else {
        // Weekly: send Monday at 9 AM in user's timezone
        shouldSend = localDay === 1 && localHour === 9;
        emailContent = weeklyCheckinEmail({ name, appUrl });
      }

      if (!shouldSend) continue;

      await resend.emails.send({
        from: FROM_EMAIL,
        to: profile.email,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text,
      });

      sent++;
    } catch (err) {
      errors.push(`${profile.email}: ${err instanceof Error ? err.message : "unknown"}`);
    }
  }

  return NextResponse.json({ sent, errors, checkedAt: nowUtc.toISOString() });
}
