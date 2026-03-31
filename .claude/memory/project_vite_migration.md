---
name: Vite+React Migration — Complete
description: Migration from vanilla JS to React+Vite+TS is done. All 29 algorithm pages migrated and merged to main (2026-03-31).
type: project
---

**Status: COMPLETE** — merged to main 2026-03-31. All vanilla HTML/JS pages removed.

**What was migrated:**
- Phase 1 (2026-03-30): Vite+React scaffold + 4 sorting pages (BubbleSort, MergeSort, QuickSort, RadixSort)
- Phase 2–5 (2026-03-31): Remaining 29 algorithm pages across Searching, Graph, DP, String, Data Structures, Advanced categories

**Key pattern (reuse for new algorithm pages):**
1. Keep `[algo]-algorithm.js` as vanilla IIFE — no modifications
2. Add `src/lib/algorithms/[algo].ts` wrapper for TypeScript types
3. Create `src/pages/algorithms/[Algo]/index.tsx` — React component reads display state from algorithm steps only
4. Add route to `src/App.tsx` + nav entry to `src/components/Nav/index.tsx`
5. Move `[algo]-algorithm.test.js` to `src/lib/algorithms/` (they live with the algorithm files)

**Pitfall: export default breaks Node.js**
Phase 4 added bare `export default AlgoName` to `.js` files. This caused `require()` failures (656 test failures). Fix: strip those lines. The `.ts` wrappers handle ESM import; `.js` files only need `module.exports` for Node.

**Linear tickets:** HL-134 through HL-138 (all Done)

**Why:** React for shared components (Nav, PlaybackController, WatchPanel, etc.), TypeScript safety, GitHub Pages CI/CD via `base: '/algoviz/'`.
**How to apply:** Migration is done. Use this pattern only when adding new algorithm pages. Do not re-migrate anything — all vanilla pages were removed.
