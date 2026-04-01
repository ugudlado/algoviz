import { useMemo, useState } from "react";
import { Nav } from "@/components/Nav";
import { PlaybackController } from "@/components/PlaybackController";
import { WatchPanel } from "@/components/WatchPanel";
import { ComplexityPopover } from "@/components/ComplexityPopover";
import { AnalogyPanel } from "@/components/AnalogyPanel";
import { ProblemFrame } from "@/components/ProblemFrame";
import { WhyComplexityPanel } from "@/components/WhyComplexityPanel";
import { generateSteps, solveAll } from "@/lib/algorithms/n-queens";
import "@/styles/n-queens.css";

const PSEUDO_LINES = [
  "placeQueen(row):",
  "  if row == n: solution",
  "  for col in 0..n-1:",
  "    if valid(row, col):",
  "      place queen",
  "      placeQueen(row + 1)",
  "      remove queen (backtrack)",
];

function attacked(
  step: { row: number; col: number },
  r: number,
  c: number,
): boolean {
  return (
    step.row === r ||
    step.col === c ||
    Math.abs(step.row - r) === Math.abs(step.col - c)
  );
}

export default function NQueensPage() {
  const [size, setSize] = useState(8);
  const [stepIdx, setStepIdx] = useState(0);

  const all = useMemo(() => solveAll(size), [size]);
  const steps = useMemo(() => generateSteps(size), [size]);
  const step =
    steps.length > 0 ? steps[Math.min(stepIdx, steps.length - 1)] : null;

  const watchVars = step
    ? [
        { label: "N", value: String(size) },
        { label: "Step", value: String(step.stepCount) },
        {
          label: "Backtracks",
          value: String(step.backtracks),
          highlight: true,
        },
        { label: "Action", value: step.type },
        { label: "Solutions", value: String(all.count) },
      ]
    : [];
  const codeLine =
    step?.type === "solution"
      ? 1
      : step?.type === "place"
        ? 4
        : step?.type === "backtrack"
          ? 6
          : 3;

  return (
    <div className="algo-page" data-category="advanced">
      <Nav
        currentCategory="advanced"
        algorithmProgressPath="/algorithms/n-queens"
      />
      <div className="page-header">
        <div className="title-group">
          <h1>N-Queens (Backtracking)</h1>
          <div className="title-meta">
            <span className="badge">Advanced</span>
            <ComplexityPopover
              best="O(n!)"
              avg="O(n!)"
              worst="O(n!)"
              space="O(n)"
              bestNote="Pruned search tree"
              avgNote="Backtracking search"
              worstNote="Exponential exploration"
              spaceNote="One queen per row + recursion"
              why="Each row chooses among remaining safe columns. Backtracking prunes invalid branches early but worst-case growth remains factorial."
            />
          </div>
        </div>
      </div>
      <div className="content-grid">
        <div className="main-column">
          <ProblemFrame title="The Problem">
            <div className="app-section">
              <span className="app-label">Goal</span>
              <p>
                Place N queens on an N×N board so no two queens attack each
                other.
              </p>
            </div>
          </ProblemFrame>
          <WhyComplexityPanel derivation="At each row, you try candidate columns and backtrack on conflicts. Search is heavily pruned but can still approach O(n!) in worst case." />
          <AnalogyPanel>
            <strong>Real-world analogy:</strong> Seating VIPs at a square
            banquet where each queen needs private sight-lines in row, column,
            and diagonal.
          </AnalogyPanel>
          <div className="panel">
            <div className="controls">
              <div className="inputs">
                <label htmlFor="nq-size">
                  Board size (4-12)
                  <input
                    id="nq-size"
                    type="number"
                    min={4}
                    max={12}
                    value={size}
                    onChange={(e) =>
                      setSize(
                        Math.max(4, Math.min(12, Number(e.target.value) || 4)),
                      )
                    }
                  />
                </label>
              </div>
              <div className="buttons">
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => setStepIdx(0)}
                >
                  Restart
                </button>
              </div>
            </div>

            <div
              className="nq-board"
              style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}
            >
              {Array.from({ length: size * size }).map((_, idx) => {
                const r = Math.floor(idx / size);
                const c = idx % size;
                const hasQueen = step ? step.board[r] === c : false;
                const danger =
                  step && (step.type === "place" || step.type === "conflict")
                    ? attacked({ row: step.row, col: step.col }, r, c) &&
                      !hasQueen
                    : false;
                const isConflict = !!step?.conflictCells.find(
                  (cc) => cc.row === r && cc.col === c,
                );
                return (
                  <div
                    key={`${r}-${c}`}
                    className={`nq-cell${(r + c) % 2 === 0 ? " light" : " dark"}${danger ? " danger" : ""}${isConflict ? " conflict" : ""}${hasQueen ? " queen" : ""}`}
                  >
                    {hasQueen ? "♛" : ""}
                  </div>
                );
              })}
            </div>

            <div className="info" style={{ marginTop: "0.75rem" }}>
              {step
                ? `${step.type.toUpperCase()} at row ${step.row + 1}, col ${step.col + 1}.`
                : "Run the solver to visualize backtracking."}
            </div>
            <div className="result" style={{ marginTop: "0.75rem" }}>
              Total solutions for N={size}: {all.count}
            </div>

            {steps.length > 0 && (
              <PlaybackController
                steps={steps}
                currentStep={Math.min(stepIdx, steps.length - 1)}
                onStep={(n) =>
                  setStepIdx(Math.max(0, Math.min(steps.length - 1, n)))
                }
                onReset={() => setStepIdx(0)}
              />
            )}
          </div>
        </div>
        <div className="sidebar">
          {step && (
            <div className="stats-grid" style={{ marginBottom: "1rem" }}>
              <div className="stat-card">
                <span className="stat-value">{step.stepCount}</span>
                <span className="stat-label">Steps</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">{step.backtracks}</span>
                <span className="stat-label">Backtracks</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">{all.count}</span>
                <span className="stat-label">Solutions</span>
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
