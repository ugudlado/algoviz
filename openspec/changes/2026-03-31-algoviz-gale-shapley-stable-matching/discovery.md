# Discovery: Gale-Shapley Stable Matching

## Problem Context
- Learners need to see how stable matching evolves through proposal rounds, not only final pairs.
- Existing AlgoViz pages already use a standard layout (`ProblemFrame`, `WatchPanel`, `PlaybackController`, complexity and analogy panels).
- The runtime must use one source of truth for algorithm state so tests and UI validate the same behavior.

## Target Persona
- CS learners who understand preference lists conceptually but struggle to reason about iterative proposal state.

## Scope Boundaries
- In scope: one proposer-optimal Gale-Shapley variant with strict rankings.
- Out of scope: many-to-one residency quotas, ties/indifference handling, randomized proposer order.

## Existing Patterns Reused
- Algorithm/test co-location in `src/lib/algorithms/*-algorithm.js` and `*-algorithm.test.js`.
- Typed React wrapper pattern in `src/lib/algorithms/*.ts`.
- Algorithm route registration via `src/App.tsx`, `src/components/Nav/index.tsx`, and `src/pages/Home/index.tsx`.

## Constraints
- Keep algorithm module pure and deterministic.
- Validate user input bounds (`MAX_SIZE`) and malformed preferences.
- Include explicit display state in each step payload for playback.

## Decision
- Build Gale-Shapley as a dedicated algorithm module with deterministic step snapshots.
- Consume snapshots directly in React page; UI derives no hidden matching logic.
- Keep strict parsing format (`Name: A,B,C`) and surface parse/validation errors explicitly.
