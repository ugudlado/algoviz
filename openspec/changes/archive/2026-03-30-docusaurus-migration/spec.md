# Vite + React Migration (AlgoViz)

## Summary

Migrate AlgoViz from a flat-file vanilla JS site to a **Vite + React** application. Sorting algorithms are migrated first as proper React components (no IIFE wrappers). Shared UI primitives (PlaybackController, WatchPanel, ComplexityPopover, AnalogyPanel, ProblemFrame) become reusable React components that every algorithm uses. The G2 design system is preserved exactly (CSS vars, dark theme, per-category accents, fonts). GitHub Actions deploys to GitHub Pages on push to main.

## Motivation

- **React components**: Algorithm visualizations written as clean React — state, hooks, no global IIFE pollution
- **Shared primitives**: `<PlaybackController>`, `<WatchPanel>`, `<ComplexityPopover>` declared once, used everywhere
- **Vite build**: Fast HMR dev, tree-shaking, TypeScript-ready, `pnpm build` → `dist/`
- **Organized routing**: React Router handles `/algorithms/quicksort`, etc. — no more 35 hand-updated nav files
- **GitHub Pages deploy**: push to main → build → deploy automatically

## Phased Approach

**Phase 1 (this spec):** Vite + React scaffold + G2 theme + sorting algorithms (Bubble Sort, Merge Sort, Quick Sort, Radix Sort)
**Phase 2 (follow-on):** Remaining algorithm categories migrated

## Acceptance Criteria

1. Vite + React project scaffolded with TypeScript, React Router, CSS Modules or global CSS
2. G2 design system ported: all CSS vars (`--bg-primary`, `--accent`, category accents), Inter + JetBrains Mono, dark theme
3. Shared components created: `PlaybackController`, `WatchPanel`, `ComplexityPopover`, `AnalogyPanel`, `ProblemFrame`, `WhyComplexityPanel`
4. Homepage (`/`) matches current index.html: hero, algorithm cards, learning path, search
5. Sorting algorithms as React components (4 pages): Bubble Sort, Merge Sort, Quick Sort, Radix Sort — each uses shared components, calls existing `*-algorithm.js` logic
6. Nav matches current category structure — rendered once from a config, not duplicated per page
7. `pnpm dev` → hot-reload dev server
8. `pnpm build` → production bundle in `dist/`, no build errors
9. `pnpm preview` → serves built site locally for verification
10. GitHub Actions at `.github/workflows/deploy.yml` — push to main → `pnpm build` → deploy `dist/` to gh-pages
11. Existing algorithm tests still pass: `pnpm test` runs the Node.js test runner unchanged
12. Deployed URL: `https://ugudlado.github.io/algoviz`

## Out of Scope

- Migrating non-sorting algorithms (deferred to Phase 2)
- Converting algorithm logic files to TypeScript
- Docusaurus (dropped — Vite+React is simpler and more flexible)

## Priority

- User value: 9/10
- Strategic fit: 10/10
- Effort: large
- **Score: 9.5**
