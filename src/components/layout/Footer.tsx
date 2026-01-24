import Image from "next/image";
import Link from "next/link";
import { BoostLogo } from "@/components/ui";

export function Footer() {
  return (
    <footer className="bg-[#1a252f] text-background">
      <div className="mx-auto max-w-7xl px-6 py-10">
        {/* Main row: Logo + Links */}
        <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:justify-between sm:text-left">
          {/* Brand */}
          <BoostLogo width={80} height={19} className="text-background" />

          {/* Links */}
          <div className="flex gap-5 text-sm">
            <Link
              href="/in-action"
              className="text-background/50 hover:text-background transition-colors"
            >
              See the output
            </Link>
            <Link
              href="/blog"
              className="text-background/50 hover:text-background transition-colors"
            >
              Blog
            </Link>
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

        {/* Badges row */}
        <div className="mt-6 flex justify-center items-center gap-3 opacity-40 hover:opacity-60 transition-opacity">
          <a
            href="https://peerpush.net/p/actionboost"
            target="_blank"
            rel="noopener"
          >
            <Image
              src="https://peerpush.net/p/actionboost/badge.png"
              alt="Boost on PeerPush"
              width={120}
              height={28}
            />
          </a>
          <a
            href="https://www.uneed.best/tool/actionboost"
            target="_blank"
            rel="noopener"
          >
            <Image
              src="https://www.uneed.best/EMBED1B.png"
              alt="Featured on Uneed"
              width={120}
              height={28}
            />
          </a>
          <a
            href="https://auraplusplus.com/projects/boost-market-research-strategy"
            target="_blank"
            rel="noopener"
          >
            <Image
              src="https://auraplusplus.com/images/badges/featured-on-dark.svg"
              alt="Featured on Aura++"
              width={120}
              height={28}
            />
          </a>
        </div>

        {/* Copyright + Founder */}
        <div className="mt-6 pt-6 border-t border-background/10 text-center text-xs text-background/30">
          <span className="font-mono">&copy; {new Date().getFullYear()} Boost</span>
          <span className="mx-2">·</span>
          <span>
            Built by{" "}
            <a
              href="https://x.com/AceTomato"
              target="_blank"
              rel="noopener"
              className="text-background/50 hover:text-background transition-colors"
            >
              @AceTomato
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}
