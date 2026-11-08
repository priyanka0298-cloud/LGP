import { Sparkles } from "lucide-react";

export const metadata = {
  title: "Coming soon",
  robots: { index: false, follow: false },
};

export default function ComingSoonPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-rose-50 via-purple-50 to-sky-50 px-4 dark:from-rose-950/30 dark:via-purple-950/20 dark:to-sky-950/30">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-400 to-pink-500 shadow-lg">
          <Sparkles className="h-7 w-7 text-white" />
        </div>
        <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
          Softlivi is <span className="bg-gradient-to-r from-rose-500 to-purple-500 bg-clip-text text-transparent">almost here</span>
        </h1>
        <p className="mt-4 text-base text-muted-foreground">
          A gentler way to plan your days is on its way. We&rsquo;re putting the finishing touches on it — check back soon 🌸
        </p>
        <p className="mt-8 text-sm text-muted-foreground">
          Questions? <a href="mailto:hello@softlivi.com" className="font-medium text-primary hover:underline">hello@softlivi.com</a>
        </p>
      </div>
    </main>
  );
}
