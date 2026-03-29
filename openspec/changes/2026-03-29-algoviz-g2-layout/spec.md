# G2 Layout Redesign

## Summary

Apply the Gemini 2 dev-tool aesthetic layout to AlgoViz algorithm pages and homepage while preserving the existing category color system (`--accent` per page via `data-category`).

## Reference

Design mockups at `tools/algoviz/designs/gemini2-design.html` (homepage) and `tools/algoviz/designs/gemini2-algorithm-page.html` (algorithm detail page).

## Key Design Elements

### Homepage (gemini2-design.html)
- Near-black palette (#030303 bg, #0a0a0a cards)
- Inter + JetBrains Mono typography
- Sticky frosted-glass nav with search bar and keyboard shortcut hint
- Gradient hero with badge, large heading, subtitle, CTA buttons
- Category sections with count badges
- Algorithm cards: 280px min-width grid, hover lift + left accent bar animation
- Complexity tags and "Visualize" reveal link on hover
- Full footer with columns

### Algorithm Pages (gemini2-algorithm-page.html)
- Two-column grid: main content (1fr) + 380px sidebar
- Main column: input panel, step info, visualization area, bottom playback controls
- Sidebar: stats grid (3-column), pseudocode panel with line highlighting, real-world analogy card
- Playback controls: icon buttons (reset, step-back, play, pause, step-forward) + speed slider
- Legend in page header alongside title and badges

### Preserved from Current System
- `data-category` on `<body>` for per-page accent colors
- Category color tokens (--cat-sorting, --cat-searching, etc.)
- Algorithm-specific CSS files and JS remain unchanged
- All algorithm functionality untouched

## Acceptance Criteria

1. Homepage adopts G2 design language (dark palette, card grid, hero, footer)
2. Algorithm pages use two-column grid layout with sidebar
3. Category accent colors still work per-page via data-category
4. All 29 algorithm pages render correctly with new layout
5. Responsive: single column below 1100px on algorithm pages
6. Mobile nav still works
