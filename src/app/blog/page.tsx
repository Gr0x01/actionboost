import { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Header, Footer } from "@/components/layout";
import { config } from "@/lib/config";

export const metadata: Metadata = {
  title: "Blog | Boost",
  description:
    "Startup teardowns, growth tactics, and strategies that actually work. Real research, real results.",
  openGraph: {
    title: "Blog | Boost",
    description:
      "Startup teardowns, growth tactics, and strategies that actually work.",
    type: "website",
  },
};

// Blog post data
interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  readTime: string;
  category: "teardown" | "highlight" | "meta";
  featured?: boolean;
}

const BLOG_POSTS: BlogPost[] = [
  {
    slug: "our-growth-plan",
    title: "We Ran Boost on Itself",
    description:
      "What happens when an AI growth strategist analyzes its own product? Here's the real Boost we're following to grow our own product.",
    date: "January 2026",
    readTime: "15 min read",
    category: "meta",
    featured: true,
  },
];

const CATEGORY_LABELS: Record<BlogPost["category"], string> = {
  teardown: "Teardown",
  highlight: "Quick Win",
  meta: "Behind the Scenes",
};

function BlogPostCard({ post }: { post: BlogPost }) {
  return (
    <Link href={`/blog/${post.slug}`} className="group block">
      <article
        className={`rounded-lg border-2 border-foreground/20 bg-background p-6 lg:p-8 ${
          post.featured
            ? "shadow-[4px_4px_0_rgba(44,62,80,0.12)]"
            : "shadow-[4px_4px_0_rgba(44,62,80,0.08)]"
        } hover:shadow-[4px_4px_0_rgba(44,62,80,0.15)] hover:-translate-y-0.5 transition-all duration-100`}
      >
        {/* Top row: category + date */}
        <div className="flex items-center justify-between gap-4 mb-4">
          <span className="text-[10px] font-semibold tracking-wide uppercase text-cta">
            {CATEGORY_LABELS[post.category]}
          </span>
          <span className="text-xs text-foreground/50">
            {post.date} · {post.readTime}
          </span>
        </div>

        {/* Title */}
        <h2
          className={`font-bold text-foreground mb-3 ${
            post.featured ? "text-2xl sm:text-3xl" : "text-xl sm:text-2xl"
          }`}
        >
          {post.title}
        </h2>

        {/* Description */}
        <p className="text-foreground/70 leading-relaxed line-clamp-2 mb-4">
          {post.description}
        </p>

        {/* Read more */}
        <div className="flex items-center gap-2 font-semibold text-foreground group-hover:text-cta transition-colors">
          Read more
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </div>
      </article>
    </Link>
  );
}

export default function BlogPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-6">
          {/* Hero - minimal */}
          <section className="pt-12 pb-8 lg:pt-16 lg:pb-12">
            <p className="text-xs font-semibold tracking-wide text-foreground/50 uppercase mb-4">
              Growth insights for small businesses
            </p>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground mb-4">
              The Blog
            </h1>
            <p className="text-lg text-foreground/70 max-w-xl leading-relaxed">
              Real strategies, real research, real results. No fluff.
            </p>
          </section>

          {/* Blog posts - 2-col grid, featured spans full width */}
          <section className="grid md:grid-cols-2 gap-6 pb-12">
            {BLOG_POSTS.map((post) => (
              <div key={post.slug} className={post.featured ? "md:col-span-2" : ""}>
                <BlogPostCard post={post} />
              </div>
            ))}
          </section>

          {/* Bottom CTA */}
          <section className="pb-16">
            <div className="rounded-lg border-2 border-foreground/20 bg-background p-8 shadow-[4px_4px_0_rgba(44,62,80,0.1)] text-center space-y-4">
              <p className="text-xs font-medium tracking-wide text-foreground/50 uppercase">
                Build your own Boost
              </p>
              <h2 className="text-2xl font-bold text-foreground">
                Ready to stop guessing?
              </h2>
              <p className="text-foreground/70 max-w-md mx-auto">
                Get AI-powered growth recommendations with live competitive
                research—specifically for your business.
              </p>
              <div className="pt-2">
                <Link href="/start">
                  <button className="rounded-md px-8 py-4 bg-cta text-white font-semibold text-lg border-b-[3px] border-b-[#B85D10] hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0.5 active:border-b-0 transition-all duration-100">
                    Get started - {config.singlePrice}
                  </button>
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
