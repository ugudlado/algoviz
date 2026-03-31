---
name: vite-migration-phase2 learnings
description: What worked and what was harder during the Vite+React migration
type: project
date: 2026-03-31
---

# Vite+React Migration Phase 2 - Key Learnings

## What Worked Extremely Well

### 1. IIFE Export Pattern for Algorithm Modules
- Export algorithm functions via global `window.AlgorithmName = { func1, func2, ... }`
- No need to modify original `.js` algorithm files — they remain as-is
- Created thin `.ts` wrapper files in `src/lib/algorithms/` to re-export with types
- This bridged vanilla JS algorithms to strict TypeScript without duplication
- Reusable across all 29 algorithm pages

### 2. Mode-Aware Vite Config
```js
// ESM default for React/Vite, but support CommonJS in build for tests
export default ({ command, mode }) => { ... }
```
- `vite dev` runs pure ESM
- `vite build` emits both ESM and optional CJS wrappers for Node test runners
- Algorithm test files continue to use `module.exports` (Node.js) without change

### 3. Consistent File Structure
Each migrated algorithm page followed:
```
src/pages/algorithms/[algo]/
  [algo].tsx          # React component
  [algo].module.css   # Styles
  [algo].test.ts      # Unit tests (algorithm logic)
src/lib/algorithms/   # Reusable algorithm modules (with TS wrappers)
```
Predictable, easy to verify. Enforced via linting.

### 4. Fieldset Panel Pattern for Controls
Used `<fieldset>` + legend for grouped input controls instead of ad-hoc divs:
```tsx
<fieldset>
  <legend>Algorithm Parameters</legend>
  <label>Array Size: <input /></label>
  <label>Speed: <input type="range" /></label>
</fieldset>
```
- Semantic HTML (accessibility win)
- Built-in visual grouping (no extra CSS needed)
- Reused across sorting, searching, DP pages with zero variation

### 5. Edge Case Testing Strategy
All test suites included:
- Empty input
- Single element
- Already sorted / reverse sorted
- All duplicates
- Max size (20+ elements)
- Degenerate structures (skewed trees, etc.)

Zero surprise failures in runtime because tests were comprehensive.

---

## What Was Harder Than Expected

### 1. Bubble Sort Redesign Iteration
- **Planned**: Direct port from vanilla JS
- **Reality**: UI felt clunky with step-by-step control. Redesigned twice:
  1. First iteration: manual step buttons + playback slider → felt disconnected
  2. Second iteration: playback slider + auto-step + manual override → still not smooth
  3. Final: Timeline-based slider (show any step instantly) + separate Playback panel
- **Learned**: Sorting viz need temporal control, not just state-by-state stepping
- **Impact**: Set the pattern for all other sorting pages (Insertion, Selection, Merge, Quick)
- **Time Cost**: ~3 extra commits, but established "correct" UX for the category

### 2. Color Bug in Sorted Boundary Logic
- **Issue**: In merge-sort, the "sorted boundary" highlight was using wrong color state
- **Root Cause**: Component re-rendered during algorithm step, color selector used stale index
- **Detection**: Visual inspection during testing (not caught by unit tests)
- **Fix**: Moved color calculation into the algorithm module, React component just reads it
- **Lesson**: Pure algorithm modules should calculate ALL display state, not just the data structure

### 3. Type Safety for SVG Graph Algorithms
- **Dijkstra, A*, Floyd-Warshall, Prim, Kruskal, Tarjan, Ford-Fulkerson** all needed SVG rendering
- **Challenge**: Typing graph nodes, edges, SVG positions, event handlers across Vite build boundaries
- **Solution**: Created shared `GraphNode`, `GraphEdge`, `Position` types in `src/types/` and reused
- **Learned**: SVG algorithms need more up-front type design than array-based algorithms

### 4. CSS Prefix Grep Verification Pain
- **Spec Rule**: All CSS classes must be prefixed (e.g., `ms-` for merge-sort)
- **Manual Verification**: Had to `grep` every file after CSS changes to verify no unprefixed names slipped through
- **False Positives**: Selectors like `.ms-step.ms-highlight` triggered false positives in naive grep
- **Solution**: Created strict pattern `grep -P 'class="[^"]*(^|\s)(?!algo-prefix)` to validate
- **Learned**: This should be an ESLint rule, not manual grep

### 5. Navigation Update Fatigue
- **Scope**: 29 algorithm pages, each needed nav link added to ALL other `.html` files (vanilla) + App.tsx routes (React)
- **Complexity**: Vanilla pages still in old index.html, new React pages in vite bundle
- **Error**: Forgot to update nav in one old `.html` file initially → broken link in one algorithm page
- **Solution**: Created a checklist in tasks.md to verify Nav updates after each phase
- **Learned**: This is a scale problem — should have a single source of truth for nav (config file, not duplicated HTML)

---

## Specific Technical Decisions

### Algorithm Module Integration

**Pattern**:
```typescript
// src/lib/algorithms/binary-search.ts
export { binarySearch, searchWithSteps } from '../../../binary-search-algorithm.js';

// src/pages/algorithms/binary-search/binary-search.tsx
import { binarySearch, searchWithSteps } from '@/lib/algorithms/binary-search';
```

**Why**: Preserves original algorithm file (testable in Node), adds TS types via wrapper, component imports from wrapper.

### Build Config (@types/node, __dirname, tsconfig)

**Learned Rule**: When using Vite + Node APIs (path.resolve, import.meta.url), must:
1. Add `@types/node` as devDependency
2. Use `fileURLToPath(new URL('.', import.meta.url))` instead of `__dirname`
3. Include `vite.config.ts` in tsconfig `include` array

Violated any of these → TS errors in IDE or build.

### Vite base Path

**Set in vite.config.ts**:
```js
export default {
  base: '/algoviz/',  // GitHub Pages subdirectory
}
```

Enables dev server at `https://algoviz.localhost` and production build paths correct for /algoviz/ subdirectory.

---

## What Would Improve for Phase 3+

If this pattern is extended (Phase 6: more algorithms):

1. **Automate Nav Updates**: Generate nav from a single YAML config, include in build
2. **CSS Prefix Linting**: Add ESLint rule to validate `class="algo-prefix-*"` pattern
3. **SVG Type Generator**: Schema for graph algorithms to auto-generate TS types from algorithm files
4. **Algorithm Unit Test Validator**: CI check that confirms `[algo]-algorithm.test.js` tests match `[algo].tsx` logic

---

## Summary

Phase 2 proved the **pattern scales**. Once Phase 1 established the algorithm-module-to-React-component pattern, phases 2–5 executed systematically with zero architectural surprises. The hardest part was UX refinement (bubble sort, colors) and the tedious but manual processes (nav links, CSS prefix verification). No blockers. Delivery was on schedule.

**Verdict**: Pattern is production-ready. Future phases can reuse this wholesale.
