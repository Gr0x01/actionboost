import type { Metadata } from "next";

// Private results pages should not be indexed
// Only /share/[slug] pages are public and crawlable
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function ResultsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
