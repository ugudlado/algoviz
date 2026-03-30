---
name: Memory Setup — Repo-Versioned with Symlink
description: Decision and implementation for git-versioning Claude memory inside the algoviz repo
type: feedback
---

Claude's auto-memory for this project lives in `.claude/memory/` inside the repo (git-versioned), symlinked from the system path `~/.claude/projects/-Users-spidey-code-algoviz/memory`.

**Setup:** `pnpm setup` (runs `scripts/setup.sh`) creates the symlink on any new machine.

**Slug formula:** `absolute_repo_path.replace('/', '-')` — no leading dash strip. `/Users/spidey/code/algoviz` → `-Users-spidey-code-algoviz`. The leading `-` must be preserved.

**Automation decision (2026-03-30):** No SessionStart hook. Symlink creation is one-time setup, intended to be part of `pnpm setup` or future `/autopilot`/`/develop` onboarding tooling. The user explicitly chose this over a hook — hooks add global overhead for something that only needs to run once per machine.

**Why:** Memory was previously only on the local machine (`~/.claude/`). Moving to repo makes it git-versioned, shareable across machines, and auditable. The `/learn`, `/reflect`, `/diagnose` commands continue to work unchanged — they write through the symlink transparently.

**How to apply:** When onboarding to this project on a new machine, always run `pnpm setup` before starting work so Claude memory is linked correctly.
