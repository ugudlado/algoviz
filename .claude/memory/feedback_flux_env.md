---
name: Flux FLUX_DATA env fix
description: FLUX_DATA is not available in Claude Code shells; always prefix flux commands with the explicit path
type: feedback
---

Always prefix `flux` CLI calls with `FLUX_DATA="$HOME/code/shell/.flux/data.json"`:

```bash
FLUX_DATA="$HOME/code/shell/.flux/data.json" flux task done <id> --note "..."
FLUX_DATA="$HOME/code/shell/.flux/data.json" flux project list
```

**Why:** `FLUX_DATA` is set in `.zshrc` but Claude Code's Bash tool does not source `.zshrc` unless launched from an interactive shell that already has it. Without it, `flux` silently falls back to `~/.flux/data.json` — a different (empty) file than the one the UI reads (`~/code/shell/.flux/data.json`). This results in tasks appearing to succeed but never appearing in the Flux board UI.

**How to apply:** Every single `flux` command in this project must be prefixed with the env var inline. Do not assume `FLUX_DATA` is in the environment.
