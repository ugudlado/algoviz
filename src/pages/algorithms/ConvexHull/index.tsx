import { useMemo, useState } from "react";
import { Nav } from "@/components/Nav";
import { PlaybackController } from "@/components/PlaybackController";
import { WatchPanel } from "@/components/WatchPanel";
import { ComplexityPopover } from "@/components/ComplexityPopover";
import { AnalogyPanel } from "@/components/AnalogyPanel";
import { ProblemFrame } from "@/components/ProblemFrame";
import { WhyComplexityPanel } from "@/components/WhyComplexityPanel";
import {
  grahamScan,
  type ConvexHullStep,
  type Point,
} from "@/lib/algorithms/convex-hull";
import "@/styles/convex-hull.css";

const WIDTH = 760;
const HEIGHT = 420;
const MAX_POINTS = 100;
const PSEUDO_LINES = [
  "pivot = lowest-y point",
  "sort points by polar angle",
  "stack = [pivot, p1, p2]",
  "for each next point p:",
  "  while turn(top-1, top, p) <= 0:",
  "    pop top",
  "  push p",
  "stack is convex hull",
];

function randomPoints(n: number): Point[] {
  const out: Point[] = [];
  for (let i = 0; i < n; i++) {
    out.push({
      x: Math.round(20 + Math.random() * (WIDTH - 40)),
      y: Math.round(20 + Math.random() * (HEIGHT - 40)),
    });
  }
  return out;
}

export default function ConvexHullPage() {
  const [points, setPoints] = useState<Point[]>([]);
  const [stepIdx, setStepIdx] = useState(0);
  const [pointCount, setPointCount] = useState(20);
  const [error, setError] = useState("");

  const result = useMemo(() => grahamScan(points), [points]);
  const steps = result.steps;
  const step: ConvexHullStep | null =
    steps.length > 0 ? steps[Math.min(stepIdx, steps.length - 1)] : null;
  const stackSet = new Set(step?.stack ?? []);
  const discardedSet = new Set(step?.discarded ?? []);
  const currentPoint = step?.currentPoint ?? -1;

  const onCanvasClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (points.length >= MAX_POINTS) {
      setError(`Maximum ${MAX_POINTS} points reached.`);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * WIDTH);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * HEIGHT);
    setError("");
    setPoints((prev) => [...prev, { x, y }]);
    setStepIdx(0);
  };

  const watchVars = step
    ? [
        {
          label: "Step Type",
          value: step.type,
          highlight: step.type === "done",
        },
        { label: "Points Processed", value: String(step.pointsProcessed) },
        { label: "Hull Size", value: String(step.hullSize), highlight: true },
        { label: "Discarded", value: String(step.discarded.length) },
        {
          label: "Current Index",
          value: step.currentPoint >= 0 ? String(step.currentPoint) : "—",
        },
      ]
    : [];
  const codeLine =
    step?.type === "pivot"
      ? 0
      : step?.type === "sort"
        ? 1
        : step?.type === "push"
          ? 6
          : step?.type === "pop"
            ? 4
            : step?.type === "done"
              ? 7
              : 3;

  return (
    <div className="algo-page" data-category="advanced">
      <Nav
        currentCategory="advanced"
        algorithmProgressPath="/algorithms/convex-hull"
      />
      <div className="page-header">
        <div className="title-group">
          <h1>Convex Hull (Graham Scan)</h1>
          <div className="title-meta">
            <span className="badge">Advanced</span>
            <ComplexityPopover
              best="O(n log n)"
              avg="O(n log n)"
              worst="O(n log n)"
              space="O(n)"
              bestNote="Polar-angle sort dominates"
              avgNote="Typical random points"
              worstNote="All points considered"
              spaceNote="Stack + sorted indices"
              why="Graham Scan first sorts points by polar angle around a pivot in O(n log n), then performs a linear stack walk. Sorting dominates the runtime."
            />
          </div>
        </div>
      </div>

      <div className="content-grid">
        <div className="main-column">
          <ProblemFrame title="The Problem">
            <div className="app-section">
              <span className="app-label">Goal</span>
              <p>Find the smallest convex boundary that contains all points.</p>
            </div>
          </ProblemFrame>
          <WhyComplexityPanel derivation="After choosing a pivot, points are sorted by angle (O(n log n)). The stack pass pushes and pops each point at most once, so the scan phase is O(n). Total: O(n log n)." />
          <AnalogyPanel>
            <strong>Real-world analogy:</strong> Stretch a rubber band around
            nails on a board. The final rubber-band shape is the convex hull.
          </AnalogyPanel>

          <div className="panel">
            <div className="controls">
              <div className="inputs">
                <label htmlFor="hull-count">
                  Random point count (5-50)
                  <input
                    id="hull-count"
                    type="number"
                    min={5}
                    max={50}
                    value={pointCount}
                    onChange={(e) =>
                      setPointCount(
                        Math.max(5, Math.min(50, Number(e.target.value) || 5)),
                      )
                    }
                  />
                </label>
              </div>
              {error && <div className="algo-error visible">{error}</div>}
              <div className="buttons">
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => {
                    setPoints(randomPoints(pointCount));
                    setStepIdx(0);
                    setError("");
                  }}
                >
                  Randomize
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPoints([]);
                    setStepIdx(0);
                    setError("");
                  }}
                >
                  Clear
                </button>
              </div>
            </div>

            <svg
              viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
              className="hull-canvas"
              onClick={onCanvasClick}
              aria-label="Convex hull canvas"
            >
              {step &&
                step.stack.slice(0, -1).map((idx: number, i: number) => {
                  const a = points[idx];
                  const b = points[step.stack[i + 1]];
                  if (!a || !b) return null;
                  return (
                    <line
                      key={`${idx}-${i}`}
                      x1={a.x}
                      y1={a.y}
                      x2={b.x}
                      y2={b.y}
                      className="hull-edge"
                    />
                  );
                })}
              {step?.type === "done" && step.stack.length >= 3 && (
                <line
                  x1={points[step.stack[0]]?.x ?? 0}
                  y1={points[step.stack[0]]?.y ?? 0}
                  x2={points[step.stack[step.stack.length - 1]]?.x ?? 0}
                  y2={points[step.stack[step.stack.length - 1]]?.y ?? 0}
                  className="hull-edge"
                />
              )}
              {points.map((p, i) => (
                <g key={`${p.x}-${p.y}-${i}`}>
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={i === currentPoint ? 7 : i === result.pivotIndex ? 7 : 5}
                    className={
                      i === currentPoint
                        ? "hull-point-current"
                        : discardedSet.has(i)
                          ? "hull-point-discarded"
                          : stackSet.has(i)
                            ? "hull-point-stack"
                            : i === result.pivotIndex
                              ? "hull-point-pivot"
                              : "hull-point"
                    }
                  />
                  <text x={p.x} y={p.y - 10} className="hull-label">
                    {i}
                  </text>
                </g>
              ))}
            </svg>

            <div className="info" style={{ marginTop: "0.75rem" }}>
              {step?.explanation ??
                "Add points or randomize to run Graham Scan."}
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
                <span className="stat-value">{step.hullSize}</span>
                <span className="stat-label">Hull Size</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">{step.pointsProcessed}</span>
                <span className="stat-label">Processed</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">{stepIdx + 1}</span>
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
