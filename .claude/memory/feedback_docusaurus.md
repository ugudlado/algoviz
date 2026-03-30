---
name: Docusaurus Migration Decision
description: User wants Docusaurus migration — preserve exact theme, deploy via GitHub Actions; investigation revealed significant mismatch with interactive app nature
type: project
---

On 2026-03-29, the user asked to migrate AlgoViz to Docusaurus. The user repeated the request explicitly: "focus on docusaurus migration and create spec...complete it after verify it matches exactly like current site with theme, colors and others...and make sure to update github actions so that we can deploy."

Investigation (session S2290) identified these concerns:
- Docusaurus is a documentation framework; AlgoViz is an interactive visualization tool — every page has custom JS, canvas animations, DOM manipulation
- Interactive algorithm pages cannot become native Docusaurus pages — they'd need iframes or React wrappers around the vanilla JS
- The G2 design system (CSS vars, per-category accents, OKLCH colors) would need non-trivial porting into Docusaurus theming
- Docusaurus gains: built-in search, sidebar nav, GitHub Pages deployment automation
- Docusaurus loses: fluid app-like feel, direct pixel control, simplicity

**Clarifying question posed by Claude:** What is the underlying goal? Options considered: better nav/search, GitHub Pages deployment, docs section, product feel.

**Status as of 2026-03-30:** The session ended with the question posed but no user answer captured. The `/develop` skill was invoked for the Docusaurus migration but was still in investigation phase.

**Why:** This is a significant architectural decision. The user's core ask (match exact theme + GitHub Actions deploy) is achievable but the interactive pages are a major concern.
**How to apply:** If the user brings this up again, present the findings above and ask about the underlying goal before proceeding with spec. The GitHub Actions deployment piece is separable and easy to deliver without Docusaurus.
