import { useState, useCallback, useMemo, useEffect } from "react";
import { Nav } from "@/components/Nav";
import { PlaybackController } from "@/components/PlaybackController";
import { WatchPanel } from "@/components/WatchPanel";
import { ComplexityPopover } from "@/components/ComplexityPopover";
import { AnalogyPanel } from "@/components/AnalogyPanel";
import { ProblemFrame } from "@/components/ProblemFrame";
import { WhyComplexityPanel } from "@/components/WhyComplexityPanel";
import { search, type BinarySearchStep } from "@/lib/algorithms/binary-search";
import "@/styles/binary-search.css";

const DEFAULT_VALUES = "2, 5, 8, 12, 16, 23, 38, 42, 56, 72, 91";
const DEFAULT_TARGET = "23";
const MAX_ARRAY_SIZE = 30;
const MAX_VALUE = 9999;

const PSEUDO_LINES = [
  "low = 0, high = n - 1",
  "while low <= high:",
  "  mid = (low + high) / 2",
  "  if arr[mid] == target:",
  "    return mid",
  "  else if arr[mid] < target:",
  "    low = mid + 1",
  "  else:",
  "    high = mid - 1",
  "return -1 // not found",
];

function buildEliminatedUpTo(
  steps: BinarySearchStep[],
  upToIdx: number,
): Set<number> {
  const eliminated = new Set<number>();
  for (let i = 0; i <= upToIdx; i++) {
    const s = steps[i];
    if (s.eliminated === "left" && s.low >= 0 && s.mid >= 0) {
      for (let j = s.low; j <= s.mid; j++) eliminated.add(j);
    } else if (s.eliminated === "right" && s.mid >= 0 && s.high >= 0) {
      for (let j = s.mid; j <= s.high; j++) eliminated.add(j);
    }
  }
  return eliminated;
}

function pseudoHighlight(step: BinarySearchStep | undefined): number {
  if (!step) return -1;
  if (step.comparison === "equal") return 3;
  if (step.comparison === "less") return 5;
  if (step.comparison === "greater") return 7;
  if (step.comparison === "none" && !step.found) return 9;
  return 2;
}

function randomSortedArray(): { arr: number[]; target: number } {
  const size = Math.max(2, Math.min(MAX_ARRAY_SIZE, 11));
  const arr: number[] = [];
  let val = Math.floor(Math.random() * 5) + 1;
  for (let i = 0; i < size; i++) {
    arr.push(val);
    val += Math.floor(Math.random() * 8) + 1;
  }
  const target =
    Math.random() < 0.7
      ? arr[Math.floor(Math.random() * arr.length)]!
      : Math.floor(Math.random() * (arr[arr.length - 1]! + 10)) + 1;
  return { arr, target };
}

function analogyText(step: BinarySearchStep | undefined): string {
  if (!step) {
    return "Imagine searching for a word in a dictionary. You open to the middle page, check if your word comes before or after, then eliminate half the dictionary with each comparison.";
  }
  if (step.comparison === "equal") {
    return `You opened the dictionary to page ${step.mid} and found the word! Search complete.`;
  }
  if (step.comparison === "greater") {
    return `Page ${step.mid} shows "${step.arr[step.mid]}", which comes AFTER "${step.target}". Flip to the LEFT half of remaining pages.`;
  }
  if (step.comparison === "less") {
    return `Page ${step.mid} shows "${step.arr[step.mid]}", which comes BEFORE "${step.target}". Flip to the RIGHT half of remaining pages.`;
  }
  return "The word is not in this dictionary. All pages checked.";
}

function ArrayViz({
  arr,
  step,
  eliminated,
}: {
  arr: number[];
  step: BinarySearchStep | undefined;
  eliminated: Set<number>;
}) {
  return (
    <>
      <div className="bsrch-array-container">
        {arr.map((v, i) => {
          let cellClass = "bsrch-cell";
          if (step) {
            if (step.found && step.mid === i) cellClass += " bsrch-found";
            else if (step.mid === i && step.comparison !== "none")
              cellClass += " bsrch-mid";
            else if (eliminated.has(i)) cellClass += " bsrch-eliminated";
            else if (
              step.low >= 0 &&
              step.high >= 0 &&
              i >= step.low &&
              i <= step.high
            )
              cellClass += " bsrch-active";
            else if (step.low >= 0 || step.high >= 0)
              cellClass += " bsrch-eliminated";
            if (step.target !== undefined && v === step.target && !step.found)
              cellClass += " bsrch-target-marker";
          }
          return (
            <div key={i} className={cellClass}>
              <span className="bsrch-value">{v}</span>
              <span className="bsrch-index">{i}</span>
            </div>
          );
        })}
      </div>
      <div className="bsrch-pointers">
        {step && step.low >= 0
          ? arr.map((_, i) => {
              const labels: string[] = [];
              if (i === step.low) labels.push("low");
              if (i === step.mid) labels.push("mid");
              if (i === step.high) labels.push("high");
              return (
                <div key={i} className="bsrch-pointer-slot">
                  {labels.map((lbl) => (
                    <span
                      key={lbl}
                      className={`bsrch-pointer-label bsrch-${lbl}-label`}
                    >
                      {lbl}
                    </span>
                  ))}
                </div>
              );
            })
          : null}
      </div>
    </>
  );
}

export default function BinarySearchPage() {
  const [valuesInput, setValuesInput] = useState(DEFAULT_VALUES);
  const [targetInput, setTargetInput] = useState(DEFAULT_TARGET);
  const [sortedArr, setSortedArr] = useState<number[]>([]);
  const [steps, setSteps] = useState<BinarySearchStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [found, setFound] = useState(false);
  const [foundIndex, setFoundIndex] = useState(-1);
  const [needle, setNeedle] = useState(Number(DEFAULT_TARGET));
  const [error, setError] = useState("");
  const [sortNote, setSortNote] = useState(false);

  const step = steps.length > 0 ? steps[currentStep] : undefined;
  const eliminated = useMemo<Set<number>>(
    () =>
      steps.length
        ? buildEliminatedUpTo(steps, currentStep)
        : new Set<number>(),
    [steps, currentStep],
  );

  const parseValues = useCallback((raw: string): number[] | null => {
    const t = raw.trim();
    if (!t.length) {
      setError("Enter at least one value.");
      return null;
    }
    const nums = t
      .split(/[,\s]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
      .map(Number);
    if (nums.some((n) => !Number.isFinite(n))) {
      setError("Enter valid numbers separated by commas or spaces.");
      return null;
    }
    if (nums.length > MAX_ARRAY_SIZE) {
      setError(`Maximum ${MAX_ARRAY_SIZE} numbers.`);
      return null;
    }
    setError("");
    return nums;
  }, []);

  const parseTarget = useCallback((raw: string): number | null => {
    const n = Number(raw);
    if (!Number.isFinite(n)) {
      setError("Target must be a valid number.");
      return null;
    }
    if (Math.abs(n) > MAX_VALUE) {
      setError(`Target must be between -${MAX_VALUE} and ${MAX_VALUE}.`);
      return null;
    }
    return n;
  }, []);

  const runSearch = useCallback(() => {
    const nums = parseValues(valuesInput);
    if (!nums) return;
    const target = parseTarget(targetInput);
    if (target === null) return;

    const sorted = [...nums].sort((a, b) => a - b);
    const inputSorted = nums.every((v, i) => i === 0 || nums[i - 1]! <= v);
    setSortNote(!inputSorted);
    setValuesInput(sorted.join(", "));

    const result = search(sorted, target);
    setSortedArr(sorted);
    setSteps(result.steps);
    setCurrentStep(0);
    setFound(result.found);
    setFoundIndex(result.foundIndex);
    setNeedle(target);
    setError("");
  }, [valuesInput, targetInput, parseValues, parseTarget]);

  const handleRandom = useCallback(() => {
    const { arr, target } = randomSortedArray();
    setValuesInput(arr.join(", "));
    setTargetInput(String(target));
    const sorted = [...arr].sort((a, b) => a - b);
    const result = search(sorted, target);
    setSortedArr(sorted);
    setSteps(result.steps);
    setCurrentStep(0);
    setFound(result.found);
    setFoundIndex(result.foundIndex);
    setNeedle(target);
    setSortNote(false);
    setError("");
  }, []);

  const handleReset = useCallback(() => {
    setCurrentStep(0);
  }, []);

  // Match vanilla pages: run once on load with default inputs.
  useEffect(() => {
    const nums = DEFAULT_VALUES.split(/[,\s]+/)
      .map((s) => s.trim())
      .filter(Boolean)
      .map(Number);
    const target = Number(DEFAULT_TARGET);
    if (nums.some((n) => !Number.isFinite(n)) || !Number.isFinite(target))
      return;
    const sorted = [...nums].sort((a, b) => a - b);
    const result = search(sorted, target);
    setSortedArr(sorted);
    setSteps(result.steps);
    setCurrentStep(0);
    setFound(result.found);
    setFoundIndex(result.foundIndex);
    setNeedle(target);
    setSortNote(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional one-shot init
  }, []);

  const codeLine = pseudoHighlight(step);

  const watchVars = step
    ? [
        {
          label: "left",
          value: step.low >= 0 ? String(step.low) : "—",
        },
        {
          label: "right",
          value: step.high >= 0 ? String(step.high) : "—",
        },
        {
          label: "mid",
          value: step.mid >= 0 ? String(step.mid) : "—",
          highlight: step.mid >= 0,
        },
        {
          label: "arr[mid]",
          value: step.mid >= 0 && step.arr ? String(step.arr[step.mid]) : "—",
          highlight: step.mid >= 0,
        },
        {
          label: "result",
          value: step.found
            ? "found!"
            : step.comparison === "greater"
              ? "too high → go left"
              : step.comparison === "less"
                ? "too low → go right"
                : step.comparison === "none"
                  ? "not found"
                  : "—",
          highlight:
            step.found ||
            step.comparison === "greater" ||
            step.comparison === "less",
        },
      ]
    : [];

  const remaining =
    step && step.low >= 0 && step.high >= 0 && step.high >= step.low
      ? step.found
        ? 1
        : step.high - step.low + 1
      : 0;

  return (
    <div className="algo-page" data-category="searching">
      <Nav currentCategory="searching" />

      <div className="page-header">
        <div className="title-group">
          <h1>Binary Search</h1>
          <div className="title-meta">
            <span className="badge">Searching</span>
            <ComplexityPopover
              best="O(1)"
              avg="O(log n)"
              worst="O(log n)"
              space="O(1)"
              bestNote="Target is middle"
              avgNote="Random target"
              worstNote="Target at edge"
              spaceNote="In-place"
              why="Each comparison eliminates half the remaining elements. Starting from n, halving log₂ n times reaches 1. Total: O(log n) steps."
            />
          </div>
        </div>
        <div className="bsrch-legend">
          <span>
            <span className="swatch bsrch-inactive-swatch" /> Inactive
          </span>
          <span>
            <span className="swatch bsrch-active-swatch" /> Search space
          </span>
          <span>
            <span className="swatch bsrch-mid-swatch" /> Mid (checking)
          </span>
          <span>
            <span className="swatch bsrch-found-swatch" /> Found
          </span>
          <span>
            <span className="swatch bsrch-eliminated-swatch" /> Eliminated
          </span>
          <span>
            <span className="swatch bsrch-target-swatch" /> Target
          </span>
        </div>
      </div>

      <div className="content-grid">
        <div className="main-column">
          <ProblemFrame title="The Problem">
            <div className="app-section">
              <span className="app-label">Given</span>
              <p>
                A sorted list of values and a target to find (or confirm
                absent).
              </p>
            </div>
            <div className="app-section">
              <span className="app-label">Goal</span>
              <p>
                Locate the target in O(log n) comparisons by repeatedly halving
                the search interval.
              </p>
            </div>
            <div className="app-section">
              <span className="app-label">Real use cases</span>
              <p>
                Fast lookup in sorted collections, database index seeks, and
                numeric root-finding.
              </p>
            </div>
          </ProblemFrame>

          <WhyComplexityPanel derivation="At each step you compare against the middle element and discard half of the remaining indices. After k steps, at most n/2^k elements remain. Solving n/2^k ≤ 1 gives k ≈ log₂ n, so time is O(log n). Only index variables are stored: O(1) extra space." />

          <AnalogyPanel>
            <strong>Real-world analogy:</strong> Looking up a word in a
            dictionary — you open to the middle page, see if your word comes
            before or after, then eliminate half the book with each comparison.
          </AnalogyPanel>

          <div className="panel">
            <div className="controls">
              <div className="inputs">
                <label htmlFor="bsrch-values">
                  Sorted values
                  <input
                    id="bsrch-values"
                    type="text"
                    value={valuesInput}
                    onChange={(e) => setValuesInput(e.target.value)}
                    placeholder="e.g. 1, 3, 5, 7, 9"
                    maxLength={400}
                  />
                </label>
                <label htmlFor="bsrch-target">
                  Target
                  <input
                    id="bsrch-target"
                    type="number"
                    value={targetInput}
                    onChange={(e) => setTargetInput(e.target.value)}
                    min={-MAX_VALUE}
                    max={MAX_VALUE}
                  />
                </label>
              </div>
              {sortNote && (
                <p
                  style={{
                    marginTop: "0.5rem",
                    fontSize: "0.85rem",
                    color: "var(--text-secondary)",
                  }}
                >
                  Values were sorted ascending for binary search (input
                  reordered to match).
                </p>
              )}
              {error && <div className="algo-error visible">{error}</div>}
              <div className="buttons">
                <button
                  type="button"
                  className="btn-primary"
                  onClick={runSearch}
                >
                  Search
                </button>
                <button type="button" onClick={handleRandom}>
                  Random
                </button>
              </div>
            </div>

            {steps.length > 0 && sortedArr.length > 0 && (
              <>
                <div className="bsrch-analogy">
                  <strong>Dictionary analogy: </strong>
                  {analogyText(step)}
                </div>

                <ArrayViz arr={sortedArr} step={step} eliminated={eliminated} />

                {step && (
                  <div className="info" style={{ marginTop: "0.75rem" }}>
                    {step.explanation}
                  </div>
                )}

                {currentStep >= steps.length - 1 && (
                  <div className="result" style={{ marginTop: "0.75rem" }}>
                    {found
                      ? `Found ${needle} at index ${foundIndex} in ${Math.max(0, steps.length - 1)} step(s).`
                      : `Target ${needle} not found after ${Math.max(0, steps.length - 1)} step(s).`}
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
          {step && (
            <div className="stats-grid" style={{ marginBottom: "1rem" }}>
              <div className="stat-card">
                <span className="stat-value">{step.step}</span>
                <span className="stat-label">Steps</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">{remaining}</span>
                <span className="stat-label">Remaining</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">
                  {currentStep + 1} / {steps.length}
                </span>
                <span className="stat-label">Step</span>
              </div>
            </div>
          )}

          {step && <WatchPanel vars={watchVars} />}

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
