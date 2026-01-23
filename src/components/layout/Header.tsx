"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";
import { Sparkles } from "lucide-react";
import type { User as AuthUser } from "@supabase/supabase-js";
import { AboostLogo } from "@/components/ui";
import { UserMenu } from "./UserMenu";
import { CreditBadge } from "./CreditBadge";

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
    <header className="sticky top-0 z-50 w-full bg-background border-b-2 border-foreground/20">
      <div className="mx-auto max-w-7xl px-6">
        {/* Grid layout: Logo | Nav (centered) | Actions */}
        <div className="grid grid-cols-[1fr_auto_1fr] h-14 items-center">
          {/* Logo */}
          <Link href="/" className="hover:opacity-70 transition-opacity justify-self-start">
            <AboostLogo width={120} height={22} className="text-foreground" />
          </Link>

          {/* Nav links - centered, hidden on mobile, stretch to fill height */}
          <nav className="hidden md:flex items-stretch gap-6 h-full">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="
                  flex items-center
                  text-sm font-bold text-foreground/60
                  border-b-2 border-transparent
                  hover:text-foreground hover:border-foreground
                  transition-colors
                "
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3 justify-self-end">
            {!loading && user ? (
              <>
                {user.email === "gr0x01@pm.me" && (
                  <Link
                    href="/in-action/admin"
                    title="Examples (Admin)"
                    className="hidden sm:flex items-center justify-center w-8 h-8 text-cta hover:text-cta-hover transition-colors"
                  >
                    <Sparkles className="h-4 w-4" />
                  </Link>
                )}
                <CreditBadge />
                <UserMenu user={user} />
                <Link
                  href="/start"
                  className="
                    px-4 py-2 text-sm font-bold
                    bg-cta text-white
                    border-2 border-cta border-b-[3px] border-b-[#B85D10]
                    rounded-md
                    hover:bg-cta-hover hover:-translate-y-0.5
                    active:translate-y-0.5 active:border-b-2
                    transition-all duration-100
                  "
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
                  className="
                    px-4 py-2 text-sm font-bold
                    bg-cta text-white
                    border-2 border-cta border-b-[3px] border-b-[#B85D10]
                    rounded-md
                    hover:bg-cta-hover hover:-translate-y-0.5
                    active:translate-y-0.5 active:border-b-2
                    transition-all duration-100
                  "
                >
                  Get Started
                </Link>
              </>
            ) : (
              <Link
                href="/start"
                className="
                  px-4 py-2 text-sm font-bold
                  bg-cta text-white
                  border-2 border-cta border-b-[3px] border-b-[#B85D10]
                  rounded-md
                  hover:bg-cta-hover hover:-translate-y-0.5
                  active:translate-y-0.5 active:border-b-2
                  transition-all duration-100
                "
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
