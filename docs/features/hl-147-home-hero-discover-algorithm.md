# HL-147 - Home Hero Discover Algorithm Spotlight

## Problem
The home hero currently relies on static introductory content and does not actively guide users to the next algorithm to learn.

## Proposed Solution
Replace the hero's passive visual area with a "Discover Algorithm" spotlight card that selects a random available algorithm, shows key metadata (name, description, category, complexity, difficulty), and provides CTA actions.

## Why This Approach
- Creates an immediate, actionable starting point for new and returning learners.
- Reuses existing algorithm metadata in `src/pages/Home/index.tsx` to avoid duplicate content systems.
- Keeps discovery lightweight and client-side while preserving manual browsing.

## Scope
- In scope:
  - Add random spotlight state in `src/pages/Home/index.tsx`.
  - Render "Discover Algorithm" card in hero area.
  - Add "Show another algorithm" refresh action.
  - Keep direct navigation CTA to selected algorithm.
- Out of scope:
  - Personalized recommendations or progress-aware ranking.
  - Server-side recommendation APIs.

## Tasks and Deliverables
- [x] Add deterministic-safe random selection helper that avoids immediate repeats.
- [x] Add hero spotlight card with algorithm metadata and CTA.
- [x] Add refresh action to rotate spotlight algorithm.
- [ ] Validate UX copy and visual spacing with product review.

## Constraints and Assumptions
- Spotlight candidates are limited to currently available algorithms in homepage-visible categories.
- Selection is intentionally non-persistent and refreshes on page reload.

## Milestones
- M1: Spotlight interaction complete.
- M2: Hero UI integrated and quality gates validated.
