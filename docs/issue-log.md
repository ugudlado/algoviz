# Issue Log

## 2026-03-31 - HL-147 Home hero discover spotlight

### Context
Home hero content was mostly descriptive and did not surface a clear "next algorithm" action from the primary above-the-fold area.

### Root Cause
The hero lacked a recommendation mechanism and relied on static copy/links, which reduced guided discovery.

### Fix
Implemented a random "Discover Algorithm" spotlight card in `src/pages/Home/index.tsx` with:
- Random available algorithm selection on load.
- Metadata display (name, description, category, complexity, difficulty).
- CTA to open the selected algorithm.
- Refresh control to rotate spotlight while avoiding immediate repeats.

### Notes
Future enhancement can layer in weighted recommendations (category diversity, recency, or learner progress) without changing the current card contract.
