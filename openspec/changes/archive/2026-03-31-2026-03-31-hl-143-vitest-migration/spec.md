## Summary

Migrate AlgoViz algorithm tests from the custom `run-tests.js` harness to Vitest as the primary test runtime, while preserving the existing test case corpus and keeping quality gates green.

## Acceptance Criteria

1. `pnpm test` executes Vitest directly.
2. Test discovery is pattern-based over algorithm test files in `src/lib/algorithms`.
3. Existing test suites remain executable without the old `run-tests.js` entrypoint.
4. Lint and dead-code gates continue to pass after migration changes.
