import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free Target Audience Generator — Know Exactly Who to Sell To | Boost",
  description:
    "Generate a detailed target audience profile for your business in 60 seconds. Demographics, psychographics, pain points, where to find them, and messaging guide. Free.",
  openGraph: {
    title: "Free Target Audience Generator | Boost",
    description:
      "Know exactly who to sell to. Free target audience profile with demographics, pain points, and messaging guide.",
  },
};

export default function TargetAudienceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
