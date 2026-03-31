---
name: AlgoViz Project State
description: Current implementation status, algorithm coverage, and active/pending work
type: project
---

AlgoViz is a React+Vite+TypeScript interactive algorithm visualization tool for CS education. The Vite+React migration is **fully complete** (merged to main as of 2026-03-31). All algorithm pages are now React components.

**Current algorithm count: 29 React pages + bubble-sort = 30 total, covering:**
- Sorting: BubbleSort, MergeSort, QuickSort, RadixSort
- Searching: BinarySearch, A*
- Graph traversal: BFS, DFS
- Graph algorithms: Dijkstra, Floyd-Warshall, Kruskal's, Prim's, Tarjan's SCC, Ford-Fulkerson (max flow), TopoSort
- Dynamic programming: Knapsack, LCS, Levenshtein, Minimax
- String matching: KMP, SlidingWindow, Huffman
- Data structures: BST, AVL tree, B-tree, MinHeap, Trie, LRU Cache, Bloom Filter, Union-Find
- Computational geometry: ConvexHull

**Completed OpenSpec changes:**
- All Vite migration phases (HL-134 through HL-138) — done 2026-03-31
- `2026-03-30-algoviz-b-tree`, `ford-fulkerson`, `n-queens`, `tarjan-scc`, `g2-layout` — done 2026-03-30
- Archived: avl-tree, complexity-popovers, homepage-learning-path, input-validation, problem-framing, watch-panel, why-complexity, bubble-sort-v2

**Remaining proposed (not yet implemented):**
- `2026-03-28-algoviz-code-walkthrough`
- `2026-03-28-algoviz-enhanced-examples`
- `2026-03-28-algoviz-homepage-nav-search`

**Pending cleanup (as of 2026-03-31):**
- `algorithms/bubble-sort/` — old prototype directory in repo root, not referenced by build or tests. User was asked whether to delete; decision pending.

**Infrastructure:**
- `scripts/setup.sh` — one-time dev setup, creates Claude memory symlink
- `pnpm setup` — runs setup.sh
- `.claude/memory/` in repo — memory files are git-versioned (symlinked from system path)
- Home page has a search filter input (added 2026-03-31)

**Why:** Active educational tool migrated to React for shared components and GitHub Pages deploy.
**How to apply:** Check archive before specifying new features. Run `pnpm setup` after cloning. All new algorithm pages go in `src/pages/algorithms/[Algo]/` following the React pattern.
