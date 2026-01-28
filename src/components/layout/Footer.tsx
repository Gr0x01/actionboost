import Image from "next/image";
import Link from "next/link";
import { BoostLogo } from "@/components/ui";

const footerLinks = {
  product: [
    { label: "See the Output", href: "/in-action" },
    { label: "Free Marketing Audit", href: "/tools/marketing-audit" },
    { label: "Marketing Guide", href: "/marketing-plan-guide" },
    { label: "Boost vs Alternatives", href: "/boost-vs-alternatives" },
  ],
  industries: [
    { label: "SaaS Marketing", href: "/marketing-plan/saas" },
    { label: "E-commerce", href: "/marketing-plan/ecommerce" },
    { label: "Consultants", href: "/marketing-plan/consulting" },
    { label: "Agencies", href: "/marketing-plan/agency" },
    { label: "Newsletters", href: "/marketing-plan/newsletter" },
  ],
  company: [
    { label: "About", href: "/about" },
    { label: "Blog", href: "/blog" },
  ],
  legal: [
    { label: "Terms", href: "/terms" },
    { label: "Privacy", href: "/privacy" },
  ],
};

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wider text-background/40 mb-4">
        {title}
      </h3>
      <ul className="space-y-2.5">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-sm text-background/60 hover:text-background transition-colors"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="bg-[#1a252f] text-background">
      <div className="mx-auto max-w-7xl px-6 py-12">
        {/* Logo */}
        <div className="mb-10">
          <BoostLogo width={80} height={19} className="text-background" />
        </div>

        {/* Link columns - 2 cols on mobile, 4 on desktop */}
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          <FooterColumn title="Product" links={footerLinks.product} />
          <FooterColumn title="Industries" links={footerLinks.industries} />
          <FooterColumn title="Company" links={footerLinks.company} />
          <FooterColumn title="Legal" links={footerLinks.legal} />
        </div>

        {/* Badges row */}
        <div className="mt-10 flex flex-wrap justify-center items-center gap-3 opacity-40 hover:opacity-60 transition-opacity">
          <a
            href="https://peerpush.net/p/actionboost"
            target="_blank"
            rel="noopener"
            style={{ width: 230 }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://peerpush.net/p/actionboost/badge.png"
              alt="Boost badge"
              style={{ width: 230 }}
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

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-background/10 text-center text-xs text-background/30">
          <span className="font-mono">&copy; {new Date().getFullYear()} Boost</span>
        </div>
      </div>
    </footer>
  );
}
