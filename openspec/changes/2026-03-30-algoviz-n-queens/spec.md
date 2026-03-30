# N-Queens Backtracking Visualization

## Summary
Interactive visualization of the N-Queens problem solved via backtracking, showing queen placement, conflict detection, and recursive backtracking on an NxN chessboard. The visualization renders both the board state and a recursion tree so students can see how the algorithm explores and prunes the search space. Real-world analogy: like seating guests at a dinner party where certain pairs cannot sit in the same row, column, or diagonal -- you try a seat, check for conflicts, and rearrange when stuck.

## Motivation
Backtracking is a fundamental algorithmic paradigm with no current representation in AlgoViz. N-Queens is the canonical backtracking problem taught in virtually every algorithms course. The visual nature of a chessboard makes conflict detection intuitive, and watching the algorithm place, detect conflict, and undo placements builds deep understanding of recursion and pruning. This opens an entirely new algorithm category (backtracking).

## Acceptance Criteria
1. Users can select board size N (4 to 12)
2. Chessboard grid renders with queens placed as the algorithm runs
3. Conflict zones (attacked squares) are highlighted when each queen is placed
4. When a conflict is detected, the backtrack step is visually animated (queen removed, previous row revisited)
5. A recursion tree panel shows the current exploration path, with pruned branches grayed out
6. Step count and backtrack count are displayed
7. Step-by-step mode with play/pause and speed control
8. Real-world analogy panel is present (dinner party seating analogy)
9. All solutions found are counted and the first solution is displayed at completion
10. Pure algorithm module with tests (N=4 has 2 solutions, N=8 has 92 solutions, N=1 has 1 solution, conflict detection edge cases)
11. Nav links added to all existing HTML pages

## Priority
- User value: 9/10
- Strategic fit: 9/10
- Technical leverage: 9/10
- Effort: medium
- **Score: 9.0**
