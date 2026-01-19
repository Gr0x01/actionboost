import Link from "next/link";
import { Button } from "@/components/ui";
import { Zap } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full glass border-b border-border/50">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cta to-accent shadow-sm group-hover:shadow-md transition-shadow">
              <Zap className="h-4 w-4 text-white" fill="white" />
            </div>
            <span className="text-xl font-bold text-foreground">
              Actionboo.st
            </span>
          </Link>

          {/* CTA */}
          <Link href="/start">
            <Button size="sm">Get Started</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
