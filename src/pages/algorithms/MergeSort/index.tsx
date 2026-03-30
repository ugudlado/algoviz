import { useState, useCallback } from 'react'
import { Nav } from '@/components/Nav'
import { PlaybackController } from '@/components/PlaybackController'
import { WatchPanel } from '@/components/WatchPanel'
import { ComplexityPopover } from '@/components/ComplexityPopover'
import { AnalogyPanel } from '@/components/AnalogyPanel'
import { ProblemFrame } from '@/components/ProblemFrame'
import { WhyComplexityPanel } from '@/components/WhyComplexityPanel'
import { generateSteps } from '@/lib/algorithms/merge-sort'

const MAX_SIZE = 20

function randomArray(size: number): number[] {
  return Array.from({ length: size }, () => Math.floor(Math.random() * 99) + 1)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function StepDisplay({ step }: { step: any }) {
  if (!step) return null

  const type = step.type as string

  if (type === 'split') {
    return (
      <div style={{ textAlign: 'center', padding: '1rem 0' }}>
        <div
          style={{
            color: 'var(--text-muted)',
            fontSize: '0.72rem',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: '0.5rem',
          }}
        >
          Split (depth {step.depth})
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '1.5rem',
            flexWrap: 'wrap',
          }}
        >
          <ArrayDisplay label="Left" arr={step.left} color="var(--cat-dp)" />
          <ArrayDisplay label="Right" arr={step.right} color="var(--cat-searching)" />
        </div>
      </div>
    )
  }

  if (type === 'merge') {
    return (
      <div style={{ textAlign: 'center', padding: '1rem 0' }}>
        <div
          style={{
            color: 'var(--text-muted)',
            fontSize: '0.72rem',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: '0.5rem',
          }}
        >
          Merge (depth {step.depth})
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start',
            gap: '1.5rem',
            flexWrap: 'wrap',
          }}
        >
          <ArrayDisplay
            label="Left"
            arr={step.left}
            highlightIdx={step.leftIndex}
            color="var(--cat-dp)"
          />
          <ArrayDisplay
            label="Right"
            arr={step.right}
            highlightIdx={step.rightIndex}
            color="var(--cat-searching)"
          />
          <ArrayDisplay label="Result" arr={step.result} color="var(--cat-graph)" />
        </div>
      </div>
    )
  }

  if (type === 'complete') {
    return (
      <div style={{ textAlign: 'center', padding: '1rem 0' }}>
        <div
          style={{
            color: 'var(--cat-graph)',
            fontSize: '0.85rem',
            fontWeight: 600,
            marginBottom: '0.75rem',
          }}
        >
          Sort Complete!
        </div>
        <ArrayDisplay label="Sorted" arr={step.array} color="var(--cat-graph)" />
      </div>
    )
  }

  return null
}

function ArrayDisplay({
  label,
  arr,
  highlightIdx,
  color,
}: {
  label: string
  arr: number[]
  highlightIdx?: number
  color: string
}) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div
        style={{
          fontSize: '0.65rem',
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          marginBottom: '0.4rem',
        }}
      >
        {label}
      </div>
      <div style={{ display: 'flex', gap: 4 }}>
        {arr.map((val, i) => (
          <div
            key={i}
            style={{
              width: 36,
              height: 36,
              display: 'grid',
              placeItems: 'center',
              background: i === highlightIdx ? color : 'var(--bg-tertiary)',
              border: `1px solid ${i === highlightIdx ? color : 'var(--border)'}`,
              borderRadius: 4,
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              color: i === highlightIdx ? 'var(--bg-primary)' : 'var(--text-secondary)',
              transition: 'all 0.15s',
            }}
          >
            {val}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function MergeSort() {
  const [inputValue, setInputValue] = useState('38, 27, 43, 3, 9, 82, 10')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [steps, setSteps] = useState<any[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [error, setError] = useState('')

  const parseInput = useCallback((raw: string): number[] | null => {
    const nums = raw
      .split(/[,\s]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
      .map(Number)
    if (nums.some((n) => isNaN(n))) {
      setError('Enter valid numbers separated by commas.')
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
  }, [inputValue, parseInput])

  const handleRandom = useCallback(() => {
    const arr = randomArray(6)
    setInputValue(arr.join(', '))
    const result = generateSteps(arr)
    setSteps(result.steps)
    setCurrentStep(0)
  }, [])

  const step = steps[currentStep]

  const watchVars = step
    ? [
        { label: 'step type', value: step.type },
        { label: 'depth', value: step.depth ?? 0 },
        { label: 'comparisons', value: step.comparisons ?? 0 },
        { label: 'merge ops', value: step.mergeOps ?? 0 },
      ]
    : []

  return (
    <div className="algo-page" data-category="sorting">
      <Nav currentCategory="sorting" />

      <div className="page-header">
        <div className="title-group">
          <h1>Merge Sort</h1>
          <div className="title-meta">
            <span className="badge">Sorting</span>
            <ComplexityPopover
              best="O(n log n)"
              avg="O(n log n)"
              worst="O(n log n)"
              space="O(n)"
              bestNote="always"
              avgNote="always"
              worstNote="always"
              spaceNote="auxiliary"
              why="The array is halved log₂(n) times. Each level merges n total elements → O(n) per level × O(log n) levels = O(n log n). Space O(n) for temp arrays."
            />
          </div>
        </div>
      </div>

      <div className="content-grid">
        <div className="main-column">
          <ProblemFrame title="The Problem">
            <div className="app-section">
              <span className="app-label">Given</span>
              <p>An unsorted array of numbers</p>
            </div>
            <div className="app-section">
              <span className="app-label">Goal</span>
              <p>
                Sort it in O(n log n) by recursively splitting the array in half,
                sorting each half, then merging the sorted halves back together.
              </p>
            </div>
            <div className="app-section">
              <span className="app-label">Real use cases</span>
              <p>
                External sorting (files too large for RAM), stable sort in standard
                libraries, inversion counting.
              </p>
            </div>
          </ProblemFrame>

          <WhyComplexityPanel derivation="Each recursive call splits the array in half: there are log₂(n) levels. At each level, we merge all n elements total across all calls at that depth. So total work = n × log₂(n) = O(n log n). Space is O(n) for the temporary merged arrays." />

          <AnalogyPanel>
            Sorting a giant pile of student papers: split the pile in two, give
            each half to an assistant, they sort their pile and hand it back.
            You then merge the two sorted stacks into one by picking the smaller
            front card each time.
          </AnalogyPanel>

          <div className="panel">
            <div className="controls">
              <div className="inputs">
                <label htmlFor="ms-input">Array</label>
                <input
                  id="ms-input"
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="e.g. 38, 27, 43, 3"
                  maxLength={100}
                />
              </div>
              {error && <div className="algo-error visible">{error}</div>}
              <div className="buttons">
                <button className="btn-primary" onClick={handleVisualize}>
                  Visualize
                </button>
                <button onClick={handleRandom}>Random</button>
              </div>
            </div>

            {step && (
              <>
                <StepDisplay step={step} />
                <div className="info" style={{ marginTop: '1rem' }}>
                  {step.explanation}
                </div>
                <PlaybackController
                  steps={steps}
                  currentStep={currentStep}
                  onStep={setCurrentStep}
                  onReset={() => setCurrentStep(0)}
                />
              </>
            )}
          </div>
        </div>

        <div className="sidebar">
          {step && <WatchPanel vars={watchVars} />}

          <div className="panel">
            <div className="panel-title">Pseudocode</div>
            <div className="code-panel">
              {[
                'function mergeSort(arr):',
                '  if len(arr) <= 1: return arr',
                '  mid = len(arr) / 2',
                '  left = mergeSort(arr[:mid])',
                '  right = mergeSort(arr[mid:])',
                '  return merge(left, right)',
                '',
                'function merge(left, right):',
                '  result = []',
                '  while left and right:',
                '    if left[0] <= right[0]:',
                '      result.append(left.pop(0))',
                '    else:',
                '      result.append(right.pop(0))',
                '  return result + left + right',
              ].map((line, idx) => (
                <span key={idx} className="code-line">
                  {line || '\u00A0'}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
