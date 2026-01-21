"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";
import { LayoutDashboard } from "lucide-react";
import type { User as AuthUser } from "@supabase/supabase-js";

export function Header() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Get initial session
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const navLinks = [
    { href: "/#how-it-works", label: "How It Works" },
    { href: "/#pricing", label: "Pricing" },
    { href: "/blog/our-growth-plan", label: "Our Plan" },
    { href: "/about", label: "About" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-background border-b-[3px] border-foreground">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex h-14 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="text-lg font-black tracking-tight text-foreground hover:text-foreground/70 transition-colors">
            ACTIONBOO.ST
          </Link>

          {/* Nav links - hidden on mobile */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-bold text-foreground/60 hover:text-foreground border-b-2 border-transparent hover:border-foreground transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {!loading && user ? (
              <>
                {user.email === "gr0x01@pm.me" && (
                  <Link
                    href="/first-impressions"
                    className="hidden sm:flex items-center gap-2 px-3 py-2 text-sm font-bold text-cta hover:text-cta-hover transition-colors"
                  >
                    FI
                  </Link>
                )}
                <Link
                  href="/dashboard"
                  className="hidden sm:flex items-center gap-2 px-3 py-2 text-sm font-bold text-foreground/60 hover:text-foreground transition-colors"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
                <Link
                  href="/start"
                  className="px-4 py-2 text-sm font-bold bg-cta text-white border-2 border-cta hover:bg-cta-hover transition-colors"
                >
                  New Plan
                </Link>
              </>
            ) : !loading ? (
              <>
                <Link
                  href="/login"
                  className="px-3 py-2 text-sm font-bold text-foreground/60 hover:text-foreground transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/start"
                  className="px-4 py-2 text-sm font-bold bg-cta text-white border-2 border-cta hover:bg-cta-hover transition-colors"
                >
                  Get Started
                </Link>
              </>
            ) : (
              <Link
                href="/start"
                className="px-4 py-2 text-sm font-bold bg-cta text-white border-2 border-cta hover:bg-cta-hover transition-colors"
              >
                Get Started
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
