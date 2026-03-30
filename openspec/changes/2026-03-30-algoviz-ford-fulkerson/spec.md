# Ford-Fulkerson Network Flow Visualization

## Summary
Interactive visualization of the Ford-Fulkerson max-flow algorithm using BFS augmenting paths (Edmonds-Karp variant). Users build a flow network with capacities, then watch the algorithm find augmenting paths, push flow, update residual capacities, and compute the maximum flow. Real-world analogy: like a city water system where each pipe has a maximum capacity -- the algorithm figures out how to route the most water from the reservoir (source) to the treatment plant (sink) without bursting any pipe.

## Motivation
Network flow is a major graph algorithm category entirely absent from AlgoViz. Ford-Fulkerson/Edmonds-Karp appears in every advanced algorithms course and has applications in matching, scheduling, and transportation. The visualization of flow along edges with changing residual capacities is highly informative and difficult to understand from pseudocode alone. Adding this fills the network flow gap and complements existing graph algorithms (Dijkstra, Kruskal, Prim's).

## Acceptance Criteria
1. Users can create a directed graph with source, sink, and edge capacities (or use preset examples)
2. Each edge displays current flow / capacity (e.g., "3/7")
3. Augmenting paths are highlighted as BFS discovers them
4. Flow is animated along the chosen path, and residual graph updates are shown
5. The algorithm repeats until no augmenting path exists, then displays maximum flow value
6. Min-cut is highlighted at completion (edges crossing the cut are marked)
7. Step-by-step mode with play/pause
8. Real-world analogy panel is present (city water system analogy)
9. Pure algorithm module with tests (simple 2-node, diamond graph, known max-flow values, no-path-exists case)
10. Nav links added to all existing HTML pages

## Priority
- User value: 8/10
- Strategic fit: 8/10
- Technical leverage: 8/10
- Effort: large
- **Score: 8.3**
