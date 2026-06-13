import React from "react";
import Link from "next/link";
import { Sparkles, Heart } from "lucide-react";

const LINKS: Record<string, { label: string; href: string }[]> = {
  Product: [
    { label: "Features", href: "/#features" },
    { label: "Pricing", href: "/pricing" },
    { label: "Templates", href: "/marketplace" },
  ],
  Support: [
    { label: "Sign Up", href: "/signup" },
    { label: "Log In", href: "/login" },
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
  ],
};

export function LandingFooter() {
  return (
    <footer className="border-t border-border/50 bg-muted/30 px-6 py-16">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 mb-12">
          {/* Brand */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-rose-400 to-pink-500">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="font-display font-semibold">Lazy Girl Planner</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              Planning for the rest of us. Anti-hustle, pro-self-compassion.
            </p>
            <p className="mt-4 text-xs text-muted-foreground">
              🌸 Made with love for ambitious women everywhere
            </p>
          </div>

          {/* Links */}
          {Object.entries(LINKS).map(([category, items]) => (
            <div key={category}>
              <h4 className="text-sm font-semibold mb-3">{category}</h4>
              <ul className="space-y-2">
                {items.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-border/50 pt-8 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Lazy Girl Planner. All rights reserved.
          </p>
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            Built with <Heart className="h-3.5 w-3.5 fill-rose-500 text-rose-500" /> for women who are done with burnout
          </p>
        </div>
      </div>
    </footer>
  );
}
