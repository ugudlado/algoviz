# HL-146 - Navigation Search and Layout Redesign

## Problem
As AlgoViz grows, top-level navigation becomes harder to scan quickly. Users need a faster way to find algorithm pages without opening multiple category dropdowns.

## Proposed Solution
Add a global navigation search input that filters algorithm routes across all categories and lets users jump directly to the selected page. Refine nav layout and responsive behavior so category browsing and search coexist cleanly on desktop and mobile.

## Why This Approach
- Improves discovery speed for returning users who know what they want.
- Preserves current category-based information architecture for exploratory browsing.
- Keeps implementation maintainable by centralizing nav metadata in one config.

## Scope
- In scope:
  - Add nav search input in `src/components/Nav/index.tsx`.
  - Render search result list with direct links to algorithm pages.
  - Improve nav spacing and responsive flow in `src/styles/global.css`.
  - Keep existing nav links and dropdown behavior working.
- Out of scope:
  - Reworking algorithm page content.
  - Introducing server-backed search or indexing.

## Tasks and Deliverables
- [ ] Add flattening utility from nav config for searchable routes.
- [ ] Add query state, filtered results, and clear affordances.
- [ ] Add responsive nav styles for search field and result panel.
- [ ] Validate no regressions in existing category dropdown links.

## Constraints and Assumptions
- Search is client-side and scoped to current known nav pages.
- Links that are not route paths (hash anchors) are excluded from searchable results.

## Milestones
- M1: Nav search interaction complete.
- M2: Responsive styling finalized.
- M3: Quality gates (lint/tests/format/knip) pass.
