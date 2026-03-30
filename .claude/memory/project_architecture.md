---
name: AlgoViz Architecture
description: Codebase structure, design system, quality gates, and file conventions
type: project
---

**Stack:** Vanilla JavaScript, no framework, no bundler. Served statically. Each algorithm is a standalone set of files.

**File pattern per algorithm:**
- `[algo].html` — page structure + nav
- `[algo].js` — visualization + UI logic (IIFE, const/let)
- `[algo]-style.css` — algorithm-specific styles (prefixed class names)
- `[algo]-algorithm.js` — pure algorithm, no DOM (IIFE, var, exports via global)
- `[algo]-algorithm.test.js` — Node.js tests with `module.exports = { runTests }`

**Shared files:**
- `style.css` — nav bar, dark theme base, G2 design system
- `complexity-popover.js` — shared popover component with "Why?" derivation sections
- `input-validator.js` — shared input validation
- `playback-controller.js` — shared playback controls

**Design system — G2 Dev-Tool Aesthetic:**
- Near-black backgrounds: `#030303`, `#0a0a0a`
- Fonts: Inter (display), JetBrains Mono (code)
- Per-category accent colors via CSS vars (`--cat-sorting`, `--cat-graph`, etc.)
- Bubble Sort v2 uses OKLCH color space for warm-tinted near-blacks with category accent

**Quality gates:**
- `pnpm run lint` — ESLint on all .js files
- `pnpm test` — Node.js tests (run-tests.js runner)
- `pnpm run format:check` — Prettier
- `pnpm run knip` — dead code detection
- NO type-check or build script — skip those in any workflow

**ESLint config** (`.eslintrc.json`): algorithm files get `node` env + IIFE global assignment suppression. Test files get `node` env. New algorithm globals must be added manually.

**Nav links:** When adding a new page, EVERY existing .html file must be updated with the nav link. Currently ~36 files.

**Memory system:** `.claude/memory/` in repo root is git-versioned and symlinked from `~/.claude/projects/-Users-spidey-code-algoviz/memory`. Run `pnpm setup` on new machines to create the symlink. Slug formula: absolute repo path with `/` replaced by `-`.

**Why:** Vanilla JS by design — each page works independently, no build step needed. Memory in repo so it's versioned and shareable.
**How to apply:** Follow the exact 5-file pattern. Never skip real-world analogy panel. Never skip updating all nav links. Run `pnpm setup` after cloning.
