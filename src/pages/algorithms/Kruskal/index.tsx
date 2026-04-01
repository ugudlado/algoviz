import { useState, useCallback, useMemo } from "react";
import { Nav } from "@/components/Nav";
import { PlaybackController } from "@/components/PlaybackController";
import { WatchPanel } from "@/components/WatchPanel";
import { ComplexityPopover } from "@/components/ComplexityPopover";
import { AnalogyPanel } from "@/components/AnalogyPanel";
import { ProblemFrame } from "@/components/ProblemFrame";
import { WhyComplexityPanel } from "@/components/WhyComplexityPanel";
import {
  findMST,
  type KruskalEdge,
  type KruskalStep,
} from "@/lib/algorithms/kruskal";
import "@/styles/kruskal.css";

const DEFAULT_EDGES_INPUT =
  "0-1:4, 0-2:4, 1-2:2, 2-3:3, 3-4:3, 4-5:1, 3-5:2, 1-4:5";
const DEFAULT_NODES = 6;
const MAX_NODES = 20;
const MAX_EDGES = 50;

const PSEUDO_LINES = [
  "sort edges by weight ascending",
  "mst = []",
  "for each edge (u, v, w):",
  "  if find(u) != find(v):",
  "    union(u, v)",
  "    mst.add(edge)",
  "  else: reject (cycle)",
  "return mst",
];

// Node positions for default 6-node graph (circle layout)
function nodePositions(
  n: number,
  cx: number,
  cy: number,
  r: number,
): [number, number][] {
  return Array.from({ length: n }, (_, i) => {
    const angle = (2 * Math.PI * i) / n - Math.PI / 2;
    return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)];
  });
}

interface ParseResult {
  edges: KruskalEdge[] | null;
  numNodes: number;
  error: string | null;
}

function parseEdgesInput(raw: string, nodesVal: number): ParseResult {
  const numNodes = Math.max(2, Math.min(MAX_NODES, nodesVal));
  const trimmed = raw.trim();
  if (trimmed.length === 0) {
    return { edges: null, numNodes, error: "Please enter edges." };
  }

  const parts = trimmed
    .split(/[,;]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  if (parts.length > MAX_EDGES) {
    return {
      edges: null,
      numNodes,
      error: `Maximum ${MAX_EDGES} edges allowed.`,
    };
  }

  const edges: KruskalEdge[] = [];
  for (const part of parts) {
    const match = part.match(/^(\d+)\s*-\s*(\d+)\s*:\s*(\d+)$/);
    if (!match) {
      return {
        edges: null,
        numNodes,
        error: `Invalid format: "${part}". Use u-v:weight (e.g. 0-1:4).`,
      };
    }
    const u = parseInt(match[1], 10);
    const v = parseInt(match[2], 10);
    const w = parseInt(match[3], 10);
    if (u >= numNodes || v >= numNodes) {
      return {
        edges: null,
        numNodes,
        error: `Node ${Math.max(u, v)} exceeds node count ${numNodes}.`,
      };
    }
    if (u === v) {
      return {
        edges: null,
        numNodes,
        error: `Self-loop ${u}-${v} not allowed.`,
      };
    }
    edges.push({ u, v, w });
  }
  return { edges, numNodes, error: null };
}

function pseudoLineForStep(
  step: KruskalStep | undefined,
  stepIdx: number,
): number {
  if (!step) return -1;
  if (step.phase === "sort") return 0;
  if (step.accepted === true) {
    // highlight union line or add-to-mst depending on sub-step
    return stepIdx % 2 === 0 ? 4 : 5;
  }
  if (step.accepted === false) return 6;
  return 2;
}

// Determine edge state for the sorted edges list
function edgeState(
  step: KruskalStep,
  sortedEdges: KruskalEdge[],
  i: number,
  isLastStep: boolean,
): "considering" | "accepted" | "rejected" | "" {
  if (step.phase === "sort") return "";

  if (i === step.edgeIdx) {
    if (!isLastStep && step.phase === "consider") {
      return step.accepted ? "considering" : "rejected";
    }
    return step.accepted ? "accepted" : "rejected";
  }

  if (i < step.edgeIdx) {
    const e = sortedEdges[i];
    const wasAccepted = step.mstEdges.some(
      (m) => m.u === e.u && m.v === e.v && m.w === e.w,
    );
    return wasAccepted ? "accepted" : "rejected";
  }

  return "";
}

// SVG graph visualization
function KruskalGraph({
  numNodes,
  sortedEdges,
  step,
  isLastStep,
}: {
  numNodes: number;
  sortedEdges: KruskalEdge[];
  step: KruskalStep | undefined;
  isLastStep: boolean;
}) {
  const svgWidth = 320;
  const svgHeight = 220;
  const cx = svgWidth / 2;
  const cy = svgHeight / 2;
  const r = Math.min(cx, cy) - 36;

  const positions = useMemo(
    () => nodePositions(numNodes, cx, cy, r),
    [numNodes, cx, cy, r],
  );

  // Determine active nodes (nodes touched by current or accepted edges)
  const activeNodes = useMemo(() => {
    const set = new Set<number>();
    if (!step) return set;
    step.mstEdges.forEach((e) => {
      set.add(e.u);
      set.add(e.v);
    });
    if (step.edge && step.accepted) {
      set.add(step.edge.u);
      set.add(step.edge.v);
    }
    return set;
  }, [step]);

  function getEdgeClass(edge: KruskalEdge): string {
    if (!step || step.phase === "sort") return "kr-svg-edge kr-svg-edge-unseen";

    // Is this the current edge being considered?
    if (
      step.edge &&
      step.edge.u === edge.u &&
      step.edge.v === edge.v &&
      step.edge.w === edge.w
    ) {
      if (!isLastStep && step.accepted === true)
        return "kr-svg-edge kr-svg-edge-considering";
      if (step.accepted === true) return "kr-svg-edge kr-svg-edge-accepted";
      if (step.accepted === false) return "kr-svg-edge kr-svg-edge-rejected";
    }

    // Was this edge accepted before this step?
    const wasAccepted = step.mstEdges.some(
      (m) => m.u === edge.u && m.v === edge.v && m.w === edge.w,
    );
    if (wasAccepted) return "kr-svg-edge kr-svg-edge-accepted";

    // Was it already processed and rejected?
    const currentIdx = step.edgeIdx;
    const edgeIdx = sortedEdges.findIndex(
      (s) => s.u === edge.u && s.v === edge.v && s.w === edge.w,
    );
    if (edgeIdx >= 0 && edgeIdx < currentIdx && !wasAccepted) {
      return "kr-svg-edge kr-svg-edge-rejected";
    }

    return "kr-svg-edge kr-svg-edge-unseen";
  }

  return (
    <div className="kr-graph-wrapper">
      <svg
        className="kr-graph-svg"
        width={svgWidth}
        height={svgHeight}
        aria-label="Graph visualization"
      >
        {/* Edge weight labels and lines */}
        {sortedEdges.map((edge, i) => {
          const pos0 = positions[edge.u];
          const pos1 = positions[edge.v];
          if (!pos0 || !pos1) return null;
          const [x1, y1] = pos0;
          const [x2, y2] = pos1;
          const mx = (x1 + x2) / 2;
          const my = (y1 + y2) / 2;
          const cls = getEdgeClass(edge);
          return (
            <g key={i}>
              <line
                className={cls}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                strokeWidth={2}
              />
              <text
                x={mx}
                y={my - 5}
                textAnchor="middle"
                fontSize="10"
                fill="var(--text-muted)"
                fontFamily="var(--font-mono)"
              >
                {edge.w}
              </text>
            </g>
          );
        })}

        {/* Node circles */}
        {positions.map(([x, y], i) => {
          const isActive = activeNodes.has(i);
          return (
            <g key={i}>
              <circle
                className={`kr-svg-node ${isActive ? "kr-svg-node-active" : "kr-svg-node-default"}`}
                cx={x}
                cy={y}
                r={16}
                strokeWidth={2}
              />
              <text
                x={x}
                y={y + 4}
                textAnchor="middle"
                fontSize="12"
                fontWeight="700"
                fill={isActive ? "#fff" : "var(--text-primary)"}
                fontFamily="var(--font-mono)"
              >
                {i}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default function KruskalPage() {
  const [edgesInput, setEdgesInput] = useState(DEFAULT_EDGES_INPUT);
  const [nodesInput, setNodesInput] = useState(DEFAULT_NODES);
  const [steps, setSteps] = useState<KruskalStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [numNodes, setNumNodes] = useState(DEFAULT_NODES);
  const [error, setError] = useState("");
  const [hasRun, setHasRun] = useState(false);

  const step = hasRun && steps.length > 0 ? steps[currentStep] : undefined;
  const isLastStep = currentStep === steps.length - 1;
  const sortedEdges = step?.sortedEdges ?? steps[0]?.sortedEdges ?? [];

  const handleVisualize = useCallback(() => {
    const parsed = parseEdgesInput(edgesInput, nodesInput);
    if (parsed.error || !parsed.edges) {
      setError(parsed.error ?? "Invalid input.");
      return;
    }
    setError("");
    const result = findMST(parsed.numNodes, parsed.edges);
    setSteps(result.steps);
    setCurrentStep(0);
    setNumNodes(parsed.numNodes);
    setHasRun(true);
  }, [edgesInput, nodesInput]);

  const handlePreset = useCallback(() => {
    setEdgesInput(DEFAULT_EDGES_INPUT);
    setNodesInput(DEFAULT_NODES);
    const parsed = parseEdgesInput(DEFAULT_EDGES_INPUT, DEFAULT_NODES);
    if (!parsed.edges) return;
    const result = findMST(parsed.numNodes, parsed.edges);
    setSteps(result.steps);
    setCurrentStep(0);
    setNumNodes(parsed.numNodes);
    setHasRun(true);
    setError("");
  }, []);

  const handleReset = useCallback(() => {
    setCurrentStep(0);
  }, []);

  const codeLine = pseudoLineForStep(step, currentStep);

  const watchVars = step
    ? [
        {
          label: "step",
          value: `${currentStep + 1} / ${steps.length}`,
        },
        {
          label: "mst weight",
          value: step.totalWeight,
          highlight: step.totalWeight > 0,
        },
        {
          label: "mst edges",
          value: step.mstEdges.length,
          highlight: step.mstEdges.length > 0,
        },
        {
          label: "target edges",
          value: numNodes - 1,
        },
        {
          label: "current edge",
          value: step.edge
            ? `${step.edge.u}-${step.edge.v} (w=${step.edge.w})`
            : "—",
          highlight: step.edge !== null,
        },
        {
          label: "decision",
          value:
            step.accepted === true
              ? "ACCEPTED"
              : step.accepted === false
                ? "REJECTED"
                : "sorting",
          highlight: step.accepted === true,
        },
      ]
    : [];

  return (
    <div className="algo-page" data-category="graph">
      <Nav
        currentCategory="graph"
        algorithmProgressPath="/algorithms/kruskal"
      />

      <div className="page-header">
        <div className="title-group">
          <h1>Kruskal's MST</h1>
          <div className="title-meta">
            <span className="badge">Graph</span>
            <ComplexityPopover
              best="O(E log E)"
              avg="O(E log E)"
              worst="O(E log E)"
              space="O(V + E)"
              bestNote="All cases"
              avgNote="All cases"
              worstNote="All cases"
              spaceNote="Edge list + union-find"
              why="Sorting E edges takes O(E log E). Processing each edge with union-find (path compression + rank) is nearly O(1) per operation. Total: O(E log E)."
            />
          </div>
        </div>

        <div className="kr-legend">
          <span>
            <span className="swatch kr-unseen-swatch" /> Unseen
          </span>
          <span>
            <span className="swatch kr-considering-swatch" /> Considering
          </span>
          <span>
            <span className="swatch kr-accepted-swatch" /> Accepted (MST)
          </span>
          <span>
            <span className="swatch kr-rejected-swatch" /> Rejected (Cycle)
          </span>
        </div>
      </div>

      <div className="content-grid">
        <div className="main-column">
          <ProblemFrame title="The Problem">
            <div className="app-section">
              <span className="app-label">Given</span>
              <p>
                A weighted undirected graph — nodes connected by edges each with
                a cost.
              </p>
            </div>
            <div className="app-section">
              <span className="app-label">Goal</span>
              <p>
                Find the Minimum Spanning Tree: the cheapest set of edges that
                connects all nodes without any cycles.
              </p>
            </div>
            <div className="app-section">
              <span className="app-label">Real use cases</span>
              <p>
                Minimum-cost network wiring, cable TV routing, cluster analysis,
                and image segmentation.
              </p>
            </div>
          </ProblemFrame>

          <WhyComplexityPanel derivation="Kruskal's first sorts all E edges — O(E log E). Then for each edge it runs two find() operations and possibly a union(), each nearly O(1) with path compression and union-by-rank. Total: O(E log E) dominated by sorting. Space is O(V + E) for the union-find arrays and edge list." />

          <AnalogyPanel>
            Connecting villages with roads — list all possible roads by cost,
            cheapest first. Build each road only if it links a village not yet
            reachable from the current network. Skip any road that would create
            a loop. The result is the cheapest way to connect everyone.
          </AnalogyPanel>

          <div className="panel">
            <div className="controls">
              <div className="inputs">
                <label htmlFor="kr-edges-input">
                  Edges (u-v:weight)
                  <input
                    id="kr-edges-input"
                    type="text"
                    value={edgesInput}
                    onChange={(e) => setEdgesInput(e.target.value)}
                    placeholder="e.g. 0-1:4, 1-2:2, 2-3:3"
                    maxLength={300}
                  />
                </label>
                <label htmlFor="kr-nodes-input">
                  Nodes
                  <input
                    id="kr-nodes-input"
                    type="number"
                    value={nodesInput}
                    min={2}
                    max={MAX_NODES}
                    onChange={(e) =>
                      setNodesInput(
                        Math.max(
                          2,
                          Math.min(
                            MAX_NODES,
                            parseInt(e.target.value, 10) || DEFAULT_NODES,
                          ),
                        ),
                      )
                    }
                  />
                </label>
              </div>
              {error && <div className="algo-error visible">{error}</div>}
              <div className="buttons">
                <button className="btn-primary" onClick={handleVisualize}>
                  Visualize
                </button>
                <button onClick={handlePreset}>Preset Graph</button>
              </div>
            </div>

            {hasRun && steps.length > 0 && (
              <>
                <div className="info" style={{ marginTop: "0.75rem" }}>
                  {step?.explanation ??
                    "Step through the algorithm or press Play."}
                </div>

                <KruskalGraph
                  numNodes={numNodes}
                  sortedEdges={sortedEdges}
                  step={step}
                  isLastStep={isLastStep}
                />

                <div className="kr-layout">
                  <div className="kr-edges-section">
                    <div className="kr-section-label">Sorted Edges</div>
                    <div className="kr-edges-list">
                      {sortedEdges.map((edge, i) => {
                        const state = step
                          ? edgeState(step, sortedEdges, i, isLastStep)
                          : "";
                        return (
                          <div
                            key={`${edge.u}-${edge.v}-${edge.w}-${i}`}
                            className={`kr-edge${state ? ` kr-${state}` : ""}`}
                          >
                            <span className="kr-edge-label">
                              {edge.u} — {edge.v}
                            </span>
                            <span className="kr-edge-weight">w={edge.w}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="kr-mst-section">
                    <div className="kr-section-label">MST Edges</div>
                    <div className="kr-edges-list">
                      {(step?.mstEdges ?? []).map((edge, i) => (
                        <div
                          key={`mst-${edge.u}-${edge.v}-${i}`}
                          className="kr-edge kr-mst-edge"
                        >
                          <span className="kr-edge-label">
                            {edge.u} — {edge.v}
                          </span>
                          <span className="kr-edge-weight">w={edge.w}</span>
                        </div>
                      ))}
                      {(step?.mstEdges ?? []).length === 0 && (
                        <div
                          style={{
                            color: "var(--text-muted)",
                            fontSize: "0.8rem",
                            padding: "0.4rem 0",
                          }}
                        >
                          No edges accepted yet
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {isLastStep && step && (
                  <div className="kr-result">
                    MST complete — weight: {step.totalWeight} (
                    {step.mstEdges.length} edges)
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
