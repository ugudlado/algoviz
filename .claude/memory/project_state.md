---
name: AlgoViz Project State
description: Current implementation status, algorithm coverage, and active/pending work
type: project
---

AlgoViz is a vanilla JavaScript interactive algorithm visualization tool for CS education. It has no framework — all pages are standalone HTML+JS+CSS files.

**Current algorithm count (as of 2026-03-30):** ~36 algorithm pages covering:
- Sorting: bubble sort (+ v2 redesign), merge sort, quicksort, radix sort, heap sort
- Searching: binary search, A*
- Graph traversal: BFS, DFS
- Graph algorithms: Dijkstra, Floyd-Warshall, Kruskal's, Prim's, Bellman-Ford, Tarjan's SCC, Ford-Fulkerson (max flow)
- Dynamic programming: knapsack, LCS, levenshtein, minimax
- String matching: KMP, sliding window
- Data structures: BST, AVL tree, B-tree, heap, trie, union-find, bloom filter, LRU cache
- Computational geometry: convex hull
- Other: elevator (scheduling), N-Queens (backtracking), topological sort, Huffman coding

**Completed OpenSpec changes (2026-03-30):**
- `2026-03-30-algoviz-b-tree` — B-Tree insertion/search visualization
- `2026-03-30-algoviz-ford-fulkerson` — Ford-Fulkerson max flow visualization
- `2026-03-30-algoviz-n-queens` — N-Queens backtracking with dual board + tree rendering
- `2026-03-30-algoviz-tarjan-scc` — Tarjan's SCC with stack mechanics
- `2026-03-29-algoviz-g2-layout` — G2 design system
- Archived: avl-tree, complexity-popovers, homepage-learning-path, input-validation, problem-framing, watch-panel, why-complexity, bubble-sort-v2

**Remaining proposed (not yet implemented):**
- `2026-03-28-algoviz-code-walkthrough`
- `2026-03-28-algoviz-enhanced-examples`
- `2026-03-28-algoviz-homepage-nav-search`

**Infrastructure added (2026-03-30):**
- `scripts/setup.sh` — one-time dev setup, creates Claude memory symlink
- `pnpm setup` — runs setup.sh
- `.claude/memory/` in repo — memory files are now git-versioned (symlinked from system path)

**Why:** Active educational tool. Memory now lives in repo for git versioning and shareability.
**How to apply:** When specifying new features, check archive to avoid duplicating completed work. Run `pnpm setup` after cloning to link Claude memory.
