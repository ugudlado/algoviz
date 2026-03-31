# Design: Vite+React+TS Migration Phase 2

## Architecture

Follows Phase 1 pattern exactly. No new architectural decisions needed.

### File Structure Per Algorithm

```
src/
  lib/algorithms/
    [algo]-algorithm.js    # Copied from root (untouched)
    [algo].ts              # TypeScript wrapper with interfaces
  pages/algorithms/
    [Name]/
      index.tsx            # React page component
```

### TypeScript Wrapper Pattern

```typescript
// @ts-ignore
import AlgoModule from './[algo]-algorithm.js'
const Algo: any = AlgoModule

export interface AlgoStep { /* fields from algorithm's step object */ }
export interface AlgoResult { steps: AlgoStep[]; /* other result fields */ }

export function generateSteps(/* params */): AlgoResult {
  return Algo.methodName(/* params */) as AlgoResult
}
```

### Visualization Categories

Different algorithms require different visualization components:

| Category | Viz Type | Examples |
|----------|----------|----------|
| Array-based | Bar chart / cell row | Binary Search, Sliding Window |
| Grid-based | CSS Grid with cell states | BFS, DFS |
| Graph-based | SVG nodes + edges | Dijkstra, A*, Prim's, Kruskal's, Tarjan's, Topo Sort, Ford-Fulkerson, Floyd-Warshall |
| Table-based | HTML table with cell highlighting | Knapsack, LCS, Levenshtein |
| Tree-based | SVG tree layout | BST, AVL, B-Tree, Trie, Heap |
| Canvas-based | 2D canvas drawing | Convex Hull |
| Board-based | Grid with pieces | Minimax, N-Queens |
| String-based | Character row comparison | KMP, Huffman |
| Structure-based | Custom node layout | LRU Cache, Bloom Filter, Union-Find |

### Shared Components (already built)

All 7 shared components from Phase 1 are reused:
- `Nav` — update NAV_CONFIG paths as pages are migrated
- `PlaybackController` — universal playback (all pages use same interface)
- `WatchPanel` — variable watch (algorithm-specific vars)
- `ComplexityPopover` — complexity badge (algorithm-specific values)
- `AnalogyPanel` — real-world analogy text
- `ProblemFrame` — Given/Goal/Real use cases
- `WhyComplexityPanel` — complexity derivation

### Interactive Algorithms (special handling)

Some algorithms have interactive inputs beyond text fields:
- **BFS/DFS**: Grid click to place walls, start, end points
- **Dijkstra/A***: Node placement, edge creation, node dragging
- **BST/AVL/B-Tree**: Insert/delete operations on live structure
- **Trie**: Insert/search/prefix operations
- **Heap**: Insert/extract operations
- **Convex Hull**: Canvas click to place points
- **Minimax**: Board click to play moves
- **N-Queens**: Board size selector

These require React event handlers (onClick, onMouseDown/Move/Up) replacing vanilla addEventListener calls.

## Migration Order Rationale

1. **Searching** first — simplest grid/array viz, validates pattern
2. **Graph** — largest batch, most complex, gets hard work done early
3. **DP + String** — table/character viz, moderate effort
4. **Data Structures** — tree/structure viz, moderate-high effort
5. **Advanced** — mixed viz types, wraps up remaining pages
