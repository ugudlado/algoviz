import { useState, useCallback, useEffect } from "react";
import { Nav } from "@/components/Nav";
import { AlgorithmComplete } from "@/components/AlgorithmComplete";
import { PlaybackController } from "@/components/PlaybackController";
import { WatchPanel } from "@/components/WatchPanel";
import { ComplexityPopover } from "@/components/ComplexityPopover";
import { AnalogyPanel } from "@/components/AnalogyPanel";
import { ProblemFrame } from "@/components/ProblemFrame";
import { WhyComplexityPanel } from "@/components/WhyComplexityPanel";
import { solve, type LcsStep, type LcsResult } from "@/lib/algorithms/lcs";
import "@/styles/lcs.css";

const DEFAULT_STR_A = "ABCBDAB";
const DEFAULT_STR_B = "BDCAB";
const MAX_LEN = 15;

const RANDOM_PAIRS: [string, string][] = [
  ["ABCBDAB", "BDCAB"],
  ["AGGTAB", "GXTXAYB"],
  ["kitten", "sitting"],
  ["sunday", "saturday"],
  ["ACCGGTCG", "GTCGTTCG"],
  ["abcdef", "ace"],
  ["intention", "execution"],
  ["horse", "ros"],
];

const PSEUDO_LINES = [
  "for i from 1 to m:",
  "  for j from 1 to n:",
  "    if A[i-1] == B[j-1]:",
  "      dp[i][j] = dp[i-1][j-1] + 1",
  "    else:",
  "      dp[i][j] = max(dp[i-1][j], dp[i][j-1])",
];

function pseudoHighlight(step: LcsStep | undefined): number {
  if (!step) return -1;
  if (step.isMatch) return 3;
  return 5;
}

function DpTable({
  result,
  strA,
  strB,
  currentStep,
  showTraceback,
}: {
  result: LcsResult;
  strA: string;
  strB: string;
  currentStep: number;
  showTraceback: boolean;
}) {
  const { dp, steps, traceback } = result;
  const m = strA.length;
  const n = strB.length;

  // Build set of filled cells up to currentStep
  const filledCells = new Set<string>();
  for (let i = 0; i <= currentStep && i < steps.length; i++) {
    const s = steps[i]!;
    filledCells.add(`${s.row},${s.col}`);
  }

  // Current step cell
  const currentCell =
    currentStep < steps.length ? steps[currentStep] : undefined;

  // Traceback path set
  const tracebackSet = new Set<string>();
  if (showTraceback) {
    for (const p of traceback.path) {
      tracebackSet.add(`${p.row},${p.col}`);
    }
  }

  return (
    <div className="lcs-table-wrapper">
      <table className="lcs-table" aria-label="LCS DP table">
        <tbody>
          {/* Header row: col indices / B chars */}
          <tr>
            {/* top-left corner */}
            <th />
            {/* empty label column */}
            <th />
            {/* base col header */}
            <th style={{ color: "#555" }}>ε</th>
            {strB.split("").map((ch, j) => (
              <th key={j}>{ch}</th>
            ))}
          </tr>

          {/* Row 0: base row (all zeros) */}
          <tr>
            <th style={{ color: "#555" }}>ε</th>
            {/* row char label */}
            <th />
            {Array.from({ length: n + 1 }, (_, j) => (
              <td key={j} className="lcs-base">
                0
              </td>
            ))}
          </tr>

          {/* Rows 1..m */}
          {Array.from({ length: m }, (_, rowIdx) => {
            const i = rowIdx + 1;
            return (
              <tr key={i}>
                {/* row char label */}
                <th>{strA[rowIdx]}</th>
                {/* base col */}
                <td className="lcs-base">0</td>
                {Array.from({ length: n }, (_, colIdx) => {
                  const j = colIdx + 1;
                  const key = `${i},${j}`;
                  const isFilled = filledCells.has(key);
                  const isCurrent =
                    currentCell?.row === i && currentCell?.col === j;
                  const isTraceback = tracebackSet.has(key);

                  let cellClass = "";
                  if (isFilled) {
                    // Find step to know if it was match
                    const stepIdx = steps.findIndex(
                      (s) => s.row === i && s.col === j,
                    );
                    if (stepIdx !== -1) {
                      cellClass = steps[stepIdx]!.isMatch
                        ? "lcs-match"
                        : "lcs-nomatch";
                    }
                  }
                  if (isCurrent) cellClass += " lcs-current";
                  if (isTraceback) cellClass += " lcs-traceback";

                  return (
                    <td key={j} className={cellClass.trim()}>
                      {isFilled ? dp[i]![j] : ""}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function LcsPage() {
  const [strAInput, setStrAInput] = useState(DEFAULT_STR_A);
  const [strBInput, setStrBInput] = useState(DEFAULT_STR_B);
  const [result, setResult] = useState<LcsResult | null>(null);
  const [activeStrA, setActiveStrA] = useState("");
  const [activeStrB, setActiveStrB] = useState("");
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState("");

  const totalSteps = result ? result.steps.length : 0;
  const isFinished = result !== null && currentStep >= totalSteps - 1;
  const showTraceback = isFinished;

  const step =
    result && result.steps.length > 0 ? result.steps[currentStep] : undefined;

  const validate = useCallback((a: string, b: string): boolean => {
    if (!a.trim() || !b.trim()) {
      setError("Both strings must be non-empty.");
      return false;
    }
    if (a.length > MAX_LEN || b.length > MAX_LEN) {
      setError(`Each string must be at most ${MAX_LEN} characters.`);
      return false;
    }
    setError("");
    return true;
  }, []);

  const runSolve = useCallback(
    (a: string, b: string) => {
      if (!validate(a, b)) return;
      const res = solve(a, b);
      setResult(res);
      setActiveStrA(a);
      setActiveStrB(b);
      setCurrentStep(0);
    },
    [validate],
  );

  const handleSolve = useCallback(() => {
    runSolve(strAInput.trim(), strBInput.trim());
  }, [strAInput, strBInput, runSolve]);

  const handleRandom = useCallback(() => {
    const [a, b] =
      RANDOM_PAIRS[Math.floor(Math.random() * RANDOM_PAIRS.length)]!;
    setStrAInput(a);
    setStrBInput(b);
    runSolve(a, b);
  }, [runSolve]);

  const handleReset = useCallback(() => {
    setCurrentStep(0);
  }, []);

  // Run once on load with default inputs.
  useEffect(() => {
    const res = solve(DEFAULT_STR_A, DEFAULT_STR_B);
    setResult(res);
    setActiveStrA(DEFAULT_STR_A);
    setActiveStrB(DEFAULT_STR_B);
    setCurrentStep(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional one-shot init
  }, []);

  const codeLine = pseudoHighlight(step);

  // Build watch panel vars
  const watchVars = step
    ? [
        {
          label: "Position",
          value: `(${step.row}, ${step.col})`,
        },
        {
          label: "charA",
          value:
            activeStrA.length > 0 ? (activeStrA[step.row - 1] ?? "—") : "—",
        },
        {
          label: "charB",
          value:
            activeStrB.length > 0 ? (activeStrB[step.col - 1] ?? "—") : "—",
        },
        {
          label: "Match",
          value: step.isMatch ? "match!" : "no match",
          highlight: step.isMatch,
        },
        {
          label: "Cell Value",
          value: String(step.value),
          highlight: true,
        },
        {
          label: "LCS Length",
          value: result && isFinished ? String(result.lcsString.length) : "—",
        },
      ]
    : [];

  // Build step-indicator text for the playback-adjacent info panel
  const stepInfo = step ? step.explanation : "";

  return (
    <div className="algo-page" data-category="dp">
      <Nav showStoryBanner />

      <div className="page-header">
        <div className="title-group">
          <h1>Longest Common Subsequence</h1>
          <div className="title-meta">
            <span className="badge">Dynamic Programming</span>
            <ComplexityPopover
              best="O(mn)"
              avg="O(mn)"
              worst="O(mn)"
              space="O(mn)"
              bestNote="All characters match"
              avgNote="Typical strings"
              worstNote="No characters match"
              spaceNote="DP table stores m×n values"
              why="Every cell dp[i][j] depends on dp[i-1][j-1], dp[i-1][j], and dp[i][j-1]. The table has (m+1)×(n+1) cells, each filled in O(1). Total: O(mn) time and O(mn) space."
            />
          </div>
        </div>
        <div className="lcs-legend">
          <span>
            <span className="swatch lcs-match-swatch" /> Match
          </span>
          <span>
            <span className="swatch lcs-nomatch-swatch" /> No Match
          </span>
          <span>
            <span className="swatch lcs-current-swatch" /> Current
          </span>
          <span>
            <span className="swatch lcs-traceback-swatch" /> Traceback
          </span>
        </div>
        <AlgorithmComplete />
      </div>

      <div className="content-grid">
        <div className="main-column">
          <ProblemFrame title="The Problem">
            <div className="app-section">
              <span className="app-label">Given</span>
              <p>Two strings A and B.</p>
            </div>
            <div className="app-section">
              <span className="app-label">Goal</span>
              <p>
                Find the longest sequence of characters that appears in both
                strings (not necessarily contiguous).
              </p>
            </div>
            <div className="app-section">
              <span className="app-label">Real use cases</span>
              <p>
                Diff tools (git diff), bioinformatics sequence alignment, spell
                checkers, and plagiarism detection.
              </p>
            </div>
          </ProblemFrame>

          <WhyComplexityPanel derivation="The DP table has (m+1)×(n+1) cells. Each cell is computed in O(1) by looking at three neighbors. Filling all cells takes O(mn) time. Storing the table requires O(mn) space. Traceback walks at most m+n steps — negligible compared to table fill." />

          <AnalogyPanel>
            <strong>Real-world analogy:</strong> Git diff uses LCS to find
            matching lines between file versions — it identifies what stayed the
            same to show you what changed.
          </AnalogyPanel>

          <div className="panel">
            <div className="controls">
              <div className="inputs">
                <label htmlFor="lcs-stra">
                  String A
                  <input
                    id="lcs-stra"
                    type="text"
                    value={strAInput}
                    onChange={(e) => setStrAInput(e.target.value)}
                    placeholder="e.g. ABCBDAB"
                    maxLength={MAX_LEN}
                  />
                </label>
                <label htmlFor="lcs-strb">
                  String B
                  <input
                    id="lcs-strb"
                    type="text"
                    value={strBInput}
                    onChange={(e) => setStrBInput(e.target.value)}
                    placeholder="e.g. BDCAB"
                    maxLength={MAX_LEN}
                  />
                </label>
              </div>
              {error && <div className="lcs-error">{error}</div>}
              <div className="buttons">
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleSolve}
                >
                  Solve
                </button>
                <button type="button" onClick={handleRandom}>
                  Random
                </button>
              </div>
            </div>

            {result && (
              <>
                <DpTable
                  result={result}
                  strA={activeStrA}
                  strB={activeStrB}
                  currentStep={currentStep}
                  showTraceback={showTraceback}
                />

                {stepInfo && (
                  <div className="info" style={{ marginTop: "0.5rem" }}>
                    {stepInfo}
                  </div>
                )}

                {isFinished && (
                  <div className="lcs-result-row">
                    <span className="lcs-result-label">LCS:</span>
                    {result.lcsString.length > 0 ? (
                      <>
                        {result.lcsString.split("").map((ch, idx) => (
                          <span key={idx} className="lcs-char">
                            {ch}
                          </span>
                        ))}
                        <span className="lcs-result-length">
                          (length {result.lcsString.length})
                        </span>
                      </>
                    ) : (
                      <span className="lcs-result-empty">
                        No common subsequence
                      </span>
                    )}
                  </div>
                )}

                <PlaybackController
                  steps={result.steps}
                  currentStep={currentStep}
                  onStep={setCurrentStep}
                  onReset={handleReset}
                />
              </>
            )}
          </div>
        </div>

        <div className="sidebar">
          {result && (
            <div className="stats-grid" style={{ marginBottom: "1rem" }}>
              <div className="stat-card">
                <span className="stat-value">{activeStrA.length}</span>
                <span className="stat-label">|A|</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">{activeStrB.length}</span>
                <span className="stat-label">|B|</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">
                  {currentStep + 1} / {totalSteps}
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
