# Spec: Complete Vite+React+TS Migration (Phase 2)

## Summary

Migrate all 29 remaining vanilla JS algorithm pages to React+Vite+TS, following the established Phase 1 pattern (BubbleSort, MergeSort, QuickSort, RadixSort).

## Background

Phase 1 established the migration pattern:
- React 19 + Vite 8 + TypeScript 6 + React Router 7
- 7 shared components: Nav, PlaybackController, WatchPanel, ComplexityPopover, AnalogyPanel, ProblemFrame, WhyComplexityPanel
- Algorithm integration: copy `*-algorithm.js` to `src/lib/algorithms/`, add `.ts` wrapper with typed exports
- Each page is a self-contained React component at `src/pages/algorithms/[Name]/index.tsx`

## Scope

### Pages to Migrate (29 total, 5 phases)

**Phase 1 — Searching (3 pages)**
- Binary Search
- BFS Pathfinding
- DFS Pathfinding

**Phase 2 — Graph Algorithms (8 pages)**
- Dijkstra's Shortest Path
- A* Pathfinding
- Floyd-Warshall
- Prim's MST
- Kruskal's MST
- Tarjan's SCC
- Ford-Fulkerson Max Flow
- Topological Sort

**Phase 3 — DP + String (5 pages)**
- Knapsack (0/1)
- LCS (Longest Common Subsequence)
- Levenshtein Distance
- KMP String Search
- Huffman Coding

**Phase 4 — Data Structures (9 pages)**
- AVL Tree
- BST Traversal
- B-Tree
- Min-Heap
- Trie
- LRU Cache
- Bloom Filter
- Union-Find
- Sliding Window

**Phase 5 — Advanced (4 pages)**
- Convex Hull (Graham Scan)
- Elevator (SCAN Algorithm)
- Minimax (Tic-Tac-Toe)
- N-Queens

## Per-Page Migration Pattern

For each algorithm page:

1. **Copy** `[algo]-algorithm.js` → `src/lib/algorithms/[algo]-algorithm.js`
2. **Create** `src/lib/algorithms/[algo].ts` — TypeScript wrapper with typed interfaces and re-exports
3. **Create** `src/pages/algorithms/[Name]/index.tsx` — React component following BubbleSort template:
   - Import shared components (Nav, PlaybackController, WatchPanel, etc.)
   - Algorithm-specific visualization component (ArrayBars, Grid, SVGTree, Canvas, etc.)
   - Input controls, error validation, playback state management
   - ProblemFrame, ComplexityPopover, AnalogyPanel, WhyComplexityPanel with algorithm-specific content
   - Pseudocode panel with line highlighting
4. **Add route** to `src/App.tsx`
5. **Update** Nav config — change `#hash` placeholder to `/algorithms/[slug]` route

## Acceptance Criteria

1. All 29 algorithm pages render correctly as React components
2. All visualizations match the vanilla JS behavior (same step data, same colors, same interactions)
3. Playback controls work (play/pause, step forward/back, speed, reset)
4. Nav links updated from `#hash` to `/algorithms/[slug]` for all migrated pages
5. Quality gates pass: `pnpm run lint`, `pnpm run format:check`, `pnpm run knip`
6. `pnpm build` succeeds
7. Each phase commits independently

## Out of Scope

- Redesigning the UI/UX (preserve existing behavior)
- Removing vanilla HTML/JS files (keep for backward compatibility)
- Adding new features to algorithms
- Mobile responsiveness improvements
