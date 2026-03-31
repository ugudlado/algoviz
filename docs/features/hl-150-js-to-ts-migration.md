# HL-150 - Complete JS to TS Migration

## Problem
AlgoViz currently uses a mixed JavaScript and TypeScript implementation across algorithm modules and tests. This split increases maintenance cost and allows runtime and test behavior to drift.

## Proposed Solution
Migrate all remaining JavaScript algorithm implementations and algorithm tests in `src/lib/algorithms/` to TypeScript while preserving runtime behavior and test outcomes.

## Why This Approach
- Keeps migration aligned with current architecture where React/UI consumes typed wrappers.
- Reduces risk by migrating in small algorithm batches instead of a one-shot rewrite.
- Preserves educational behavior and visualization parity with existing snapshots/tests.

## Current Inventory (2026-03-31)
- `34` algorithm sources: `src/lib/algorithms/*-algorithm.js`
- `33` algorithm tests: `src/lib/algorithms/*-algorithm.test.js`
- `34` TypeScript wrappers already present: `src/lib/algorithms/*.ts`

## Scope
- In scope:
  - Convert `*-algorithm.js` to TypeScript modules.
  - Convert `*-algorithm.test.js` to TypeScript tests.
  - Remove JS interop shims no longer needed after each migrated batch.
  - Keep lint/test/format/knip green for each batch.
- Out of scope:
  - UI redesign or interaction changes.
  - Algorithm behavior changes except parity bug fixes.

## Phases
1. Baseline and guardrails
   - Freeze current test baseline.
   - Add migration checklist and grouping strategy.
2. Algorithm conversion batches
   - Batch A: sorting and searching.
   - Batch B: graph traversal/shortest path/MST.
   - Batch C: dynamic programming and strings.
   - Batch D: tree/data-structure algorithms.
3. Test conversion batches
   - Convert corresponding `*.test.js` to TS for each algorithm batch.
4. Cleanup and hardening
   - Remove obsolete JS files in migrated areas.
   - Tighten lint rules for no new JS in target paths.
5. Final validation
   - Run lint, tests, format check, and knip.
   - Update migration notes and close ticket.

## Tasks and Deliverables
- [ ] Produce file-by-file migration checklist with owner and status.
- [ ] Migrate Batch A algorithms and tests.
- [ ] Migrate Batch B algorithms and tests.
- [ ] Migrate Batch C algorithms and tests.
- [ ] Migrate Batch D algorithms and tests.
- [ ] Remove remaining JS files from `src/lib/algorithms/`.
- [ ] Validate quality gates and document final state.

## Constraints and Assumptions
- Existing IIFE/global style in legacy algorithm files may require temporary compatibility adapters during transition.
- Migration should preserve current exported APIs consumed by pages and wrappers.
- Any behavior change must include explicit regression tests.

## Milestones
- M1: Batch A complete and merged.
- M2: Batches B and C complete and merged.
- M3: Batch D + cleanup complete.
- M4: Quality gates green and ticket closed.
