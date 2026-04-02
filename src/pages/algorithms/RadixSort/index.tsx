import { useState, useCallback } from "react";
import { Nav } from "@/components/Nav";
import { AlgorithmComplete } from "@/components/AlgorithmComplete";
import { PlaybackController } from "@/components/PlaybackController";
import { WatchPanel } from "@/components/WatchPanel";
import { ComplexityPopover } from "@/components/ComplexityPopover";
import { AnalogyPanel } from "@/components/AnalogyPanel";
import { ProblemFrame } from "@/components/ProblemFrame";
import { WhyComplexityPanel } from "@/components/WhyComplexityPanel";
import { generateSteps, type RadixSortStep } from "@/lib/algorithms/radix-sort";

const MAX_SIZE = 16;

function randomArray(size: number): number[] {
  return Array.from(
    { length: size },
    () => Math.floor(Math.random() * 999) + 1,
  );
}

function BucketsDisplay({
  buckets,
  highlightBucket,
}: {
  buckets: number[][];
  highlightBucket: number;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(10, 1fr)",
        gap: 4,
        marginTop: "0.5rem",
      }}
    >
      {buckets.map((bucket, i) => (
        <div key={i}>
          <div
            style={{
              fontSize: "0.65rem",
              textAlign: "center",
              color:
                i === highlightBucket
                  ? "var(--cat-sorting)"
                  : "var(--text-muted)",
              marginBottom: 2,
              fontFamily: "var(--font-mono)",
              fontWeight: i === highlightBucket ? 700 : 400,
            }}
          >
            {i}
          </div>
          <div
            style={{
              background:
                i === highlightBucket
                  ? "var(--accent-dim)"
                  : "var(--bg-tertiary)",
              border: `1px solid ${i === highlightBucket ? "var(--accent)" : "var(--border)"}`,
              borderRadius: 4,
              minHeight: 40,
              padding: "4px 2px",
              display: "flex",
              flexDirection: "column",
              gap: 2,
              alignItems: "center",
            }}
          >
            {bucket.map((val, j) => (
              <span
                key={j}
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.62rem",
                  color:
                    i === highlightBucket
                      ? "var(--accent)"
                      : "var(--text-secondary)",
                }}
              >
                {val}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function ArrayDisplay({
  arr,
  highlightIdx,
}: {
  arr: number[];
  highlightIdx: number;
}) {
  return (
    <div
      style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: "0.5rem" }}
    >
      {arr.map((val, i) => (
        <div
          key={i}
          style={{
            background:
              i === highlightIdx ? "var(--cat-sorting)" : "var(--bg-tertiary)",
            border: `1px solid ${i === highlightIdx ? "var(--cat-sorting)" : "var(--border)"}`,
            borderRadius: 4,
            padding: "4px 8px",
            fontFamily: "var(--font-mono)",
            fontSize: "0.75rem",
            color:
              i === highlightIdx
                ? "var(--bg-primary)"
                : "var(--text-secondary)",
            transition: "all 0.15s",
          }}
        >
          {val}
        </div>
      ))}
    </div>
  );
}

export default function RadixSort() {
  const [inputValue, setInputValue] = useState(
    "170, 45, 75, 90, 802, 24, 2, 66",
  );
  const [steps, setSteps] = useState<RadixSortStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState("");

  const parseInput = useCallback((raw: string): number[] | null => {
    const nums = raw
      .split(/[,\s]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
      .map(Number);
    if (nums.some((n) => isNaN(n) || n < 0 || !Number.isInteger(n))) {
      setError("Enter valid non-negative integers separated by commas.");
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
    const result = generateSteps(arr);
    setSteps(result.steps);
    setCurrentStep(0);
  }, [inputValue, parseInput]);

  const handleRandom = useCallback(() => {
    const arr = randomArray(7);
    setInputValue(arr.join(", "));
    const result = generateSteps(arr);
    setSteps(result.steps);
    setCurrentStep(0);
  }, []);

  const step = steps[currentStep];

  const watchVars = step
    ? [
        { label: "phase", value: step.phase },
        { label: "digit position", value: step.digitPosition },
        {
          label: "highlight bucket",
          value: step.highlightBucket >= 0 ? step.highlightBucket : "—",
        },
      ]
    : [];

  return (
    <div className="algo-page" data-category="sorting">
      <Nav showStoryBanner />

      <div className="page-header">
        <div className="title-group">
          <h1>Radix Sort</h1>
          <div className="title-meta">
            <span className="badge">Sorting</span>
            <ComplexityPopover
              best="O(nk)"
              avg="O(nk)"
              worst="O(nk)"
              space="O(n+k)"
              bestNote="n elements, k digits"
              avgNote="k = max digit count"
              worstNote="always O(nk)"
              spaceNote="buckets + aux array"
              why="We make k passes (one per digit). Each pass processes n numbers. k = log₁₀(max) ≈ constant for bounded integers, so effectively O(n) in practice."
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
              <p>An array of non-negative integers</p>
            </div>
            <div className="app-section">
              <span className="app-label">Goal</span>
              <p>
                Sort by processing one digit position at a time (least
                significant first), using stable counting-sort buckets at each
                pass.
              </p>
            </div>
            <div className="app-section">
              <span className="app-label">Real use cases</span>
              <p>
                Sorting fixed-length keys (IP addresses, phone numbers, ZIP
                codes), suffix arrays in bioinformatics, GPU sorting.
              </p>
            </div>
          </ProblemFrame>

          <WhyComplexityPanel derivation="LSD Radix Sort makes d passes where d = number of digits in the largest number. Each pass is O(n) using counting sort. So total time = O(d × n) = O(nk). For 32-bit integers, k ≤ 10, making this practically O(n). Space O(n + 10) = O(n) for buckets." />

          <AnalogyPanel>
            Think of sorting a pile of postal codes. First sort by the last
            digit, keeping ties in original order. Then sort by the
            second-to-last digit. After sorting by each digit from right to
            left, the whole pile is sorted — no comparisons needed!
          </AnalogyPanel>

          <div className="panel">
            <div className="controls">
              <div className="inputs">
                <label htmlFor="rs-input">Array (non-negative integers)</label>
                <input
                  id="rs-input"
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  maxLength={120}
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
                <div
                  style={{
                    marginTop: "1rem",
                    marginBottom: "0.5rem",
                    fontSize: "0.72rem",
                    color: "var(--text-muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}
                >
                  Current Array
                </div>
                <ArrayDisplay arr={step.arr} highlightIdx={step.highlightIdx} />

                <div
                  style={{
                    marginTop: "1rem",
                    marginBottom: "0.5rem",
                    fontSize: "0.72rem",
                    color: "var(--text-muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}
                >
                  Buckets (digit position: {step.digitPosition})
                </div>
                <BucketsDisplay
                  buckets={step.buckets}
                  highlightBucket={step.highlightBucket}
                />

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
            <div className="panel-title">Pseudocode (LSD Radix Sort)</div>
            <div className="code-panel">
              {[
                "function radixSort(arr):",
                "  maxDigits = digitCount(max(arr))",
                "  for d = 0 to maxDigits - 1:",
                "    buckets = [[] * 10]",
                "    for num in arr:",
                "      digit = getDigit(num, d)",
                "      buckets[digit].append(num)",
                "    arr = flatten(buckets)",
                "  return arr",
                "",
                "getDigit(n, d) = floor(n / 10^d) % 10",
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
