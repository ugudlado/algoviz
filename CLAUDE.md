# AlgoViz — Visual Algorithm Teacher

Interactive web-based algorithm visualizations for CS education.

## Development

```bash
# Dev server → https://algoviz.localhost
pnpm dev

# Lint JavaScript
pnpm run lint

# Run tests (Node.js)
pnpm test

# Format check
pnpm run format:check

# Auto-format
pnpm run format

# Build output (gitignored — CI builds and deploys via GitHub Actions)
pnpm build
```

## Quality Gates

| Check | Command | When |
|-------|---------|------|
| JS Lint | `pnpm run lint` | Every phase gate |
| Tests | `pnpm test` | Every phase gate (feature-tdd), final validation |
| Format | `pnpm run format:check` | Before commit |
| Dead code | `pnpm run knip` | Before commit — catches unused exports, dead files |

**Note**: This project has no `type-check` script. The `build` script (`tsc -b && vite build`) exists but is not a quality gate — lint + tests + format + knip are the quality gates. Config: `.eslintrc.json` (lint), `knip.json` (dead code), devDependencies in `package.json`.

**Lint coverage**: ESLint now lints ALL `.js` files including `*-algorithm.js` and `*-algorithm.test.js`. Algorithm files get `node` env (for `module.exports`) and a pattern to suppress expected IIFE global assignment warnings. Test files get `node` env. Unused variables will be caught in all files.

## Architecture

Each algorithm is a standalone page:
- `[algo].html` — page structure + nav
- `[algo].js` — visualization + UI logic
- `[algo]-style.css` — algorithm-specific styles
- `[algo]-algorithm.js` — pure algorithm (no DOM, testable in Node)
- `[algo]-algorithm.test.js` — Node.js tests for algorithm correctness

Shared: `style.css` (nav bar, dark theme base)

## Code Rules (from reviewer learnings)

These rules come from real issues found during code review. Follow them to avoid repeating mistakes.

### DRY: Tested code == Runtime code
- If `[algo]-algorithm.js` exports a function, the UI in `[algo].js` MUST call that function — never duplicate the logic inline
- If tests pass but the UI calls different code, the tests prove nothing
- One source of truth per algorithm — algorithm file is the source, UI file consumes it
- Within `[algo].js`, if two functions compute the same data structure from the same inputs, extract a shared helper. Never duplicate snapshot/state-building logic across functions in the same file.
- Export all reusable constants and pure helpers from `[algo]-algorithm.js`. If the UI needs a constant (e.g., win-line arrays, direction vectors) or a pure function defined in the algorithm module, the algorithm module MUST export it. The UI MUST NOT redeclare it.

### Edge Case Testing (mandatory for feature-tdd)
- Always test: empty input, single element, already-sorted, reverse-sorted, all duplicates, max size (20+)
- For tree structures: test degenerate/skewed trees, not just balanced ones
- For bugfix: test empty source, empty target, single-char operations

### Input Bounds
- Every input field must have max length/value validation
- Guard against unbounded recursive depth (cap tree size, array size)
- Display clear error message when input exceeds bounds

### Visualization UX
- If spec promises a visualization feature (e.g., "recursion tree"), it MUST be implemented — not just the algorithm
- Test UX with extreme cases: 1 element AND 20 elements — does the layout work for both?
- Use `textContent` not `innerHTML` for user-visible text (XSS prevention)
- Clean up timers on reset/page unload (prevent memory leaks)
- Timer cleanup accuracy: use `clearTimeout` for `setTimeout` timers, `clearInterval` for `setInterval` timers — they are not interchangeable

### Style Consistency
- Algorithm files: IIFE pattern, `var` for broad compatibility
- UI files: IIFE pattern, `const`/`let`
- CSS: prefix algorithm-specific classes (e.g., `ms-` for merge-sort) to avoid collisions with shared styles

### Nav Links
- When adding a new page, update nav in ALL existing `.html` files — not just index.html

### CSS Prefix Verification
- After implementing CSS, grep for unprefixed class names — self-reported "prefixed" is insufficient without exhaustive check
- Run: `grep -P 'class="(?!algo-prefix-)' [algo]-style.css` to verify all classes use the feature prefix
- After renaming CSS classes, grep for old names as both standalone AND compound selectors (e.g., `td.traceback.old-name`) — old compounds become dead code

### HTML Validity
- Always use `<!doctype html>` (no backslash, no escaping) as the first line of every HTML file
- Verify the page doesn't trigger Quirks Mode — check console for doctype warnings after runtime verification

### Display Values
- Never derive user-visible counts (step count, progress) from array.length — compute from explicit state
- If any operation mutates user input (sort, filter, normalize), disclose the transformation in the UI

### TDD Test Quality
- Every test assertion must be falsifiable — disjunctions that accept any outcome are invalid (e.g., `assert(A || B)` where one is always true)
- Before marking a RED test task complete, confirm the test actually FAILS without the implementation

### Bugfix Accuracy
- When fix-plan.md lists a count of affected call sites, take it verbatim from Phase 1 grep output — no estimation
- Regression tests must assert post-fix behavior (absence of bug), not tolerance of the old pattern

### Real-World Analogy
- Every algorithm page MUST include a real-world analogy panel (e.g., `<div class="[prefix]-analogy">`)
- Use `<strong>Real-world analogy:</strong>` followed by a concrete, relatable example
- Examples: postal sorting for radix sort, dictionary lookup for binary search, rubber band for convex hull
- Style: bordered card (`#161b22` bg, `#30363d` border), placed between legend and visualization area

## Adding a New Algorithm

1. Create `[algo]-algorithm.js` with pure functions (no DOM, IIFE, exports via global)
2. Create `[algo]-algorithm.test.js` with `module.exports = { runTests }` — test edge cases
3. Create `[algo].html` (include `[algo]-algorithm.js` via script tag BEFORE `[algo].js`)
4. Create `[algo].js` — UI calls functions from algorithm module, no logic duplication
5. Create `[algo]-style.css` with prefixed class names
6. Add real-world analogy panel to HTML with prefixed CSS class
7. Add nav link to ALL existing `.html` files
8. Update `package.json` lint script with new globals
9. Run `npm test && npm run lint` before committing

## Vite + React Conventions

These conventions apply to the Vite+React migration, used for organizing the next generation of algorithm pages.

### Algorithm Module Integration
- Copy `*-algorithm.js` files to `src/lib/algorithms/`, add ES module wrapper `.ts` files that re-export typed functions
- Never modify the original algorithm files — preserve them as-is for backward compatibility
- Wrapper `.ts` files bridge vanilla JS to TypeScript, enabling strict type safety in React components

### Build and Configuration
- **`@types/node` required**: Always add `@types/node` as devDependency when using `vite.config.ts` with path aliases — needed for `path` module and `__dirname`
- **`__dirname` in Vite ESM config**: Use `fileURLToPath(new URL('.', import.meta.url))` instead of `__dirname` in `vite.config.ts`
- **tsconfig `include`**: Always include `vite.config.ts` in tsconfig `include` array alongside `src` to avoid IDE false-positive errors
- **`base: '/algoviz/'`**: Always set Vite `base` to the repo name for GitHub Pages subdirectory deployment

## Ideation Guidance

The ideator agent should focus **exclusively on algorithm visualizations** for this project. Do not propose:
- Code refactors, DX improvements, or infrastructure changes
- UI framework changes or build system overhauls
- Generic "improvement" items

Instead, propose **new algorithms** from CS curriculum topics. Prioritize by:
1. **Educational value** — commonly taught, hard to understand without visuals
2. **Visual impact** — the algorithm's mechanics are inherently visual
3. **Gap coverage** — fills a missing category in the current collection

Current categories covered: sorting, searching, graph traversal, graph algorithms (MST, shortest path), dynamic programming, string matching, data structures (BST, RBT, heap, trie, segment tree, hash table, union-find, bloom filter, LRU cache), computational geometry, caching/scheduling.
