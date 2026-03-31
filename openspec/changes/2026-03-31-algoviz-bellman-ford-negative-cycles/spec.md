# Bellman-Ford with Negative Cycle Detection

## Summary
Create a Bellman-Ford visualization that animates relaxation passes over weighted directed edges and explicitly highlights when a negative cycle is detected on the extra verification pass. Use a real-world analogy of currency exchange arbitrage loops, where repeatedly converting currencies can grow value if a negative cycle exists in log-weight space.

## Acceptance Criteria
1. Users can define a weighted directed graph (including negative edges) and choose a source node.
2. The visualization animates each relaxation pass, showing distance updates, predecessor changes, and unchanged edges.
3. A dedicated final pass identifies and highlights edges/nodes involved in reachable negative cycles when present.
4. The algorithm module produces step-by-step state snapshots for rendering and includes tests for empty graph, disconnected graph, no-negative-cycle graph, and graph with reachable negative cycle.
5. The page includes a real-world analogy panel explaining exchange-rate arbitrage and why negative cycles invalidate shortest paths.
