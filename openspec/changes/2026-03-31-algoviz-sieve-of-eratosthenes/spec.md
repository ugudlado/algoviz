# Sieve of Eratosthenes Prime Visualization

## Summary
Build a grid-based visualization of the Sieve of Eratosthenes that progressively marks composite numbers and leaves primes unmarked up to a user-selected limit. Use a real-world analogy of quality-control stamping on a production line: each prime "inspector" marks every multiple as non-prime, leaving only truly prime items.

## Acceptance Criteria
1. Users can set an upper bound and run the sieve step-by-step or autoplay with speed controls.
2. The visualization distinguishes current base prime, newly marked composites, previously marked composites, and confirmed primes.
3. The algorithm module emits complete per-step display state and includes tests for low bounds (0, 1, 2), typical bounds, and upper-bound limits.
4. The page includes a real-world analogy panel explaining the stamping/inspection process and why multiples are eliminated.
5. Final output includes prime count and explicit prime list up to the chosen bound.
