import { useState } from 'react'
import { Link } from 'react-router-dom'

interface AlgoCard {
  name: string
  path: string
  category: string
  categoryLabel: string
  accentVar: string
  description: string
  complexity: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  available: boolean
}

const ALGORITHMS: AlgoCard[] = [
  {
    name: 'Bubble Sort',
    path: '/algorithms/bubble-sort',
    category: 'sorting',
    categoryLabel: 'Sorting',
    accentVar: '--cat-sorting',
    description: 'Compare adjacent elements and bubble the largest to the end.',
    complexity: 'O(n²)',
    difficulty: 'Beginner',
    available: true,
  },
  {
    name: 'Merge Sort',
    path: '/algorithms/merge-sort',
    category: 'sorting',
    categoryLabel: 'Sorting',
    accentVar: '--cat-sorting',
    description: 'Divide and conquer: split, sort halves, then merge.',
    complexity: 'O(n log n)',
    difficulty: 'Intermediate',
    available: true,
  },
  {
    name: 'Quick Sort',
    path: '/algorithms/quicksort',
    category: 'sorting',
    categoryLabel: 'Sorting',
    accentVar: '--cat-sorting',
    description: 'Pick a pivot, partition around it, recurse on sub-arrays.',
    complexity: 'O(n log n)',
    difficulty: 'Intermediate',
    available: true,
  },
  {
    name: 'Radix Sort',
    path: '/algorithms/radix-sort',
    category: 'sorting',
    categoryLabel: 'Sorting',
    accentVar: '--cat-sorting',
    description: 'Sort integers digit by digit using counting sort buckets.',
    complexity: 'O(nk)',
    difficulty: 'Intermediate',
    available: true,
  },
  {
    name: 'Binary Search',
    path: '#binary-search',
    category: 'searching',
    categoryLabel: 'Searching',
    accentVar: '--cat-searching',
    description: 'Find an element in a sorted array by halving the search space.',
    complexity: 'O(log n)',
    difficulty: 'Beginner',
    available: false,
  },
  {
    name: 'Dijkstra',
    path: '#dijkstra',
    category: 'graph',
    categoryLabel: 'Graph',
    accentVar: '--cat-graph',
    description: "Find shortest paths from a source using a priority queue.",
    complexity: 'O((V+E) log V)',
    difficulty: 'Advanced',
    available: false,
  },
  {
    name: 'A* Pathfinding',
    path: '#astar',
    category: 'graph',
    categoryLabel: 'Graph',
    accentVar: '--cat-graph',
    description: 'Guided graph search using heuristics to find optimal paths.',
    complexity: 'O(E)',
    difficulty: 'Advanced',
    available: false,
  },
  {
    name: 'Knapsack (0/1)',
    path: '#knapsack',
    category: 'dp',
    categoryLabel: 'DP',
    accentVar: '--cat-dp',
    description: 'Maximize value in a weight-limited knapsack using DP.',
    complexity: 'O(nW)',
    difficulty: 'Intermediate',
    available: false,
  },
  {
    name: 'KMP Search',
    path: '#kmp',
    category: 'string',
    categoryLabel: 'String',
    accentVar: '--cat-string',
    description: 'Find pattern in text in linear time using a failure function.',
    complexity: 'O(n+m)',
    difficulty: 'Advanced',
    available: false,
  },
  {
    name: 'BST Traversal',
    path: '#bst',
    category: 'ds',
    categoryLabel: 'Data Structures',
    accentVar: '--cat-ds',
    description: 'Insert, delete, and traverse a binary search tree.',
    complexity: 'O(log n)',
    difficulty: 'Beginner',
    available: false,
  },
  {
    name: 'LRU Cache',
    path: '#lru-cache',
    category: 'ds',
    categoryLabel: 'Data Structures',
    accentVar: '--cat-ds',
    description: 'O(1) cache with doubly-linked list + hash map eviction.',
    complexity: 'O(1)',
    difficulty: 'Intermediate',
    available: false,
  },
  {
    name: 'Convex Hull',
    path: '#convex-hull',
    category: 'geometry',
    categoryLabel: 'Advanced',
    accentVar: '--cat-geometry',
    description: 'Find the smallest convex polygon enclosing a point set.',
    complexity: 'O(n log n)',
    difficulty: 'Advanced',
    available: false,
  },
]

const DIFFICULTY_COLOR: Record<string, string> = {
  Beginner: '#3fb950',
  Intermediate: '#d29922',
  Advanced: '#f85149',
}

const LEARNING_PATHS = [
  {
    title: 'CS Fundamentals',
    color: 'var(--cat-sorting)',
    steps: ['Bubble Sort', 'Binary Search', 'BST Traversal', 'Merge Sort'],
  },
  {
    title: 'Interview Prep',
    color: 'var(--cat-dp)',
    steps: ['Quick Sort', 'Knapsack (0/1)', 'LCS', 'Levenshtein Distance'],
  },
  {
    title: 'Graph Mastery',
    color: 'var(--cat-graph)',
    steps: ["Dijkstra", 'A* Pathfinding', "Prim's MST", "Kruskal's MST"],
  },
]

export default function Home() {
  const [query, setQuery] = useState('')

  const filtered = ALGORITHMS.filter((a) =>
    a.name.toLowerCase().includes(query.toLowerCase()) ||
    a.categoryLabel.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div
      className="algo-page"
      data-category="home"
      style={{ alignItems: 'stretch', padding: 0 }}
    >
      {/* Navigation */}
      <nav
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0 2rem',
          height: 56,
          borderBottom: '1px solid var(--border)',
          position: 'sticky',
          top: 0,
          background: 'rgba(3,3,3,0.8)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          zIndex: 100,
        }}
      >
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            fontWeight: 700,
            fontSize: '1.1rem',
            letterSpacing: '-0.02em',
            textDecoration: 'none',
            color: 'var(--text-primary)',
          }}
        >
          <span
            style={{
              width: 24,
              height: 24,
              background: 'var(--accent)',
              borderRadius: 4,
              display: 'grid',
              placeItems: 'center',
              boxShadow: '0 0 15px var(--accent-glow)',
              fontSize: '0.65rem',
              fontWeight: 800,
              color: 'var(--bg-primary)',
            }}
          >
            AV
          </span>
          AlgoViz
        </Link>

        <div style={{ display: 'flex', gap: '2rem' }}>
          <a
            href="#algorithms"
            style={{
              color: 'var(--text-secondary)',
              textDecoration: 'none',
              fontSize: '0.9rem',
            }}
          >
            Algorithms
          </a>
          <a
            href="#learning-paths"
            style={{
              color: 'var(--text-secondary)',
              textDecoration: 'none',
              fontSize: '0.9rem',
            }}
          >
            Learning Paths
          </a>
        </div>

        {/* Search bar */}
        <div style={{ position: 'relative', width: 240 }}>
          <span
            style={{
              position: 'absolute',
              left: '0.65rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
              pointerEvents: 'none',
              fontSize: '0.9rem',
            }}
          >
            ⌕
          </span>
          <input
            type="text"
            placeholder="Search algorithms..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
              padding: '0.5rem 1rem 0.5rem 2.25rem',
              borderRadius: 6,
              fontFamily: 'var(--font-body)',
              fontSize: '0.85rem',
              width: '100%',
              outline: 'none',
            }}
          />
        </div>
      </nav>

      {/* Hero */}
      <section
        style={{
          maxWidth: 1200,
          margin: '6rem auto 4rem',
          padding: '0 2rem',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            display: 'inline-block',
            padding: '4px 12px',
            background: 'var(--accent-dim)',
            border: '1px solid rgba(0,229,255,0.2)',
            color: 'var(--accent)',
            borderRadius: 20,
            fontSize: '0.75rem',
            fontWeight: 600,
            marginBottom: '1.5rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          Interactive Algorithm Visualizations
        </div>

        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(3rem, 8vw, 4rem)',
            fontWeight: 800,
            letterSpacing: '-0.04em',
            marginBottom: '1.5rem',
            background: 'linear-gradient(to bottom, #fff 0%, #a1a1a1 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            lineHeight: 1.1,
          }}
        >
          See algorithms
          <br />
          come alive
        </h1>

        <p
          style={{
            fontSize: '1.25rem',
            color: 'var(--text-secondary)',
            maxWidth: 600,
            margin: '0 auto 3rem',
            lineHeight: 1.6,
          }}
        >
          Step through every comparison, swap, and recursion. Built for CS
          students who learn by doing.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
          <Link
            to="/algorithms/bubble-sort"
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: 6,
              fontWeight: 600,
              fontSize: '0.95rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              textDecoration: 'none',
              background: 'var(--text-primary)',
              color: 'var(--bg-primary)',
              border: 'none',
            }}
          >
            Start with Bubble Sort →
          </Link>
          <a
            href="#algorithms"
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: 6,
              fontWeight: 600,
              fontSize: '0.95rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              textDecoration: 'none',
              background: 'transparent',
              color: 'var(--text-primary)',
              border: '1px solid var(--border)',
            }}
          >
            Browse all →
          </a>
        </div>
      </section>

      {/* Algorithm Cards Grid */}
      <section
        id="algorithms"
        style={{
          maxWidth: 1200,
          margin: '0 auto 6rem',
          padding: '0 2rem',
          width: '100%',
        }}
      >
        <h2
          style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            marginBottom: '0.5rem',
            letterSpacing: '-0.02em',
          }}
        >
          All Algorithms
        </h2>
        <p
          style={{
            color: 'var(--text-muted)',
            fontSize: '0.9rem',
            marginBottom: '2rem',
          }}
        >
          {ALGORITHMS.length} algorithms across 7 categories
        </p>

        {filtered.length === 0 && (
          <div
            style={{
              textAlign: 'center',
              padding: '3rem 0',
              color: 'var(--text-muted)',
              fontSize: '0.95rem',
            }}
          >
            No algorithms match &quot;{query}&quot;
          </div>
        )}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1rem',
          }}
        >
          {filtered.map((algo) => (
            <AlgoCard key={algo.name} algo={algo} />
          ))}
        </div>
      </section>

      {/* Learning Paths */}
      <section
        id="learning-paths"
        style={{
          maxWidth: 1200,
          margin: '0 auto 6rem',
          padding: '0 2rem',
          width: '100%',
        }}
      >
        <h2
          style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            marginBottom: '0.5rem',
            letterSpacing: '-0.02em',
          }}
        >
          Learning Paths
        </h2>
        <p
          style={{
            color: 'var(--text-muted)',
            fontSize: '0.9rem',
            marginBottom: '2rem',
          }}
        >
          Structured sequences to build understanding step by step
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {LEARNING_PATHS.map((path) => (
            <div
              key={path.title}
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                borderTop: `3px solid ${path.color}`,
                borderRadius: 12,
                padding: '1.5rem',
              }}
            >
              <h3
                style={{
                  fontSize: '1rem',
                  fontWeight: 700,
                  marginBottom: '1rem',
                  color: path.color,
                }}
              >
                {path.title}
              </h3>
              <ol style={{ paddingLeft: '1.5rem', color: 'var(--text-secondary)' }}>
                {path.steps.map((step, i) => (
                  <li key={i} style={{ marginBottom: '0.4rem', fontSize: '0.875rem' }}>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function AlgoCard({ algo }: { algo: AlgoCard }) {
  const content = (
    <div
      style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        padding: '1.25rem',
        cursor: algo.available ? 'pointer' : 'default',
        transition: 'border-color 0.2s, transform 0.15s',
        opacity: algo.available ? 1 : 0.55,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.6rem',
        height: '100%',
      }}
      onMouseEnter={(e) => {
        if (algo.available) {
          const el = e.currentTarget as HTMLDivElement
          el.style.borderColor = `var(${algo.accentVar})`
          el.style.transform = 'translateY(-2px)'
        }
      }}
      onMouseLeave={(e) => {
        if (algo.available) {
          const el = e.currentTarget as HTMLDivElement
          el.style.borderColor = 'var(--border)'
          el.style.transform = ''
        }
      }}
    >
      {/* Category + Difficulty */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span
          style={{
            fontSize: '0.7rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: `var(${algo.accentVar})`,
          }}
        >
          {algo.categoryLabel}
        </span>
        <span
          style={{
            fontSize: '0.68rem',
            color: DIFFICULTY_COLOR[algo.difficulty],
            fontWeight: 600,
          }}
        >
          {algo.difficulty}
        </span>
      </div>

      {/* Name */}
      <h3
        style={{
          fontSize: '1rem',
          fontWeight: 700,
          letterSpacing: '-0.01em',
          color: 'var(--text-primary)',
        }}
      >
        {algo.name}
      </h3>

      {/* Description */}
      <p
        style={{
          fontSize: '0.82rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.5,
          flex: 1,
        }}
      >
        {algo.description}
      </p>

      {/* Complexity + badge */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.78rem',
            color: `var(${algo.accentVar})`,
            fontWeight: 600,
          }}
        >
          {algo.complexity}
        </span>
        {!algo.available && (
          <span
            style={{
              fontSize: '0.65rem',
              color: 'var(--text-muted)',
              border: '1px solid var(--border)',
              borderRadius: 4,
              padding: '2px 8px',
            }}
          >
            Coming soon
          </span>
        )}
        {algo.available && (
          <span
            style={{
              fontSize: '0.72rem',
              color: `var(${algo.accentVar})`,
              fontWeight: 500,
            }}
          >
            Visualize →
          </span>
        )}
      </div>
    </div>
  )

  if (algo.available) {
    return (
      <Link to={algo.path} style={{ textDecoration: 'none' }}>
        {content}
      </Link>
    )
  }
  return <div>{content}</div>
}
