import { useState, useCallback } from "react";
import { Nav } from "@/components/Nav";
import { AlgorithmComplete } from "@/components/AlgorithmComplete";
import { PlaybackController } from "@/components/PlaybackController";
import { WatchPanel } from "@/components/WatchPanel";
import { ComplexityPopover } from "@/components/ComplexityPopover";
import { AnalogyPanel } from "@/components/AnalogyPanel";
import { ProblemFrame } from "@/components/ProblemFrame";
import { WhyComplexityPanel } from "@/components/WhyComplexityPanel";
import { generateSteps } from "@/lib/algorithms/quicksort";

const MAX_SIZE = 20;

function randomArray(size: number): number[] {
  return Array.from({ length: size }, () => Math.floor(Math.random() * 99) + 1);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ArrayBars({ step, maxVal }: { step: any; maxVal: number }) {
  const arr: number[] = step.array ?? [];
  const pivotIndex: number = step.pivotIndex ?? -1;
  const iPos: number = step.i ?? -1;
  const jPos: number = step.j ?? -1;
  const low: number = step.low ?? -1;
  const high: number = step.high ?? -1;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        gap: 4,
        height: 200,
        padding: "0 1rem",
      }}
    >
      {arr.map((val, idx) => {
        let bg = "var(--text-muted)";
        if (step.type === "complete") bg = "var(--cat-graph)";
        else if (idx === pivotIndex) bg = "var(--cat-sorting)";
        else if (idx === iPos || idx === jPos) bg = "var(--cat-dp)";
        else if (low >= 0 && high >= 0 && idx >= low && idx <= high)
          bg = "var(--bg-tertiary)";

        const heightPct = Math.max(4, (val / maxVal) * 100);
        return (
          <div
            key={idx}
            style={{
              flex: 1,
              background: bg,
              height: `${heightPct}%`,
              borderRadius: "3px 3px 0 0",
              transition: "height 0.15s, background 0.15s",
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "center",
              paddingTop: 2,
            }}
            title={`${val}`}
          >
            {arr.length <= 14 && (
              <span
                style={{
                  fontSize: "0.55rem",
                  color: "rgba(255,255,255,0.8)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {val}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function QuickSort() {
  const [inputValue, setInputValue] = useState("38, 27, 43, 3, 9, 82, 10");
  const [partitionScheme, setPartitionScheme] = useState<string>("lomuto");
  const [pivotStrategy, setPivotStrategy] = useState<string>("last");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [steps, setSteps] = useState<any[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState("");
  const [maxVal, setMaxVal] = useState(100);

  const parseInput = useCallback((raw: string): number[] | null => {
    const nums = raw
      .split(/[,\s]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
      .map(Number);
    if (nums.some((n) => isNaN(n))) {
      setError("Enter valid numbers separated by commas.");
      return null;
    }
    if (nums.length < 2) {
      setError("Enter at least 2 numbers.");
      return null;
    }
    if (nums.length > MAX_SIZE) {
      setError(`Maximum ${MAX_SIZE} numbers.`);
      return null;
    }
    setError("");
    return nums;
  }, []);

  const handleVisualize = useCallback(() => {
    const arr = parseInput(inputValue);
    if (!arr) return;
    const result = generateSteps(arr, partitionScheme, pivotStrategy);
    setSteps(result.steps);
    setCurrentStep(0);
    setMaxVal(Math.max(...arr));
  }, [inputValue, partitionScheme, pivotStrategy, parseInput]);

  const handleRandom = useCallback(() => {
    const arr = randomArray(8);
    setInputValue(arr.join(", "));
    const result = generateSteps(arr, partitionScheme, pivotStrategy);
    setSteps(result.steps);
    setCurrentStep(0);
    setMaxVal(Math.max(...arr));
  }, [partitionScheme, pivotStrategy]);

  const step = steps[currentStep];

  const watchVars = step
    ? [
        { label: "type", value: step.type ?? "" },
        { label: "pivot", value: step.pivotValue ?? "—" },
        { label: "pivot idx", value: step.pivotIndex ?? "—" },
        { label: "i", value: step.i ?? "—" },
        { label: "j", value: step.j ?? "—" },
        {
          label: "comparisons",
          value: step.comparisons ?? 0,
        },
        { label: "swaps", value: step.swaps ?? 0 },
      ]
    : [];

  return (
    <div className="algo-page" data-category="sorting">
      <Nav showStoryBanner />

      <div className="page-header">
        <div className="title-group">
          <h1>Quick Sort</h1>
          <div className="title-meta">
            <span className="badge">Sorting</span>
            <ComplexityPopover
              best="O(n log n)"
              avg="O(n log n)"
              worst="O(n²)"
              space="O(log n)"
              bestNote="balanced partitions"
              avgNote="random input"
              worstNote="sorted/reverse sorted"
              spaceNote="recursion stack"
              why="Each partition step is O(n). With balanced pivots we get log₂(n) levels → O(n log n). With worst-case pivot (always min/max), we get n levels → O(n²)."
            />
          </div>
        </div>
        <AlgorithmComplete />
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
                Select a pivot element, partition the array so all smaller
                elements are to its left, then recursively sort the sub-arrays.
              </p>
            </div>
            <div className="app-section">
              <span className="app-label">Real use cases</span>
              <p>
                Default sort in C++ STL, Java, Python (introsor t variant);
                cache-friendly in-place sorting; database query optimization.
              </p>
            </div>
          </ProblemFrame>

          <WhyComplexityPanel derivation="In the average case, each partition divides the array roughly in half, giving log₂(n) recursive levels. Each level does O(n) work total. So O(n log n). Worst case: if the pivot is always the min or max, we get n levels of O(n) work each → O(n²). Random pivot or median-of-3 avoids this." />

          <AnalogyPanel>
            Pick one person from a crowd and have everyone taller stand to their
            right, shorter to their left. Repeat within each group. After enough
            rounds, everyone is in sorted position.
          </AnalogyPanel>

          <div className="panel">
            <div className="controls">
              <div className="inputs">
                <label htmlFor="qs-input">Array</label>
                <input
                  id="qs-input"
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  maxLength={100}
                />
              </div>
              <div className="inputs" style={{ gap: "1rem" }}>
                <label>Partition</label>
                <select
                  value={partitionScheme}
                  onChange={(e) => setPartitionScheme(e.target.value)}
                  style={{
                    background: "var(--bg-input)",
                    border: "1px solid var(--border)",
                    color: "var(--text-primary)",
                    padding: "0.4rem 0.6rem",
                    borderRadius: 6,
                    fontFamily: "var(--font-body)",
                    fontSize: "0.82rem",
                  }}
                >
                  <option value="lomuto">Lomuto</option>
                  <option value="hoare">Hoare</option>
                </select>
                <label>Pivot</label>
                <select
                  value={pivotStrategy}
                  onChange={(e) => setPivotStrategy(e.target.value)}
                  style={{
                    background: "var(--bg-input)",
                    border: "1px solid var(--border)",
                    color: "var(--text-primary)",
                    padding: "0.4rem 0.6rem",
                    borderRadius: 6,
                    fontFamily: "var(--font-body)",
                    fontSize: "0.82rem",
                  }}
                >
                  <option value="last">Last</option>
                  <option value="first">First</option>
                  <option value="random">Random</option>
                  <option value="median-of-3">Median of 3</option>
                </select>
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
                {/* Legend */}
                <div className="legend">
                  <span>
                    <span
                      className="swatch"
                      style={{
                        background: "var(--cat-sorting)",
                        borderColor: "var(--cat-sorting)",
                      }}
                    />
                    Pivot
                  </span>
                  <span>
                    <span
                      className="swatch"
                      style={{
                        background: "var(--cat-dp)",
                        borderColor: "var(--cat-dp)",
                      }}
                    />
                    i / j
                  </span>
                  <span>
                    <span
                      className="swatch"
                      style={{
                        background: "var(--cat-graph)",
                        borderColor: "var(--cat-graph)",
                      }}
                    />
                    Sorted
                  </span>
                </div>

                <ArrayBars step={step} maxVal={maxVal} />

                <div className="info" style={{ marginTop: "1rem" }}>
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
            <div className="panel-title">Pseudocode (Lomuto)</div>
            <div className="code-panel">
              {[
                "function quickSort(arr, low, high):",
                "  if low < high:",
                "    p = partition(arr, low, high)",
                "    quickSort(arr, low, p - 1)",
                "    quickSort(arr, p + 1, high)",
                "",
                "function partition(arr, low, high):",
                "  pivot = arr[high]",
                "  i = low - 1",
                "  for j = low to high - 1:",
                "    if arr[j] <= pivot:",
                "      i++",
                "      swap(arr[i], arr[j])",
                "  swap(arr[i+1], arr[high])",
                "  return i + 1",
              ].map((line, idx) => (
                <span key={idx} className="code-line">
                  {line || "\u00A0"}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
