"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, Sparkles, X } from "lucide-react";
import type { User as AuthUser } from "@supabase/supabase-js";
import { BoostLogo } from "@/components/ui";
import { UserMenu } from "./UserMenu";
import { CreditBadge } from "./CreditBadge";

export function Header() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    { href: "/in-action", label: "See the Output" },
    { href: "/#pricing", label: "Pricing" },
    { href: "/about", label: "About" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-background border-b-2 border-foreground/20">
      <div className="mx-auto max-w-7xl px-6">
        {/* Flex on mobile, Grid on desktop for centered nav */}
        <div className="flex justify-between lg:grid lg:grid-cols-[1fr_auto_1fr] h-14 items-center">
          {/* Logo */}
          <Link href="/" className="hover:opacity-70 transition-opacity justify-self-start">
            <BoostLogo width={80} height={19} className="text-foreground" />
          </Link>

          {/* Nav links - centered, hidden below lg, stretch to fill height */}
          <nav className="hidden lg:flex items-stretch gap-6 h-full">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="
                  flex items-center
                  text-sm font-bold text-foreground/60
                  border-b-2 border-transparent
                  hover:text-foreground
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
                <div className="hidden sm:block">
                  <CreditBadge />
                </div>
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

            {/* Hamburger menu button - visible below lg, always at far right */}
            <button
              className="lg:hidden flex items-center justify-center w-10 h-10 -mr-2 text-foreground/60 hover:text-foreground transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
            >
              <AnimatePresence mode="wait" initial={false}>
                {mobileMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <X className="h-5 w-5" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Menu className="h-5 w-5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.nav
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="lg:hidden border-t border-foreground/10 overflow-hidden"
            >
              <div className="flex flex-col gap-1 py-4">
                {navLinks.map((link, index) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.15 }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="
                        block px-4 py-2.5 text-sm font-bold text-foreground/60
                        hover:text-foreground hover:bg-foreground/5
                        rounded-md transition-colors
                      "
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
