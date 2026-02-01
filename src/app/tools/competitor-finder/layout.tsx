import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free Competitor Finder — See Who You're Up Against | Boost",
  description:
    "Enter your URL and get 5 competitors with positioning analysis, weaknesses, and opportunities you can exploit. Free, no signup required.",
  openGraph: {
    title: "Free Competitor Finder | Boost",
    description:
      "Find your top 5 competitors with strategic intel — positioning, weaknesses, and opportunities. Free, no signup.",
  },
};

export default function CompetitorFinderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
