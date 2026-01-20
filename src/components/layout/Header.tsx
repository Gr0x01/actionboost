"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";
import { Button } from "@/components/ui";
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
    { href: "#how-it-works", label: "How it works" },
    { href: "#features", label: "Features" },
    { href: "#pricing", label: "Pricing" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full glass border-b border-border/50">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="text-xl font-bold text-foreground hover:text-foreground/80 transition-colors">
            Actionboo.st
          </Link>

          {/* Nav links - hidden on mobile */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="group relative text-[13px] font-semibold uppercase tracking-wide text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 right-0 h-[3px] bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {!loading && user ? (
              <>
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm">
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
                <Link href="/start">
                  <Button size="sm">New Action Plan</Button>
                </Link>
              </>
            ) : !loading ? (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Login
                  </Button>
                </Link>
                <Link href="/start">
                  <Button size="sm">Get Started</Button>
                </Link>
              </>
            ) : (
              <Link href="/start">
                <Button size="sm">Get Started</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
