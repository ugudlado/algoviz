import { useState, useCallback, useEffect, useMemo } from "react";
import { Nav } from "@/components/Nav";
import { PlaybackController } from "@/components/PlaybackController";
import { WatchPanel } from "@/components/WatchPanel";
import { ComplexityPopover } from "@/components/ComplexityPopover";
import { AnalogyPanel } from "@/components/AnalogyPanel";
import { ProblemFrame } from "@/components/ProblemFrame";
import { WhyComplexityPanel } from "@/components/WhyComplexityPanel";
import {
  levenshteinCompute,
  tracebackDescription,
  type LevenshteinResult,
} from "@/lib/algorithms/levenshtein";
import "@/styles/levenshtein.css";

const DEFAULT_SOURCE = "kitten";
const DEFAULT_TARGET = "sitting";
const MAX_STRING_LEN = 15;

const PSEUDO_LINES = [
  "for i from 0 to m:",
  "  for j from 0 to n:",
  "    if i == 0: dp[i][j] = j",
  "    else if j == 0: dp[i][j] = i",
  "    else if s[i-1] == t[j-1]:",
  "      dp[i][j] = dp[i-1][j-1]",
  "    else:",
  "      dp[i][j] = 1 + min(",
  "        dp[i-1][j-1],  // substitute",
  "        dp[i-1][j],    // delete",
  "        dp[i][j-1]     // insert",
  "      )",
];

interface VizStep {
  row: number;
  col: number;
  value: number;
  op: string;
}

function pseudoLineForStep(step: VizStep): number {
  const { row, col, op } = step;
  if (row === 0 && col === 0) return 5; // match at origin
  if (row === 0) return 2; // base row: insert
  if (col === 0) return 3; // base col: delete
  if (op === "match") return 5;
  if (op === "substitute") return 8;
  if (op === "insert") return 10;
  if (op === "delete") return 9;
  return 0;
}

function opLabel(op: string): string {
  switch (op) {
    case "match":
      return "Match";
    case "substitute":
      return "Substitute";
    case "insert":
      return "Insert";
    case "delete":
      return "Delete";
    default:
      return op;
  }
}

function DPTable({
  source,
  target,
  result,
  vizSteps,
  currentStep,
}: {
  source: string;
  target: string;
  result: LevenshteinResult;
  vizSteps: VizStep[];
  currentStep: number;
}) {
  const m = source.length;
  const n = target.length;

  const currentVizStep = vizSteps[currentStep];
  const filledUpTo = currentStep; // steps are 0-indexed

  // Build set of traceback cells (only show after all cells filled)
  const allFilled = currentStep >= vizSteps.length - 1;
  const tracebackSet = useMemo(() => {
    const s = new Set<string>();
    if (allFilled) {
      for (const cell of result.traceback) {
        s.add(`${cell.i},${cell.j}`);
      }
    }
    return s;
  }, [allFilled, result.traceback]);

  // Map from "row,col" -> step index for quick lookup of whether a cell is filled
  const filledMap = useMemo(() => {
    const map = new Map<string, VizStep>();
    for (let idx = 0; idx <= filledUpTo && idx < vizSteps.length; idx++) {
      const s = vizSteps[idx]!;
      map.set(`${s.row},${s.col}`, s);
    }
    return map;
  }, [vizSteps, filledUpTo]);

  const rows = Array.from({ length: m + 1 }, (_, i) => i);
  const cols = Array.from({ length: n + 1 }, (_, j) => j);

  return (
    <div className="lev-table-wrapper">
      <table className="lev-table">
        <thead>
          <tr>
            <th />
            <th>-</th>
            {target.split("").map((ch, j) => (
              <th key={j}>{ch}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((i) => (
            <tr key={i}>
              <th>{i === 0 ? "-" : source[i - 1]}</th>
              {cols.map((j) => {
                const key = `${i},${j}`;
                const filledStep = filledMap.get(key);
                const isCurrent =
                  currentVizStep?.row === i && currentVizStep?.col === j;
                const isTraceback = tracebackSet.has(key);

                let cellClass = "";
                let displayValue = "";

                if (filledStep) {
                  cellClass = `lev-${filledStep.op}`;
                  displayValue = String(filledStep.value);
                } else {
                  cellClass = "lev-empty";
                }

                if (isCurrent) {
                  cellClass += " lev-current";
                }
                if (isTraceback) {
                  cellClass += " lev-traceback";
                }

                return (
                  <td key={j} className={cellClass}>
                    {displayValue}
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

export default function LevenshteinPage() {
  const [sourceInput, setSourceInput] = useState(DEFAULT_SOURCE);
  const [targetInput, setTargetInput] = useState(DEFAULT_TARGET);
  const [source, setSource] = useState(DEFAULT_SOURCE);
  const [target, setTarget] = useState(DEFAULT_TARGET);
  const [result, setResult] = useState<LevenshteinResult | null>(null);
  const [vizSteps, setVizSteps] = useState<VizStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState("");

  const buildVizSteps = useCallback(
    (res: LevenshteinResult, src: string, tgt: string): VizStep[] => {
      const m = src.length;
      const n = tgt.length;
      const steps: VizStep[] = [];
      for (let i = 0; i <= m; i++) {
        for (let j = 0; j <= n; j++) {
          steps.push({
            row: i,
            col: j,
            value: res.dp[i]![j]!,
            op: res.ops[i]![j]!,
          });
        }
      }
      return steps;
    },
    [],
  );

  const runCompute = useCallback(
    (src: string, tgt: string) => {
      if (!src.length || !tgt.length) {
        setError("Both source and target must be non-empty.");
        return;
      }
      if (src.length > MAX_STRING_LEN || tgt.length > MAX_STRING_LEN) {
        setError(`Maximum ${MAX_STRING_LEN} characters each.`);
        return;
      }
      setError("");
      const res = levenshteinCompute(src, tgt);
      const steps = buildVizSteps(res, src, tgt);
      setSource(src);
      setTarget(tgt);
      setResult(res);
      setVizSteps(steps);
      setCurrentStep(0);
    },
    [buildVizSteps],
  );

  const handleRun = useCallback(() => {
    runCompute(sourceInput.trim(), targetInput.trim());
  }, [sourceInput, targetInput, runCompute]);

  const handleRandom = useCallback(() => {
    const wordPairs = [
      ["sunday", "saturday"],
      ["horse", "ros"],
      ["intention", "execution"],
      ["algorithm", "altruistic"],
      ["pale", "bale"],
      ["gumbo", "gambol"],
      ["book", "back"],
      ["java", "javascript"],
    ];
    const pair = wordPairs[Math.floor(Math.random() * wordPairs.length)]!;
    const src = pair[0]!;
    const tgt = pair[1]!;
    setSourceInput(src);
    setTargetInput(tgt);
    runCompute(src, tgt);
  }, [runCompute]);

  const handleReset = useCallback(() => {
    setCurrentStep(0);
  }, []);

  // Run on mount with defaults
  useEffect(() => {
    runCompute(DEFAULT_SOURCE, DEFAULT_TARGET);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional one-shot init
  }, []);

  const currentVizStep =
    vizSteps.length > 0 ? vizSteps[currentStep] : undefined;
  const allFilled = vizSteps.length > 0 && currentStep >= vizSteps.length - 1;

  const codeLine = currentVizStep ? pseudoLineForStep(currentVizStep) : -1;

  const tracebackDesc = useMemo(() => {
    if (!result || !allFilled) return "";
    return tracebackDescription(source, target, result.traceback, result.ops);
  }, [result, allFilled, source, target]);

  const watchVars = currentVizStep
    ? [
        {
          label: "Position",
          value: `(${currentVizStep.row}, ${currentVizStep.col})`,
        },
        {
          label: "Characters",
          value:
            currentVizStep.row > 0 && currentVizStep.col > 0
              ? `'${source[currentVizStep.row - 1]}' vs '${target[currentVizStep.col - 1]}'`
              : "—",
        },
        {
          label: "Operation",
          value: opLabel(currentVizStep.op),
          highlight: true,
        },
        {
          label: "Cell Value",
          value: String(currentVizStep.value),
          highlight: true,
        },
        {
          label: "Distance",
          value: result && allFilled ? String(result.distance) : "—",
        },
      ]
    : [];

  return (
    <div className="algo-page" data-category="dp">
      <Nav currentCategory="dp" />

      <div className="page-header">
        <div className="title-group">
          <h1>Levenshtein Distance</h1>
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
              spaceNote="Full DP table"
              why="Every cell (i, j) in the (m+1)x(n+1) table requires O(1) work from three neighbors. Total cells = (m+1)(n+1) = O(mn). The table itself is the O(mn) space."
            />
          </div>
        </div>
        <div className="lev-legend">
          <span>
            <span className="swatch lev-match-swatch" /> Match
          </span>
          <span>
            <span className="swatch lev-substitute-swatch" /> Substitute
          </span>
          <span>
            <span className="swatch lev-insert-swatch" /> Insert
          </span>
          <span>
            <span className="swatch lev-delete-swatch" /> Delete
          </span>
          <span>
            <span className="swatch lev-current-swatch" /> Current
          </span>
          <span>
            <span className="swatch lev-traceback-swatch" /> Traceback
          </span>
        </div>
      </div>

      <div className="content-grid">
        <div className="main-column">
          <ProblemFrame title="The Problem">
            <div className="app-section">
              <span className="app-label">Given</span>
              <p>Two strings: a source and a target.</p>
            </div>
            <div className="app-section">
              <span className="app-label">Goal</span>
              <p>
                Find the minimum number of single-character edits (insertions,
                deletions, substitutions) to transform one string into another.
              </p>
            </div>
            <div className="app-section">
              <span className="app-label">Real use cases</span>
              <p>
                Spell checkers, DNA sequence alignment, diff tools, fuzzy string
                matching.
              </p>
            </div>
          </ProblemFrame>

          <WhyComplexityPanel derivation="The algorithm fills an (m+1)×(n+1) table where m = |source| and n = |target|. Each cell dp[i][j] depends only on dp[i-1][j-1], dp[i-1][j], and dp[i][j-1] — O(1) per cell. Total work: O(mn). The full table must be stored for traceback: O(mn) space." />

          <AnalogyPanel>
            <strong>Real-world analogy:</strong> Spell checkers use Levenshtein
            distance — when you mistype a word, the checker finds dictionary
            words with the smallest edit distance to suggest corrections.
          </AnalogyPanel>

          <div className="panel">
            <div className="controls">
              <div className="inputs">
                <label htmlFor="lev-source">
                  Source
                  <input
                    id="lev-source"
                    type="text"
                    value={sourceInput}
                    onChange={(e) =>
                      setSourceInput(e.target.value.slice(0, MAX_STRING_LEN))
                    }
                    placeholder="e.g. kitten"
                    maxLength={MAX_STRING_LEN}
                  />
                </label>
                <label htmlFor="lev-target">
                  Target
                  <input
                    id="lev-target"
                    type="text"
                    value={targetInput}
                    onChange={(e) =>
                      setTargetInput(e.target.value.slice(0, MAX_STRING_LEN))
                    }
                    placeholder="e.g. sitting"
                    maxLength={MAX_STRING_LEN}
                  />
                </label>
              </div>
              {error && <div className="algo-error visible">{error}</div>}
              <div className="buttons">
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleRun}
                >
                  Compute
                </button>
                <button type="button" onClick={handleRandom}>
                  Random
                </button>
              </div>
            </div>

            {result && vizSteps.length > 0 && (
              <>
                <DPTable
                  source={source}
                  target={target}
                  result={result}
                  vizSteps={vizSteps}
                  currentStep={currentStep}
                />

                {currentVizStep && (
                  <div className="info" style={{ marginTop: "0.5rem" }}>
                    {`Cell (${currentVizStep.row}, ${currentVizStep.col}): `}
                    {currentVizStep.row === 0 && currentVizStep.col === 0
                      ? "Base case — empty source to empty target requires 0 edits."
                      : currentVizStep.row === 0
                        ? `Base case — insert ${currentVizStep.col} character(s) to build "${target.slice(0, currentVizStep.col)}".`
                        : currentVizStep.col === 0
                          ? `Base case — delete ${currentVizStep.row} character(s) from "${source.slice(0, currentVizStep.row)}".`
                          : currentVizStep.op === "match"
                            ? `'${source[currentVizStep.row - 1]}' matches '${target[currentVizStep.col - 1]}' — no edit needed (inherit dp[${currentVizStep.row - 1}][${currentVizStep.col - 1}]).`
                            : currentVizStep.op === "substitute"
                              ? `Substitute '${source[currentVizStep.row - 1]}' → '${target[currentVizStep.col - 1]}': 1 + dp[${currentVizStep.row - 1}][${currentVizStep.col - 1}] = ${currentVizStep.value}.`
                              : currentVizStep.op === "insert"
                                ? `Insert '${target[currentVizStep.col - 1]}': 1 + dp[${currentVizStep.row}][${currentVizStep.col - 1}] = ${currentVizStep.value}.`
                                : `Delete '${source[currentVizStep.row - 1]}': 1 + dp[${currentVizStep.row - 1}][${currentVizStep.col}] = ${currentVizStep.value}.`}
                  </div>
                )}

                {allFilled && result && (
                  <>
                    <div className="result" style={{ marginTop: "0.75rem" }}>
                      {`Edit distance from "${source}" to "${target}": ${result.distance}`}
                    </div>
                    {tracebackDesc && (
                      <div className="lev-ops-row">
                        <span className="lev-ops-label">Operations:</span>
                        {tracebackDesc.split(", ").map((op, idx) => {
                          const opType = op.toLowerCase().split(" ")[0] ?? "";
                          return (
                            <span
                              key={idx}
                              className={`lev-op-badge lev-${opType}`}
                            >
                              {op}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </>
                )}

                <PlaybackController
                  steps={vizSteps}
                  currentStep={currentStep}
                  onStep={setCurrentStep}
                  onReset={handleReset}
                />
              </>
            )}
          </div>
        </div>

        <div className="sidebar">
          {currentVizStep && (
            <div className="stats-grid" style={{ marginBottom: "1rem" }}>
              <div className="stat-card">
                <span className="stat-value">{currentStep + 1}</span>
                <span className="stat-label">Cell</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">{vizSteps.length}</span>
                <span className="stat-label">Total</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">
                  {allFilled && result ? result.distance : "—"}
                </span>
                <span className="stat-label">Distance</span>
              </div>
            </div>
          )}

          {currentVizStep && <WatchPanel vars={watchVars} />}

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
