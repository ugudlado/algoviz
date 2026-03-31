import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

interface NavItem {
  label: string;
  path: string;
}

interface NavCategory {
  label: string;
  category: string;
  items: NavItem[];
}

const NAV_CONFIG: NavCategory[] = [
  {
    label: "Sorting",
    category: "sorting",
    items: [
      { label: "Bubble Sort", path: "/algorithms/bubble-sort" },
      { label: "Merge Sort", path: "/algorithms/merge-sort" },
      { label: "Quick Sort", path: "/algorithms/quicksort" },
      { label: "Radix Sort", path: "/algorithms/radix-sort" },
    ],
  },
  {
    label: "Searching",
    category: "searching",
    items: [
      { label: "Binary Search", path: "/algorithms/binary-search" },
      { label: "BFS Pathfinding", path: "/algorithms/bfs-pathfinding" },
      { label: "DFS Pathfinding", path: "/algorithms/dfs-pathfinding" },
    ],
  },
  {
    label: "Graph",
    category: "graph",
    items: [
      { label: "Dijkstra", path: "/algorithms/dijkstra" },
      { label: "A* Pathfinding", path: "/algorithms/astar-pathfinding" },
      { label: "Floyd-Warshall", path: "/algorithms/floyd-warshall" },
      { label: "Prim's MST", path: "/algorithms/prims-mst" },
      { label: "Kruskal's MST", path: "/algorithms/kruskal" },
      { label: "Tarjan's SCC", path: "/algorithms/tarjan" },
      { label: "Topological Sort", path: "/algorithms/topo-sort" },
      { label: "Ford-Fulkerson", path: "/algorithms/ford-fulkerson" },
      { label: "Gale-Shapley Matching", path: "/algorithms/gale-shapley" },
    ],
  },
  {
    label: "DP",
    category: "dp",
    items: [
      { label: "Knapsack (0/1)", path: "/algorithms/knapsack" },
      { label: "LCS", path: "/algorithms/lcs" },
      { label: "Levenshtein Distance", path: "/algorithms/levenshtein" },
    ],
  },
  {
    label: "String",
    category: "string",
    items: [
      { label: "KMP Search", path: "/algorithms/kmp" },
      { label: "Huffman Coding", path: "/algorithms/huffman" },
    ],
  },
  {
    label: "Data Structures",
    category: "ds",
    items: [
      { label: "AVL Tree", path: "/algorithms/avl-tree" },
      { label: "BST Traversal", path: "/algorithms/bst-traversal" },
      { label: "B-Tree", path: "/algorithms/btree" },
      { label: "Hash Table", path: "#hash-table" },
      { label: "Min-Heap", path: "/algorithms/min-heap" },
      { label: "LRU Cache", path: "/algorithms/lru-cache" },
      { label: "Bloom Filter", path: "/algorithms/bloom-filter" },
      { label: "Trie", path: "/algorithms/trie" },
      { label: "Union-Find", path: "/algorithms/union-find" },
      { label: "Sliding Window", path: "/algorithms/sliding-window" },
    ],
  },
  {
    label: "More",
    category: "advanced",
    items: [
      { label: "Convex Hull", path: "/algorithms/convex-hull" },
      { label: "Elevator (SCAN)", path: "/algorithms/elevator-scan" },
      { label: "Minimax", path: "/algorithms/minimax" },
      { label: "N-Queens", path: "/algorithms/n-queens" },
    ],
  },
];

interface NavProps {
  currentCategory?: string;
}

export function Nav({ currentCategory }: NavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  return (
    <nav className={`algo-nav${isOpen ? " nav-open" : ""}`}>
      <Link to="/" className="nav-home">
        <span
          style={{
            width: 22,
            height: 22,
            background: "var(--accent)",
            borderRadius: 4,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "0.7rem",
            fontWeight: 800,
            color: "var(--bg-primary)",
          }}
        >
          AV
        </span>
        AlgoViz
      </Link>

      {NAV_CONFIG.map((cat) => {
        const isCurrent = cat.category === currentCategory;
        return (
          <div key={cat.label} className="nav-category">
            <button
              className={`nav-category-btn${isCurrent ? " current-category" : ""}`}
            >
              {cat.label}
            </button>
            <div className="nav-dropdown">
              {cat.items.map((item) => {
                const isActive = location.pathname === item.path;
                const isInternalLink = item.path.startsWith("/");
                return isInternalLink ? (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={isActive ? "active" : ""}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <a
                    key={item.path}
                    href={item.path}
                    className={isActive ? "active" : ""}
                  >
                    {item.label}
                  </a>
                );
              })}
            </div>
          </div>
        );
      })}

      <button
        className="nav-hamburger"
        onClick={() => setIsOpen((o) => !o)}
        aria-label="Toggle navigation"
      >
        ☰
      </button>
    </nav>
  );
}
