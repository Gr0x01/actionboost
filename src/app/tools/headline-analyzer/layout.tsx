import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free Headline Analyzer — Score Your Headline in 30 Seconds | Boost",
  description:
    "Get a brutally honest score on your headline's clarity, specificity, and differentiation — plus 3 rewrites. Free in 30 seconds. No signup required.",
  openGraph: {
    title: "Free Headline Analyzer | Boost",
    description:
      "Score your headline on clarity, specificity, and differentiation — plus 3 rewrites. Free, no signup.",
  },
};

export default function HeadlineAnalyzerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
