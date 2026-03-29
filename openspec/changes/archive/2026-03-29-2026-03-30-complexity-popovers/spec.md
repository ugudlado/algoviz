# Complexity Popovers

## Summary
Make the O() complexity badges on every algorithm page interactive. Clicking a badge opens a popover explaining best/average/worst case with a concrete example of when each occurs. Bubble sort already has this — extend the same pattern to all other algorithm pages.

## Acceptance Criteria
1. Every algorithm page has clickable complexity badge(s) that open a popover on click
2. Each popover shows: best case, average case, worst case (time), and space complexity with a 1-line explanation of why each applies
3. Clicking outside or pressing Escape closes the popover
4. The popover pattern is extracted into a shared `complexity-popover.js` utility (no duplication)
5. Bubble sort's existing popover is refactored to use the shared utility
6. All existing pages updated — verify all .html files have the popover wired
