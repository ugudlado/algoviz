import { useState, useCallback } from 'react'
import { Nav } from '@/components/Nav'
import { PlaybackController } from '@/components/PlaybackController'
import { WatchPanel } from '@/components/WatchPanel'
import { ComplexityPopover } from '@/components/ComplexityPopover'
import { AnalogyPanel } from '@/components/AnalogyPanel'
import { ProblemFrame } from '@/components/ProblemFrame'
import { WhyComplexityPanel } from '@/components/WhyComplexityPanel'
import { generateSteps, type BubbleSortStep } from '@/lib/algorithms/bubble-sort'

const DEFAULT_ARRAY = [38, 27, 43, 3, 9, 82, 10]
const MAX_SIZE = 20

function randomArray(size: number): number[] {
  return Array.from({ length: size }, () => Math.floor(Math.random() * 99) + 1)
}

function ArrayBars({
  step,
  maxVal,
}: {
  step: BubbleSortStep
  maxVal: number
}) {
  const { arr, comparing, sortedBoundary } = step
  const [ci, cj] = comparing

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: 4,
        height: 200,
        padding: '0 1rem',
      }}
    >
      {arr.map((val, idx) => {
        const isSorted = sortedBoundary <= idx && sortedBoundary > 0
        const isComparing = idx === ci || idx === cj

        let bg = 'var(--text-muted)'
        if (isSorted) bg = 'var(--cat-graph)'
        if (isComparing) bg = 'var(--cat-sorting)'

        const heightPct = Math.max(4, (val / maxVal) * 100)

        return (
          <div
            key={idx}
            style={{
              flex: 1,
              background: bg,
              height: `${heightPct}%`,
              borderRadius: '3px 3px 0 0',
              transition: 'height 0.15s, background 0.15s',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'center',
              paddingTop: 2,
            }}
            title={`${val}`}
          >
            {arr.length <= 12 && (
              <span
                style={{
                  fontSize: '0.6rem',
                  color: 'rgba(255,255,255,0.8)',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                {val}
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function BubbleSort() {
  const [inputValue, setInputValue] = useState(DEFAULT_ARRAY.join(', '))
  const [steps, setSteps] = useState<BubbleSortStep[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [error, setError] = useState('')
  const [maxVal, setMaxVal] = useState(100)

  const parseInput = useCallback((raw: string): number[] | null => {
    const nums = raw
      .split(/[,\s]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
      .map(Number)

    if (nums.some((n) => isNaN(n))) {
      setError('Enter valid numbers separated by commas or spaces.')
      return null
    }
    if (nums.length < 2) {
      setError('Enter at least 2 numbers.')
      return null
    }
    if (nums.length > MAX_SIZE) {
      setError(`Maximum ${MAX_SIZE} numbers.`)
      return null
    }
    setError('')
    return nums
  }, [])

  const handleVisualize = useCallback(() => {
    const arr = parseInput(inputValue)
    if (!arr) return
    const result = generateSteps(arr)
    setSteps(result.steps)
    setCurrentStep(0)
    setMaxVal(Math.max(...arr))
  }, [inputValue, parseInput])

  const handleRandom = useCallback(() => {
    const arr = randomArray(8)
    setInputValue(arr.join(', '))
    const result = generateSteps(arr)
    setSteps(result.steps)
    setCurrentStep(0)
    setMaxVal(Math.max(...arr))
  }, [])

  const handleReset = useCallback(() => {
    setCurrentStep(0)
  }, [])

  const step = steps[currentStep]

  const watchVars = step
    ? [
        { label: 'comparisons', value: step.comparisons },
        { label: 'swaps', value: step.swaps },
        {
          label: 'comparing',
          value:
            step.comparing[0] >= 0
              ? `[${step.comparing[0]}] vs [${step.comparing[1]}]`
              : '—',
          highlight: step.comparing[0] >= 0,
        },
        {
          label: 'swapped',
          value: step.swapped ? 'YES' : 'no',
          highlight: step.swapped,
        },
        { label: 'pass', value: step.i >= 0 ? step.i + 1 : '—' },
      ]
    : []

  return (
    <div className="algo-page" data-category="sorting">
      <Nav currentCategory="sorting" />

      {/* Page Header */}
      <div className="page-header">
        <div className="title-group">
          <h1>Bubble Sort</h1>
          <div className="title-meta">
            <span className="badge">Sorting</span>
            <ComplexityPopover
              best="O(n)"
              avg="O(n²)"
              worst="O(n²)"
              space="O(1)"
              bestNote="already sorted"
              avgNote="random input"
              worstNote="reverse sorted"
              spaceNote="in-place"
              why="Each pass compares n−i pairs. Summing all passes: (n−1)+(n−2)+…+1 = n(n−1)/2 ≈ n². Early-termination gives O(n) best case."
            />
          </div>
        </div>
      </div>

      {/* Two-column content */}
      <div className="content-grid">
        {/* Main column */}
        <div className="main-column">
          {/* Problem frame */}
          <ProblemFrame title="The Problem">
            <div className="app-section">
              <span className="app-label">Given</span>
              <p>An unsorted array of numbers</p>
            </div>
            <div className="app-section">
              <span className="app-label">Goal</span>
              <p>
                Arrange them in ascending order by repeatedly swapping adjacent
                elements that are out of order.
              </p>
            </div>
            <div className="app-section">
              <span className="app-label">Real use cases</span>
              <p>
                Detecting nearly-sorted data; teaching comparison-based sorting;
                checking if an array is sorted in linear time.
              </p>
            </div>
          </ProblemFrame>

          {/* Why complexity */}
          <WhyComplexityPanel derivation="Bubble sort makes at most n−1 passes. In pass i, it compares n−1−i pairs. Total comparisons = (n−1)+(n−2)+…+1 = n(n−1)/2 ∈ O(n²). With early termination, a sorted array is detected after one pass: O(n). Space is O(1) since sorting is done in-place." />

          {/* Analogy */}
          <AnalogyPanel>
            Imagine sorting a row of people by height. You walk along the row
            comparing neighbours — if the left person is taller, they swap. After
            each full pass, the tallest unsorted person has &ldquo;bubbled&rdquo; to
            their correct position at the right end.
          </AnalogyPanel>

          {/* Controls */}
          <div className="panel">
            <div className="controls">
              <div className="inputs">
                <label htmlFor="bs-input">Array</label>
                <input
                  id="bs-input"
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="e.g. 38, 27, 43, 3"
                  maxLength={100}
                />
              </div>
              {error && (
                <div className="algo-error visible">{error}</div>
              )}
              <div className="buttons">
                <button className="btn-primary" onClick={handleVisualize}>
                  Visualize
                </button>
                <button onClick={handleRandom}>Random</button>
              </div>
            </div>

            {/* Visualization */}
            {step && (
              <>
                {/* Legend */}
                <div className="legend" style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '0.75rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <span>
                    <span
                      className="swatch"
                      style={{ background: 'var(--cat-sorting)', borderColor: 'var(--cat-sorting)' }}
                    />
                    Comparing
                  </span>
                  <span>
                    <span
                      className="swatch"
                      style={{ background: 'var(--cat-graph)', borderColor: 'var(--cat-graph)' }}
                    />
                    Sorted
                  </span>
                  <span>
                    <span
                      className="swatch"
                      style={{ background: 'var(--text-muted)', borderColor: 'var(--text-muted)' }}
                    />
                    Unsorted
                  </span>
                </div>

                <ArrayBars step={step} maxVal={maxVal} />

                {/* Explanation */}
                <div className="info" style={{ marginTop: '1rem' }}>
                  {step.explanation}
                </div>

                <PlaybackController
                  steps={steps}
                  currentStep={currentStep}
                  onStep={setCurrentStep}
                  onReset={handleReset}
                />
              </>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="sidebar">
          {/* Watch panel */}
          {step && <WatchPanel vars={watchVars} />}

          {/* Pseudocode */}
          <div className="panel">
            <div className="panel-title">Pseudocode</div>
            <div className="code-panel">
              {[
                'for i = 0 to n-2:',
                '  swapped = false',
                '  for j = 0 to n-2-i:',
                '    if arr[j] > arr[j+1]:',
                '      swap(arr[j], arr[j+1])',
                '      swapped = true',
                '  if not swapped: break',
              ].map((line, idx) => (
                <span
                  key={idx}
                  className={`code-line${step && step.codeLine === idx ? ' highlight' : ''}`}
                >
                  {line}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
