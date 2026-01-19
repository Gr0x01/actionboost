import { Header, Footer } from "@/components/layout"

export const metadata = {
  title: "Terms of Service | ActionBoost",
  description: "Terms and conditions for using ActionBoost.",
}

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-surface/30">
      <Header />

      <main className="flex-1 py-10 sm:py-14">
        <div className="mx-auto max-w-3xl px-6">
          <div className="bg-background rounded-xl shadow-lg shadow-foreground/5 border border-border/50 p-6 sm:p-10">
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Terms of Service
            </h1>
            <p className="text-muted text-sm mb-8">Last updated: January 2025</p>

            <div className="prose prose-neutral max-w-none text-foreground/90 space-y-6 font-serif">
              <section>
                <h2 className="text-lg font-semibold text-foreground mb-3 font-sans">
                  Service Description
                </h2>
                <p className="text-sm text-muted leading-relaxed">
                  ActionBoost provides AI-powered growth strategy recommendations for founders and
                  businesses. You submit information about your product, and we generate personalized
                  strategic advice using artificial intelligence and competitive research.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-foreground mb-3 font-sans">
                  Eligibility
                </h2>
                <p className="text-sm text-muted leading-relaxed">
                  You must be at least 18 years old to use ActionBoost.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-foreground mb-3 font-sans">
                  Pricing & Payment
                </h2>
                <ul className="text-sm text-muted space-y-2 list-disc list-inside">
                  <li>
                    <strong className="text-foreground">Single strategy</strong> — $7.99 USD
                  </li>
                  <li>
                    <strong className="text-foreground">3-pack</strong> — $19.99 USD (credits never
                    expire)
                  </li>
                </ul>
                <p className="text-sm text-muted leading-relaxed mt-3">
                  All payments are processed securely through Stripe.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-foreground mb-3 font-sans">
                  Refund Policy
                </h2>
                <p className="text-sm text-muted leading-relaxed">
                  All sales are final. As a digital product delivered immediately upon purchase,
                  refunds are not available. If you experience a technical issue that prevents
                  delivery of your strategy, contact us and we&apos;ll make it right.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-foreground mb-3 font-sans">
                  Disclaimer
                </h2>
                <p className="text-sm text-muted leading-relaxed">
                  ActionBoost provides AI-generated strategic recommendations, not professional
                  consulting services. The advice is based on the information you provide and
                  publicly available data.
                </p>
                <p className="text-sm text-muted leading-relaxed mt-3">
                  <strong className="text-foreground">
                    We do not guarantee any specific results.
                  </strong>{" "}
                  Business outcomes depend on many factors beyond our control. You are responsible
                  for evaluating recommendations and making your own business decisions.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-foreground mb-3 font-sans">
                  Case Studies
                </h2>
                <p className="text-sm text-muted leading-relaxed">
                  With your consent, we may use anonymized excerpts from your strategy as case
                  studies or examples. We will never share your personal information, company name,
                  or identifiable details without explicit permission.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-foreground mb-3 font-sans">
                  Prohibited Uses
                </h2>
                <p className="text-sm text-muted mb-3">You agree not to:</p>
                <ul className="text-sm text-muted space-y-2 list-disc list-inside">
                  <li>Use the service for any illegal purpose</li>
                  <li>Submit false or misleading information</li>
                  <li>Attempt to reverse-engineer or scrape the service</li>
                  <li>Use automated tools to access the service</li>
                  <li>Resell or redistribute strategies commercially</li>
                </ul>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-foreground mb-3 font-sans">
                  Intellectual Property
                </h2>
                <p className="text-sm text-muted leading-relaxed">
                  You own the strategy we generate for you and may use it for any lawful purpose.
                  The ActionBoost name, logo, and service remain our property.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-foreground mb-3 font-sans">
                  Limitation of Liability
                </h2>
                <p className="text-sm text-muted leading-relaxed">
                  ActionBoost is provided &quot;as is&quot; without warranties of any kind. We are
                  not liable for any indirect, incidental, or consequential damages arising from
                  your use of the service. Our total liability is limited to the amount you paid
                  for the service.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-foreground mb-3 font-sans">
                  Indemnification
                </h2>
                <p className="text-sm text-muted leading-relaxed">
                  You agree to indemnify and hold ActionBoost harmless from any claims, damages,
                  or expenses arising from your use of the service or violation of these terms.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-foreground mb-3 font-sans">
                  Dispute Resolution
                </h2>
                <p className="text-sm text-muted leading-relaxed">
                  Before taking legal action, you agree to contact us at team@actionboo.st to
                  attempt informal resolution. If we cannot resolve the issue within 30 days,
                  either party may pursue legal remedies.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-foreground mb-3 font-sans">
                  Termination
                </h2>
                <p className="text-sm text-muted leading-relaxed">
                  We reserve the right to suspend or terminate your access if you violate these
                  terms. Unused credits may be forfeited upon termination for cause.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-foreground mb-3 font-sans">
                  Changes to Terms
                </h2>
                <p className="text-sm text-muted leading-relaxed">
                  We may update these terms from time to time. Continued use of ActionBoost after
                  changes constitutes acceptance of the new terms.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-foreground mb-3 font-sans">
                  Governing Law
                </h2>
                <p className="text-sm text-muted leading-relaxed">
                  These terms are governed by the laws of the State of Texas, United States.
                  Any disputes will be resolved in the courts of Texas.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-foreground mb-3 font-sans">
                  Contact
                </h2>
                <p className="text-sm text-muted leading-relaxed">
                  Questions about these terms? Email us at{" "}
                  <a
                    href="mailto:team@actionboo.st"
                    className="text-primary hover:text-primary/80"
                  >
                    team@actionboo.st
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
