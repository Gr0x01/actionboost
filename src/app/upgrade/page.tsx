import type { Metadata } from "next";
import { UpgradeContent } from "./UpgradeContent";

export const metadata: Metadata = {
  title: "Upgrade to Full Boost | Boost",
  description:
    "Get a 30-day marketing plan built from real competitive research. Specific to your business.",
};

export default async function UpgradePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const from = typeof params.from === "string" ? params.from : undefined;
  const audit = typeof params.audit === "string" ? params.audit : undefined;
  const token = typeof params.token === "string" ? params.token : undefined;
  const websiteUrl =
    typeof params.websiteUrl === "string" ? params.websiteUrl : undefined;

  return (
    <UpgradeContent
      from={from}
      audit={audit}
      token={token}
      websiteUrl={websiteUrl}
    />
  );
}
