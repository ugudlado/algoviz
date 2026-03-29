# "Why This Complexity?" Narrative

## Summary
Extend every algorithm page's complexity popover (already built) with a "Why?" section that explains the mathematical derivation in plain English. Students see O(n log n) but don't understand *why* — this closes that gap with a 2-4 line derivation for each algorithm.

## Acceptance Criteria
1. Every complexity popover gains a "WHY?" section below the best/avg/worst/space rows
2. Each derivation explains the source of the complexity in plain English (e.g. "Each of n elements bubbles up through at most n positions — n × n = n² comparisons total")
3. For algorithms with different best/worst derivations, explain both (e.g. QuickSort best vs worst)
4. The WHY section uses a slightly muted style to visually separate it from the O() values
5. All 29 algorithm pages updated — no page left without a derivation
6. The shared complexity-popover.js utility is updated to render the WHY section from a `data-why` attribute
