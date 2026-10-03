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

## Workflow Evidence Gates (Required Before Completion)

Apply these gates for every feature/bugfix completion check. "Completion" is blocked until all required evidence is recorded in the execution notes.

### UI-Touching Work: Mandatory UX Review Evidence
- If any UI file is changed (`*.tsx`, `*.jsx`, `*.html`, `*.css`, page/layout/component files), you MUST run a UX review and record evidence.
- Required evidence to record:
  - What was reviewed (screens/views + changed interactions)
  - How it was reviewed (manual walkthrough and/or critique/review agent/tool)
  - Result summary (pass/fail + issues found/fixed)
- Missing UX review evidence is a blocking process failure for UI-touching work.

### UI-Touching Work: Edge-Case UX Validation Checklist
- For each changed user flow/state, explicitly validate and record:
  - Minimum/empty state (no data, empty input, first-load state)
  - Typical state (normal user path)
  - Stress/extreme state (long text, max bounds, dense data, narrow viewport)
  - Failure/error state (invalid input, algorithm guardrails, unavailable data)
- Record the observed behavior for each checklist item. "Not checked" is not allowed for completion.

### Quality-Gate Hygiene (Always Required)
- Before completion, run and record outcomes for:
  - `pnpm run lint`
  - `pnpm test`
  - `pnpm run format:check`
  - `pnpm run knip`
- All four must pass. If `format:check` fails, run `pnpm run format`, then re-run `pnpm run format:check` and record the final pass.
- Do not mark tasks/phase/feature complete until all required quality-gate pass evidence is present.

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

### Display State Ownership
- Algorithm modules must compute ALL display state (colors, highlights, sorted boundaries, active indicators) as part of step data. React components and vanilla UI files must only READ display state from the algorithm step — never derive visual indicators from raw indices or state. This prevents stale-state bugs during re-renders. <!-- learned: cycle 2, 2026-03-31 -->

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

### React Page Conventions
- Use `<fieldset>` + `<legend>` for grouped input controls (algorithm parameters, speed settings) — semantic HTML, accessible, built-in visual grouping without extra CSS <!-- learned: cycle 2, 2026-03-31 -->
- React components consume algorithm step data as read-only — all computation lives in algorithm modules, components only render and dispatch user actions <!-- learned: cycle 2, 2026-03-31 -->
- Any randomized homepage/recommendation card MUST degrade gracefully when candidate lists are empty (show fallback copy + disabled CTA) instead of throwing during render. <!-- learned: cycle 6, 2026-04-01 -->

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

<!-- cc-profile:agents:start (generated) -->
## Shared agent rules

Every rule here traces to a real incident. Add rules only with an incident behind them; delete rules that stop firing.

### Memory

- The memory plane is **agentmemory** (hub `http://localhost:3111`, MCP `agentmemory`, skills `/remember` `/recall` `/handoff` `/recap`). Durable knowledge — decisions, gotchas, how-things-work, cross-session state — goes there via `remember`; past-work questions go through `recall`/`smart-search` FIRST, before grep-archaeology or any per-tool memory. Do not create new per-agent or per-tool memory silos.
- Active multi-step work uses a **scratchpad slot** (agentmemory `memory_slot_*` / REST `/agentmemory/slot*`) keyed by ticket or `<repo>_<branch>` (`[a-z0-9_]`, e.g. `buzz_17`), shared by Cursor, Claude Code and Codex. Keep its Goal / State / Next steps / Key file paths / Dead ends current; in Claude Code the scratchpad mod logs each turn under `## Log`. Never delete a slot or save it to memory yourself: the user reviews it (`/notepad` in Claude Code) and saves or discards.
- **Scoping**: `memory_save` does NOT derive the project from cwd — pass `project` explicitly (the repo's directory name, e.g. `paperclip-factory`) for project-specific memory; machine-wide knowledge uses no project plus concept tag `global`. Recall project-first, then global/unfiltered.
- When continuing implementation after a prior agent session, treat recent agentmemory observations for the same project/topic as the default source of truth unless the code has since diverged.

### Orchestration

- The main agent plans, scopes, integrates, and resolves decisions; subagents execute concrete edits. Use the smaller/cheaper model for execution, the strongest model for conflict-laden merges, cross-cutting refactors, and subtle debugging.
- **Route work by task type to the matching skill, not a bespoke per-agent file.** Skills are portable across coding agents (Claude Code, Cursor, Codex); per-harness subagent tool/MCP scoping is not. Use: `explorer` for investigating a bug, tracing code, or read-only impact analysis; `designer` for planning an approach or breaking work into tasks; `developer` for implementing a scoped change from a plan/brief; `code-reviewer` for reviewing a diff; `design-reviewer` for reviewing a design/plan before implementation. (2026-09-15, playr session: Cursor/Codex agent formats can't express tool restriction.)

### Working rules

- When a constraint has ambiguous units or type (length limit, field type, API shape), state the assumption explicitly before building — don't guess.
- Before any destructive or scope-expanding change (removing files from git, changing tracked configs, deleting branches), state the rationale and confirm there isn't a smaller fix.
- For tooling, library versions, or external APIs, verify instead of answering from memory — prefer context7 docs, else web search.
- Before speccing tests, confirm the test tooling actually exists in the project (check package.json / lockfile) — don't assume a library is installed.
- If you notice a security issue outside the task scope, flag it — don't silently fix it.
- When you don't know something, say "I'm not sure about X" and propose how to verify it — never guess an answer.
- Create worktrees under `.worktrees/<name>` inside the repo (gitignored), not an external directory.
- Put repo-related scratch files in `.tmp/` inside the repo (gitignored), not `/tmp`. Doesn't override a harness's own per-session scratchpad.
- This repo is self-sufficient: plugins, skills, MCP servers and these rules are declared here, not in user-global config. Need something new? Add it to this repo (`cc-profile`, `npx skills add`, `.mcp.json`).

### Communication

- Short responses by default; extremely concise when reporting — sacrifice grammar for concision. Conclusions first, reasoning after. Don't sugarcoat technical risks.
- No cheerleading, no filler, no "great question".
- Disagree when you have good reason; state your confidence.
- If something is unclear, ask one focused question — not five.
<!-- cc-profile:agents:end -->

<!-- cc-profile:claude:start (generated) -->
## Claude Code specifics

- **Fable is the architect, not the builder.** When the main session runs Fable (or any Mythos-class model), it plans, designs, reviews, orchestrates, and resolves decisions; it does not write or edit code itself beyond trivial one-line fixes and config nudges. Every implementation, refactor, test-writing, exploration, and mechanical-edit task goes to a subagent (Agent tool): `model: "sonnet"` by default; `model: "opus"` only for judgment-heavy work. Fable verifies the subagent's result (run the checks, read the diff) and commits. (2026-09-02, loop-design session burning Fable tokens; 2026-09-03, narada restructure confirming the split.)
- The harness's file memory (`memory/` + MEMORY.md) is for session-bootstrap pointers only. Full memory content belongs in agentmemory.
<!-- cc-profile:claude:end -->
