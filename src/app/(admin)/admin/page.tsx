import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AdminDashboard } from "@/components/admin/AdminDashboard";

export const metadata = { title: "Admin" };

// Simple admin check — in production add a proper admin role to profiles
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim());

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !ADMIN_EMAILS.includes(user.email ?? "")) {
    redirect("/dashboard");
  }

  const [
    { count: userCount },
    { count: taskCount },
    { count: premiumCount },
    { data: recentUsers },
    { data: templates },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("tasks").select("*", { count: "exact", head: true }),
    supabase.from("subscriptions").select("*", { count: "exact", head: true }).eq("plan", "premium"),
    supabase
      .from("profiles")
      .select("id, email, full_name, created_at, onboarding_completed")
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("planner_templates")
      .select("*")
      .order("created_at", { ascending: false }),
  ]);

  return (
    <AdminDashboard
      stats={{
        users: userCount ?? 0,
        tasks: taskCount ?? 0,
        premium: premiumCount ?? 0,
        conversionRate: userCount ? Math.round(((premiumCount ?? 0) / userCount) * 100) : 0,
      }}
      recentUsers={recentUsers ?? []}
      templates={templates ?? []}
    />
  );
}
