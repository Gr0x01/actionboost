import { Metadata } from "next";
import { createServiceClient } from "@/lib/supabase/server";

type Props = {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const supabase = createServiceClient();

  const { data: impression } = await supabase
    .from("first_impressions")
    .select("url, output, status")
    .eq("id", id)
    .single();

  if (!impression) {
    return {
      title: "Not Found | Actionboo.st",
    };
  }

  let hostname = "a startup";
  try {
    hostname = new URL(impression.url).hostname.replace("www.", "");
  } catch {
    // ignore
  }

  // Get first ~150 chars of output for description
  const description = impression.output
    ? impression.output.replace(/[#*_\-]/g, "").slice(0, 150) + "..."
    : `Growth analysis for ${hostname}`;

  return {
    title: `First Impressions: ${hostname} | Actionboo.st`,
    description,
    openGraph: {
      title: `First Impressions: ${hostname}`,
      description,
      type: "article",
      siteName: "Actionboo.st",
      url: `https://actionboo.st/i/${id}`,
    },
    twitter: {
      card: "summary_large_image",
      title: `First Impressions: ${hostname}`,
      description,
    },
  };
}

export default function Layout({ children }: Props) {
  return children;
}
