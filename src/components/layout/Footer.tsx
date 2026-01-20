import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-foreground text-background">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-between sm:text-left">
          {/* Brand */}
          <div>
            <span className="text-base font-black tracking-tight text-background">
              ACTIONBOO.ST
            </span>
            <p className="mt-1 text-sm text-background/50">
              Growth plans that don't suck.
            </p>
          </div>

          {/* Links */}
          <div className="flex gap-6 text-sm font-mono">
            <Link
              href="/about"
              className="text-background/50 hover:text-background transition-colors"
            >
              About
            </Link>
            <Link
              href="/terms"
              className="text-background/50 hover:text-background transition-colors"
            >
              Terms
            </Link>
            <Link
              href="/privacy"
              className="text-background/50 hover:text-background transition-colors"
            >
              Privacy
            </Link>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-6 border-t border-background/20 text-center text-xs text-background/40 font-mono">
          &copy; {new Date().getFullYear()} Actionboo.st
        </div>
      </div>
    </footer>
  );
}
