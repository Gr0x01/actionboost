# Hero Redesign: Chaos → Clarity

**Started:** Jan 23, 2026
**Status:** In Progress

---

## The Story We're Telling

SMB owners (salon owners, local shops, niche e-commerce) are **drowning in marketing noise**. Every platform wants their attention. Every guru has advice. Algorithms change weekly. They didn't start a business to become marketers.

**The visual metaphor:**
1. **Chaos** - Scattered platform logos (Instagram, TikTok, Google, etc.) and marketing noise ("Post 3x daily!", "CTR: 0.3%", "Algorithm changed") float around the screen
2. **Scroll trigger** - As user scrolls, the chaos **coalesces toward the center**
3. **Clarity emerges** - The noise fades, replaced by a clean "30-Day Plan" preview card
4. **Headlines crossfade** - "You didn't start a business to become a marketer" transforms into "What if it was just **one clear plan**?"

**The emotional journey:** Overwhelm → Recognition → Relief → Action

---

## Design Decisions

### Visual Style
- **Light Skeuomorphism** - Soft shadows, tactile elements (established in SMB repositioning)
- Chaos elements: Platform logo tiles + noise cards with subtle shadows
- Summary card: Clean, premium feel with gradient header
- Scroll indicator to invite interaction

### Animation Approach
- **Scroll-driven parallax** using Framer Motion's `useScroll` + `useTransform`
- Section is 130vh tall with sticky content (100vh visible, 30vh scroll range)
- Chaos elements use viewport units (vw/vh) for movement
- Headlines crossfade via opacity transforms

### Chaos Elements (24 total)
- **12 platform logos**: Google Analytics, Instagram, Facebook, TikTok, Pinterest, LinkedIn, Yelp, Google, X, YouTube, Mailchimp, HubSpot
- **12 noise cards**: Mix of bad advice ("Post 3x daily"), scary metrics ("Bounce rate: 67%"), and alerts ("Algorithm changed")
- Positioned around edges, avoiding center where content lives
- Float gently when static, coalesce toward center on scroll

### Summary Card Preview
Shows first glimpse of what they'll get:
- Week 1: Foundation (sample tasks with checkmarks)
- Week 2: Quick Wins (sample tasks)
- Weeks 3-4: Faded hint
- Bottom stats: 24 Actions, 4 Weeks, 3 Priorities

---

## Implementation Progress

### Completed
- [x] Created `HeroChaos.tsx` - 24 floating elements
- [x] Created `HeroSummaryCard.tsx` - 30-day plan preview card (kept for explainer/checkout)
- [x] Created platform logo SVGs in `/public/logos/`
- [x] Accessibility: `useReducedMotion` support, decorative images marked correctly

### Latest: Hero Restructure (Jan 23)
**Decision:** Separated hero from explainer. Hero is now static layout with ambient motion.

- [x] **Hero simplified** - Static headline, form, trust line (no scroll-dependent effects)
- [x] **Ambient "Restless Background"** - Chaos elements perpetually drift (15-36s cycles)
- [x] **Added social proof** - "The competitor analysis alone is worth it." — Noah P.
- [x] **Added price to trust line** - "$49 one-time. Takes 5 minutes..."
- [x] **Added contradictions to noise cards** - "Email is dead" / "Email is back"
- [x] **Varied motion parameters** - Each element has unique duration, amplitude, direction

### Still To Do
- [x] **Create ExplainerSection** - The chaos→clarity coalescing animation ✓
- [ ] Mobile optimization (reduce element count, smaller sizes)
- [ ] Test on various screen sizes

### ExplainerSection (Jan 23)
Created `ExplainerSection.tsx` with scroll-triggered coalescing animation:
- 12 platform logos start at edge positions
- IntersectionObserver triggers animation when 30% visible
- Logos converge toward center and fade out
- HeroSummaryCard appears at center as the "result"
- Section header: "We take all the noise and turn it into one clear plan."
- Bottom text: "Data from 12+ platforms, distilled into 24 specific actions."
- Respects `useReducedMotion` - shows end state immediately

---

## File Locations

### New Files
- `src/components/landing/HeroChaos.tsx` - Floating chaos layer (ambient motion)
- `src/components/landing/ExplainerSection.tsx` - Chaos→clarity coalescing animation
- `src/components/landing/HeroSummaryCard.tsx` - Plan preview card (used in ExplainerSection)
- `public/logos/*.svg` - 12 platform logos

### Modified Files
- `src/components/landing/Hero.tsx` - Main orchestrator with scroll tracking
- `src/components/forms/TractionInput.tsx` - Added autoFocus prop (disabled on homepage)

---

## Technical Notes

### Hero: Ambient Motion ("Restless Background")
```tsx
// HeroChaos.tsx - Perpetual drifting motion
// Each element has unique parameters based on index

const baseDuration = 15 + (index % 7) * 3; // 15-36 seconds per cycle
const xAmplitude = 8 + (index % 5) * 4;    // 8-24px horizontal drift
const yAmplitude = 12 + (index % 4) * 5;   // 12-27px vertical drift
const rotateAmplitude = 3 + (index % 3) * 2; // 3-7 degrees rotation

// Alternate directions for organic chaos
const xDirection = index % 2 === 0 ? 1 : -1;
const yDirection = index % 3 === 0 ? 1 : -1;

// Stagger start times so elements don't sync
delay: (index * 0.3) % 3
```

### Hero: Static Layout
```tsx
// Hero.tsx - No scroll effects, simple structure
<section className="relative min-h-screen">
  <HeroChaos />  {/* Ambient background */}
  <div className="relative z-10">
    <h1>Headline</h1>
    <p>Subhead + social proof</p>
    <HeroForm />
    <p>Trust line with $49 price</p>
  </div>
</section>
```

### Noise Cards with Contradictions
```tsx
// Deliberate contradictions to emphasize conflicting advice:
{ text: "Post 3x daily", type: "advice" },
{ text: "Quality over quantity", type: "advice" }, // contradiction
{ text: "Email is dead", type: "advice" },
{ text: "Email is back", type: "advice" }, // contradiction
```

### ExplainerSection: Coalescing Animation
```tsx
// ExplainerSection.tsx - One-time convergence animation
// Triggered by IntersectionObserver at 30% threshold

// Logos start at edge positions and converge to center
const LOGO_POSITIONS = [
  { x: 10, y: 5 },   // top-left
  { x: 90, y: 10 },  // top-right
  { x: 5, y: 30 },   // left side
  // ... etc
];

// Animation: move toward center, fade out, shrink
animate={hasAnimated ? {
  x: `${distanceX * 0.7}vw`,
  y: `${distanceY * 0.7}vh`,
  opacity: 0,
  scale: 0.3,
} : initialState}

// HeroSummaryCard appears after logos converge (0.8s delay)
```

---

## Open Questions

1. ~~**Scroll indicator copy**~~ - RESOLVED: Removed scroll indicator entirely, replaced with "Let's start simple" micro-copy on form

2. **Chaos density** - Should there be MORE elements to feel more overwhelming? Or is 24 enough?

3. ~~**Form position**~~ - RESOLVED: Form is the clarity destination in Hero. HeroSummaryCard used in ExplainerSection.

4. **Mobile experience** - How should this work on mobile where scroll-driven parallax can feel janky?
   - Current: Uses IntersectionObserver (not scroll-scrubbing), should be smoother
   - Still need to test on actual devices
   - May need reduced element count for performance

5. ~~**HeroSummaryCard reuse**~~ - RESOLVED: Now used in ExplainerSection as the "clarity" result.

---

## References

- **Original request**: Better storytelling flow for SMBs, not feature-focused
- **SMB repositioning**: `memory-bank/phases/current.md` (Jan 23 section)
- **Design direction**: Light Skeuomorphism from `decisions.md`
