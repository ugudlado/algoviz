# Design: Gale-Shapley Stable Matching

## Architecture
- `src/lib/algorithms/gale-shapley-algorithm.js`
  - Pure implementation of Gale-Shapley.
  - Input validation, deterministic proposal loop, stability check, rank outcomes.
  - Emits step snapshots with:
    - `type`, `description`, `proposalNumber`
    - `proposer`, `acceptor`
    - `matches`, `proposalsByProposer`
- `src/lib/algorithms/gale-shapley.ts`
  - TypeScript bridge with typed interfaces and exports for React.
- `src/pages/algorithms/GaleShapley/index.tsx`
  - Input controls and custom preference parsing.
  - Playback-driven rendering of tentative engagements and final outcome ranks.
  - Uses shared teaching components (`ProblemFrame`, `AnalogyPanel`, `ComplexityPopover`, `WatchPanel`).
- `src/styles/gale-shapley.css`
  - Prefixed `gs-` styles only.

## Data Flow
1. User generates/enters participant names and preferences.
2. Page constructs `StableMatchingInput`.
3. `runStableMatching()` returns full deterministic result and steps.
4. Playback index selects a step and UI renders snapshot state directly.
5. Final panel reports stability and rank outcomes for both sides.

## Risk Mitigation
- Invalid/tied-like preferences rejected early via duplicate and unknown-entry checks.
- Max-size limit protects against unbounded input growth.
- Determinism validated by snapshot equality tests.
