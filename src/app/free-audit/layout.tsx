import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free Marketing Clarity Score | Boost",
  description:
    "Find out where you stand vs competitors. Get a free clarity score for your business — real research, specific findings, ready in 2 minutes.",
  openGraph: {
    title: "Is your website actually convincing anyone?",
    description:
      "Free clarity score for your business. Real competitive research, specific findings, no signup required.",
    type: "website",
  },
};

export default function FreeAuditLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
