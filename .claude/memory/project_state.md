---
name: AlgoViz Project State
description: Current implementation status, algorithm coverage, active/pending work, and feature pipeline
type: project
---

AlgoViz is a React+Vite+TypeScript interactive algorithm visualization tool for CS education. Vite+React migration **fully complete** (merged to main 2026-03-31).

**Current algorithm count: 34 React pages, covering:**
- Sorting: BubbleSort, MergeSort, QuickSort, RadixSort
- Searching: BinarySearch, A*
- Graph traversal: BFS, DFS
- Graph algorithms: Dijkstra, Floyd-Warshall, Kruskal's, Prim's, Tarjan's SCC, Ford-Fulkerson (max flow), TopoSort
- Dynamic programming: Knapsack, LCS, Levenshtein, Minimax
- String matching: KMP, SlidingWindow, Huffman
- Data structures: BST, AVL tree, B-tree, MinHeap, Trie, LRU Cache, Bloom Filter, Union-Find
- Computational geometry: ConvexHull
- Scheduling: ElevatorScan (SCAN disk scheduling)
- Matching: Gale-Shapley (stable matching)
- Backtracking: N-Queens

**Recent features (post-migration):**
- HL-140 (2026-04-01): Story-driven learning paths — "Delivery Startup" and "Algorithm Detective" paths with tiered progression. Data in `src/data/learningPaths.ts`, detail page at `/learning-path/:slug`.
- HL-147 (2026-04-01): Redesigned home algorithm spotlight card + navbar discoverability improvements.
- HL-151 (2026-04-01): Aligned algorithm views to BubbleSort layout pattern — 13 pages refactored (sidebar reorder, stats merged into watchVars, ProblemFrame→fieldsets). Uncommitted on main as of 2026-04-02.
- HL-152 (2026-04-02): Learning path progress tracking — canonical algorithm-route-based completion, Settings page, cross-tab sync, import/export. Merged to main.

**Remaining proposed (not yet implemented):**
- `2026-03-28-algoviz-code-walkthrough`
- `2026-03-28-algoviz-enhanced-examples`
- `2026-03-28-algoviz-homepage-nav-search`

**Pending cleanup:**
- `algorithms/bubble-sort/` — old prototype directory, not referenced by build or tests. Deletion decision pending.

**Infrastructure:**
- `scripts/setup.sh` / `pnpm setup` — creates Claude memory symlink
- Home page has search filter + learning path previews
- GitHub Pages deploy via GitHub Actions

**Why:** Active educational tool with React shared components and GitHub Pages deploy.
**How to apply:** Check archive before specifying new features. Run `pnpm setup` after cloning. New algorithm pages go in `src/pages/algorithms/[Algo]/`.
