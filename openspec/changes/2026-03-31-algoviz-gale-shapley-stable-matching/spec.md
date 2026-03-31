# Gale-Shapley Stable Matching Visualization

## Summary
Build an interactive visualization of the Gale-Shapley stable matching algorithm where two groups iteratively propose based on ranked preferences until a stable pairing is reached. Use a real-world analogy of medical residency matching (students and hospitals) so learners can connect proposals, tentative matches, and final stability to a familiar process.

## Acceptance Criteria
1. Users can enter or generate two equal-sized groups with ranked preference lists and step through each proposal event.
2. The visualization clearly shows tentative engagements, rejections, and partner swaps as state changes over time.
3. The algorithm module emits deterministic step snapshots (including display state) and is covered by Node tests for edge cases (empty input, size 1, ties/invalid preference handling, and max supported size).
4. The page includes a real-world analogy panel explaining residency matching and why stable outcomes matter.
5. The final state reports whether the matching is stable and shows each pair's preference rank outcome.
