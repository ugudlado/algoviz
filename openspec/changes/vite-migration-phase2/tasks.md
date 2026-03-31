# Tasks: Vite+React+TS Migration Phase 2

**Flux + Linear:** Umbrella task id is `imp-v2-umbrella` (see `.openspec.yaml` `flux-task-id`). Phase tickets HL-134…HL-138 map to `imp-v2-p1-srch` … `imp-v2-p5-adv`. Import JSON includes **`agent`** + **`Executor: …`** lines; set **`FLUX_EXECUTOR`** (`cursor` / `claude`, …) in your shell when syncing — see `~/.claude/skills/flux/SKILL.md` (*Assigning tasks to an executor*). Re-sync: `flux import openspec/changes/vite-migration-phase2/flux-phase-linear-import.json --merge` (merge skips existing ids).

## Phase 1 — Searching (3 pages)

- [x] P1.1: Migrate Binary Search (array bars + pointer highlighting)
- [x] P1.2: Migrate BFS Pathfinding (CSS grid with interactive wall/start/end placement)
- [x] P1.3: Migrate DFS Pathfinding (CSS grid, same pattern as BFS)
- [x] P1.4: Update Nav + App.tsx routes for searching pages
- [x] P1.5: Quality gates + commit Phase 1

## Phase 2 — Graph Algorithms (8 pages)

- [x] P2.1: Migrate Dijkstra (SVG graph + distance table + priority queue)
- [x] P2.2: Migrate A* Pathfinding (SVG graph + heuristic display)
- [x] P2.3: Migrate Floyd-Warshall (distance matrix table)
- [x] P2.4: Migrate Prim's MST (SVG graph + edge selection)
- [x] P2.5: Migrate Kruskal's MST (SVG graph + union-find display)
- [x] P2.6: Migrate Tarjan's SCC (SVG graph + SCC highlighting)
- [x] P2.7: Migrate Ford-Fulkerson (SVG flow network + residual graph)
- [x] P2.8: Migrate Topological Sort (SVG DAG + sorted order display)
- [x] P2.9: Update Nav + App.tsx routes for graph pages
- [x] P2.10: Quality gates + commit Phase 2

## Phase 3 — DP + String (5 pages)

- [x] P3.1: Migrate Knapsack 0/1 (DP table + item selection)
- [x] P3.2: Migrate LCS (DP table + sequence highlighting)
- [x] P3.3: Migrate Levenshtein Distance (DP table + operation trace)
- [x] P3.4: Migrate KMP Search (character row comparison + failure function)
- [x] P3.5: Migrate Huffman Coding (tree visualization + encoding table)
- [x] P3.6: Update Nav + App.tsx routes for DP+String pages
- [x] P3.7: Quality gates + commit Phase 3

## Phase 4 — Data Structures (9 pages)

- [x] P4.1: Migrate AVL Tree (SVG tree + rotation animation)
- [x] P4.2: Migrate BST Traversal (SVG tree + 3 traversal modes)
- [x] P4.3: Migrate B-Tree (SVG tree + node splitting)
- [x] P4.4: Migrate Min-Heap (array row + SVG tree dual view)
- [x] P4.5: Migrate Trie (SVG tree + insert/search/prefix tabs)
- [x] P4.6: Migrate LRU Cache (linked list + hash map dual view)
- [x] P4.7: Migrate Bloom Filter (bit array + hash function display)
- [x] P4.8: Migrate Union-Find (forest visualization + rank/path display)
- [x] P4.9: Migrate Sliding Window (array with window highlighting)
- [x] P4.10: Update Nav + App.tsx routes for data structure pages
- [x] P4.11: Quality gates + commit Phase 4

## Phase 5 — Advanced (4 pages)

- [x] P5.1: Migrate Convex Hull (canvas 2D + point placement)
- [x] P5.2: Migrate Elevator/SCAN (disk track visualization)
- [x] P5.3: Migrate Minimax (tic-tac-toe board + game tree)
- [x] P5.4: Migrate N-Queens (dynamic chessboard + backtracking tree)
- [x] P5.5: Update Nav + App.tsx routes for advanced pages
- [x] P5.6: Quality gates + commit Phase 5

## Final

- [x] F.1: Final quality gates pass (lint, format, knip, build)
- [ ] F.2: Remove `bubble-sort-v2.html` and related files (superseded by React)
- [x] F.3: Update Home page to link all migrated algorithms (remove "Coming soon")
