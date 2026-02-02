import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free Landing Page Roaster — Get Your Page Roasted with Specific Fixes | Boost",
  description:
    "Get a sharp, entertaining roast of your landing page with specific fixes. We evaluate copy, design, conversion flow, and trust signals — the full page, not just above-the-fold.",
  openGraph: {
    title: "Free Landing Page Roaster | Boost",
    description:
      "Get your landing page roasted — sharp observations with specific fixes for copy, design, conversion, and trust.",
  },
};

export default function LandingPageRoasterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
