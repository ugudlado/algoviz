/**
 * Canonical list of client-side algorithm page routes.
 * Keep in sync with `src/App.tsx` Route paths.
 */
export const ALGORITHM_ROUTE_PATHS = [
  "/algorithms/bubble-sort",
  "/algorithms/merge-sort",
  "/algorithms/quicksort",
  "/algorithms/radix-sort",
  "/algorithms/binary-search",
  "/algorithms/bfs-pathfinding",
  "/algorithms/dfs-pathfinding",
  "/algorithms/astar-pathfinding",
  "/algorithms/dijkstra",
  "/algorithms/kruskal",
  "/algorithms/tarjan",
  "/algorithms/prims-mst",
  "/algorithms/floyd-warshall",
  "/algorithms/ford-fulkerson",
  "/algorithms/topo-sort",
  "/algorithms/knapsack",
  "/algorithms/lcs",
  "/algorithms/levenshtein",
  "/algorithms/kmp",
  "/algorithms/huffman",
  "/algorithms/avl-tree",
  "/algorithms/bst-traversal",
  "/algorithms/btree",
  "/algorithms/min-heap",
  "/algorithms/trie",
  "/algorithms/lru-cache",
  "/algorithms/bloom-filter",
  "/algorithms/union-find",
  "/algorithms/sliding-window",
  "/algorithms/convex-hull",
  "/algorithms/elevator-scan",
  "/algorithms/minimax",
  "/algorithms/n-queens",
  "/algorithms/gale-shapley",
] as const;

export const ALGORITHM_ROUTE_PATH_SET: ReadonlySet<string> = new Set(
  ALGORITHM_ROUTE_PATHS,
);
