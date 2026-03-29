# Watch Panel — Live Variable Tracker

## Summary
Add a live variable watch panel to all algorithm pages that shows the algorithm's key internal state at each step. Bubble Sort has this ("pass", "comparing", "left", "right", "action", "sorted from"). Extend the pattern to all categories with algorithm-appropriate variables.

## Acceptance Criteria
1. Every algorithm page has a `.algo-watch` panel showing 4-6 key variables updated on each step
2. Variables are algorithm-specific and educationally meaningful:
   - Sorting: pass#, comparing indices, values being compared, action (swap/keep), sorted boundary
   - Graph search: current node, queue/stack size, visited count, distance/cost so far
   - DP: current cell (i,j), values being compared, decision made (take/skip), running result
   - Tree: current node, operation (insert/rotate/delete), height/balance factor, path taken
   - String: current position, pattern/text chars being compared, match/mismatch, next action
3. Watch panel uses monospace font, color-coded values (neutral/highlight/success/error)
4. Panel updates in sync with playback steps — no lag
5. Shared CSS `.algo-watch` class in style.css; per-page JS wires step data to the panel
6. Bubble Sort's existing watch panel is refactored to use the shared CSS class
