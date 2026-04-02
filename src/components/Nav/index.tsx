import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAlgovizProgress } from "@/contexts/AlgovizProgressContext";
import { StoryBanner } from "@/components/StoryBanner";

interface NavItem {
  label: string;
  path: string;
}

interface SearchItem extends NavItem {
  categoryLabel: string;
}

/** Algorithm data used only for search — not rendered as nav dropdowns. */
const SEARCH_INDEX: { label: string; items: NavItem[] }[] = [
  {
    label: "Sorting",
    items: [
      { label: "Bubble Sort", path: "/algorithms/bubble-sort" },
      { label: "Merge Sort", path: "/algorithms/merge-sort" },
      { label: "Quick Sort", path: "/algorithms/quicksort" },
      { label: "Radix Sort", path: "/algorithms/radix-sort" },
    ],
  },
  {
    label: "Searching",
    items: [
      { label: "Binary Search", path: "/algorithms/binary-search" },
      { label: "BFS Pathfinding", path: "/algorithms/bfs-pathfinding" },
      { label: "DFS Pathfinding", path: "/algorithms/dfs-pathfinding" },
      { label: "Sliding Window", path: "/algorithms/sliding-window" },
    ],
  },
  {
    label: "Graph",
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
    items: [
      { label: "Knapsack (0/1)", path: "/algorithms/knapsack" },
      { label: "LCS", path: "/algorithms/lcs" },
      { label: "Levenshtein Distance", path: "/algorithms/levenshtein" },
    ],
  },
  {
    label: "String",
    items: [
      { label: "KMP Search", path: "/algorithms/kmp" },
      { label: "Huffman Coding", path: "/algorithms/huffman" },
    ],
  },
  {
    label: "Data Structures",
    items: [
      { label: "AVL Tree", path: "/algorithms/avl-tree" },
      { label: "BST Traversal", path: "/algorithms/bst-traversal" },
      { label: "B-Tree", path: "/algorithms/btree" },
      { label: "Min-Heap", path: "/algorithms/min-heap" },
      { label: "LRU Cache", path: "/algorithms/lru-cache" },
      { label: "Bloom Filter", path: "/algorithms/bloom-filter" },
      { label: "Trie", path: "/algorithms/trie" },
      { label: "Union-Find", path: "/algorithms/union-find" },
    ],
  },
  {
    label: "Advanced",
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
  /** When set (algorithm pages), show mark-complete control in the nav bar */
  algorithmProgressPath?: string;
}

function NavAlgorithmProgress({ path }: { path: string }) {
  const { isAlgorithmComplete, toggleAlgorithmComplete } = useAlgovizProgress();
  const done = isAlgorithmComplete(path);
  return (
    <button
      type="button"
      className="nav-algo-progress-btn"
      onClick={() => toggleAlgorithmComplete(path)}
      aria-pressed={done}
      aria-label={done ? "Mark as not completed" : "Mark as completed"}
    >
      {done ? "Completed" : "Mark as completed"}
    </button>
  );
}

export function Nav({ algorithmProgressPath }: NavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const searchableItems = useMemo<SearchItem[]>(
    () =>
      SEARCH_INDEX.flatMap((group) =>
        group.items.map((item) => ({ ...item, categoryLabel: group.label })),
      ),
    [],
  );
  const normalizedQuery = query.trim().toLowerCase();
  const searchResults = useMemo(
    () =>
      normalizedQuery.length === 0
        ? []
        : searchableItems
            .filter((item) => {
              const label = item.label.toLowerCase();
              const category = item.categoryLabel.toLowerCase();
              return (
                label.includes(normalizedQuery) ||
                category.includes(normalizedQuery)
              );
            })
            .slice(0, 8),
    [normalizedQuery, searchableItems],
  );

  useEffect(() => {
    function handleShortcut(event: KeyboardEvent) {
      const isCommandK = (event.metaKey || event.ctrlKey) && event.key === "k";
      if (!isCommandK) {
        return;
      }
      event.preventDefault();
      searchInputRef.current?.focus();
      searchInputRef.current?.select();
    }

    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);

  function closeSearchAndMenu() {
    setQuery("");
    setIsOpen(false);
  }

  return (
    <>
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

        <div className="nav-search-wrap">
          <input
            ref={searchInputRef}
            type="search"
            className="nav-search-input"
            placeholder="Search algorithms... (⌘K)"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && searchResults.length > 0) {
                navigate(searchResults[0].path);
                closeSearchAndMenu();
              }
            }}
            aria-label="Search algorithm pages"
          />
          {query.length > 0 && (
            <button
              type="button"
              className="nav-search-clear"
              onClick={() => setQuery("")}
              aria-label="Clear search"
            >
              x
            </button>
          )}
          {normalizedQuery.length > 0 && (
            <div className="nav-search-results" role="listbox">
              {searchResults.length === 0 && (
                <div className="nav-search-empty">
                  No matches. Try algorithm name or category.
                </div>
              )}
              {searchResults.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={isActive ? "active" : ""}
                    onClick={closeSearchAndMenu}
                  >
                    <span>{item.label}</span>
                    <small>{item.categoryLabel}</small>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        <Link
          to="/#learning-paths"
          className={`nav-link${location.pathname.startsWith("/learning-paths") ? " nav-link--active" : ""}`}
        >
          Learning Paths
        </Link>
        <Link
          to="/algorithms"
          className={`nav-link${location.pathname === "/algorithms" ? " nav-link--active" : ""}`}
        >
          Algorithms
        </Link>
        <Link
          to="/settings"
          className={`nav-link nav-link--util${location.pathname === "/settings" ? " nav-link--active" : ""}`}
        >
          Settings
        </Link>

        {algorithmProgressPath && (
          <>
            <span className="nav-divider" aria-hidden />
            <NavAlgorithmProgress path={algorithmProgressPath} />
          </>
        )}

        <button
          className="nav-hamburger"
          onClick={() => setIsOpen((o) => !o)}
          aria-label="Toggle navigation"
        >
          ☰
        </button>
      </nav>
      {algorithmProgressPath && <StoryBanner />}
    </>
  );
}
