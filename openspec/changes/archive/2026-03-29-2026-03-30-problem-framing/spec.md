# "The Problem" Framing Panel

## Summary
Every algorithm page gets a structured narrative panel that frames the learning context before the visualization. Bubble Sort already has this ("You have a shelf of books in random order…"). Add it to all 28 other pages. The panel has three parts: The Problem (what situation needs solving), The Approach (how this algorithm thinks about it), and When To Use (real-world scenarios).

## Acceptance Criteria
1. Every algorithm page has a `.algo-problem-panel` div with three subsections: problem, approach, when-to-use
2. Content is specific and concrete — not generic ("This algorithm sorts arrays") but narrative ("You have 10,000 packages to route through a city. How do you find the shortest path for each delivery?")
3. Panel is placed in the left sidebar or above the input controls — visible before the user presses play
4. Shared CSS class `.algo-problem-panel` added to style.css with consistent styling (subtle border, readable typography)
5. Bubble Sort's existing "The Problem" section is refactored to use the same CSS class
6. All 28 remaining pages updated with unique, accurate content per algorithm
