---
name: frontend-design
description: Guidelines for creating distinctive, high-quality frontend UI. Use when building or modifying React components, pages, or visual elements.
---

# Frontend Design Guidelines (2025-2026)

## Design Decision Protocol

**Before writing any code, you MUST explicitly choose ONE aesthetic direction from the list below.** State your choice and why it fits the context. This prevents defaulting to the same 2-3 styles.

### Quick Context Questions
1. **Who's the user?** (Developer? Consumer? Enterprise?)
2. **What's the emotional tone?** (Playful? Serious? Luxurious? Raw?)
3. **What era fits?** (Cutting-edge? Nostalgic? Timeless?)
4. **Light or dark?** (Commit early, don't waffle)

---

## Aesthetic Directions (Pick One)

### 1. Human Scribble
**The antidote to AI-polish.** Hand-drawn doodles, sketch overlays, wobbly lines, marker-style annotations. Feels like a human made it on paper first.

```css
/* Implementation patterns */
.scribble-underline {
  background-image: url("data:image/svg+xml,..."); /* hand-drawn SVG line */
  background-repeat: no-repeat;
  background-position: bottom;
}
.sketch-border {
  border: 2px solid currentColor;
  border-radius: 255px 15px 225px 15px/15px 225px 15px 255px; /* wobbly */
}
```
- **Fonts**: Caveat, Kalam, Patrick Hand, Architects Daughter
- **Colors**: Paper white (#FFFEF9), pencil gray, highlighter accents
- **Details**: Doodle arrows, circled text, crossed-out words, sticky notes

### 2. Nature Distilled
**Muted earthy sophistication.** Palettes of skin, wood, soil, stone. Warm but restrained. Feels like a high-end ceramics studio.

```css
:root {
  --sand: #E8DFD0;
  --clay: #C4A484;
  --bark: #5C4033;
  --moss: #8A9A5B;
  --stone: #787276;
}
```
- **Fonts**: Cormorant, EB Garamond, Libre Baskerville (serifs), DM Sans (clean body)
- **Textures**: Subtle paper grain, linen patterns, organic shapes
- **Motion**: Slow, breathing transitions (600ms+), gentle parallax

### 3. Light Skeuomorphism
**Tactile digital.** Subtle shadows, soft embossing, gentle gradients that suggest real materials without going full 2010 Apple.

```css
.card-skeu {
  background: linear-gradient(145deg, #ffffff, #e6e6e6);
  box-shadow:
    5px 5px 10px #d1d1d1,
    -5px -5px 10px #ffffff;
  border-radius: 16px;
}
.button-pressed {
  box-shadow: inset 2px 2px 5px #d1d1d1, inset -2px -2px 5px #ffffff;
}
```
- **Fonts**: SF Pro, Nunito, Quicksand (rounded, friendly)
- **Colors**: Soft whites, gentle grays, one accent color
- **Details**: Inset inputs, toggle switches with depth, subtle icon shadows

### 4. Digital Texture
**Jelly, chrome, clay.** Buttons that look squishy. Surfaces that deform. Playful 3D without heavy renders.

```css
.jelly-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50px;
  box-shadow:
    0 10px 30px -10px rgba(102, 126, 234, 0.5),
    inset 0 -3px 0 rgba(0,0,0,0.1),
    inset 0 3px 0 rgba(255,255,255,0.2);
  transition: transform 0.1s ease, box-shadow 0.1s ease;
}
.jelly-button:active {
  transform: scale(0.95) translateY(2px);
}
```
- **Fonts**: Clash Display, Cabinet Grotesk, Satoshi
- **Colors**: Candy gradients, iridescent effects, soft pastels with pop
- **Motion**: Squish on press (scale 0.95), bounce-back springs

### 5. Glow Design
**Futuristic luminescence.** Dark backgrounds with glowing elements, neon accents, light trails. Huly-style.

```css
.glow-card {
  background: rgba(20, 20, 30, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow:
    0 0 20px rgba(99, 102, 241, 0.3),
    0 0 40px rgba(99, 102, 241, 0.1);
}
.glow-text {
  text-shadow: 0 0 10px currentColor, 0 0 20px currentColor;
}
```
- **Fonts**: Geist, Instrument Sans, Azeret Mono (monospace accents)
- **Colors**: Deep navy/black base, electric blue, violet, cyan accents
- **Details**: Blur backdrops, gradient borders, animated glow pulses

### 6. Y2K Revival
**Intentionally chaotic.** Layered text, visual noise, maximalist energy. MySpace meets modern tooling.

```css
.y2k-container {
  background:
    repeating-linear-gradient(90deg, #ff00ff22 0px, transparent 1px, transparent 20px),
    repeating-linear-gradient(0deg, #00ffff22 0px, transparent 1px, transparent 20px),
    linear-gradient(135deg, #1a0a2e, #16213e);
}
.glitch-text {
  animation: glitch 0.3s infinite;
}
```
- **Fonts**: VT323, Press Start 2P, Orbitron, Plus Jakarta Sans
- **Colors**: Hot pink, electric cyan, lime green, purple gradients
- **Details**: Sticker overlays, star/sparkle decorations, chunky borders, pixel patterns

### 7. Glassmorphism (Refined)
**Layered transparency.** Frosted glass panels, subtle blur, floating UI. Evolved past the 2021 hype into something more restrained.

```css
.glass-panel {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 24px;
}
```
- **Fonts**: Inter (yes, allowed here), Outfit, Be Vietnam Pro
- **Colors**: Works on any vibrant background, white/black text
- **Details**: Layered z-depth, subtle gradients on glass, thin borders

### 8. Editorial/Magazine
**Typography-led layouts.** Big type, dramatic hierarchy, generous whitespace. Feels like a printed publication.

```css
.editorial-headline {
  font-size: clamp(3rem, 10vw, 8rem);
  font-weight: 300;
  letter-spacing: -0.03em;
  line-height: 0.95;
}
.pull-quote {
  font-size: 2rem;
  border-left: 4px solid currentColor;
  padding-left: 2rem;
}
```
- **Fonts**: Newsreader, Fraunces, Instrument Serif (display), Source Serif Pro (body)
- **Layout**: Asymmetric grids, text wrapping around images, full-bleed sections
- **Colors**: High contrast (near-black on cream, or inverted)

### 9. Brutalist Raw
**Unpolished on purpose.** System fonts, harsh borders, exposed structure. Anti-design that's actually designed.

```css
.brutalist-box {
  border: 3px solid black;
  background: white;
  box-shadow: 8px 8px 0 black;
}
.brutalist-input {
  border: 2px solid black;
  font-family: 'Courier New', monospace;
  padding: 12px;
}
```
- **Fonts**: Courier New, Times New Roman, or ultra-bold sans (Bebas Neue)
- **Colors**: Black, white, one screaming accent (red, yellow)
- **Details**: No border-radius, harsh shadows, visible grid lines

### 10. Soft Minimal
**Airy, calming restraint.** Lots of whitespace, muted palette, gentle curves. Feels like a meditation app.

```css
:root {
  --soft-bg: #FAFAFA;
  --soft-border: #EEEEEE;
  --soft-text: #333333;
  --soft-muted: #888888;
}
.soft-card {
  background: white;
  border-radius: 20px;
  box-shadow: 0 2px 20px rgba(0,0,0,0.04);
}
```
- **Fonts**: Plus Jakarta Sans, General Sans, Switzer
- **Colors**: Off-whites, warm grays, single subtle accent
- **Motion**: Fade-ins, gentle slides (no bounces)

---

## Typography (Updated 2025-2026)

### Fresh Fonts to Use
**Display/Headlines:**
- Clash Display, Cabinet Grotesk, Satoshi, Outfit
- Instrument Serif, Fraunces, Newsreader (serifs)
- Geist, Geist Mono (Vercel's fonts - very current)

**Body Text:**
- Plus Jakarta Sans, General Sans, Switzer
- DM Sans, Be Vietnam Pro
- Source Serif 4 (updated serif)

**Monospace:**
- Geist Mono, Berkeley Mono, Monaspace
- JetBrains Mono (still good)

### Fonts That Feel Dated Now
**Avoid unless intentionally retro:**
- Inter (everywhere, default, boring)
- Space Grotesk (2020-2022 darling, oversaturated)
- IBM Plex (same)
- Roboto, Open Sans, Lato (always avoid)
- Poppins (overused in no-code sites)

### Variable Fonts Are Standard Now
Use them. Animate weight on hover. Shift width on scroll. They're not a novelty anymore.

```css
.kinetic-text {
  font-variation-settings: 'wght' 400;
  transition: font-variation-settings 0.3s ease;
}
.kinetic-text:hover {
  font-variation-settings: 'wght' 700;
}
```

---

## Patterns Falling Out of Favor

### Bento Grids
Oversaturated since Apple made them cool. Everyone has them now. Use **Card Play** instead - cards that are interactive, pressable, flippable. Or break the grid entirely.

### Heavy Page Animations
Performance matters. Instead of animating everything, pick ONE hero moment per page. Make it count.

### Purple Gradients on White
The AI-startup cliché. If your site looks like it could be any AI product, you've failed.

### Safe Minimalism
"Clean" is not a design direction. It's the absence of one. Commit to something specific.

---

## Motion Principles (2025-2026)

### Micro-Delight Over Micro-Interactions
Not just "button changes on hover." The button should feel tactile. A toggle should feel like it clicks. Form fields should breathe.

```css
/* Tactile button example */
.button-tactile {
  transition: transform 0.1s ease, box-shadow 0.1s ease;
}
.button-tactile:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}
.button-tactile:active {
  transform: translateY(1px);
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}
```

### Kinetic Typography
Text that responds. Weight shifts on scroll. Size animates on focus. Use variable fonts.

### Scroll-Triggered Reveals
Staggered fade-ins with `animation-delay` still work. Just don't overdo it - 3-5 elements max per viewport.

---

## Implementation Checklist

Before shipping, verify:
- [ ] Explicitly chose ONE aesthetic direction (stated at start)
- [ ] Font is NOT Inter/Roboto/Poppins (unless Glassmorphism)
- [ ] Has at least one "memorable moment" (what will users screenshot?)
- [ ] Dark/light mode is deliberate, not an afterthought
- [ ] Mobile-first responsive (test at 375px)
- [ ] Motion is purposeful (one hero animation > scattered effects)
- [ ] Doesn't look like "any AI startup landing page"
