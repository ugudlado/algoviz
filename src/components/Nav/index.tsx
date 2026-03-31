import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

interface NavItem {
  label: string;
  path: string;
}

interface NavCategory {
  label: string;
  category: string;
  items: NavItem[];
}

interface SearchItem extends NavItem {
  categoryLabel: string;
}

const HOMEPAGE_VISIBLE_NAV_CATEGORIES = new Set([
  "sorting",
  "searching",
  "string",
  "dp",
]);

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
  const [query, setQuery] = useState("");
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const closeTimerRef = useRef<number | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const searchableItems = useMemo<SearchItem[]>(
    () =>
      NAV_CONFIG.flatMap((category) =>
        category.items
          .filter(
            (item) =>
              item.path.startsWith("/") &&
              HOMEPAGE_VISIBLE_NAV_CATEGORIES.has(category.category),
          )
          .map((item) => ({ ...item, categoryLabel: category.label })),
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
    return () => {
      if (closeTimerRef.current !== null) {
        window.clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

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

  function cancelCategoryClose() {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }

  function scheduleCategoryClose() {
    cancelCategoryClose();
    closeTimerRef.current = window.setTimeout(() => {
      setOpenCategory(null);
    }, 320);
  }

  function closeSearchAndMenu() {
    cancelCategoryClose();
    setQuery("");
    setIsOpen(false);
    setOpenCategory(null);
  }

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
      <div className="nav-search-wrap">
        <input
          ref={searchInputRef}
          type="search"
          className="nav-search-input"
          placeholder="Search algorithms..."
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

      {NAV_CONFIG.map((cat) => {
        if (!HOMEPAGE_VISIBLE_NAV_CATEGORIES.has(cat.category)) {
          return null;
        }
        const isCurrent = cat.category === currentCategory;
        return (
          <div
            key={cat.label}
            className={`nav-category${openCategory === cat.label ? " open" : ""}`}
            onMouseEnter={() => {
              cancelCategoryClose();
              setOpenCategory(cat.label);
            }}
            onMouseLeave={scheduleCategoryClose}
          >
            <button
              className={`nav-category-btn${isCurrent ? " current-category" : ""}`}
              onClick={() =>
                setOpenCategory((previous) =>
                  previous === cat.label ? null : cat.label,
                )
              }
              aria-expanded={openCategory === cat.label}
            >
              {cat.label}
            </button>
            <div
              className="nav-dropdown"
              onMouseEnter={cancelCategoryClose}
              onMouseLeave={scheduleCategoryClose}
            >
              {cat.items.map((item) => {
                const isActive = location.pathname === item.path;
                const isInternalLink = item.path.startsWith("/");
                return isInternalLink ? (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={isActive ? "active" : ""}
                    onClick={() => setOpenCategory(null)}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <a
                    key={item.path}
                    href={item.path}
                    className={isActive ? "active" : ""}
                    onClick={() => setOpenCategory(null)}
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
