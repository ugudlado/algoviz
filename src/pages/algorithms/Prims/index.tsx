import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { Nav } from "@/components/Nav";
import { ComplexityPopover } from "@/components/ComplexityPopover";
import { AnalogyPanel } from "@/components/AnalogyPanel";
import { ProblemFrame } from "@/components/ProblemFrame";
import { WhyComplexityPanel } from "@/components/WhyComplexityPanel";
import { WatchPanel } from "@/components/WatchPanel";
import {
  createGraph,
  addEdge,
  primsMST,
  type PrimsStep,
  type PrimsEdge,
} from "@/lib/algorithms/prims";
import "@/styles/prims.css";

const NODE_RADIUS = 19;

interface NodePos {
  x: number;
  y: number;
}

interface GraphEdge {
  u: number;
  v: number;
  weight: number;
}

interface Preset {
  label: string;
  nodes: NodePos[];
  edges: GraphEdge[];
}

const PRESETS: Record<string, Preset> = {
  small: {
    label: "Small (4 nodes)",
    nodes: [
      { x: 140, y: 200 },
      { x: 320, y: 100 },
      { x: 460, y: 200 },
      { x: 300, y: 330 },
    ],
    edges: [
      { u: 0, v: 1, weight: 4 },
      { u: 0, v: 3, weight: 6 },
      { u: 1, v: 2, weight: 3 },
      { u: 1, v: 3, weight: 8 },
      { u: 2, v: 3, weight: 7 },
    ],
  },
  medium: {
    label: "Medium (7 nodes)",
    nodes: [
      { x: 100, y: 200 },
      { x: 220, y: 100 },
      { x: 220, y: 300 },
      { x: 340, y: 200 },
      { x: 460, y: 100 },
      { x: 460, y: 300 },
      { x: 560, y: 200 },
    ],
    edges: [
      { u: 0, v: 1, weight: 2 },
      { u: 0, v: 2, weight: 4 },
      { u: 1, v: 2, weight: 1 },
      { u: 1, v: 3, weight: 5 },
      { u: 2, v: 3, weight: 3 },
      { u: 3, v: 4, weight: 6 },
      { u: 3, v: 5, weight: 2 },
      { u: 4, v: 5, weight: 4 },
      { u: 4, v: 6, weight: 3 },
      { u: 5, v: 6, weight: 7 },
    ],
  },
  dense: {
    label: "Dense (10 nodes)",
    nodes: [
      { x: 300, y: 60 },
      { x: 460, y: 130 },
      { x: 530, y: 280 },
      { x: 440, y: 400 },
      { x: 280, y: 420 },
      { x: 140, y: 360 },
      { x: 80, y: 220 },
      { x: 160, y: 100 },
      { x: 300, y: 200 },
      { x: 380, y: 280 },
    ],
    edges: [
      { u: 0, v: 1, weight: 4 },
      { u: 0, v: 7, weight: 8 },
      { u: 1, v: 2, weight: 8 },
      { u: 1, v: 8, weight: 11 },
      { u: 2, v: 3, weight: 7 },
      { u: 2, v: 5, weight: 4 },
      { u: 2, v: 8, weight: 2 },
      { u: 3, v: 4, weight: 9 },
      { u: 3, v: 5, weight: 14 },
      { u: 4, v: 5, weight: 10 },
      { u: 5, v: 6, weight: 2 },
      { u: 6, v: 7, weight: 1 },
      { u: 6, v: 8, weight: 6 },
      { u: 7, v: 8, weight: 7 },
      { u: 8, v: 9, weight: 3 },
      { u: 9, v: 3, weight: 5 },
      { u: 9, v: 4, weight: 6 },
    ],
  },
};

const SPEEDS_MS = [
  { label: "0.5x", ms: 1200 },
  { label: "1x", ms: 600 },
  { label: "2x", ms: 300 },
  { label: "4x", ms: 150 },
];

const PSEUDO_LINES = [
  "mst = {}, visited = {start}",
  "pq = edges from start",
  "while pq not empty:",
  "  (w, u, v) = pq.extractMin()",
  "  if v in visited: skip",
  "  mst.add(edge u\u2014v)",
  "  visited.add(v)",
  "  for each edge from v:",
  "    if neighbor not visited:",
  "      pq.insert(edge)",
];

type PresetKey = "small" | "medium" | "dense";

function getEdgeState(
  edge: GraphEdge,
  step: PrimsStep | null,
): "mst" | "candidate" | "default" {
  if (!step) return "default";
  for (const m of step.mstSoFar) {
    if (
      (m.u === edge.u && m.v === edge.v) ||
      (m.u === edge.v && m.v === edge.u)
    ) {
      return "mst";
    }
  }
  for (const q of step.priorityQueue) {
    if (
      (q.u === edge.u && q.v === edge.v) ||
      (q.u === edge.v && q.v === edge.u)
    ) {
      return "candidate";
    }
  }
  return "default";
}

function getNodeState(
  idx: number,
  startNode: number,
  step: PrimsStep | null,
): "start" | "current" | "in-mst" | "default" {
  if (!step) return idx === startNode ? "start" : "default";
  if (step.visited.includes(idx)) {
    if (step.type === "visit" && step.node === idx) return "current";
    return "in-mst";
  }
  if (idx === startNode) return "start";
  return "default";
}

function pseudoLineForStep(step: PrimsStep | null): number {
  if (!step) return -1;
  if (step.type === "visit" && step.edge === null) return 0;
  if (step.type === "skip_edge") return 4;
  if (step.type === "add_edge") return 5;
  return -1;
}

interface GraphVizProps {
  nodes: NodePos[];
  edges: GraphEdge[];
  step: PrimsStep | null;
  startNode: number;
}

function GraphViz({ nodes, edges, step, startNode }: GraphVizProps) {
  if (nodes.length === 0) {
    return (
      <div
        className="pm-graph-container"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#484f58",
          fontSize: "0.85rem",
        }}
      >
        Select a preset and click Run
      </div>
    );
  }

  // Compute viewBox bounds from nodes
  const xs = nodes.map((n) => n.x);
  const ys = nodes.map((n) => n.y);
  const minX = Math.min(...xs) - NODE_RADIUS - 10;
  const minY = Math.min(...ys) - NODE_RADIUS - 10;
  const maxX = Math.max(...xs) + NODE_RADIUS + 10;
  const maxY = Math.max(...ys) + NODE_RADIUS + 10;
  const vbWidth = maxX - minX;
  const vbHeight = maxY - minY;

  return (
    <div className="pm-graph-container">
      <svg
        className="pm-edge-svg"
        viewBox={`${minX} ${minY} ${vbWidth} ${vbHeight}`}
        preserveAspectRatio="xMidYMid meet"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
        }}
      >
        {edges.map((e, i) => {
          const n1 = nodes[e.u];
          const n2 = nodes[e.v];
          if (!n1 || !n2) return null;
          const state = getEdgeState(e, step);
          const lineClass =
            "pm-edge-line" +
            (state === "mst"
              ? " pm-edge-mst"
              : state === "candidate"
                ? " pm-edge-candidate"
                : "");
          const weightClass =
            "pm-edge-weight" +
            (state === "mst"
              ? " pm-edge-mst"
              : state === "candidate"
                ? " pm-edge-candidate"
                : "");
          const mx = (n1.x + n2.x) / 2;
          const my = (n1.y + n2.y) / 2;

          // Offset weight label slightly perpendicular to edge
          const dx = n2.x - n1.x;
          const dy = n2.y - n1.y;
          const len = Math.sqrt(dx * dx + dy * dy) || 1;
          const perpX = (-dy / len) * 10;
          const perpY = (dx / len) * 10;

          return (
            <g key={i}>
              <line
                className={lineClass}
                x1={n1.x}
                y1={n1.y}
                x2={n2.x}
                y2={n2.y}
              />
              <text
                className={weightClass}
                x={mx + perpX}
                y={my + perpY}
                textAnchor="middle"
                dominantBaseline="middle"
              >
                {e.weight}
              </text>
            </g>
          );
        })}

        {nodes.map((n, i) => {
          const state = getNodeState(i, startNode, step);
          let fill = "#161b22";
          let stroke = "#30363d";
          let textColor = "#c9d1d9";

          if (state === "start") {
            fill = "#1a3a20";
            stroke = "#3fb950";
            textColor = "#3fb950";
          } else if (state === "current") {
            fill = "#1a2a3a";
            stroke = "#58a6ff";
            textColor = "#58a6ff";
          } else if (state === "in-mst") {
            fill = "#1a3a20";
            stroke = "#2ea043";
            textColor = "#3fb950";
          }

          return (
            <g key={i}>
              <circle
                cx={n.x}
                cy={n.y}
                r={NODE_RADIUS}
                fill={fill}
                stroke={stroke}
                strokeWidth={2}
                style={{ transition: "fill 0.2s, stroke 0.2s" }}
              />
              {state === "current" && (
                <circle
                  cx={n.x}
                  cy={n.y}
                  r={NODE_RADIUS + 4}
                  fill="none"
                  stroke="#58a6ff"
                  strokeWidth={1.5}
                  opacity={0.4}
                />
              )}
              <text
                x={n.x}
                y={n.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={textColor}
                fontSize={12}
                fontWeight="700"
                fontFamily="var(--font-mono, monospace)"
                style={{ transition: "fill 0.2s" }}
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

export default function PrimsPage() {
  const [presetKey, setPresetKey] = useState<PresetKey>("small");
  const [graphNodes, setGraphNodes] = useState<NodePos[]>(PRESETS.small.nodes);
  const [graphEdges, setGraphEdges] = useState<GraphEdge[]>(
    PRESETS.small.edges,
  );
  const [startNode, setStartNode] = useState(0);
  const [steps, setSteps] = useState<PrimsStep[]>([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speedIdx, setSpeedIdx] = useState(1);
  const [infoText, setInfoText] = useState(
    "Select a graph preset, choose a start node, then click Run.",
  );

  const playTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasRun = steps.length > 0;
  const step =
    hasRun && currentStep >= 0 && currentStep < steps.length
      ? steps[currentStep]
      : null;

  const stopPlayback = useCallback(() => {
    setIsPlaying(false);
    if (playTimerRef.current) {
      clearTimeout(playTimerRef.current);
      playTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (playTimerRef.current) clearTimeout(playTimerRef.current);
    };
  }, []);

  const handlePresetChange = useCallback(
    (key: PresetKey) => {
      stopPlayback();
      setPresetKey(key);
      const preset = PRESETS[key];
      setGraphNodes(preset.nodes.slice());
      setGraphEdges(preset.edges.slice());
      setStartNode(0);
      setSteps([]);
      setCurrentStep(-1);
      setInfoText("Preset loaded. Select a start node and click Run.");
    },
    [stopPlayback],
  );

  const handleRun = useCallback(() => {
    stopPlayback();
    const g = createGraph(graphNodes.length);
    for (const e of graphEdges) {
      addEdge(g, e.u, e.v, e.weight);
    }
    const result = primsMST(g, startNode);
    setSteps(result.steps);
    setCurrentStep(-1);
    setInfoText(
      "Algorithm ready. Use step controls or Play to walk through Prim\u2019s MST.",
    );
  }, [graphNodes.length, graphEdges, startNode, stopPlayback]);

  const handleReset = useCallback(() => {
    stopPlayback();
    setSteps([]);
    setCurrentStep(-1);
    setInfoText("Reset. Select a start node and click Run.");
  }, [stopPlayback]);

  const stepForward = useCallback(() => {
    if (!hasRun) return;
    if (currentStep < steps.length - 1) {
      const next = currentStep + 1;
      setCurrentStep(next);
      const s = steps[next];
      if (s.type === "visit") {
        setInfoText(
          `Visiting node ${s.node}. Scanning its edges for candidates.`,
        );
      } else if (s.type === "add_edge" && s.edge) {
        setInfoText(
          `Adding edge ${s.edge.u} \u2014 ${s.edge.v} (weight ${s.edge.weight}) to MST. Total weight: ${s.totalWeight}.`,
        );
      } else if (s.type === "skip_edge" && s.edge) {
        setInfoText(
          `Skipping edge ${s.edge.u} \u2014 ${s.edge.v} (weight ${s.edge.weight}) \u2014 node ${s.edge.v} already in MST.`,
        );
      }
    } else {
      stopPlayback();
      const finalWeight =
        steps.length > 0 ? steps[steps.length - 1].totalWeight : 0;
      setInfoText(`Algorithm complete. MST total weight: ${finalWeight}.`);
    }
  }, [hasRun, currentStep, steps, stopPlayback]);

  const stepBackward = useCallback(() => {
    if (currentStep > 0) {
      const prev = currentStep - 1;
      setCurrentStep(prev);
      const s = steps[prev];
      if (s.type === "visit") {
        setInfoText(
          `Visiting node ${s.node}. Scanning its edges for candidates.`,
        );
      } else if (s.type === "add_edge" && s.edge) {
        setInfoText(
          `Adding edge ${s.edge.u} \u2014 ${s.edge.v} (weight ${s.edge.weight}) to MST.`,
        );
      } else if (s.type === "skip_edge" && s.edge) {
        setInfoText(
          `Skipping edge ${s.edge.u} \u2014 ${s.edge.v} (weight ${s.edge.weight}) \u2014 node ${s.edge.v} already in MST.`,
        );
      }
    } else if (currentStep === 0) {
      setCurrentStep(-1);
      setInfoText("Stepped back to start.");
    }
  }, [currentStep, steps]);

  // Autoplay effect
  useEffect(() => {
    if (!isPlaying || !hasRun) return;
    if (currentStep >= steps.length - 1) {
      setIsPlaying(false);
      return;
    }
    playTimerRef.current = setTimeout(() => {
      stepForward();
    }, SPEEDS_MS[speedIdx].ms);
    return () => {
      if (playTimerRef.current) clearTimeout(playTimerRef.current);
    };
  }, [isPlaying, currentStep, steps.length, speedIdx, stepForward, hasRun]);

  const handlePlayPause = useCallback(() => {
    if (!hasRun) return;
    if (currentStep >= steps.length - 1) {
      setCurrentStep(-1);
      setIsPlaying(true);
    } else {
      setIsPlaying((p) => !p);
    }
  }, [hasRun, currentStep, steps.length]);

  const atStart = !hasRun || currentStep < 0;
  const atEnd = hasRun && currentStep >= steps.length - 1;

  const codeLine = pseudoLineForStep(step);

  const watchVars = useMemo(() => {
    if (!step) return [];
    return [
      {
        label: "step type",
        value: step.type,
        highlight: step.type === "add_edge",
      },
      {
        label: "current node",
        value: String(step.node),
        highlight: true,
      },
      {
        label: "pq size",
        value: String(step.priorityQueue.length),
        highlight: step.priorityQueue.length > 0,
      },
      {
        label: "mst edges",
        value: String(step.mstSoFar.length),
        highlight: step.type === "add_edge",
      },
      {
        label: "total weight",
        value: String(step.totalWeight),
        highlight: step.type === "add_edge",
      },
      {
        label: "visited",
        value: step.visited.join(", ") || "none",
      },
    ];
  }, [step]);

  return (
    <div className="algo-page" data-category="graph">
      <Nav currentCategory="graph" />

      <div className="page-header">
        <div className="title-group">
          <h1>Prim&apos;s Minimum Spanning Tree</h1>
          <div className="title-meta">
            <span className="badge">Graph</span>
            <ComplexityPopover
              best="O(E log V)"
              avg="O(E log V)"
              worst="O(E log V)"
              space="O(V + E)"
              bestNote="All cases"
              avgNote="All cases"
              worstNote="All cases"
              spaceNote="Priority queue + adjacency"
              why="Each of V vertices is added to the MST once. Each addition may push E edges to the heap. Each heap operation is O(log V). Total: O(E log V)."
            />
          </div>
        </div>
        <div className="pm-legend">
          <span>
            <span className="pm-swatch pm-swatch-unvisited" />
            Unvisited
          </span>
          <span>
            <span className="pm-swatch pm-swatch-start" />
            Start
          </span>
          <span>
            <span className="pm-swatch pm-swatch-mst" />
            In MST
          </span>
          <span>
            <span className="pm-swatch pm-swatch-current" />
            Current
          </span>
          <span>
            <span
              style={{
                display: "inline-block",
                width: 22,
                height: 3,
                background: "#3fb950",
                verticalAlign: "middle",
                marginRight: 4,
                borderRadius: 2,
              }}
            />
            MST Edge
          </span>
          <span>
            <span
              style={{
                display: "inline-block",
                width: 22,
                height: 0,
                verticalAlign: "middle",
                marginRight: 4,
                borderBottom: "2px dashed #e3b341",
              }}
            />
            Candidate
          </span>
        </div>
      </div>

      <div className="content-grid">
        <div className="main-column">
          <ProblemFrame title="Context">
            <div className="app-section">
              <span className="app-label">The Problem</span>
              <p>
                You&apos;re laying fiber optic cable to connect 50 cities. Each
                potential cable segment has a cost. How do you connect all
                cities with minimum total cable?
              </p>
            </div>
            <div className="app-section">
              <span className="app-label">The Approach</span>
              <p>
                Grow a tree one edge at a time. Always add the cheapest edge
                that connects a new city to the already-connected group. The
                result spans all cities optimally.
              </p>
            </div>
            <div className="app-section">
              <span className="app-label">When To Use</span>
              <p>
                Minimum Spanning Tree for dense graphs. Network design
                (telecommunications, electrical grids, water pipes). Cluster
                analysis.
              </p>
            </div>
          </ProblemFrame>

          <WhyComplexityPanel derivation="Each of V vertices is visited exactly once (added to the MST). For each vertex, all incident edges are pushed to the priority queue. Total edge operations across all vertices: E. Each heap push/pop is O(log V) since the heap contains at most E entries bounded by V in a sparse MST. Overall: O(E log V) time, O(V + E) space for the heap and adjacency list." />

          <AnalogyPanel>
            <strong>Real-world analogy:</strong> Building a road network on a
            budget &mdash; always connect the cheapest available road that
            reaches a new town, until every town is connected. You never build a
            road between two already-connected towns.
          </AnalogyPanel>

          <div className="panel">
            <div className="pm-controls-row">
              <label htmlFor="pm-preset">
                Graph
                <select
                  id="pm-preset"
                  className="pm-select"
                  value={presetKey}
                  onChange={(e) =>
                    handlePresetChange(e.target.value as PresetKey)
                  }
                >
                  {(Object.keys(PRESETS) as PresetKey[]).map((k) => (
                    <option key={k} value={k}>
                      {PRESETS[k].label}
                    </option>
                  ))}
                </select>
              </label>

              <label htmlFor="pm-start-node">
                Start Node
                <select
                  id="pm-start-node"
                  className="pm-select"
                  value={startNode}
                  onChange={(e) => {
                    setStartNode(Number(e.target.value));
                    stopPlayback();
                    setSteps([]);
                    setCurrentStep(-1);
                  }}
                >
                  {graphNodes.map((_, i) => (
                    <option key={i} value={i}>
                      Node {i}
                    </option>
                  ))}
                </select>
              </label>

              <button className="pm-btn-run" onClick={handleRun}>
                Run Prim&apos;s MST
              </button>
            </div>

            <div className="pm-info" style={{ marginTop: "0.75rem" }}>
              {infoText}
            </div>

            <div className="pm-layout" style={{ marginTop: "0.75rem" }}>
              <GraphViz
                nodes={graphNodes}
                edges={graphEdges}
                step={step}
                startNode={startNode}
              />

              <div className="pm-sidebar">
                <div className="pm-sidebar-section">
                  <div className="pm-sidebar-title">
                    Priority Queue <span className="pm-badge">Min-Heap</span>
                  </div>
                  <div className="pm-pq-list">
                    {!step || step.priorityQueue.length === 0 ? (
                      <div className="pm-pq-empty">
                        {step
                          ? "Priority queue is empty"
                          : "Run algorithm to see queue"}
                      </div>
                    ) : (
                      step.priorityQueue.map((q: PrimsEdge, i: number) => (
                        <div
                          key={i}
                          className={`pm-pq-item${i === 0 ? " pm-pq-top" : ""}`}
                        >
                          <span>
                            {q.u} \u2014 {q.v}
                          </span>
                          <span className="pm-pq-weight">{q.weight}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="pm-sidebar-section">
                  <div className="pm-sidebar-title">MST Edges</div>
                  <div className="pm-mst-list">
                    {!step || step.mstSoFar.length === 0 ? (
                      <div className="pm-mst-empty">
                        {step ? "No MST edges yet" : "Run algorithm to see MST"}
                      </div>
                    ) : (
                      step.mstSoFar.map((m: PrimsEdge, i: number) => (
                        <div key={i} className="pm-mst-item">
                          <span>
                            {m.u} \u2014 {m.v}
                          </span>
                          <span className="pm-mst-weight">{m.weight}</span>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="pm-total-label">Total Weight</div>
                  <div className="pm-total-weight">
                    {step ? step.totalWeight : 0}
                  </div>
                </div>

                <div className="pm-sidebar-section">
                  <div className="pm-sidebar-title">Visited Nodes</div>
                  <div className="pm-visited-list">
                    {step && step.visited.length > 0
                      ? step.visited.join(", ")
                      : step
                        ? "none"
                        : "\u2014"}
                  </div>
                </div>
              </div>
            </div>

            {hasRun && (
              <div
                className="playback-controls"
                style={{ marginTop: "0.75rem" }}
              >
                <div className="playback-btns">
                  <button
                    type="button"
                    className="icon-btn"
                    onClick={handleReset}
                    title="Reset"
                    aria-label="Reset"
                  >
                    &#8635;
                  </button>
                  <button
                    type="button"
                    className="icon-btn"
                    onClick={stepBackward}
                    disabled={atStart}
                    title="Step back"
                    aria-label="Step back"
                  >
                    &#9198;
                  </button>
                  <button
                    type="button"
                    className={`icon-btn${isPlaying ? " active" : ""}`}
                    onClick={handlePlayPause}
                    title={isPlaying ? "Pause" : "Play"}
                    aria-label={isPlaying ? "Pause" : "Play"}
                  >
                    {isPlaying ? "\u23F8" : "\u25B6"}
                  </button>
                  <button
                    type="button"
                    className="icon-btn"
                    onClick={stepForward}
                    disabled={atEnd}
                    title="Step forward"
                    aria-label="Step forward"
                  >
                    &#9197;
                  </button>
                </div>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.8rem",
                    color: "var(--text-secondary)",
                  }}
                >
                  Step {currentStep < 0 ? 0 : currentStep + 1} / {steps.length}
                </span>
                <button
                  type="button"
                  className="icon-btn"
                  onClick={() => setSpeedIdx((i) => (i + 1) % SPEEDS_MS.length)}
                  title="Cycle speed"
                  style={{
                    width: "auto",
                    padding: "0 0.6rem",
                    fontSize: "0.72rem",
                  }}
                >
                  {SPEEDS_MS[speedIdx].label}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="sidebar">
          {step && (
            <div className="stats-grid" style={{ marginBottom: "1rem" }}>
              <div className="stat-card">
                <span className="stat-value">
                  {currentStep < 0 ? 0 : currentStep + 1}
                </span>
                <span className="stat-label">Steps</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">{step.totalWeight}</span>
                <span className="stat-label">MST Weight</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">{step.mstSoFar.length}</span>
                <span className="stat-label">MST Edges</span>
              </div>
            </div>
          )}

          {watchVars.length > 0 && <WatchPanel vars={watchVars} />}

          <div className="panel">
            <div className="panel-title">Pseudocode</div>
            <div className="code-panel pm-pseudo">
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
