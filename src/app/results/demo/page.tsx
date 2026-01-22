import { promises as fs } from "fs";
import path from "path";
import { Header, Footer, ResultsLayout } from "@/components/layout";
import { ResultsContent, ExportBar } from "@/components/results";
import { parseStrategy } from "@/lib/markdown/parser";

async function getStrategy(): Promise<string> {
  const filePath = path.join(process.cwd(), "docs", "actionboost-strategy-export.md");
  try {
    return await fs.readFile(filePath, "utf-8");
  } catch {
    return "# Strategy Not Found\n\nThe strategy document could not be loaded.";
  }
}

export default async function DemoResultsPage() {
  const markdown = await getStrategy();
  const strategy = parseStrategy(markdown);

  const demoBanner = (
    <div className="bg-amber-100 border-b-[3px] border-amber-600 px-6 py-3">
      <p className="text-center font-mono text-xs tracking-[0.1em] text-amber-800 uppercase font-semibold">
        Demo preview — Real output for Aboost
      </p>
    </div>
  );

  const exportBar = (
    <ExportBar
      markdown={markdown}
      runId="demo"
      shareSlug={null}
      productName="Aboost - AI growth strategist"
    />
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <ResultsLayout
        toc={{ strategy }}
        slots={{
          topBanner: demoBanner,
          afterToc: exportBar,
        }}
      >
        <ResultsContent strategy={strategy} />
      </ResultsLayout>

      <Footer />
    </div>
  );
}
