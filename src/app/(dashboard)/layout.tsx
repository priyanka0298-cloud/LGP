import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/shared/Sidebar";
import { Topbar } from "@/components/shared/Topbar";
import { BottomNav } from "@/components/shared/BottomNav";
import { AccentColorApplier } from "@/components/shared/AccentColorApplier";
import type { Profile, Subscription } from "@/types";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Redirect to onboarding if not completed
  if (profile && !profile.onboarding_completed) {
    redirect("/onboarding");
  }

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AccentColorApplier accentColor={profile?.accent_color ?? "rose"} theme={profile?.theme ?? "light"} />
      {/* Sidebar — desktop only */}
      <div className="hidden md:block">
        <Sidebar />
      </div>
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar profile={profile as Profile | null} subscription={subscription as Subscription | null} />
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="mx-auto max-w-7xl px-4 py-4 pb-24 md:px-6 md:py-6 md:pb-6">
            {children}
          </div>
        </main>
      </div>
      {/* Bottom nav — mobile only */}
      <BottomNav />
    </div>
  );
}
