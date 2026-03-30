# B-Tree Visualization

## Summary
Interactive visualization of B-Tree insert, delete, and search operations, showing node splits, merges, and key redistributions with animated transitions. Users select the tree order (minimum degree t = 2 to 5) and insert keys to watch the multi-way balanced tree grow, split overflowing nodes, and maintain the B-Tree invariants. Real-world analogy: like a filing cabinet where each drawer holds 3-5 folders -- when a drawer gets too full, you split it into two drawers and promote a divider label to the index above, keeping everything organized for fast lookup.

## Motivation
B-Trees are the backbone of database indices and file systems (ext4, NTFS, PostgreSQL, SQLite) and appear in every systems or databases course. The multi-key, multi-child structure is fundamentally different from binary trees and much harder to grasp from static diagrams. Watching a node split and promote a median key upward is an "aha moment" that static text cannot deliver. This fills the multi-way tree gap -- all current tree visualizations are binary.

## Acceptance Criteria
1. Users can select minimum degree t (2 to 5) before building the tree
2. Insert, delete, and search operations are supported
3. Nodes display all keys with visual separators between child pointers
4. Node splits are animated: overflow detected, median key rises, two new nodes form
5. Node merges and key redistribution (rotation) on delete are animated
6. Search highlights the traversal path from root to target key
7. Step-by-step mode with play/pause and speed control
8. Real-world analogy panel is present (filing cabinet analogy)
9. Tree layout handles up to 30 keys without visual overlap
10. Pure algorithm module with tests (insert causing root split, delete causing merge, search hit/miss, single key, order-2 through order-5)
11. Nav links added to all existing HTML pages

## Priority
- User value: 9/10
- Strategic fit: 9/10
- Technical leverage: 7/10
- Effort: large
- **Score: 8.5**
