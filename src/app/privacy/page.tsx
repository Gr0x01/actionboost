import { Header, Footer } from "@/components/layout"

export const metadata = {
  title: "Privacy Policy | Boost",
  description: "How Boost collects, uses, and protects your data.",
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-surface/30">
      <Header />

      <main className="flex-1 py-10 sm:py-14">
        <div className="mx-auto max-w-3xl px-6">
          <div className="bg-background rounded-xl shadow-lg shadow-foreground/5 border border-border/50 p-6 sm:p-10">
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Privacy Policy
            </h1>
            <p className="text-muted text-sm mb-8">Last updated: January 2025</p>

            <div className="prose prose-neutral max-w-none text-foreground/90 space-y-6 font-serif">
              <section>
                <h2 className="text-lg font-semibold text-foreground mb-3 font-sans">
                  Data Controller
                </h2>
                <p className="text-sm text-muted leading-relaxed">
                  Boost is operated from Texas, United States. For privacy inquiries, contact
                  us at{" "}
                  <a
                    href="mailto:team@aboo.st"
                    className="text-primary hover:text-primary/80"
                  >
                    team@aboo.st
                  </a>
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-foreground mb-3 font-sans">
                  What We Collect
                </h2>
                <p className="text-sm leading-relaxed text-muted mb-3">
                  When you use Boost, we collect:
                </p>
                <ul className="text-sm text-muted space-y-2 list-disc list-inside">
                  <li>
                    <strong className="text-foreground">Email address</strong> — for magic link authentication and
                    delivering your action plan
                  </li>
                  <li>
                    <strong className="text-foreground">Form inputs</strong> — your product description, current
                    traction, growth tactics, what&apos;s working/not working, and focus area
                  </li>
                  <li>
                    <strong className="text-foreground">File uploads</strong> — optional screenshots, analytics
                    exports, or documents you attach
                  </li>
                  <li>
                    <strong className="text-foreground">Usage data</strong> — page views and interactions to improve
                    the service
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-foreground mb-3 font-sans">
                  How We Use Your Data
                </h2>
                <ul className="text-sm text-muted space-y-2 list-disc list-inside">
                  <li>
                    <strong className="text-foreground">Generate your action plan</strong> — your inputs are sent to our
                    AI to create personalized recommendations (legal basis: contract performance)
                  </li>
                  <li>
                    <strong className="text-foreground">Competitive research</strong> — competitor URLs you provide
                    are used to gather public SEO and traffic data (legal basis: contract performance)
                  </li>
                  <li>
                    <strong className="text-foreground">Process payments</strong> — we use Stripe for secure payment
                    processing (legal basis: contract performance, legal obligation)
                  </li>
                  <li>
                    <strong className="text-foreground">Improve the service</strong> — analytics help us understand
                    usage patterns (legal basis: legitimate interest)
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-foreground mb-3 font-sans">
                  Third-Party Services
                </h2>
                <p className="text-sm text-muted mb-3">
                  We share data with these services to provide Boost:
                </p>
                <ul className="text-sm text-muted space-y-2 list-disc list-inside">
                  <li>
                    <strong className="text-foreground">Stripe</strong> — payment processing (PCI-DSS compliant)
                  </li>
                  <li>
                    <strong className="text-foreground">Supabase</strong> — database, authentication, and file storage
                  </li>
                  <li>
                    <strong className="text-foreground">Anthropic (Claude)</strong> — AI action plan generation
                  </li>
                  <li>
                    <strong className="text-foreground">OpenAI</strong> — text embeddings for improved recommendations
                  </li>
                  <li>
                    <strong className="text-foreground">Tavily</strong> — web search for competitive research
                  </li>
                  <li>
                    <strong className="text-foreground">DataForSEO</strong> — competitor traffic and SEO metrics
                  </li>
                  <li>
                    <strong className="text-foreground">PostHog</strong> — privacy-focused analytics
                  </li>
                  <li>
                    <strong className="text-foreground">Vercel Analytics</strong> — page view and performance analytics
                  </li>
                </ul>
                <p className="text-sm text-muted leading-relaxed mt-3">
                  Your data may be transferred to and processed in the United States. Our service
                  providers maintain appropriate safeguards for international data transfers.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-foreground mb-3 font-sans">
                  Data Retention
                </h2>
                <ul className="text-sm text-muted space-y-2 list-disc list-inside">
                  <li>
                    <strong className="text-foreground">Strategies & account data</strong> — stored until you request
                    deletion
                  </li>
                  <li>
                    <strong className="text-foreground">File uploads</strong> — stored until account deletion
                  </li>
                  <li>
                    <strong className="text-foreground">Payment records</strong> — retained for 7 years as required
                    by law
                  </li>
                  <li>
                    <strong className="text-foreground">Analytics data</strong> — retained for 24 months
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-foreground mb-3 font-sans">
                  Your Rights
                </h2>
                <ul className="text-sm text-muted space-y-2 list-disc list-inside">
                  <li>
                    <strong className="text-foreground">Access</strong> — view all your past action plans in your
                    dashboard
                  </li>
                  <li>
                    <strong className="text-foreground">Deletion</strong> — request deletion of your account and all
                    associated data
                  </li>
                  <li>
                    <strong className="text-foreground">Export</strong> — download your action plans as PDF
                  </li>
                  <li>
                    <strong className="text-foreground">Correction</strong> — request correction of inaccurate data
                  </li>
                </ul>
                <p className="text-sm text-muted leading-relaxed mt-4">
                  <strong className="text-foreground">For EU residents:</strong> You have the right to lodge a
                  complaint with your local data protection authority if you believe your rights
                  have been violated.
                </p>
                <p className="text-sm text-muted leading-relaxed mt-3">
                  <strong className="text-foreground">For California residents:</strong> We do not sell your personal
                  information. You can request access to or deletion of your data by emailing us.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-foreground mb-3 font-sans">
                  Security
                </h2>
                <p className="text-sm text-muted leading-relaxed">
                  We protect your data with HTTPS encryption, row-level security on our database, and
                  private file storage. We use magic link authentication — no passwords are stored.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-foreground mb-3 font-sans">
                  Cookies
                </h2>
                <p className="text-sm text-muted leading-relaxed">
                  We use essential cookies for authentication sessions and analytics. No advertising
                  cookies are used.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-foreground mb-3 font-sans">
                  Contact
                </h2>
                <p className="text-sm text-muted leading-relaxed">
                  Questions about privacy? Email us at{" "}
                  <a
                    href="mailto:team@aboo.st"
                    className="text-primary hover:text-primary/80"
                  >
                    team@aboo.st
                  </a>
                </p>
              </section>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
