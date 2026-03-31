import { useState, useCallback, useEffect } from "react";
import { Nav } from "@/components/Nav";
import { PlaybackController } from "@/components/PlaybackController";
import { WatchPanel } from "@/components/WatchPanel";
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
  "  compare each neighboring book pair:",
  "    if left book is taller than right:",
  "      swap them",
  "      no_swap = false",
  "  if no_swap: shelf is sorted!",
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
        height: 280,
        padding: "0 0.5rem",
      }}
    >
      {arr.map((val, idx) => {
        const isSorted = idx >= sortedBoundary;
        const isComparing = idx === ci || idx === cj;

        let bg = "#3a3a3a";
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
          label: "left book",
          value: step.comparing[0] >= 0 ? step.arr[step.comparing[0]] : "—",
        },
        {
          label: "right book",
          value: step.comparing[1] >= 0 ? step.arr[step.comparing[1]] : "—",
        },
        {
          label: "no_swap",
          value: step.swapped ? "false" : "true",
          highlight: !step.swapped,
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
          {/* Top row: Analogy + Input side by side */}
          <div
            style={{
              display: "flex",
              gap: "1rem",
              marginBottom: "1.5rem",
              alignItems: "flex-start",
            }}
          >
            {/* Analogy */}
            <fieldset className="bs-fieldset" style={{ flex: "1 1 0" }}>
              <legend className="bs-legend">Analogy</legend>
              <p
                style={{
                  margin: 0,
                  fontSize: "0.9rem",
                  lineHeight: 1.6,
                  color: "var(--text-secondary)",
                }}
              >
                You have a shelf of{" "}
                <strong style={{ color: "var(--text-primary)" }}>
                  books in random order
                </strong>{" "}
                and need to sort them by height. You can only{" "}
                <strong style={{ color: "var(--text-primary)" }}>
                  compare two neighboring books
                </strong>{" "}
                at a time and swap if they&rsquo;re out of order. After each
                full pass, the tallest unsorted book has &ldquo;bubbled&rdquo;
                to its correct position on the right.
              </p>
            </fieldset>

            {/* Scenarios + Custom Input */}
            <fieldset className="bs-fieldset" style={{ flex: "0 0 260px" }}>
              <legend className="bs-legend">Input</legend>

              {/* Custom input — label pill + Run button */}
              <div
                style={{
                  display: "flex",
                  gap: "0.5rem",
                  alignItems: "center",
                  marginBottom: "0.6rem",
                }}
              >
                <div className="bs-array-input-wrap">
                  <label htmlFor="bs-input" className="bs-array-label">
                    Array
                  </label>
                  <input
                    id="bs-input"
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") parseAndRun(inputValue);
                    }}
                    placeholder="38, 27, 43, 3, 9"
                    maxLength={100}
                    className="bs-array-input"
                  />
                </div>
                <button
                  className="btn-primary"
                  style={{
                    padding: "0.3rem 0.65rem",
                    fontSize: "0.8rem",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                  }}
                  onClick={() => parseAndRun(inputValue)}
                >
                  Run
                </button>
              </div>
              {error && (
                <div
                  className="algo-error visible"
                  style={{ marginBottom: "0.4rem" }}
                >
                  {error}
                </div>
              )}

              {/* Divider */}
              <div
                style={{
                  borderTop: "1px solid var(--border)",
                  margin: "0 0 0.5rem",
                }}
              />

              {/* Scenarios — 2×2 horizontal grid */}
              <div className="bs-scenarios-grid">
                {SCENARIOS.map((s) => (
                  <div key={s.id} className="bs-scenario-wrap">
                    <button
                      className={`bs-scenario-btn${activeScenario === s.id ? " active" : ""}`}
                      onClick={
                        s.id === "random"
                          ? handleRandom
                          : () => handleScenario(s)
                      }
                      title={s.tooltip}
                    >
                      {s.label}
                    </button>
                    <div className="bs-scenario-tip">{s.tooltip}</div>
                  </div>
                ))}
              </div>
            </fieldset>
          </div>

          {/* Visualization panel */}
          <div className="panel panel-fieldset">
            <div className="panel-title">Visualization</div>
            {/* Playback bar — above chart */}
            {steps.length > 0 && (
              <PlaybackController
                steps={steps}
                currentStep={currentStep}
                onStep={setCurrentStep}
                onReset={() => setCurrentStep(0)}
              />
            )}

            {/* Explanation — below playback */}
            <div
              className="info"
              style={{ minHeight: "1.5em", margin: "0.5rem 0" }}
            >
              {step?.explanation ?? ""}
            </div>

            {/* Framed chart stage with legend inside */}
            <div
              style={{
                background: "#080808",
                border: "1px solid var(--border)",
                borderRadius: 8,
                padding: "0.75rem 0.5rem 0.5rem",
              }}
            >
              {/* Legend inside frame — top right */}
              <div
                style={{
                  display: "flex",
                  gap: "1rem",
                  alignItems: "center",
                  fontSize: "0.72rem",
                  color: "var(--text-secondary)",
                  marginBottom: "0.5rem",
                  justifyContent: "flex-end",
                  paddingRight: "0.25rem",
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
                    style={{ background: "#3a3a3a", borderColor: "#3a3a3a" }}
                  />
                  Unsorted
                </span>
              </div>

              {step ? (
                <ArrayBars step={step} maxVal={maxVal} />
              ) : (
                <div style={{ height: 280 }} />
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="sidebar">
          {/* Pseudocode first */}
          <div className="panel panel-fieldset">
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

          {/* Watch below */}
          {step && <WatchPanel vars={watchVars} />}
        </div>
      </div>
    </div>
  );
}
