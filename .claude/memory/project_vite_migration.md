---
name: Vite+React Migration Status
description: Phase 1 complete — sorting algorithms migrated. Phase 2 (remaining 31 pages) pending.
type: project
---

Phase 1 of the Vite+React migration is complete and merged to main.

**What's done:**
- Vite+React+TS scaffold with G2 dark theme
- 7 shared components: Nav, PlaybackController, WatchPanel, ComplexityPopover, AnalogyPanel, ProblemFrame, WhyComplexityPanel
- 4 sorting pages: BubbleSort, MergeSort, QuickSort, RadixSort
- GitHub Actions deploy to gh-pages

**Why:** User wants Docusaurus/React-based organized site with shared components and GitHub Pages deploy.

**How to apply:** Phase 2 should migrate remaining categories (Searching, Graph, DP, String, Data Structures, Advanced) using the same AlgoPage+AlgoVizLoader pattern established in Phase 1. Start with `pnpm dev` to verify current state.

**Pending:** 31 algorithm pages still as vanilla HTML/JS (not yet React components).
