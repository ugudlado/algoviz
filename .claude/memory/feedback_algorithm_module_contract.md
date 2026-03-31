---
name: Algorithm Module Dual-Mode Contract
description: Rules for keeping algorithm .js files compatible with both Node.js test runner and Vite/ESM imports
type: feedback
---

Algorithm `.js` files (`src/lib/algorithms/*-algorithm.js`) must remain CommonJS-compatible. The dual-mode contract:

**For Node.js (test runner):** Use IIFE + `module.exports` guard:
```js
var AlgoName = (function() {
  // ...
  return { func1, func2 };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = AlgoName;
}
```

**For Vite/ESM (React components):** Use `.ts` wrapper file:
```ts
// src/lib/algorithms/algo-name.ts
// @ts-ignore
import AlgoNameModule from "./algo-name-algorithm.js";
export const func1 = AlgoNameModule.func1;
```

**Rule: Never add bare `export default` to `.js` files.**
The Phase 4 migration added `export default AlgoName;` directly — this caused 656 test failures because Node.js `require()` chokes on ES module `export` syntax. Stripping those lines restored 729/729 tests.

**Why:** Node.js `require()` parses the file before execution; `export` is a syntax error in CommonJS mode even if it's at the bottom of the file.
**How to apply:** If tests suddenly fail with "Unexpected token 'export'", grep `src/lib/algorithms/*-algorithm.js` for bare `export default` lines and remove them.
