# Diagnose: Consecutive FAILs

## Pattern
- `FAIL` verdict persisted across recent cycles.
- Implementation quality is strong, but workflow compliance remains the limiting dimension.

## Root Causes
- Missing runtime/UX verification evidence for the interactive page.
- Full formatting gate (`pnpm run format:check`) is not green at repository scope.
- Workflow state drift between completion claims and gate evidence.

## Immediate Remediation Checklist
1. Capture runtime verification evidence for Gale-Shapley UI interactions and error paths.
2. Resolve formatting drift with `pnpm run format` and re-run `pnpm run format:check`.
3. Re-run full gates (`pnpm test`, `pnpm run lint`, `pnpm run knip`, `pnpm run format:check`).
4. Update OpenSpec status/result notes after gates are fully green.

## Guardrails
- Do not mark verify complete until all required gate outputs are recorded.
- Treat missing UX/runtime evidence as a blocking issue.
