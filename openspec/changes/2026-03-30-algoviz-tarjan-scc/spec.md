# Tarjan's Strongly Connected Components Visualization

## Summary
Interactive visualization of Tarjan's algorithm for finding strongly connected components (SCCs) in a directed graph, showing the DFS traversal, discovery/low-link value updates, and stack-based component identification with distinct color coding for each SCC. Real-world analogy: like mapping one-way streets in a city to find neighborhoods where you can drive from any intersection to any other intersection within that neighborhood -- each such neighborhood is a strongly connected component.

## Motivation
Strongly connected components are a fundamental concept in graph theory taught in every algorithms course, with applications in compiler optimization (dependency cycles), social network analysis (communities), and deadlock detection. AlgoViz has BFS, DFS, and MST algorithms but lacks any SCC algorithm. Tarjan's algorithm is particularly visual -- the interplay between the DFS tree, back edges, and the stack produces satisfying "discovery" moments when components pop off. This fills a graph analysis gap distinct from traversal and shortest-path algorithms.

## Acceptance Criteria
1. Users can create a directed graph by clicking to add nodes and dragging to add edges (or use preset examples)
2. DFS traversal is animated with discovery-time and low-link values shown on each node
3. The algorithm stack is displayed as a visual panel, with nodes pushed/popped in real time
4. When an SCC is identified (low-link equals discovery index at root), the component is popped from the stack and highlighted with a unique color
5. Back edges and cross edges are visually distinguished from tree edges
6. Final result shows all SCCs with distinct colors and a summary count
7. Step-by-step mode with play/pause and speed control
8. Real-world analogy panel is present (one-way streets neighborhood analogy)
9. Pure algorithm module with tests (single node, fully connected graph, DAG with zero non-trivial SCCs, classic textbook examples with known SCC counts)
10. Nav links added to all existing HTML pages

## Priority
- User value: 8/10
- Strategic fit: 8/10
- Technical leverage: 8/10
- Effort: medium
- **Score: 8.0**
