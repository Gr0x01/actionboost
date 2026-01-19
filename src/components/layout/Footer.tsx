import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-navy text-white/90">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-between sm:text-left">
          {/* Brand */}
          <div>
            <span className="text-lg font-semibold text-white">
              Actionboo.st
            </span>
            <p className="mt-1 text-sm text-white/60">
              AI-powered action plan for startups and entrepreneurs
            </p>
          </div>

          {/* Links */}
          <div className="flex gap-6 text-sm">
            <Link
              href="/terms"
              className="text-white/60 hover:text-white transition-colors"
            >
              Terms
            </Link>
            <Link
              href="/privacy"
              className="text-white/60 hover:text-white transition-colors"
            >
              Privacy
            </Link>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-6 border-t border-white/10 text-center text-sm text-white/40">
          &copy; {new Date().getFullYear()} Actionboo.st. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
