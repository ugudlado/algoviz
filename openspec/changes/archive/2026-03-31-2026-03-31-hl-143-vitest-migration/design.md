## Design

### Runtime and tooling

- Add `vitest` dependency.
- Set `package.json` test script to `vitest run`.
- Add `vitest.config.ts` with globals enabled and algorithm test glob include.

### Test execution strategy

- Keep existing algorithm test logic intact.
- Use per-file Vitest wrapper blocks to invoke legacy `runTests` and assert zero failures.
- This preserves current test semantics while removing the external custom runner.

### Lint compatibility

- Extend test-file ESLint override globals with `describe`, `it`, and `expect`.

### Removed components

- Delete `run-tests.js` (no longer used).
