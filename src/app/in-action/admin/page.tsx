"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";
import { motion } from "framer-motion";
import { Loader2, Plus, Eye, EyeOff, Trash2, ExternalLink, Edit2 } from "lucide-react";
import { Header, Footer } from "@/components/layout";
import { Button } from "@/components/ui/Button";
import type { Example } from "@/lib/types/database";

const ALLOWED_EMAIL = "gr0x01@pm.me";

function isLocalhost(): boolean {
  if (typeof window === "undefined") return false;
  const hostname = window.location.hostname;
  return hostname === "localhost" || hostname === "127.0.0.1";
}

// Industry and stage options
const INDUSTRIES = ["Local Service", "E-commerce", "SaaS", "Creator", "Agency", "Other"];
const STAGES = ["Pre-launch", "Early traction", "Plateau", "Growth", "Established"];

interface ExampleFormData {
  slug: string;
  industry: string;
  stage: string;
  insight: string;
  content: string;
}

const emptyFormData: ExampleFormData = {
  slug: "",
  industry: "",
  stage: "",
  insight: "",
  content: "",
};

export default function InActionAdminPage() {
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [examples, setExamples] = useState<Example[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ExampleFormData>(emptyFormData);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Check authorization
  useEffect(() => {
    if (isLocalhost()) {
      setAuthorized(true);
      return;
    }

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    supabase.auth.getUser().then(({ data: { user } }) => {
      setAuthorized(user?.email === ALLOWED_EMAIL);
    });
  }, []);

  // Fetch examples
  useEffect(() => {
    if (authorized === false) return;
    if (authorized === true) {
      fetchExamples();
    }
  }, [authorized]);

  const fetchExamples = async () => {
    try {
      const res = await fetch("/api/examples?all=true");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setExamples(data.examples || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load examples");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);

    try {
      const url = editingId ? `/api/examples/${editingId}` : "/api/examples";
      const method = editingId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save");
      }

      await fetchExamples();
      setShowForm(false);
      setEditingId(null);
      setFormData(emptyFormData);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (example: Example) => {
    setFormData({
      slug: example.slug,
      industry: example.industry,
      stage: example.stage,
      insight: example.insight,
      content: example.content,
    });
    setEditingId(example.id);
    setShowForm(true);
    setFormError(null);
  };

  const handleToggleLive = async (example: Example) => {
    try {
      const res = await fetch(`/api/examples/${example.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_live: !example.is_live }),
      });

      if (!res.ok) throw new Error("Failed to update");
      await fetchExamples();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this example?")) return;

    try {
      const res = await fetch(`/api/examples/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      await fetchExamples();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
    }
  };

  // Loading authorization
  if (authorized === null) {
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

  // Not authorized
  if (!authorized) {
    return (
      <div className="min-h-screen flex flex-col bg-mesh">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="text-center">
            <h1 className="text-6xl font-black text-foreground mb-4">404</h1>
            <p className="text-foreground/60 mb-6">Page not found</p>
            <Link href="/">
              <Button>Go home</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-mesh">
      <Header />

      <main className="flex-1 px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="font-mono text-[10px] tracking-[0.15em] text-cta uppercase font-semibold mb-1">
                Admin
              </p>
              <h1 className="text-2xl font-black text-foreground">
                Boost in Action
              </h1>
              <p className="text-foreground/60 text-sm mt-1">
                Add example Boost outputs to showcase
              </p>
            </div>
            <div className="flex gap-3">
              <Link href="/in-action">
                <Button variant="outline" size="sm">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Public
                </Button>
              </Link>
              <Button
                onClick={() => {
                  setFormData(emptyFormData);
                  setEditingId(null);
                  setShowForm(true);
                  setFormError(null);
                }}
                size="sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Example
              </Button>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Form Modal */}
          {showForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setShowForm(false);
                  setEditingId(null);
                }
              }}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border-[3px] border-foreground bg-surface p-6 shadow-[6px_6px_0_0_rgba(44,62,80,1)]"
              >
                <h2 className="text-xl font-bold mb-6">
                  {editingId ? "Edit Example" : "Add Example"}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Slug */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Slug <span className="text-cta">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) =>
                        setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") })
                      }
                      placeholder="salon-instagram-strategy"
                      className="w-full rounded-lg px-4 py-3 bg-background border border-border text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-cta"
                      required
                    />
                  </div>

                  {/* Industry & Stage */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Industry <span className="text-cta">*</span>
                      </label>
                      <select
                        value={formData.industry}
                        onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                        className="w-full rounded-lg px-4 py-3 bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-cta"
                        required
                      >
                        <option value="">Select...</option>
                        {INDUSTRIES.map((ind) => (
                          <option key={ind} value={ind}>{ind}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Stage <span className="text-cta">*</span>
                      </label>
                      <select
                        value={formData.stage}
                        onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                        className="w-full rounded-lg px-4 py-3 bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-cta"
                        required
                      >
                        <option value="">Select...</option>
                        {STAGES.map((st) => (
                          <option key={st} value={st}>{st}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Insight - card preview text */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Card Preview Text <span className="text-cta">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.insight}
                      onChange={(e) => setFormData({ ...formData, insight: e.target.value })}
                      placeholder="The hook that appears on the gallery card"
                      className="w-full rounded-lg px-4 py-3 bg-background border border-border text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-cta"
                      required
                    />
                    <p className="text-xs text-muted mt-1">Short text shown on gallery cards to entice clicks</p>
                  </div>

                  {/* Content - the full Boost output */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Boost Output <span className="text-cta">*</span>
                    </label>
                    <textarea
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      placeholder="Paste the full Boost output markdown here..."
                      rows={16}
                      className="w-full rounded-lg px-4 py-3 bg-background border border-border text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-cta font-mono text-sm"
                      required
                    />
                  </div>

                  {formError && (
                    <p className="text-red-600 text-sm">{formError}</p>
                  )}

                  {/* Actions */}
                  <div className="flex justify-end gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowForm(false);
                        setEditingId(null);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={submitting}>
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : editingId ? (
                        "Update"
                      ) : (
                        "Create"
                      )}
                    </Button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}

          {/* Examples List */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted" />
            </div>
          ) : examples.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-foreground/60 mb-4">No examples yet</p>
              <Button
                onClick={() => {
                  setFormData(emptyFormData);
                  setShowForm(true);
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add your first example
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {examples.map((example) => (
                <div
                  key={example.id}
                  className={`rounded-xl border-2 p-4 transition-all ${
                    example.is_live
                      ? "border-green-400 bg-green-50/50"
                      : "border-border bg-surface"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 text-xs font-mono uppercase tracking-wide bg-foreground/10 rounded">
                          {example.industry}
                        </span>
                        <span className="px-2 py-0.5 text-xs font-mono uppercase tracking-wide bg-foreground/10 rounded">
                          {example.stage}
                        </span>
                        {example.is_live ? (
                          <span className="px-2 py-0.5 text-xs font-bold uppercase tracking-wide bg-green-500 text-white rounded">
                            Live
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 text-xs font-mono uppercase tracking-wide bg-foreground/20 rounded">
                            Draft
                          </span>
                        )}
                      </div>
                      <p className="font-medium text-foreground mb-1 truncate">
                        {example.insight}
                      </p>
                      <p className="text-sm text-muted">
                        /{example.slug} &middot; {example.content.length.toLocaleString()} chars
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleEdit(example)}
                        className="p-2 rounded-lg hover:bg-foreground/10 transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4 text-foreground/60" />
                      </button>
                      <button
                        onClick={() => handleToggleLive(example)}
                        className="p-2 rounded-lg hover:bg-foreground/10 transition-colors"
                        title={example.is_live ? "Unpublish" : "Publish"}
                      >
                        {example.is_live ? (
                          <EyeOff className="w-4 h-4 text-foreground/60" />
                        ) : (
                          <Eye className="w-4 h-4 text-foreground/60" />
                        )}
                      </button>
                      {example.is_live && (
                        <Link
                          href={`/in-action/${example.slug}`}
                          className="p-2 rounded-lg hover:bg-foreground/10 transition-colors"
                          title="View"
                        >
                          <ExternalLink className="w-4 h-4 text-foreground/60" />
                        </Link>
                      )}
                      <button
                        onClick={() => handleDelete(example.id)}
                        className="p-2 rounded-lg hover:bg-red-100 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
