---
name: vite-migration-phase2 learnings
description: What worked and what was harder during the full Vite+React migration (complete as of 2026-03-31)
type: project
date: 2026-03-31
---

# Vite+React Migration — Key Learnings

## What Worked Extremely Well

### 1. IIFE Export Pattern for Algorithm Modules
- Algorithm `.js` files kept as-is (IIFE + `module.exports`) — no modification
- Thin `.ts` wrapper files in `src/lib/algorithms/` re-export with types
- Bridges vanilla JS to TypeScript without duplication
- **Critical**: Never add bare `export default` to `.js` files — breaks Node.js `require()`

### 2. Consistent File Structure
Each migrated algorithm page:
```
src/pages/algorithms/[Algo]/index.tsx   # React component
src/lib/algorithms/
  [algo]-algorithm.js                   # Canonical algorithm (IIFE, no DOM)
  [algo]-algorithm.test.js              # Node.js tests
  [algo].ts                             # TS wrapper
```
Test files belong in `src/lib/algorithms/` alongside the `.js` files (not in root).

### 3. Fieldset Panel Pattern for Controls
`<fieldset>` + `<legend>` for grouped input controls — semantic HTML, built-in visual grouping, zero extra CSS. Also applied to section panels (WatchPanel, visualization, pseudocode) as fieldset-style floating title.

### 4. Display State in Algorithm Module
React components must read display state (colors, highlights, sorted boundaries) from algorithm step data — never derive visual indicators from raw indices. Found in merge-sort (stale color index on re-render). Fix: move color calculation into algorithm module.

---

## What Was Harder Than Expected

### 1. Bubble Sort Redesign Iteration
Three iterations to reach final UX: timeline slider (show any step instantly) + separate Playback panel. Set the pattern for all sorting pages. Also: sorted/unsorted color assignments were inverted — fixed 2026-03-31.

### 2. Bare `export default` Breaking Tests
Phase 4 added `export default AlgoName` to `.js` files. This caused 656 test failures ("Unexpected token 'export'" in Node.js). Stripped all bare export defaults; `.ts` wrappers handle Vite side. Lesson: `.js` algorithm files must stay CJS-only.

### 3. Type Safety for SVG Graph Algorithms
Dijkstra, A*, Floyd-Warshall, Prim, Kruskal, Tarjan, Ford-Fulkerson all needed SVG rendering. Solution: shared `GraphNode`, `GraphEdge`, `Position` types in `src/types/`.

### 4. CSS Prefix Verification Pain
Manual grep required after every CSS change. Self-reporting "all prefixed" is insufficient. Should become an ESLint rule.

### 5. Navigation Update Fatigue
Old pattern: update nav in every `.html` file. New pattern (React): single source of truth in `src/App.tsx` routes + `src/components/Nav/index.tsx`. Migration eliminated the per-HTML-file nav duplication problem permanently.

---

## Summary

Pattern scales perfectly. Phases 2–5 executed systematically after Phase 1 established the algorithm-module-to-React-component pattern. Hardest part: UX refinement (bubble sort) and the `export default` pitfall in Phase 4. No architectural blockers. All 729 tests passing post-cleanup.
