---
name: AlgoViz Implementation Rules (Learned)
description: Non-obvious rules learned from code review failures during algorithm page development
type: feedback
---

These rules come from real review failures. Follow them to avoid regressions.

**DRY: Tested code == Runtime code**
- `[algo]-algorithm.js` exports the algorithm; `[algo].js` UI MUST call that export — never duplicate logic inline
- Tests proving a function correct are useless if the UI calls different code
**Why:** Caught in multiple reviews where UI reimplemented what the algorithm module already exported.
**How to apply:** After implementing the UI, grep for the core algorithm function name and verify the UI file calls it.

**Nav link exhaustiveness**
- Every new page must update ALL existing .html files — currently ~35 files
- "All" means programmatically verified, not spot-checked
**Why:** Repeatedly missed during implementation; reviewers flagged this.
**How to apply:** After adding a page, grep for `<nav` across all .html files and confirm the new link appears in every one.

**CSS prefix verification**
- After implementing CSS, grep for unprefixed class names
- Self-reporting "all classes are prefixed" is insufficient without grep verification
**Why:** A prior implementation claimed prefixes were applied but inspection found bare class names.
**How to apply:** Run `grep -n 'class="' [algo]-style.css` and verify every class starts with the algorithm prefix.

**Timer cleanup accuracy**
- `clearTimeout` for `setTimeout` timers; `clearInterval` for `setInterval` timers — not interchangeable
**Why:** Mixed up in at least one implementation.

**Real-world analogy mandatory**
- Every algorithm page MUST have a `<div class="[prefix]-analogy">` with `<strong>Real-world analogy:</strong>`
**Why:** Part of the educational mandate; missing it fails spec acceptance criteria.

**ESLint globals must be updated**
- When adding a new algorithm module global (e.g., `BTreeAlgorithm`), add it to `.eslintrc.json`
- Knip config (`knip.json`) may also need updating for new entry points
**Why:** Lint fails silently without this, or passes with warnings that pollute the lint report.

**HTML doctype**
- Always `<!doctype html>` (lowercase, no backslash) as the first line
**Why:** Missing or malformed doctype triggers Quirks Mode.

**Input bounds**
- Every input field must have `max` attribute or programmatic cap
- Show a clear error message when exceeded
**Why:** Caught unbounded recursive depth in tree algorithms causing browser freeze.
