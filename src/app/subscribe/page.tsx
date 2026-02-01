"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { ONBOARDING_STEPS, type BusinessProfile, type OnboardingStepId } from "@/lib/types/business-profile"

/**
 * /subscribe — Boost Weekly onboarding flow
 *
 * Progressive form: URL → description → ICP → voice → competitors → tried → goals
 * Each step saves to business context via API.
 * Final step triggers subscription checkout.
 */
export default function SubscribePage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [businessId, setBusinessId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [profile, setProfile] = useState<BusinessProfile>({})

  const currentStep = ONBOARDING_STEPS[step]
  const isLastStep = step === ONBOARDING_STEPS.length - 1
  const progress = ((step + 1) / ONBOARDING_STEPS.length) * 100

  // Create business on first step if needed
  const ensureBusiness = useCallback(async (): Promise<string> => {
    if (businessId) return businessId

    const res = await fetch("/api/business/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: profile.websiteUrl || profile.description?.slice(0, 50) || "My Business",
      }),
    })

    if (!res.ok) throw new Error("Failed to create business")
    const data = await res.json()
    setBusinessId(data.id)
    return data.id
  }, [businessId, profile])

  // Save current step's data
  const saveStep = useCallback(async () => {
    const bId = await ensureBusiness()

    const res = await fetch(`/api/business/${bId}/profile`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    })

    if (!res.ok) throw new Error("Failed to save profile")
  }, [ensureBusiness, profile])

  const handleNext = async () => {
    setError(null)
    setLoading(true)

    try {
      await saveStep()

      if (isLastStep) {
        // Mark onboarding complete and go to checkout
        const bId = businessId!
        await fetch(`/api/business/${bId}/profile`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            onboardingCompleted: true,
            onboardingCompletedAt: new Date().toISOString(),
          }),
        })

        // Create subscription checkout
        const checkoutRes = await fetch("/api/checkout/create-subscription", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ businessId: bId }),
        })

        if (!checkoutRes.ok) throw new Error("Failed to create checkout")
        const { url } = await checkoutRes.json()
        router.push(url)
      } else {
        setStep((s) => s + 1)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    if (step > 0) setStep((s) => s - 1)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="mb-8">
          <a href="/" className="text-sm font-mono text-foreground/40 hover:text-foreground/60 transition-colors">
            Boost
          </a>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-[10px] tracking-[0.25em] text-foreground/40 uppercase">
              Step {step + 1} of {ONBOARDING_STEPS.length}
            </span>
            <span className="font-mono text-[10px] tracking-[0.25em] text-foreground/40 uppercase">
              {currentStep.label}
            </span>
          </div>
          <div className="h-1 bg-foreground/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-cta rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Step content */}
        <div
          className="bg-white border-2 border-foreground/20 rounded-md p-8"
          style={{ boxShadow: "4px 4px 0 rgba(44, 62, 80, 0.1)" }}
        >
          <StepContent
            stepId={currentStep.id}
            profile={profile}
            onChange={setProfile}
          />

          {error && (
            <p className="mt-4 text-sm text-red-600">{error}</p>
          )}

          {/* Navigation */}
          <div className="mt-8 flex items-center justify-between">
            {step > 0 ? (
              <button
                onClick={handleBack}
                className="text-sm text-foreground/50 hover:text-foreground transition-colors"
              >
                Back
              </button>
            ) : (
              <div />
            )}

            <button
              onClick={handleNext}
              disabled={loading}
              className="bg-cta text-white font-semibold px-6 py-3 rounded-md
                         border-b-3 border-b-[#B85D10]
                         hover:-translate-y-0.5 hover:shadow-lg
                         active:translate-y-0.5 active:border-b-0
                         transition-all duration-100
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Saving..." : isLastStep ? "Start subscription" : "Continue"}
            </button>
          </div>
        </div>

        {/* Trust line */}
        <p className="mt-6 text-center text-sm text-foreground/40">
          $29/mo · Cancel anytime · Money back if it doesn&apos;t help
        </p>
      </div>
    </div>
  )
}

// =============================================================================
// STEP CONTENT
// =============================================================================

function StepContent({
  stepId,
  profile,
  onChange,
}: {
  stepId: OnboardingStepId
  profile: BusinessProfile
  onChange: (p: BusinessProfile) => void
}) {
  switch (stepId) {
    case "url":
      return (
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">What&apos;s your website?</h2>
          <p className="text-[15px] text-foreground/60 mb-6">We&apos;ll take a look at what you&apos;ve got.</p>
          <input
            type="url"
            placeholder="https://yoursite.com"
            value={profile.websiteUrl || ""}
            onChange={(e) => onChange({ ...profile, websiteUrl: e.target.value })}
            className="w-full px-4 py-3 border-2 border-foreground/20 rounded-md font-mono text-sm
                       focus:border-cta focus:outline-none transition-colors"
          />
          <p className="mt-2 text-xs text-foreground/40">Optional — skip if you don&apos;t have one yet</p>
        </div>
      )

    case "description":
      return (
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Tell us about your business</h2>
          <p className="text-[15px] text-foreground/60 mb-6">What do you sell? Who do you sell it to? Be specific.</p>
          <textarea
            placeholder="We build project management software for freelance designers..."
            value={profile.description || ""}
            onChange={(e) => onChange({ ...profile, description: e.target.value })}
            rows={4}
            className="w-full px-4 py-3 border-2 border-foreground/20 rounded-md text-sm
                       focus:border-cta focus:outline-none transition-colors resize-none"
          />
        </div>
      )

    case "icp":
      return (
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Who&apos;s your ideal customer?</h2>
          <p className="text-[15px] text-foreground/60 mb-6">The more specific, the better your strategy.</p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1">Who are they?</label>
              <input
                type="text"
                placeholder="Freelance designers earning $50-150K/year"
                value={profile.icp?.who || ""}
                onChange={(e) => onChange({ ...profile, icp: { ...profile.icp, who: e.target.value, problem: profile.icp?.problem || "", alternatives: profile.icp?.alternatives || "" } })}
                className="w-full px-4 py-3 border-2 border-foreground/20 rounded-md text-sm
                           focus:border-cta focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1">What problem do you solve?</label>
              <input
                type="text"
                placeholder="They spend 10+ hours/week on project admin instead of design"
                value={profile.icp?.problem || ""}
                onChange={(e) => onChange({ ...profile, icp: { ...profile.icp, who: profile.icp?.who || "", problem: e.target.value, alternatives: profile.icp?.alternatives || "" } })}
                className="w-full px-4 py-3 border-2 border-foreground/20 rounded-md text-sm
                           focus:border-cta focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1">What do they do instead?</label>
              <input
                type="text"
                placeholder="Spreadsheets, Notion, or just wing it"
                value={profile.icp?.alternatives || ""}
                onChange={(e) => onChange({ ...profile, icp: { ...profile.icp, who: profile.icp?.who || "", problem: profile.icp?.problem || "", alternatives: e.target.value } })}
                className="w-full px-4 py-3 border-2 border-foreground/20 rounded-md text-sm
                           focus:border-cta focus:outline-none transition-colors"
              />
            </div>
          </div>
        </div>
      )

    case "voice":
      return (
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">How do you want to sound?</h2>
          <p className="text-[15px] text-foreground/60 mb-6">This shapes any content we draft for you.</p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1">Your tone</label>
              <input
                type="text"
                placeholder="Direct and confident / Friendly and casual / Professional but warm"
                value={profile.voice?.tone || ""}
                onChange={(e) => onChange({ ...profile, voice: { ...profile.voice, tone: e.target.value } })}
                className="w-full px-4 py-3 border-2 border-foreground/20 rounded-md text-sm
                           focus:border-cta focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1">
                Paste some existing copy <span className="font-normal text-foreground/40">(optional)</span>
              </label>
              <textarea
                placeholder="Paste your homepage headline, a tweet, an email — anything that sounds like you"
                value={profile.voice?.examples || ""}
                onChange={(e) => onChange({ ...profile, voice: { ...profile.voice, tone: profile.voice?.tone || "", examples: e.target.value } })}
                rows={3}
                className="w-full px-4 py-3 border-2 border-foreground/20 rounded-md text-sm
                           focus:border-cta focus:outline-none transition-colors resize-none"
              />
            </div>
          </div>
        </div>
      )

    case "competitors":
      return (
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Who are your competitors?</h2>
          <p className="text-[15px] text-foreground/60 mb-6">We&apos;ll research what&apos;s working for them.</p>
          {[0, 1, 2, 3, 4].map((i) => (
            <input
              key={i}
              type="url"
              placeholder={i === 0 ? "https://competitor.com" : "Add another (optional)"}
              value={profile.competitors?.[i] || ""}
              onChange={(e) => {
                const comps = [...(profile.competitors || [])]
                comps[i] = e.target.value
                onChange({ ...profile, competitors: comps })
              }}
              className="w-full px-4 py-3 mb-3 border-2 border-foreground/20 rounded-md font-mono text-sm
                         focus:border-cta focus:outline-none transition-colors"
            />
          ))}
        </div>
      )

    case "tried":
      return (
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">What marketing have you tried?</h2>
          <p className="text-[15px] text-foreground/60 mb-6">So we don&apos;t suggest things you&apos;ve already done.</p>
          <textarea
            placeholder="We tried Twitter threads, cold email, and a few Reddit posts. Twitter got some engagement but no conversions..."
            value={profile.triedBefore || ""}
            onChange={(e) => onChange({ ...profile, triedBefore: e.target.value })}
            rows={5}
            className="w-full px-4 py-3 border-2 border-foreground/20 rounded-md text-sm
                       focus:border-cta focus:outline-none transition-colors resize-none"
          />
        </div>
      )

    case "goals":
      return (
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">What&apos;s your goal?</h2>
          <p className="text-[15px] text-foreground/60 mb-6">What does success look like in the next 3 months?</p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1">Primary goal</label>
              <input
                type="text"
                placeholder="Get to 100 paying customers / Hit $5K MRR / Get first 1000 users"
                value={profile.goals?.primary || ""}
                onChange={(e) => onChange({ ...profile, goals: { ...profile.goals, primary: e.target.value } })}
                className="w-full px-4 py-3 border-2 border-foreground/20 rounded-md text-sm
                           focus:border-cta focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1">
                Monthly marketing budget <span className="font-normal text-foreground/40">(optional)</span>
              </label>
              <input
                type="text"
                placeholder="$0 (just my time) / $500/mo / $2K/mo"
                value={profile.goals?.budget || ""}
                onChange={(e) => onChange({ ...profile, goals: { ...profile.goals, primary: profile.goals?.primary || "", budget: e.target.value } })}
                className="w-full px-4 py-3 border-2 border-foreground/20 rounded-md text-sm
                           focus:border-cta focus:outline-none transition-colors"
              />
            </div>
          </div>
        </div>
      )
  }
}
