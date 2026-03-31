import { useState, useCallback, useEffect, useMemo } from "react";
import { Nav } from "@/components/Nav";
import { PlaybackController } from "@/components/PlaybackController";
import { WatchPanel } from "@/components/WatchPanel";
import { ComplexityPopover } from "@/components/ComplexityPopover";
import { AnalogyPanel } from "@/components/AnalogyPanel";
import { ProblemFrame } from "@/components/ProblemFrame";
import { WhyComplexityPanel } from "@/components/WhyComplexityPanel";
import {
  solve,
  type KnapsackStep,
  type KnapsackItem,
  type KnapsackResult,
} from "@/lib/algorithms/knapsack";
import "@/styles/knapsack.css";

const DEFAULT_ITEMS: KnapsackItem[] = [
  { weight: 2, value: 3 },
  { weight: 3, value: 4 },
  { weight: 4, value: 5 },
  { weight: 5, value: 6 },
];
const DEFAULT_CAPACITY = 7;
const MAX_ITEMS = 10;
const MAX_CAPACITY = 50;
const MAX_WEIGHT = 50;
const MAX_VALUE = 100;

const PSEUDO_LINES = [
  "for i from 1 to n:",
  "  for w from 0 to W:",
  "    if wt[i] > w:",
  "      dp[i][w] = dp[i-1][w]",
  "    else:",
  "      dp[i][w] = max(",
  "        dp[i-1][w],",
  "        dp[i-1][w-wt[i]] + val[i]",
  "      )",
];

function pseudoHighlight(step: KnapsackStep | undefined): number {
  if (!step) return -1;
  if (!step.take) return 3;
  return 7;
}

function buildFilledSet(steps: KnapsackStep[], upToIdx: number): Set<string> {
  const filled = new Set<string>();
  for (let i = 0; i <= upToIdx; i++) {
    const s = steps[i];
    if (s) filled.add(`${s.row},${s.col}`);
  }
  return filled;
}

interface DPTableProps {
  items: KnapsackItem[];
  capacity: number;
  dp: number[][];
  steps: KnapsackStep[];
  currentStep: number;
  result: KnapsackResult | null;
  showTraceback: boolean;
}

function DPTable({
  items,
  capacity,
  dp,
  steps,
  currentStep,
  result,
  showTraceback,
}: DPTableProps) {
  const currentStepData = steps.length > 0 ? steps[currentStep] : undefined;

  const filledSet = useMemo(
    () => buildFilledSet(steps, currentStep),
    [steps, currentStep],
  );

  const tracebackSet = useMemo(() => {
    const s = new Set<string>();
    if (showTraceback && result) {
      result.traceback.path.forEach((p) => s.add(`${p.row},${p.col}`));
    }
    return s;
  }, [showTraceback, result]);

  const cols = capacity + 1;
  const rows = items.length + 1;

  return (
    <div className="ks-table-wrapper">
      <table className="ks-table">
        <thead>
          <tr>
            <th className="ks-row-header">Item</th>
            {Array.from({ length: cols }, (_, w) => (
              <th key={w}>{w}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }, (_, rowIdx) => (
            <tr key={rowIdx}>
              <th className="ks-row-header">
                {rowIdx === 0
                  ? "0 (base)"
                  : `${rowIdx} (w=${items[rowIdx - 1]!.weight},v=${items[rowIdx - 1]!.value})`}
              </th>
              {Array.from({ length: cols }, (_, colIdx) => {
                const key = `${rowIdx},${colIdx}`;
                const isCurrent =
                  currentStepData?.row === rowIdx &&
                  currentStepData?.col === colIdx;
                const isTraceback = tracebackSet.has(key);
                const isFilled = filledSet.has(key);
                const stepForCell =
                  isFilled && !isCurrent
                    ? steps.find((s) => s.row === rowIdx && s.col === colIdx)
                    : undefined;

                let cellClass = "";
                if (rowIdx === 0) {
                  cellClass = "ks-base";
                } else if (isFilled || isCurrent) {
                  if (isCurrent) {
                    cellClass = currentStepData?.take ? "ks-take" : "ks-skip";
                  } else if (stepForCell) {
                    cellClass = stepForCell.take ? "ks-take" : "ks-skip";
                  }
                } else {
                  cellClass = "ks-empty";
                }

                if (isCurrent) cellClass += " ks-current";
                if (isTraceback) cellClass += " ks-traceback";

                const displayValue =
                  rowIdx === 0
                    ? 0
                    : isFilled || isCurrent
                      ? (dp[rowIdx]?.[colIdx] ?? "")
                      : "";

                return (
                  <td key={colIdx} className={cellClass}>
                    {displayValue !== "" ? String(displayValue) : ""}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function KnapsackPage() {
  const [items, setItems] = useState<KnapsackItem[]>(DEFAULT_ITEMS);
  const [capacityInput, setCapacityInput] = useState(String(DEFAULT_CAPACITY));
  const [steps, setSteps] = useState<KnapsackStep[]>([]);
  const [result, setResult] = useState<KnapsackResult | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState("");

  const currentStepData = steps.length > 0 ? steps[currentStep] : undefined;
  const showTraceback = steps.length > 0 && currentStep >= steps.length - 1;
  const capacity = parseInt(capacityInput, 10);
  const validCapacity =
    Number.isFinite(capacity) && capacity >= 1 && capacity <= MAX_CAPACITY;

  const runSolve = useCallback((itemsToSolve: KnapsackItem[], cap: number) => {
    const parsedCap = cap;
    if (
      !Number.isFinite(parsedCap) ||
      parsedCap < 1 ||
      parsedCap > MAX_CAPACITY
    ) {
      setError(`Capacity must be between 1 and ${MAX_CAPACITY}.`);
      return;
    }
    if (itemsToSolve.length === 0) {
      setError("Add at least one item.");
      return;
    }
    for (let i = 0; i < itemsToSolve.length; i++) {
      const item = itemsToSolve[i]!;
      if (
        !Number.isFinite(item.weight) ||
        item.weight < 1 ||
        item.weight > MAX_WEIGHT
      ) {
        setError(`Item ${i + 1}: weight must be between 1 and ${MAX_WEIGHT}.`);
        return;
      }
      if (
        !Number.isFinite(item.value) ||
        item.value < 1 ||
        item.value > MAX_VALUE
      ) {
        setError(`Item ${i + 1}: value must be between 1 and ${MAX_VALUE}.`);
        return;
      }
    }
    setError("");
    const res = solve(itemsToSolve, parsedCap);
    setResult(res);
    setSteps(res.steps);
    setCurrentStep(0);
  }, []);

  const handleSolve = useCallback(() => {
    const cap = parseInt(capacityInput, 10);
    runSolve(items, cap);
  }, [items, capacityInput, runSolve]);

  const handleReset = useCallback(() => {
    setCurrentStep(0);
  }, []);

  const handleAddItem = useCallback(() => {
    if (items.length >= MAX_ITEMS) return;
    setItems((prev) => [...prev, { weight: 1, value: 1 }]);
  }, [items.length]);

  const handleRemoveItem = useCallback((idx: number) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  }, []);

  const handleItemChange = useCallback(
    (idx: number, field: "weight" | "value", raw: string) => {
      const val = parseInt(raw, 10);
      setItems((prev) =>
        prev.map((item, i) =>
          i === idx
            ? { ...item, [field]: Number.isFinite(val) ? val : 0 }
            : item,
        ),
      );
    },
    [],
  );

  // Run on load with default data
  useEffect(() => {
    runSolve(DEFAULT_ITEMS, DEFAULT_CAPACITY);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional one-shot init
  }, []);

  const codeLine = pseudoHighlight(currentStepData);

  const watchVars = currentStepData
    ? [
        {
          label: "Cell",
          value: `(${currentStepData.row}, ${currentStepData.col})`,
        },
        {
          label: "Item",
          value:
            currentStepData.row > 0
              ? `w=${items[currentStepData.row - 1]?.weight ?? "?"}, v=${items[currentStepData.row - 1]?.value ?? "?"}`
              : "base",
        },
        {
          label: "Decision",
          value: currentStepData.take ? "Take" : "Skip",
          highlight: currentStepData.take,
        },
        {
          label: "Cell Value",
          value: String(currentStepData.value),
          highlight: true,
        },
        {
          label: "Optimal",
          value:
            showTraceback && result ? String(result.traceback.totalValue) : "—",
          highlight: showTraceback,
        },
      ]
    : [];

  return (
    <div className="algo-page" data-category="dp">
      <Nav currentCategory="dp" />

      <div className="page-header">
        <div className="title-group">
          <h1>0/1 Knapsack</h1>
          <div className="title-meta">
            <span className="badge">Dynamic Programming</span>
            <ComplexityPopover
              best="O(nW)"
              avg="O(nW)"
              worst="O(nW)"
              space="O(nW)"
              bestNote="Always fills full DP table"
              avgNote="n items, W capacity"
              worstNote="Always fills full DP table"
              spaceNote="DP table size"
              why="Every cell dp[i][w] requires checking at most two previous cells. With n items and W capacity, we fill n×W cells — each in O(1) time."
            />
          </div>
        </div>
        <div className="ks-legend">
          <span>
            <span className="swatch ks-take-swatch" /> Take
          </span>
          <span>
            <span className="swatch ks-skip-swatch" /> Skip
          </span>
          <span>
            <span className="swatch ks-current-swatch" /> Current
          </span>
          <span>
            <span className="swatch ks-traceback-swatch" /> Traceback
          </span>
        </div>
      </div>

      <div className="content-grid">
        <div className="main-column">
          <ProblemFrame title="The Problem">
            <div className="app-section">
              <span className="app-label">Given</span>
              <p>
                A set of items each with a weight and a value, and a knapsack
                with a maximum weight capacity.
              </p>
            </div>
            <div className="app-section">
              <span className="app-label">Goal</span>
              <p>
                Packing a hiking bag with a weight limit. Each item has a weight
                and value. How do you maximize value?
              </p>
            </div>
            <div className="app-section">
              <span className="app-label">Constraint</span>
              <p>
                Each item is all-or-nothing (0/1) — you cannot take a fraction
                of an item.
              </p>
            </div>
          </ProblemFrame>

          <WhyComplexityPanel derivation="We build a 2D table with (n+1) rows and (W+1) columns. Each cell dp[i][w] is computed in O(1) by looking up two previously filled cells. Total cells: (n+1)×(W+1) ≈ n×W. Time: O(nW). The table itself is the only extra storage: O(nW) space." />

          <AnalogyPanel>
            <strong>Real-world analogy:</strong> Packing a suitcase for a flight
            — you have a weight limit and must choose which items to bring to
            maximize value. Each item is all-or-nothing: you cannot bring half a
            laptop.
          </AnalogyPanel>

          <div className="panel">
            <div className="controls">
              <div className="ks-item-list">
                {items.map((item, idx) => (
                  <div key={idx} className="ks-item-row">
                    <span className="ks-item-label">Item {idx + 1}</span>
                    <label>
                      w=
                      <input
                        type="number"
                        value={item.weight}
                        min={1}
                        max={MAX_WEIGHT}
                        onChange={(e) =>
                          handleItemChange(idx, "weight", e.target.value)
                        }
                      />
                    </label>
                    <label>
                      v=
                      <input
                        type="number"
                        value={item.value}
                        min={1}
                        max={MAX_VALUE}
                        onChange={(e) =>
                          handleItemChange(idx, "value", e.target.value)
                        }
                      />
                    </label>
                    <button
                      type="button"
                      className="ks-btn-remove"
                      onClick={() => handleRemoveItem(idx)}
                      aria-label={`Remove item ${idx + 1}`}
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="ks-btn-add-item"
                  onClick={handleAddItem}
                  disabled={items.length >= MAX_ITEMS}
                >
                  + Add item{" "}
                  {items.length >= MAX_ITEMS ? `(max ${MAX_ITEMS})` : ""}
                </button>
              </div>

              <div className="ks-capacity-row">
                <label htmlFor="ks-capacity">
                  Capacity (max weight)
                  <input
                    id="ks-capacity"
                    type="number"
                    value={capacityInput}
                    min={1}
                    max={MAX_CAPACITY}
                    onChange={(e) => setCapacityInput(e.target.value)}
                  />
                </label>
              </div>

              {error && <div className="algo-error visible">{error}</div>}

              <div className="buttons">
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleSolve}
                  disabled={items.length === 0 || !validCapacity}
                >
                  Solve
                </button>
              </div>
            </div>

            {steps.length > 0 && result && (
              <>
                <DPTable
                  items={items}
                  capacity={capacity}
                  dp={result.dp}
                  steps={steps}
                  currentStep={currentStep}
                  result={result}
                  showTraceback={showTraceback}
                />

                {currentStepData && (
                  <div className="info" style={{ marginTop: "0.75rem" }}>
                    {currentStepData.explanation}
                  </div>
                )}

                {showTraceback && (
                  <div className="ks-result">
                    <div className="ks-result-title">Optimal Solution</div>
                    <div className="ks-result-stats">
                      <div className="ks-result-stat">
                        <span className="ks-result-stat-label">
                          Total Value
                        </span>
                        <span className="ks-result-stat-value">
                          {result.traceback.totalValue}
                        </span>
                      </div>
                      <div className="ks-result-stat">
                        <span className="ks-result-stat-label">
                          Total Weight
                        </span>
                        <span className="ks-result-stat-value">
                          {result.traceback.totalWeight} / {capacity}
                        </span>
                      </div>
                      <div className="ks-result-stat">
                        <span className="ks-result-stat-label">
                          Items Selected
                        </span>
                        <span className="ks-result-stat-value">
                          {result.traceback.selectedItems.length}
                        </span>
                      </div>
                    </div>
                    {result.traceback.selectedItems.length > 0 && (
                      <div className="ks-result-items">
                        {result.traceback.selectedItems.map((itemIdx) => {
                          const item = items[itemIdx];
                          return item ? (
                            <span key={itemIdx} className="ks-selected-badge">
                              Item {itemIdx + 1} (w={item.weight}, v=
                              {item.value})
                            </span>
                          ) : null;
                        })}
                      </div>
                    )}
                  </div>
                )}

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

        <div className="sidebar">
          {currentStepData && (
            <div className="stats-grid" style={{ marginBottom: "1rem" }}>
              <div className="stat-card">
                <span className="stat-value">{currentStep + 1}</span>
                <span className="stat-label">Step</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">{steps.length}</span>
                <span className="stat-label">Total Steps</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">
                  {currentStepData.take ? "Take" : "Skip"}
                </span>
                <span className="stat-label">Decision</span>
              </div>
            </div>
          )}

          {currentStepData && <WatchPanel vars={watchVars} />}

          <div className="panel">
            <div className="panel-title">Pseudocode</div>
            <div className="code-panel">
              {PSEUDO_LINES.map((line, idx) => (
                <span
                  key={idx}
                  className={`code-line${codeLine === idx ? " highlight" : ""}`}
                >
                  {line}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
