# Gale-Shapley Stable Matching Visualization

## Summary
Build an interactive visualization of the Gale-Shapley stable matching algorithm where two groups iteratively propose based on ranked preferences until a stable pairing is reached. Use a real-world analogy of medical residency matching (students and hospitals) so learners can connect proposals, tentative matches, and final stability to a familiar process.

## Use Cases
- **UC-1 (Generate and run):** Learner generates balanced groups, runs playback, and inspects each proposal transition.
- **UC-2 (Custom preferences):** Learner inputs custom names/rankings and sees validation feedback for malformed data.
- **UC-3 (Understand stability):** Learner verifies final stable status and compares rank outcomes for both sides.
- **UC-4 (Observe transitions):** Learner identifies accepts, rejects, and swaps across snapshots.

## Functional Requirements
1. Page supports generated and custom inputs for two equal-sized groups, with size bounds `1..24`. `[traces: UC-1, UC-2]`
2. Invalid inputs are rejected with an actionable error message (unequal group size, duplicate entries, unknown participant, malformed ranking line). `[traces: UC-2]`
3. Runtime consumes a single pure algorithm module and emits deterministic step snapshots including display-ready state (`matches`, `proposalsByProposer`, step metadata). `[traces: UC-1, UC-4]`
4. Visualization renders each proposal event and state transitions for accept/reject/swap through playback. `[traces: UC-1, UC-4]`
5. Final panel reports stable/not-stable status and rank outcomes for each proposer and acceptor. `[traces: UC-3]`
6. Page includes a real-world analogy panel linking the flow to residency matching. `[traces: UC-3]`

## Non-Functional Requirements
1. Algorithm output is deterministic for identical input (same matching and same ordered steps).
2. Unit tests cover empty input, size 1, invalid preference handling, and max supported size.
3. Styling remains locally scoped with `gs-` prefixed selectors.

## Alternatives Considered
- **Inline algorithm logic in React page:** rejected because it breaks DRY between tested logic and runtime behavior.
- **Non-deterministic/randomized proposer order:** rejected for educational playback consistency and test reproducibility.
- **Support ties in rankings:** deferred to a future variant to keep current visualization focused and testable.

## Acceptance Criteria
1. Given generated valid input with `n` in `1..24`, when the user runs playback, then proposal events are step-able and include proposal, accept/reject/swap, and done states. `[traces: UC-1, UC-4]`
2. Given malformed custom input, when user applies input, then execution is blocked and an error string explains the issue category. `[traces: UC-2]`
3. Given identical valid input executed twice, matching and step snapshots are equal across runs. `[traces: UC-1]`
4. Given completion of algorithm, final UI displays stability verdict and per-participant rank outcomes for both groups. `[traces: UC-3]`
5. UI includes a residency-matching analogy panel between complexity/legend context and visualization controls. `[traces: UC-3]`
