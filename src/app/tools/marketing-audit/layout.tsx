import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free Marketing Audit — See What's Costing You Customers in 60 Seconds | Boost",
  description:
    "Get a free marketing audit in 60 seconds. Enter your URL and see what's costing you customers — plus the one fix that'll make the biggest difference. Built for small businesses.",
  openGraph: {
    title: "Free Marketing Audit | Boost",
    description:
      "See what's costing you customers in 60 seconds. Free marketing audit for small businesses.",
  },
};

export default function MarketingAuditLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
