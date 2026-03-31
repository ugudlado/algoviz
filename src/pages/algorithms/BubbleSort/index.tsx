import { useState, useCallback, useEffect } from "react";
import { Nav } from "@/components/Nav";
import { PlaybackController } from "@/components/PlaybackController";
import { WatchPanel } from "@/components/WatchPanel";
import { ProblemFrame } from "@/components/ProblemFrame";
import {
  generateSteps,
  type BubbleSortStep,
} from "@/lib/algorithms/bubble-sort";

const MAX_SIZE = 20;

const SCENARIOS = [
  {
    id: "random",
    label: "Random",
    tooltip: "Standard unordered array — average-case performance.",
    make: () =>
      Array.from({ length: 9 }, () => Math.floor(Math.random() * 99) + 1),
  },
  {
    id: "worst",
    label: "Worst (n²)",
    tooltip: "Reverse ordered — every element must bubble all the way across.",
    make: () => [9, 8, 7, 6, 5, 4, 3, 2, 1],
  },
  {
    id: "best",
    label: "Best (n)",
    tooltip: "Already sorted — detected in one pass, no swaps needed.",
    make: () => [1, 2, 3, 4, 5, 6, 7, 8, 9],
  },
  {
    id: "turtle",
    label: "The Turtle",
    tooltip:
      "Smallest value trapped at the end — takes N passes to crawl left.",
    make: () => [2, 3, 4, 5, 6, 7, 8, 9, 1],
  },
];

const PSEUDO_LINES = [
  "for each pass along the shelf:",
  "  no_swap = true",
  "  for each neighbor pair:",
  "    if left book taller:",
  "      swap them",
  "      no_swap = false",
  "  if no_swap: done!",
];

function randomArray(size: number): number[] {
  return Array.from({ length: size }, () => Math.floor(Math.random() * 99) + 1);
}

function ArrayBars({ step, maxVal }: { step: BubbleSortStep; maxVal: number }) {
  const { arr, comparing, sortedBoundary } = step;
  const [ci, cj] = comparing;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        gap: 4,
        height: 200,
        padding: "0 0.5rem",
      }}
    >
      {arr.map((val, idx) => {
        const isSorted =
          sortedBoundary > 0 && idx >= arr.length - sortedBoundary;
        const isComparing = idx === ci || idx === cj;

        let bg = "var(--text-muted)";
        if (isSorted) bg = "var(--cat-graph)";
        if (isComparing) bg = "var(--cat-sorting)";

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
            {arr.length <= 12 && (
              <span
                style={{
                  fontSize: "0.6rem",
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

function ComplexityBadge({
  label,
  value,
  rows,
  why,
}: {
  label: string;
  value: string;
  rows: { name: string; val: string; note?: string }[];
  why: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div
      style={{ position: "relative", display: "inline-block" }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <span
        className="badge badge-accent"
        style={{ cursor: "pointer" }}
        onClick={() => setOpen((o) => !o)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") setOpen((o) => !o);
        }}
      >
        {label}: {value}
      </span>
      {open && (
        <div
          className="complexity-popover"
          style={{ top: "100%", left: 0, minWidth: 220 }}
        >
          {rows.map((r) => (
            <div className="cp-row" key={r.name}>
              <span className="cp-label">{r.name}</span>
              <span className="cp-value">{r.val}</span>
              {r.note && <span className="cp-note">{r.note}</span>}
            </div>
          ))}
          <div className="cp-why">
            <div className="cp-why-label">Why?</div>
            <div className="cp-why-text">{why}</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BubbleSort() {
  const [inputValue, setInputValue] = useState("8, 3, 5, 1, 9, 2, 7, 4, 6");
  const [steps, setSteps] = useState<BubbleSortStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState("");
  const [maxVal, setMaxVal] = useState(100);
  const [activeScenario, setActiveScenario] = useState<string | null>(null);
  const [tooltipId, setTooltipId] = useState<string | null>(null);

  const runArray = useCallback((arr: number[]) => {
    const result = generateSteps(arr);
    setSteps(result.steps);
    setCurrentStep(0);
    setMaxVal(Math.max(...arr));
    setError("");
  }, []);

  const parseAndRun = useCallback(
    (raw: string) => {
      const nums = raw
        .split(/[,\s]+/)
        .map((s) => s.trim())
        .filter((s) => s.length > 0)
        .map(Number);

      if (nums.some((n) => isNaN(n))) {
        setError("Enter valid numbers separated by commas or spaces.");
        return;
      }
      if (nums.length < 2) {
        setError("Enter at least 2 numbers.");
        return;
      }
      if (nums.length > MAX_SIZE) {
        setError(`Maximum ${MAX_SIZE} numbers.`);
        return;
      }
      setActiveScenario(null);
      runArray(nums);
    },
    [runArray],
  );

  // Auto-run on mount
  useEffect(() => {
    runArray([8, 3, 5, 1, 9, 2, 7, 4, 6]);
  }, [runArray]);

  const handleScenario = (scenario: (typeof SCENARIOS)[number]) => {
    const arr = scenario.make();
    setInputValue(arr.join(", "));
    setActiveScenario(scenario.id);
    runArray(arr);
  };

  const handleRandom = useCallback(() => {
    const arr = randomArray(9);
    setInputValue(arr.join(", "));
    setActiveScenario("random");
    runArray(arr);
  }, [runArray]);

  const step = steps[currentStep];

  const watchVars = step
    ? [
        { label: "pass", value: step.i >= 0 ? step.i + 1 : "—" },
        {
          label: "comparing",
          value:
            step.comparing[0] >= 0
              ? `[${step.comparing[0]}] vs [${step.comparing[1]}]`
              : "—",
          highlight: step.comparing[0] >= 0,
        },
        {
          label: "A[i]",
          value: step.comparing[0] >= 0 ? step.arr[step.comparing[0]] : "—",
        },
        {
          label: "A[i+1]",
          value: step.comparing[1] >= 0 ? step.arr[step.comparing[1]] : "—",
        },
        {
          label: "swapped",
          value: step.swapped ? "YES" : "no",
          highlight: step.swapped,
        },
        { label: "comparisons", value: step.comparisons },
        { label: "swaps", value: step.swaps },
      ]
    : [];

  return (
    <div className="algo-page" data-category="sorting">
      <Nav currentCategory="sorting" />

      <div className="page-header">
        <div className="title-group">
          <h1>Bubble Sort</h1>
          <div className="title-meta">
            <span className="badge">Sorting</span>
            <ComplexityBadge
              label="Time"
              value="O(n²)"
              rows={[
                { name: "Best", val: "O(n)", note: "already sorted" },
                { name: "Avg", val: "O(n²)", note: "random input" },
                { name: "Worst", val: "O(n²)", note: "reverse sorted" },
              ]}
              why="Each pass compares n−i neighbors. Summing all passes: (n−1)+(n−2)+…+1 = n(n−1)/2 ≈ n². Early-termination gives O(n) when already sorted."
            />
            <ComplexityBadge
              label="Space"
              value="O(1)"
              rows={[{ name: "Auxiliary", val: "O(1)", note: "in-place" }]}
              why="Bubble sort swaps elements in-place. Only a single temp variable is needed regardless of input size."
            />
          </div>
        </div>
      </div>

      <div className="content-grid">
        {/* Main column */}
        <div className="main-column">
          {/* Problem + Analogy merged */}
          <ProblemFrame title="The Problem">
            <div className="app-section">
              <span className="app-label">Analogy</span>
              <p>
                You have a shelf of <strong>books in random order</strong> and
                need to sort them by height. You can only{" "}
                <strong>compare two neighboring books</strong> at a time and
                swap if they're out of order. After each full pass, the tallest
                unsorted book has &ldquo;bubbled&rdquo; to its correct position.
              </p>
            </div>
            <div className="app-section">
              <span className="app-label">Goal</span>
              <p>
                Sort numbers in ascending order by repeatedly swapping adjacent
                elements that are out of order.
              </p>
            </div>
          </ProblemFrame>

          {/* Visualization panel */}
          <div className="panel">
            {/* Legend + playback at top */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "0.5rem",
                marginBottom: "0.75rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: "1rem",
                  alignItems: "center",
                  fontSize: "0.82rem",
                  color: "var(--text-secondary)",
                }}
              >
                <span>
                  <span
                    className="swatch"
                    style={{
                      background: "var(--cat-sorting)",
                      borderColor: "var(--cat-sorting)",
                    }}
                  />
                  Comparing
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
                <span>
                  <span
                    className="swatch"
                    style={{
                      background: "var(--text-muted)",
                      borderColor: "var(--text-muted)",
                    }}
                  />
                  Unsorted
                </span>
              </div>
              {steps.length > 0 && (
                <PlaybackController
                  steps={steps}
                  currentStep={currentStep}
                  onStep={setCurrentStep}
                  onReset={() => setCurrentStep(0)}
                />
              )}
            </div>

            {/* Bars */}
            {step && <ArrayBars step={step} maxVal={maxVal} />}

            {/* Explanation */}
            <div
              className="info"
              style={{ marginTop: "0.75rem", minHeight: "1.5em" }}
            >
              {step?.explanation ?? ""}
            </div>

            {/* Custom input */}
            <div className="controls" style={{ marginTop: "1rem" }}>
              <div className="inputs">
                <label htmlFor="bs-input">Custom array</label>
                <input
                  id="bs-input"
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") parseAndRun(inputValue);
                  }}
                  placeholder="e.g. 8, 3, 5, 1"
                  maxLength={100}
                />
              </div>
              {error && <div className="algo-error visible">{error}</div>}
              <div className="buttons">
                <button
                  className="btn-primary"
                  onClick={() => parseAndRun(inputValue)}
                >
                  Run
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="sidebar">
          {step && <WatchPanel vars={watchVars} />}

          {/* Pseudocode */}
          <div className="panel">
            <div className="panel-title">Pseudocode</div>
            <div className="code-panel">
              {PSEUDO_LINES.map((line, idx) => (
                <span
                  key={idx}
                  className={`code-line${step && step.codeLine === idx ? " highlight" : ""}`}
                >
                  {line}
                </span>
              ))}
            </div>
          </div>

          {/* Scenarios */}
          <div className="panel">
            <div className="panel-title">Scenarios</div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.4rem",
              }}
            >
              <div
                style={{ position: "relative", display: "inline-block" }}
                onMouseEnter={() => setTooltipId("random")}
                onMouseLeave={() => setTooltipId(null)}
              >
                <button
                  style={{ width: "100%", textAlign: "left" }}
                  className={activeScenario === "random" ? "btn-primary" : ""}
                  onClick={handleRandom}
                >
                  Random
                </button>
                {tooltipId === "random" && (
                  <div className="scenario-tooltip">
                    Standard unordered array — average-case performance.
                  </div>
                )}
              </div>
              {SCENARIOS.slice(1).map((s) => (
                <div
                  key={s.id}
                  style={{ position: "relative", display: "inline-block" }}
                  onMouseEnter={() => setTooltipId(s.id)}
                  onMouseLeave={() => setTooltipId(null)}
                >
                  <button
                    style={{ width: "100%", textAlign: "left" }}
                    className={activeScenario === s.id ? "btn-primary" : ""}
                    onClick={() => handleScenario(s)}
                  >
                    {s.label}
                  </button>
                  {tooltipId === s.id && (
                    <div className="scenario-tooltip">{s.tooltip}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
