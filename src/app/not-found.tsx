import Link from "next/link";

export const metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-sm text-center">
        <div className="mb-4 text-5xl">🌙</div>
        <h1 className="font-display text-2xl font-bold">This page drifted off</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          We couldn&rsquo;t find what you were looking for. No stress — let&rsquo;s get you back.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          Back home
        </Link>
      </div>
    </main>
  );
}
