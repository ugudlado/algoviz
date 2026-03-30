# Tasks: Vite + React Migration (Phase 1 — Sorting)

## Phase 1 — Scaffold & Theme

- [ ] Install Vite + React + TypeScript + React Router: `pnpm add react react-dom react-router-dom && pnpm add -D vite @vitejs/plugin-react typescript @types/react @types/react-dom`
- [ ] Create `vite.config.ts`, `tsconfig.json`, `index.html` entry point, `src/main.tsx`, `src/App.tsx`
- [ ] Port G2 design system to `src/styles/global.css` — all CSS vars, fonts, dark body base, category accent overrides, shared algo-nav styles
- [ ] Verify `pnpm dev` starts with blank app using correct background color (`#030303`)

## Phase 2 — Shared Components

- [ ] `Nav` component — category dropdowns from a `NAV_CONFIG` array, active category highlight, same HTML structure as current `.algo-nav`
- [ ] `PlaybackController` component — play/pause/step-forward/step-back buttons, speed slider, step counter; props: `steps[]`, `currentStep`, `onStep`, `onReset`
- [ ] `WatchPanel` component — renders a grid of variable name/value pairs; props: `vars: { label, value, highlight }[]`
- [ ] `ComplexityPopover` component — badge with popover showing best/avg/worst/space + why derivation; props match existing data-attributes
- [ ] `AnalogyPanel` component — bordered card with analogy text; props: `children`
- [ ] `ProblemFrame` component — "The Problem" panel; props: `title`, `description`, `children`
- [ ] `WhyComplexityPanel` component — "Why this complexity" expandable section; props: `derivation`

## Phase 3 — Homepage

- [ ] `src/pages/Home/index.tsx` — hero, algorithm cards grid (4 sorting + links to others), learning path section, search bar
- [ ] Verify homepage matches current index.html layout and colors

## Phase 4 — Sorting Algorithm Pages

- [ ] `src/lib/algorithms/bubble-sort.ts` — ES module wrapper that loads `bubble-sort-algorithm.js` and exports `generateSteps`, `BubbleSortAlgorithm`
- [ ] `src/pages/algorithms/BubbleSort/index.tsx` — full React visualization: array bars, step-through, watch panel (comparisons/swaps/current), complexity popover, analogy, problem frame
- [ ] `src/lib/algorithms/merge-sort.ts` + `src/pages/algorithms/MergeSort/index.tsx` — merge sort React page
- [ ] `src/lib/algorithms/quicksort.ts` + `src/pages/algorithms/QuickSort/index.tsx` — quicksort React page with pivot/bounds/i/j watch vars
- [ ] `src/lib/algorithms/radix-sort.ts` + `src/pages/algorithms/RadixSort/index.tsx` — radix sort React page

## Phase 5 — Build & Deploy

- [ ] Configure `vite.config.ts` with `base: '/algoviz/'` for GitHub Pages subdirectory
- [ ] Verify `pnpm build` succeeds — no TypeScript errors, no missing imports
- [ ] Verify `pnpm preview` serves the built site correctly
- [ ] Create `.github/workflows/deploy.yml` — push-to-main → pnpm build → peaceiris/actions-gh-pages to `gh-pages` branch
- [ ] Run `pnpm test` to confirm 698 existing tests still pass (test runner is Node.js, unaffected by Vite)
- [ ] Final smoke test: all 4 sorting algorithm pages function correctly in built output
