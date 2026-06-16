import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { ThemeProvider } from "@/components/shared/ThemeProvider";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: {
    default: "Lazy Girl Planner — Plan Softly, Live Fully",
    template: "%s | Lazy Girl Planner",
  },
  description:
    "A digital planning and wellness platform for overwhelmed, ambitious women. Gentle planning, habit tracking, journaling, and AI-powered productivity — without the guilt.",
  keywords: [
    "planner",
    "productivity",
    "wellness",
    "habit tracker",
    "journal",
    "ADHD planner",
    "anti-hustle",
    "soft life",
    "goal setting",
    "neurodivergent",
  ],
  authors: [{ name: "Lazy Girl Planner" }],
  creator: "Lazy Girl Planner",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: "Lazy Girl Planner",
    title: "Lazy Girl Planner — Plan Softly, Live Fully",
    description:
      "Gentle planning, habit tracking, and AI-powered wellness for ambitious women who are done with hustle culture.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Lazy Girl Planner",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Lazy Girl Planner",
    description: "Plan softly. Live fully.",
    images: ["/og-image.png"],
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Lazy Girl Planner",
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    shortcut: "/icon-192.png",
    apple: "/apple-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fff1f5" },
    { media: "(prefers-color-scheme: dark)", color: "#1a0a10" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${playfair.variable} font-sans`} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange={false}
        >
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                borderRadius: "12px",
                background: "hsl(var(--card))",
                color: "hsl(var(--foreground))",
                border: "1px solid hsl(var(--border))",
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
