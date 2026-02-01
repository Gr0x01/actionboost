import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free Email Subject Line Scorer — Score Your Subject Line in 30 Seconds | Boost",
  description:
    "Get a brutally honest score on your email subject line's clarity, urgency, and curiosity — plus 3 rewrites. Free in 30 seconds. No signup required.",
  openGraph: {
    title: "Free Email Subject Line Scorer | Boost",
    description:
      "Score your email subject line on clarity, urgency, and curiosity — plus 3 rewrites. Free, no signup.",
  },
};

export default function EmailSubjectScorerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
