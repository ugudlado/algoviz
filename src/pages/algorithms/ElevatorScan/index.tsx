import { useMemo, useState } from "react";
import { Nav } from "@/components/Nav";
import { PlaybackController } from "@/components/PlaybackController";
import { WatchPanel } from "@/components/WatchPanel";
import { ComplexityPopover } from "@/components/ComplexityPopover";
import { AnalogyPanel } from "@/components/AnalogyPanel";
import { ProblemFrame } from "@/components/ProblemFrame";
import { WhyComplexityPanel } from "@/components/WhyComplexityPanel";
import { solve } from "@/lib/algorithms/scan";
import "@/styles/elevator.css";

const DEFAULT_REQUESTS = "2, 8, 3, 15, 10, 6";
const PSEUDO_LINES = [
  "split requests into above/below start",
  "sort above ascending",
  "sort below descending",
  "if direction is up: order = above + below",
  "else: order = below + above",
  "walk order and accumulate distance",
];

function parseRequests(raw: string): number[] {
  return raw
    .split(/[,\s]+/)
    .map((n) => Number(n))
    .filter((n) => Number.isFinite(n));
}

export default function ElevatorScanPage() {
  const [requestsInput, setRequestsInput] = useState(DEFAULT_REQUESTS);
  const [start, setStart] = useState(5);
  const [maxFloor, setMaxFloor] = useState(20);
  const [direction, setDirection] = useState<"up" | "down">("up");
  const [stepIdx, setStepIdx] = useState(0);
  const [error, setError] = useState("");

  const requests = useMemo(() => parseRequests(requestsInput), [requestsInput]);
  const result = useMemo(
    () => solve(requests, start, direction),
    [requests, start, direction],
  );
  const steps = result.steps;
  const step =
    steps.length > 0 ? steps[Math.min(stepIdx, steps.length - 1)] : null;
  const currentFloor = step ? step.target : start;

  const valid = useMemo(() => {
    const invalid = requests.filter((r) => r < 0 || r > maxFloor);
    return invalid.length === 0 && start >= 0 && start <= maxFloor;
  }, [requests, start, maxFloor]);

  const watchVars = step
    ? [
        { label: "Current", value: String(step.position) },
        { label: "Target", value: String(step.target), highlight: true },
        { label: "Direction", value: step.direction.toUpperCase() },
        {
          label: "Distance So Far",
          value: String(step.distanceSoFar),
          highlight: true,
        },
        {
          label: "Serviced",
          value: `${Math.min(stepIdx + 1, steps.length)} / ${steps.length}`,
        },
      ]
    : [];
  const codeLine = !step
    ? 0
    : step.direction === "up" || step.direction === "down"
      ? 5
      : 0;

  const floors = Array.from({ length: maxFloor + 1 }, (_, i) => i).reverse();
  const serviced = new Set(
    steps.slice(0, Math.max(0, stepIdx)).map((s) => s.target),
  );

  return (
    <div className="algo-page" data-category="advanced">
      <Nav
        currentCategory="advanced"
        algorithmProgressPath="/algorithms/elevator-scan"
      />
      <div className="page-header">
        <div className="title-group">
          <h1>Elevator (SCAN) Scheduling</h1>
          <div className="title-meta">
            <span className="badge">Advanced</span>
            <ComplexityPopover
              best="O(n log n)"
              avg="O(n log n)"
              worst="O(n log n)"
              space="O(n)"
              bestNote="Sorted service order"
              avgNote="Typical request distribution"
              worstNote="All requests on both sides"
              spaceNote="Order + steps arrays"
              why="SCAN partitions requests above and below start, sorts both partitions, and then services in directional order."
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
                Service floor requests efficiently while reducing unnecessary
                direction changes.
              </p>
            </div>
          </ProblemFrame>
          <WhyComplexityPanel derivation="Requests are split and sorted once, giving O(n log n). The actual elevator walk is linear over the sorted order." />
          <AnalogyPanel>
            <strong>Real-world analogy:</strong> Like a real elevator, you
            finish requests in your current direction before reversing.
          </AnalogyPanel>

          <div className="panel">
            <div className="controls">
              <div className="inputs">
                <label htmlFor="scan-requests">
                  Requests (comma-separated)
                  <input
                    id="scan-requests"
                    type="text"
                    value={requestsInput}
                    onChange={(e) => setRequestsInput(e.target.value)}
                  />
                </label>
                <label htmlFor="scan-start">
                  Start floor
                  <input
                    id="scan-start"
                    type="number"
                    min={0}
                    max={maxFloor}
                    value={start}
                    onChange={(e) =>
                      setStart(Math.max(0, Number(e.target.value) || 0))
                    }
                  />
                </label>
                <label htmlFor="scan-max">
                  Max floor
                  <input
                    id="scan-max"
                    type="number"
                    min={5}
                    max={100}
                    value={maxFloor}
                    onChange={(e) =>
                      setMaxFloor(Math.max(5, Number(e.target.value) || 5))
                    }
                  />
                </label>
                <label htmlFor="scan-dir">
                  Direction
                  <select
                    id="scan-dir"
                    value={direction}
                    onChange={(e) =>
                      setDirection(e.target.value as "up" | "down")
                    }
                  >
                    <option value="up">Up</option>
                    <option value="down">Down</option>
                  </select>
                </label>
              </div>
              {!valid && (
                <div className="algo-error visible">
                  Requests and start floor must be within 0..{maxFloor}.
                </div>
              )}
              {error && <div className="algo-error visible">{error}</div>}
              <div className="buttons">
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => {
                    if (!valid) {
                      setError("Fix input bounds before visualizing.");
                      return;
                    }
                    setError("");
                    setStepIdx(0);
                  }}
                >
                  Visualize
                </button>
              </div>
            </div>

            <div className="elev-grid">
              <div className="elev-shaft">
                {floors.map((f) => (
                  <div
                    key={f}
                    className={`elev-floor${f === currentFloor ? " elev-current" : ""}${requests.includes(f) ? " elev-requested" : ""}${serviced.has(f) ? " elev-serviced" : ""}`}
                  >
                    <span>F{f}</span>
                  </div>
                ))}
              </div>
              <div>
                <div className="elev-queue">
                  {result.order.map((f, i) => (
                    <span
                      key={`${f}-${i}`}
                      className={`elev-chip${i === stepIdx ? " active" : ""}${i < stepIdx ? " done" : ""}`}
                    >
                      F{f}
                    </span>
                  ))}
                </div>
                <div className="info" style={{ marginTop: "0.75rem" }}>
                  {step
                    ? `Move ${step.direction.toUpperCase()} from ${step.position} to ${step.target} (total distance: ${step.distanceSoFar}).`
                    : "Use controls and click Visualize to step through SCAN scheduling."}
                </div>
                {steps.length > 0 && (
                  <div className="result" style={{ marginTop: "0.75rem" }}>
                    Total distance: {result.totalDistance}
                  </div>
                )}
              </div>
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
                <span className="stat-value">{step.distanceSoFar}</span>
                <span className="stat-label">Distance</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">{stepIdx + 1}</span>
                <span className="stat-label">Serviced</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">
                  {step.direction.toUpperCase()}
                </span>
                <span className="stat-label">Direction</span>
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
