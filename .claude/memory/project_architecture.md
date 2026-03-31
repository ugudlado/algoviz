---
name: AlgoViz Architecture
description: Codebase structure, design system, quality gates, and file conventions (post-Vite migration)
type: project
---

**Stack:** React + Vite + TypeScript. Served via GitHub Pages at `/algoviz/`. All algorithm pages are React components. The old vanilla JS/HTML pages have been removed.

**File pattern per algorithm page (React):**
```
src/pages/algorithms/[Algo]/
  index.tsx             # React component — consumes algorithm module, renders only
  index.module.css      # Algorithm-specific styles (prefixed class names)
src/lib/algorithms/
  [algo]-algorithm.js   # Pure algorithm, no DOM (IIFE, var, module.exports) — canonical source
  [algo]-algorithm.test.js  # Node.js tests with module.exports = { runTests }
  [algo].ts             # TS wrapper — imports .js, re-exports with types for React
```

**Algorithm JS file dual-mode contract:**
- IIFE pattern with `module.exports = AlgoName` guard for Node.js
- `.ts` wrappers handle Vite/ESM import side
- **Do NOT add bare `export default` to `.js` files** — it breaks Node.js `require()`. Phase 4 migration added these and had to strip them; rely on `.ts` wrappers.

**Test runner:**
- `node run-tests.js` at root — finds all `*.test.js` recursively including `src/lib/algorithms/`
- Tests use CommonJS (`require`), not ESM
- 729 tests passing as of 2026-03-31

**Shared components (`src/components/`):**
- Nav, PlaybackController, WatchPanel, ComplexityPopover, AnalogyPanel, ProblemFrame, WhyComplexityPanel

**Design system — G2 Dev-Tool Aesthetic:**
- Near-black backgrounds: `#030303`, `#0a0a0a`
- Fonts: Inter (display), JetBrains Mono (code)
- Per-category accent colors via CSS vars (`--cat-sorting`, `--cat-graph`, etc.)
- Panels use `<fieldset>` + `<legend>` for grouped controls (semantic, no extra CSS)
- Section panels (WatchPanel, visualization, pseudocode) use fieldset-style floating title styling

**Quality gates:**
- `pnpm run lint` — ESLint on all .js/.ts/.tsx files
- `pnpm test` — Node.js test runner (run-tests.js)
- `pnpm run format:check` — Prettier
- `pnpm run knip` — dead code detection
- NO `type-check` script; `build` (`tsc -b && vite build`) is NOT a quality gate

**Vite config:**
- `base: '/algoviz/'` — GitHub Pages subdirectory
- `@types/node` devDependency required for path aliases in vite.config.ts
- Use `fileURLToPath(new URL('.', import.meta.url))` instead of `__dirname` in vite.config.ts
- Include `vite.config.ts` in tsconfig `include` array

**Nav:** Single source of truth in `src/App.tsx` (React Router routes) + `src/components/Nav/index.tsx`. No more per-HTML-file nav duplication.

**Memory system:** `.claude/memory/` in repo root is git-versioned and symlinked from `~/.claude/projects/-Users-spidey-code-algoviz/memory`. Run `pnpm setup` on new machines.

**Why:** React migration for shared components, TypeScript safety, and GitHub Pages CI/CD. Memory in repo so it's versioned and shareable.
**How to apply:** New algorithm pages: create `src/pages/algorithms/[Algo]/` + TS wrapper in `src/lib/algorithms/`. Algorithm modules stay as vanilla JS (IIFE + module.exports). Components only read display state — never derive visual indicators from raw indices.
