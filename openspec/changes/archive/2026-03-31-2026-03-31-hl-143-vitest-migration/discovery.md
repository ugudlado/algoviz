## Discovery

- Current state used a repository-wide Node runner (`run-tests.js`) that manually located `*.test.js` files and invoked exported `runTests`.
- Algorithm test files are CommonJS and rely on `assert`/`assertEqual` arguments, not native Vitest APIs.
- A hard cutover requiring full manual rewrite of every test file would be high-risk and time-consuming.

## Decision

- Move runtime first: switch `pnpm test` to Vitest immediately.
- Keep algorithm test bodies stable, and execute them via Vitest-discovered per-file adapters.
- Remove the old central Node harness to make Vitest the single test runtime entrypoint.
