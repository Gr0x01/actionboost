"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ResultsContent, StatusMessage, ExportBar } from "@/components/results";
import { parseStrategy, type ParsedStrategy } from "@/lib/markdown/parser";

type RunStatus = "pending" | "processing" | "complete" | "failed";

interface RunData {
  id: string;
  status: RunStatus;
  input: Record<string, unknown>;
  output: string | null;
  share_slug: string | null;
  completed_at: string | null;
}

export default function ResultsPage() {
  const params = useParams();
  const runId = params.runId as string;

  const [run, setRun] = useState<RunData | null>(null);
  const [strategy, setStrategy] = useState<ParsedStrategy | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!runId) return;

    const fetchRun = async () => {
      try {
        const res = await fetch(`/api/runs/${runId}`);
        if (!res.ok) {
          if (res.status === 404) {
            setError("Strategy not found");
          } else {
            setError("Failed to load strategy");
          }
          setLoading(false);
          return;
        }

        const data = await res.json();
        setRun(data.run);

        // Parse strategy if complete
        if (data.run.status === "complete" && data.run.output) {
          const parsed = parseStrategy(data.run.output);
          setStrategy(parsed);
        }

        setLoading(false);
      } catch {
        setError("Failed to load strategy");
        setLoading(false);
      }
    };

    fetchRun();
  }, [runId]);

  // Poll for status if pending/processing (max 100 polls = ~5 minutes)
  useEffect(() => {
    if (!runId || !run) return;
    if (run.status !== "pending" && run.status !== "processing") return;

    const MAX_POLLS = 100;
    let pollCount = 0;

    const interval = setInterval(async () => {
      pollCount++;

      // Stop polling after max attempts
      if (pollCount >= MAX_POLLS) {
        clearInterval(interval);
        setError("Strategy generation is taking longer than expected. Please refresh the page.");
        return;
      }

      try {
        const res = await fetch(`/api/runs/${runId}/status`);
        if (res.ok) {
          const data = await res.json();

          if (data.status === "complete") {
            // Refetch full data
            const fullRes = await fetch(`/api/runs/${runId}`);
            if (fullRes.ok) {
              const fullData = await fullRes.json();
              setRun(fullData.run);
              if (fullData.run.output) {
                setStrategy(parseStrategy(fullData.run.output));
              }
            }
            clearInterval(interval);
          } else if (data.status === "failed") {
            setRun((prev) => (prev ? { ...prev, status: "failed" } : null));
            clearInterval(interval);
          }
        }
      } catch {
        // Silently continue polling on network errors
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [runId, run]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-mesh">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-pulse text-muted">Loading...</div>
        </main>
        <Footer />
      </div>
    );
  }

  // Error state
  if (error || !run) {
    return (
      <div className="min-h-screen flex flex-col bg-mesh">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <StatusMessage status="failed" />
        </main>
        <Footer />
      </div>
    );
  }

  // Status states (pending/processing/failed)
  if (run.status !== "complete") {
    return (
      <div className="min-h-screen flex flex-col bg-mesh">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <StatusMessage
            status={run.status as "pending" | "processing" | "failed"}
          />
        </main>
        <Footer />
      </div>
    );
  }

  // Extract product name for PDF title
  const productName =
    typeof run.input === "object" && run.input !== null
      ? (run.input as { productDescription?: string }).productDescription?.slice(
          0,
          50
        )
      : undefined;

  // Success state - render full results
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-8">
        <div className="mx-auto max-w-4xl px-6">
          <ExportBar
            markdown={run.output || ""}
            runId={run.id}
            shareSlug={run.share_slug}
            productName={productName}
          />

          {strategy && <ResultsContent strategy={strategy} />}
        </div>
      </main>

      <Footer />
    </div>
  );
}
