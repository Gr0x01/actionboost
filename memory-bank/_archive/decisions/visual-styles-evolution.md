# Visual Styles Evolution (Archived)

Moved from `decisions.md` on Jan 29, 2026. Current style is **Soft Brutalist** — see `decisions.md` for essentials.

---

## Visual Style: Light Skeuomorphism (Jan 2026) — SUPERSEDED by Soft Brutalist

Warm, tactile design with soft shadows. Designed for SMB audience (later pivoted to tech-adjacent).

**Implementation patterns**:
```css
/* Soft card */
.soft-card {
  border-radius: 16px;
  border: 1px solid var(--border);
  background: var(--background);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

/* Tactile button */
.tactile-button {
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transition: all 150ms;
}
.tactile-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}
.tactile-button:active {
  transform: translateY(2px);
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}
```

**Colors**: Warm cream (#FDFCFB), soft beige surface (#F8F6F3), orange CTA (#E67E22), navy foreground (#2C3E50).

---

## Results Page: Document Style

Clean document layout over SaaS dashboard aesthetic. Tienne serif at 18px, 1.7 line-height, `max-w-prose` (65ch). Strategy output feels like a professional report. Component: `src/components/results/MarkdownContent.tsx`.
