# Input Validation with Error Messages

## Summary
Replace silent failures across algorithm pages with clear, contextual error messages. Currently 22+ pages accept invalid input (empty, out-of-range, wrong type) without feedback. Add consistent validation that shows inline error messages near the input field.

## Acceptance Criteria
1. All sorting pages (merge-sort, quicksort, radix-sort, bubble-sort) validate: empty input, non-numeric values, values out of allowed range, array too large
2. All graph pages (dijkstra, astar, floyd-warshall, prims, kruskal) validate: negative edge weights where not allowed, disconnected graphs with clear message
3. All tree/DS pages (bst, heap, trie, union-find) validate: empty input, duplicate inserts where relevant
4. Error messages appear inline near the input (not alert() dialogs), styled consistently with a shared `.algo-error` CSS class in style.css
5. Errors clear automatically when the user starts typing again
6. A shared `validateInput(value, rules)` helper is extracted to `input-validator.js` to avoid per-page duplication
