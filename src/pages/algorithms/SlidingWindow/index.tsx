import { useState, useCallback, useRef, useEffect } from "react";
import { Nav } from "@/components/Nav";
import { PlaybackController } from "@/components/PlaybackController";
import { WatchPanel } from "@/components/WatchPanel";
import { ComplexityPopover } from "@/components/ComplexityPopover";
import { AnalogyPanel } from "@/components/AnalogyPanel";
import { ProblemFrame } from "@/components/ProblemFrame";
import { WhyComplexityPanel } from "@/components/WhyComplexityPanel";
import {
  maxSumFixedWindow,
  longestUniqueSubstring,
  MAX_ARRAY_SIZE,
  MAX_STRING_LENGTH,
  type FixedWindowStep,
  type UniqueSubstringStep,
} from "@/lib/algorithms/sliding-window";
import "@/styles/sliding-window.css";

const DEFAULT_ARRAY = [2, 1, 5, 1, 3, 2];
const DEFAULT_K = 3;
const DEFAULT_STRING = "abcabcbb";

type SWMode = "fixed" | "unique";

const PSEUDO: Record<SWMode, string[]> = {
  fixed: [
    "maxSumFixedWindow(arr, k):",
    "  sum first k elements",
    "  for i in k..n:",
    "    sum += arr[i] - arr[i-k]",
    "    update maxSum if sum > maxSum",
    "  return maxSum, windowStart",
  ],
  unique: [
    "longestUnique(s):",
    "  left = 0, freq = {}",
    "  for right in 0..n:",
    "    freq[s[right]]++",
    "    while freq[s[right]] > 1:",
    "      freq[s[left]]--, left++",
    "    update longest if right-left+1 > longest",
  ],
};

// --- Fixed window array viz ---

function FixedWindowViz({
  arr,
  step,
}: {
  arr: number[];
  step?: FixedWindowStep;
}) {
  const left = step?.left ?? 0;
  const right = step?.right ?? 0;

  return (
    <div className="sw-array-row">
      {arr.map((val, i) => {
        const inWindow = step ? i >= left && i <= right : false;
        const isLeft = i === left;
        const isRight = i === right;
        return (
          <div
            key={i}
            className={`sw-cell${inWindow ? " sw-cell-window" : ""}${isLeft ? " sw-cell-left" : ""}${isRight ? " sw-cell-right" : ""}${step?.isMax && inWindow ? " sw-cell-max" : ""}`}
          >
            <span className="sw-cell-val">{val}</span>
            <span className="sw-cell-idx">{i}</span>
          </div>
        );
      })}
    </div>
  );
}

// --- Unique substring viz ---

function UniqueWindowViz({
  str,
  step,
}: {
  str: string;
  step?: UniqueSubstringStep;
}) {
  const left = step?.left ?? 0;
  const right = step?.right ?? 0;

  return (
    <div className="sw-array-row">
      {str.split("").map((ch, i) => {
        const inWindow = step ? i >= left && i <= right : false;
        const isLeft = i === left;
        const isRight = i === right;
        const isLongestStart = step?.isLongest && i === step.longestStart;
        const inLongest =
          step?.isLongest &&
          i >= step.longestStart &&
          i < step.longestStart + step.longestLen;

        return (
          <div
            key={i}
            className={`sw-cell${inWindow ? " sw-cell-window" : ""}${isLeft ? " sw-cell-left" : ""}${isRight ? " sw-cell-right" : ""}${inLongest ? " sw-cell-max" : ""}${isLongestStart ? " sw-cell-longest-start" : ""}`}
          >
            <span className="sw-cell-val sw-cell-char">{ch}</span>
            <span className="sw-cell-idx">{i}</span>
          </div>
        );
      })}
    </div>
  );
}

type AnyStep = FixedWindowStep | UniqueSubstringStep;

export default function SlidingWindowPage() {
  const [mode, setMode] = useState<SWMode>("fixed");
  const [arrayInput, setArrayInput] = useState(DEFAULT_ARRAY.join(", "));
  const [kInput, setKInput] = useState(String(DEFAULT_K));
  const [stringInput, setStringInput] = useState(DEFAULT_STRING);
  const [error, setError] = useState("");
  const [arr, setArr] = useState<number[]>(DEFAULT_ARRAY);
  const [str, setStr] = useState(DEFAULT_STRING);
  const [steps, setSteps] = useState<AnyStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [bestResult, setBestResult] = useState<string>("-");
  const hasInit = useRef(false);

  useEffect(() => {
    if (hasInit.current) return;
    hasInit.current = true;
    const res = maxSumFixedWindow(DEFAULT_ARRAY, DEFAULT_K);
    setSteps(res.steps);
    setCurrentStep(0);
    setBestResult(`max sum = ${res.maxSum}`);
  }, []);

  const handleSolve = useCallback(() => {
    setError("");
    if (mode === "fixed") {
      const nums = arrayInput
        .split(",")
        .map((s) => parseInt(s.trim(), 10))
        .filter((n) => !isNaN(n));
      const k = parseInt(kInput, 10);
      if (nums.length === 0 || nums.length > MAX_ARRAY_SIZE) {
        setError(`Enter 1–${MAX_ARRAY_SIZE} numbers.`);
        return;
      }
      if (isNaN(k) || k < 1 || k > nums.length) {
        setError(`k must be between 1 and ${nums.length}.`);
        return;
      }
      setArr(nums);
      const res = maxSumFixedWindow(nums, k);
      setSteps(res.steps);
      setCurrentStep(0);
      setBestResult(
        `max sum = ${res.maxSum} (window starts at ${res.windowStart})`,
      );
    } else {
      const s = stringInput.trim();
      if (!s || s.length > MAX_STRING_LENGTH) {
        setError(`Enter a string of 1–${MAX_STRING_LENGTH} characters.`);
        return;
      }
      setStr(s);
      const res = longestUniqueSubstring(s);
      setSteps(res.steps);
      setCurrentStep(0);
      setBestResult(`"${res.longest}" (length ${res.length})`);
    }
  }, [mode, arrayInput, kInput, stringInput]);

  const handleModeChange = useCallback((m: SWMode) => {
    setMode(m);
    setSteps([]);
    setCurrentStep(0);
    setBestResult("-");
    setError("");
  }, []);

  const handleReset = useCallback(() => {
    setMode("fixed");
    setArrayInput(DEFAULT_ARRAY.join(", "));
    setKInput(String(DEFAULT_K));
    setStringInput(DEFAULT_STRING);
    setArr(DEFAULT_ARRAY);
    setStr(DEFAULT_STRING);
    const res = maxSumFixedWindow(DEFAULT_ARRAY, DEFAULT_K);
    setSteps(res.steps);
    setCurrentStep(0);
    setBestResult(`max sum = ${res.maxSum}`);
    setError("");
  }, []);

  const handleStepReset = useCallback(() => setCurrentStep(0), []);

  const step = steps[currentStep] as
    | (FixedWindowStep & UniqueSubstringStep)
    | undefined;
  const fixedStep =
    mode === "fixed" ? (step as FixedWindowStep | undefined) : undefined;
  const uniqueStep =
    mode === "unique" ? (step as UniqueSubstringStep | undefined) : undefined;

  const currentWindow = step ? `[${step.left}, ${step.right}]` : "-";
  const currentVal = fixedStep
    ? String(fixedStep.sum)
    : uniqueStep
      ? String(uniqueStep.right - uniqueStep.left + 1)
      : "-";

  const watchVars = [
    { label: "mode", value: mode === "fixed" ? "max sum" : "longest unique" },
    { label: "window", value: currentWindow },
    {
      label: mode === "fixed" ? "current sum" : "current length",
      value: currentVal,
    },
    { label: "best", value: bestResult },
  ];

  return (
    <div className="algo-page" data-category="ds">
      <Nav
        currentCategory="ds"
        algorithmProgressPath="/algorithms/sliding-window"
      />

      <div className="page-header">
        <div className="title-group">
          <h1>Sliding Window</h1>
          <div className="title-meta">
            <span className="badge">Data Structures</span>
            <ComplexityPopover
              best="O(n)"
              avg="O(n)"
              worst="O(n)"
              space="O(1)"
              bestNote="Single pass through array/string"
              avgNote="Each element enters and exits window once"
              worstNote="Still O(n) — left pointer only moves right"
              spaceNote="O(k) for fixed window, O(alphabet) for unique"
              why="In the sliding window technique, each element is added and removed at most once. The right pointer advances n times total. The left pointer also advances at most n times total. Combined: O(2n) = O(n). This avoids the O(n²) of checking every subarray from scratch."
            />
          </div>
        </div>
        <div className="sw-mode-selector">
          <button
            type="button"
            className={`sw-mode-btn${mode === "fixed" ? " active" : ""}`}
            onClick={() => handleModeChange("fixed")}
          >
            Max Sum Fixed
          </button>
          <button
            type="button"
            className={`sw-mode-btn${mode === "unique" ? " active" : ""}`}
            onClick={() => handleModeChange("unique")}
          >
            Longest Unique
          </button>
        </div>
      </div>

      <div className="content-grid">
        <div className="main-column">
          <ProblemFrame title="The Problem">
            <div className="app-section">
              <span className="app-label">Given</span>
              <p>
                {mode === "fixed"
                  ? "An array of integers and a window size k."
                  : "A string of characters."}
              </p>
            </div>
            <div className="app-section">
              <span className="app-label">Goal</span>
              <p>
                {mode === "fixed"
                  ? "Find the contiguous subarray of length k with the maximum sum in O(n) by sliding a window across the array."
                  : "Find the longest substring with all unique characters in O(n) by expanding the window right and shrinking from the left when a duplicate appears."}
              </p>
            </div>
            <div className="app-section">
              <span className="app-label">Real use cases</span>
              <p>
                Network packet analysis (rate in fixed window), substring
                search, DNA sequence analysis, moving averages in finance, and
                maximum subarray problems.
              </p>
            </div>
          </ProblemFrame>

          <WhyComplexityPanel derivation="Naive approaches check every subarray: O(n²) for max sum, O(n³) for longest unique. Sliding window avoids recomputation: the fixed window slides one step at a time — add the new element, remove the departed one: O(1) per step, O(n) total. The variable window (unique chars) moves left only when needed — each element is added once and removed once: O(2n) = O(n)." />

          <AnalogyPanel>
            Like looking through a train window — as the train moves, you see
            new scenery ahead and lose sight of what's behind. You never need to
            re-examine what you've already passed; the view updates
            incrementally.
          </AnalogyPanel>

          <div className="panel">
            <div className="controls">
              <div className="inputs">
                {mode === "fixed" ? (
                  <>
                    <label htmlFor="sw-array">
                      Array (comma-separated)
                      <input
                        id="sw-array"
                        type="text"
                        value={arrayInput}
                        maxLength={100}
                        onChange={(e) => setArrayInput(e.target.value)}
                        placeholder="e.g. 2, 1, 5, 1, 3, 2"
                      />
                    </label>
                    <label htmlFor="sw-k">
                      Window size k
                      <input
                        id="sw-k"
                        type="number"
                        value={kInput}
                        min={1}
                        max={MAX_ARRAY_SIZE}
                        onChange={(e) => setKInput(e.target.value)}
                        style={{ width: "70px" }}
                      />
                    </label>
                  </>
                ) : (
                  <label htmlFor="sw-string">
                    String
                    <input
                      id="sw-string"
                      type="text"
                      value={stringInput}
                      maxLength={MAX_STRING_LENGTH}
                      onChange={(e) => setStringInput(e.target.value)}
                      placeholder="e.g. abcabcbb"
                    />
                  </label>
                )}
              </div>
              {error && <div className="algo-error visible">{error}</div>}
              <div className="buttons">
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleSolve}
                >
                  Solve
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleReset}
                >
                  Reset
                </button>
              </div>
            </div>

            {step && (
              <div className="sw-step-info">
                {mode === "fixed" && fixedStep
                  ? `Window [${fixedStep.left}, ${fixedStep.right}] — sum = ${fixedStep.sum}${fixedStep.isMax ? " (new max!)" : ""}`
                  : uniqueStep
                    ? `Window [${uniqueStep.left}, ${uniqueStep.right}] char='${uniqueStep.char}'${uniqueStep.isLongest ? " (new longest!)" : ""}`
                    : ""}
              </div>
            )}

            {mode === "fixed" ? (
              <FixedWindowViz arr={arr} step={fixedStep} />
            ) : (
              <UniqueWindowViz str={str} step={uniqueStep} />
            )}

            {steps.length > 0 && (
              <>
                <div className="sw-result-row">
                  <span className="sw-result-label">Best:</span>
                  <span className="sw-result-val">{bestResult}</span>
                </div>

                <PlaybackController
                  steps={steps}
                  currentStep={currentStep}
                  onStep={setCurrentStep}
                  onReset={handleStepReset}
                />
              </>
            )}
          </div>
        </div>

        <div className="sidebar">
          <WatchPanel vars={watchVars} />

          <div className="panel">
            <div className="panel-title">Pseudocode</div>
            <div className="code-panel">
              {PSEUDO[mode].map((line, idx) => (
                <span
                  key={idx}
                  className={`code-line${
                    step && idx >= 2 && idx <= 4 ? " highlight" : ""
                  }`}
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
