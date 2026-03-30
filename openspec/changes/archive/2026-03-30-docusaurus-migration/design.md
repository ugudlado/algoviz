# Design: Vite + React Migration

## Project Structure

```
algoviz/
├── index.html                    # Vite entry point
├── vite.config.ts
├── tsconfig.json
├── src/
│   ├── main.tsx                  # ReactDOM.createRoot, Router
│   ├── App.tsx                   # Routes
│   ├── styles/
│   │   └── global.css            # G2 design system (ported from style.css)
│   ├── components/
│   │   ├── Nav/                  # Category nav (config-driven, no duplication)
│   │   ├── PlaybackController/   # Play/pause/step/speed — shared
│   │   ├── WatchPanel/           # Live variable watch panel — shared
│   │   ├── ComplexityPopover/    # Complexity badges with popover — shared
│   │   ├── AnalogyPanel/         # Real-world analogy card — shared
│   │   ├── ProblemFrame/         # "The Problem" panel — shared
│   │   └── WhyComplexityPanel/   # "Why this complexity" panel — shared
│   ├── pages/
│   │   ├── Home/                 # index.tsx — homepage
│   │   └── algorithms/
│   │       ├── BubbleSort/       # index.tsx — React visualization
│   │       ├── MergeSort/
│   │       ├── QuickSort/
│   │       └── RadixSort/
│   └── lib/
│       └── algorithms/           # Re-exports existing *-algorithm.js as ES modules
│           ├── bubble-sort.ts    # import * from '../../../bubble-sort-algorithm.js'
│           └── ...
├── public/                       # Static assets (favicon, etc.)
├── .github/
│   └── workflows/
│       └── deploy.yml
└── package.json
```

## Algorithm Page Pattern

Each sorting algorithm page follows this pattern:

```tsx
// src/pages/algorithms/BubbleSort/index.tsx
import { useState, useCallback } from 'react'
import { PlaybackController } from '@/components/PlaybackController'
import { WatchPanel } from '@/components/WatchPanel'
import { ComplexityPopover } from '@/components/ComplexityPopover'
import { AnalogyPanel } from '@/components/AnalogyPanel'
import { generateSteps } from '@/lib/algorithms/bubble-sort'

export default function BubbleSort() {
  const [steps, setSteps] = useState([])
  const [currentStep, setCurrentStep] = useState(0)
  // visualization state...

  return (
    <div className="algo-page" data-category="sorting">
      <Nav />
      <ComplexityPopover best="O(n)" avg="O(n²)" worst="O(n²)" space="O(1)" />
      <AnalogyPanel>Sorting cards in your hand...</AnalogyPanel>
      <ProblemFrame>...</ProblemFrame>
      <WatchPanel vars={watchVars} />
      <div className="viz-area">{/* canvas/SVG visualization */}</div>
      <PlaybackController
        steps={steps}
        onStep={setCurrentStep}
      />
    </div>
  )
}
```

## Algorithm JS Integration

Existing `*-algorithm.js` files export via globals (e.g., `window.BubbleSortAlgorithm`). Two options:

**Option A (preferred):** Copy algorithm files to `src/lib/algorithms/`, add `export` to the IIFE's return value — minimal change, works with Vite's module system.

**Option B (no-touch):** Keep algorithm files in `public/`, load via dynamic `<script>` in useEffect — avoids touching algorithm files but loses tree-shaking.

**Decision: Option A** — add a thin ES module wrapper per algorithm that imports the IIFE file and re-exports its functions. Algorithm IIFE files themselves are not modified.

## Routing

```tsx
// React Router v6
<Routes>
  <Route path="/" element={<Home />} />
  <Route path="/algorithms/bubble-sort" element={<BubbleSort />} />
  <Route path="/algorithms/merge-sort" element={<MergeSort />} />
  <Route path="/algorithms/quicksort" element={<QuickSort />} />
  <Route path="/algorithms/radix-sort" element={<RadixSort />} />
</Routes>
```

## GitHub Actions

```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
permissions:
  contents: write
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: pnpm }
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
      - uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

## Theme Mapping (G2 → Vite global CSS)

All existing CSS vars are preserved exactly in `src/styles/global.css`:
- `--bg-primary: #030303` etc. unchanged
- `body[data-category="sorting"]` accent overrides unchanged
- Inter + JetBrains Mono Google Fonts import unchanged
- Component CSS uses CSS Modules with `camelCase` referencing vars
