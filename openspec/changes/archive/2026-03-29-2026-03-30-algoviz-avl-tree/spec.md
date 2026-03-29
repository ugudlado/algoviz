# AVL Tree Visualization

## Summary
Interactive visualization of AVL tree insert and delete operations, highlighting the four rotation types (LL, RR, LR, RL) with step-by-step animation. Students can insert nodes and watch the tree detect imbalance, compute balance factors, and perform the correct rotation to restore the AVL property. Real-world analogy: like a self-organizing bookshelf that automatically shifts books to keep every section roughly equal height, so you never have to search through a lopsided pile.

## Motivation
AVL trees are typically the first self-balancing BST taught in data structures courses, yet the rotation mechanics are notoriously confusing from textbook diagrams alone. The existing BST visualization shows unbalanced trees but does not demonstrate rebalancing. AVL rotations are inherently spatial transformations -- seeing nodes physically rotate into new positions makes the concept click instantly. This fills a critical gap in the data structures category.

## Acceptance Criteria
1. Users can insert and delete integer keys into an AVL tree
2. Balance factors are displayed on each node, updated after every operation
3. When a rotation is needed, the visualization highlights the imbalanced node and animates the rotation (LL, RR, LR, RL) step by step
4. A legend explains each rotation type with a mini-diagram
5. Real-world analogy panel is present (self-organizing bookshelf analogy)
6. Step-by-step mode allows pausing between insert, imbalance detection, and rotation phases
7. Tree layout handles up to 20 nodes without overlap
8. Pure algorithm module with full test coverage (empty tree, single node, forced LL/RR/LR/RL rotations, sequential inserts creating degenerate input)
9. Nav links added to all existing HTML pages

## Priority
- User value: 9/10
- Strategic fit: 10/10
- Technical leverage: 8/10
- Effort: medium
- **Score: 9.3**
