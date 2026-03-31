import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { Nav } from "@/components/Nav";
import { PlaybackController } from "@/components/PlaybackController";
import { WatchPanel } from "@/components/WatchPanel";
import { ComplexityPopover } from "@/components/ComplexityPopover";
import { AnalogyPanel } from "@/components/AnalogyPanel";
import { ProblemFrame } from "@/components/ProblemFrame";
import { WhyComplexityPanel } from "@/components/WhyComplexityPanel";
import {
  maxFlow,
  buildResidual,
  PRESETS,
  type FordFulkersonStep,
  type MinCut,
  type PresetGraph,
} from "@/lib/algorithms/ford-fulkerson";
import "@/styles/ford-fulkerson.css";

// SVG canvas dimensions
const SVG_W = 540;
const SVG_H = 360;
const NODE_R = 22;
const ARROW_OFFSET = NODE_R + 2;

const PSEUDO_LINES = [
  "maxFlow(G, s, t):",
  " build residual graph R = G",
  " flow = 0",
  " while path = BFS(R, s, t):",
  "  b = min capacity on path",
  "  for each edge (u,v) in path:",
  "   R[u][v] -= b",
  "   R[v][u] += b",
  "  flow += b",
  " return flow",
];

function pseudoLineForStep(step: FordFulkersonStep | undefined): number {
  if (!step) return -1;
  switch (step.type) {
    case "bfs-start":
      return 3;
    case "bfs-path-found":
      return 4;
    case "bfs-no-path":
      return 9;
    case "augment":
      return 8;
    case "done":
      return 9;
    default:
      return -1;
  }
}

interface EdgeGeometry {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  mx: number;
  my: number;
  labelX: number;
  labelY: number;
}

function computeEdgeGeometry(
  fromPos: { x: number; y: number },
  toPos: { x: number; y: number },
  offset: number,
): EdgeGeometry {
  const dx = toPos.x - fromPos.x;
  const dy = toPos.y - fromPos.y;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  const nx = dx / len;
  const ny = dy / len;

  const x1 = fromPos.x + nx * offset;
  const y1 = fromPos.y + ny * offset;
  const x2 = toPos.x - nx * offset;
  const y2 = toPos.y - ny * offset;

  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;

  // Perpendicular offset for label
  const labelX = mx - ny * 14;
  const labelY = my + nx * 14;

  return { x1, y1, x2, y2, mx, my, labelX, labelY };
}

type EdgeState = "normal" | "path" | "cut" | "saturated";

interface FlowEdge {
  from: string;
  to: string;
  capacity: number;
  flow: number;
  state: EdgeState;
}

function buildFlowEdges(
  preset: PresetGraph,
  step: FordFulkersonStep | undefined,
  minCut: MinCut | null,
): FlowEdge[] {
  const originalGraph = preset.graph;
  const initialResidual = buildResidual(originalGraph);
  const residual = step ? step.residual : initialResidual;

  const pathSet = new Set<string>();
  if (step?.path) {
    for (let i = 0; i < step.path.length - 1; i++) {
      pathSet.add(`${step.path[i]}->${step.path[i + 1]}`);
    }
  }

  const cutEdgeSet = new Set<string>();
  if (minCut) {
    for (const e of minCut.edges) {
      cutEdgeSet.add(`${e.from}->${e.to}`);
    }
  }

  const edges: FlowEdge[] = [];
  for (const from of Object.keys(originalGraph)) {
    for (const to of Object.keys(originalGraph[from] ?? {})) {
      const capacity = originalGraph[from]![to]!;
      const residualForward = residual[from]?.[to] ?? 0;
      // flow = original_capacity - residual_forward
      const flow = capacity - residualForward;

      const edgeKey = `${from}->${to}`;
      let state: EdgeState = "normal";

      if (pathSet.has(edgeKey)) {
        state = "path";
      } else if (cutEdgeSet.has(edgeKey)) {
        state = "cut";
      } else if (residualForward === 0) {
        state = "saturated";
      }

      edges.push({ from, to, capacity, flow, state });
    }
  }
  return edges;
}

function edgeColor(state: EdgeState): string {
  switch (state) {
    case "path":
      return "#f78166";
    case "cut":
      return "#ffa657";
    case "saturated":
      return "#3d444d";
    default:
      return "#58a6ff";
  }
}

function arrowMarkerId(state: EdgeState): string {
  switch (state) {
    case "path":
      return "url(#ff-arrow-path)";
    case "cut":
      return "url(#ff-arrow-cut)";
    case "saturated":
      return "url(#ff-arrow-saturated)";
    default:
      return "url(#ff-arrow-normal)";
  }
}

function edgeStrokeWidth(state: EdgeState): number {
  if (state === "path") return 2.5;
  if (state === "cut") return 2;
  return 1.5;
}

interface FlowNetworkSvgProps {
  preset: PresetGraph;
  step: FordFulkersonStep | undefined;
  minCut: MinCut | null;
}

function FlowNetworkSvg({ preset, step, minCut }: FlowNetworkSvgProps) {
  const edges = useMemo(
    () => buildFlowEdges(preset, step, minCut),
    [preset, step, minCut],
  );

  const pathNodeSet = useMemo(() => new Set(step?.path ?? []), [step?.path]);

  const sideS = useMemo(() => new Set(minCut?.sideS ?? []), [minCut]);
  const sideT = useMemo(() => new Set(minCut?.sideT ?? []), [minCut]);

  return (
    <svg
      className="ff-svg"
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      width={SVG_W}
      height={SVG_H}
      aria-label="Flow network visualization"
    >
      <defs>
        <marker
          id="ff-arrow-normal"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon points="0 0, 10 3.5, 0 7" fill="#58a6ff" />
        </marker>
        <marker
          id="ff-arrow-path"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon points="0 0, 10 3.5, 0 7" fill="#f78166" />
        </marker>
        <marker
          id="ff-arrow-cut"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon points="0 0, 10 3.5, 0 7" fill="#ffa657" />
        </marker>
        <marker
          id="ff-arrow-saturated"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon points="0 0, 10 3.5, 0 7" fill="#3d444d" />
        </marker>
      </defs>

      {/* Edges */}
      {edges.map((edge) => {
        const fromPos = preset.positions[edge.from]!;
        const toPos = preset.positions[edge.to]!;
        const geo = computeEdgeGeometry(fromPos, toPos, ARROW_OFFSET);
        const color = edgeColor(edge.state);
        const strokeW = edgeStrokeWidth(edge.state);
        const marker = arrowMarkerId(edge.state);

        return (
          <g key={`${edge.from}-${edge.to}`}>
            <line
              x1={geo.x1}
              y1={geo.y1}
              x2={geo.x2}
              y2={geo.y2}
              stroke={color}
              strokeWidth={strokeW}
              markerEnd={marker}
              opacity={edge.state === "saturated" ? 0.45 : 1}
            />
            <text
              x={geo.labelX}
              y={geo.labelY}
              className="ff-edge-label"
              textAnchor="middle"
              dominantBaseline="central"
            >
              {edge.flow}/{edge.capacity}
            </text>
          </g>
        );
      })}

      {/* Nodes */}
      {preset.nodes.map((nodeId) => {
        const pos = preset.positions[nodeId]!;
        const isSource = nodeId === preset.source;
        const isSink = nodeId === preset.sink;
        const isOnPath = pathNodeSet.has(nodeId);
        const isInSideS = sideS.has(nodeId) && minCut !== null;
        const isInSideT = sideT.has(nodeId) && minCut !== null;

        let fillColor = "#161b22";
        let strokeColor = "#30363d";
        let strokeWidth = 1.5;
        let labelColor = "#c9d1d9";

        if (isSource) {
          fillColor = "#0d3a1f";
          strokeColor = "#3fb950";
          strokeWidth = 2;
          labelColor = "#3fb950";
        } else if (isSink) {
          fillColor = "#3a0d0d";
          strokeColor = "#f78166";
          strokeWidth = 2;
          labelColor = "#f78166";
        }

        if (isOnPath && !isSource && !isSink) {
          fillColor = "#3a1f0d";
          strokeColor = "#f78166";
          strokeWidth = 2.5;
          labelColor = "#f78166";
        }

        if (minCut !== null) {
          if (isInSideS && !isSource) {
            strokeColor = "#3fb950";
            strokeWidth = 2;
          }
          if (isInSideT && !isSink) {
            strokeColor = "#ffa657";
            strokeWidth = 2;
          }
        }

        return (
          <g key={nodeId}>
            <circle
              cx={pos.x}
              cy={pos.y}
              r={NODE_R}
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
            />
            <text
              x={pos.x}
              y={pos.y}
              textAnchor="middle"
              dominantBaseline="central"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "13px",
                fontWeight: 700,
                fill: labelColor,
                pointerEvents: "none",
                userSelect: "none",
              }}
            >
              {nodeId}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

interface PathInfoBannerProps {
  step: FordFulkersonStep;
  source: string;
  sink: string;
}

function PathInfoBanner({ step, source, sink }: PathInfoBannerProps) {
  if (!step.path || step.path.length === 0) return null;

  return (
    <div className="ff-path-info">
      {step.path.map((nodeId, idx) => (
        <span
          key={`${nodeId}-${idx}`}
          style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}
        >
          <span
            className={`ff-path-node${
              nodeId === source
                ? " ff-path-node-source"
                : nodeId === sink
                  ? " ff-path-node-sink"
                  : " ff-path-node-active"
            }`}
          >
            {nodeId}
          </span>
          {idx < step.path!.length - 1 && (
            <span className="ff-path-arrow">→</span>
          )}
        </span>
      ))}
      {step.bottleneck > 0 && (
        <span className="ff-bottleneck-badge">
          bottleneck: {step.bottleneck}
        </span>
      )}
    </div>
  );
}

export default function FordFulkersonPage() {
  const [activePresetKey, setActivePresetKey] = useState<string>("simple");
  const [preset, setPreset] = useState<PresetGraph>(PRESETS["simple"]!);
  const [steps, setSteps] = useState<FordFulkersonStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [minCut, setMinCut] = useState<MinCut | null>(null);
  const [hasRun, setHasRun] = useState(false);
  const [infoText, setInfoText] = useState(
    "Select a preset and click Run Algorithm to visualize Ford-Fulkerson max flow.",
  );
  const playbackResetRef = useRef(0);

  const step = hasRun && steps.length > 0 ? steps[currentStep] : undefined;

  const pathsFound = useMemo(() => {
    if (!steps.length) return 0;
    return steps.filter((s) => s.type === "augment").length;
  }, [steps]);

  const handlePresetClick = useCallback((key: string) => {
    const p = PRESETS[key];
    if (!p) return;
    setActivePresetKey(key);
    setPreset(p);
    setSteps([]);
    setCurrentStep(0);
    setMinCut(null);
    setHasRun(false);
    setInfoText(`Loaded: ${p.name}. ${p.description}`);
  }, []);

  const handleRun = useCallback(() => {
    const result = maxFlow(preset.graph, preset.source, preset.sink);
    setSteps(result.steps);
    setCurrentStep(0);
    setMinCut(result.minCut);
    setHasRun(true);
    // Force PlaybackController to reset its isPlaying state
    playbackResetRef.current += 1;
    setInfoText(
      `Running Ford-Fulkerson on ${preset.name}. Max flow = ${result.flow}. Use playback to step through.`,
    );
  }, [preset]);

  const handleReset = useCallback(() => {
    setCurrentStep(0);
  }, []);

  const handleResetAll = useCallback(() => {
    setSteps([]);
    setCurrentStep(0);
    setMinCut(null);
    setHasRun(false);
    setInfoText("Select a preset and click Run Algorithm to start.");
  }, []);

  // Show min-cut only at done step
  const visibleMinCut = useMemo(() => {
    if (!step || !minCut) return null;
    if (step.type === "done") return minCut;
    return null;
  }, [step, minCut]);

  const codeLine = pseudoLineForStep(step);

  const watchVars = step
    ? [
        {
          label: "total flow",
          value: step.totalFlow,
          highlight: step.type === "augment" || step.type === "done",
        },
        {
          label: "bottleneck",
          value: step.bottleneck > 0 ? step.bottleneck : "—",
          highlight: step.bottleneck > 0,
        },
        {
          label: "paths found",
          value: pathsFound,
        },
        {
          label: "step type",
          value: step.type,
          highlight: step.type === "bfs-path-found" || step.type === "augment",
        },
      ]
    : [];

  const atEnd = hasRun && currentStep >= steps.length - 1;
  const isDone = step?.type === "done";

  useEffect(() => {
    if (step) {
      setInfoText(step.description);
    }
  }, [step]);

  return (
    <div className="algo-page" data-category="graph">
      <Nav currentCategory="graph" />

      {/* Page Header */}
      <div className="page-header">
        <div className="title-group">
          <h1>Ford-Fulkerson Max Flow</h1>
          <div className="title-meta">
            <span className="badge">Graph</span>
            <ComplexityPopover
              best="O(VE²)"
              avg="O(VE²)"
              worst="O(VE²)"
              space="O(V + E)"
              bestNote="Edmonds-Karp (BFS)"
              avgNote="BFS guarantees polynomial"
              worstNote="Edmonds-Karp bound"
              spaceNote="Residual graph"
              why="Each BFS augmentation saturates at least one edge. There are O(VE) possible saturations. Each BFS costs O(E). Total: O(VE²)."
            />
          </div>
        </div>
        <div className="ff-legend">
          <span>
            <span className="ff-swatch ff-swatch-source" /> Source
          </span>
          <span>
            <span className="ff-swatch ff-swatch-sink" /> Sink
          </span>
          <span>
            <span className="ff-swatch ff-swatch-path" /> Augmenting Path
          </span>
          <span>
            <span className="ff-swatch ff-swatch-cut" /> Min-Cut Edge
          </span>
          <span>
            <span className="ff-swatch ff-swatch-saturated" /> Saturated
          </span>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="content-grid">
        {/* Main column */}
        <div className="main-column">
          <ProblemFrame title="The Problem">
            <div className="app-section">
              <span className="app-label">The Problem</span>
              <p>
                Given a directed graph where each edge has a capacity, find the
                maximum amount of flow that can be sent from a source node to a
                sink node without exceeding any edge capacity.
              </p>
            </div>
            <div className="app-section">
              <span className="app-label">The Approach</span>
              <p>
                Repeatedly find augmenting paths (routes with remaining
                capacity) from source to sink using BFS, push flow along them,
                and update the residual graph — until no path exists.
              </p>
            </div>
            <div className="app-section">
              <span className="app-label">When To Use</span>
              <p>
                Network routing, scheduling, bipartite matching, project
                selection, image segmentation, and any problem reducible to
                maximizing flow through a capacity-constrained network.
              </p>
            </div>
          </ProblemFrame>

          <WhyComplexityPanel derivation="Each BFS finds and saturates at least one edge. An edge can be saturated and re-used at most O(V) times before being permanently saturated in one direction — giving O(VE) augmentations. Each BFS costs O(E). Total: O(VE²)." />

          <AnalogyPanel>
            Imagine a city water system with pipes of different diameters
            connecting a reservoir (source) to a district (sink). Engineers
            maximize delivery by routing water along any open path, using
            reverse-flow (letting water &ldquo;change direction&rdquo; in pipes
            already in use) until no new route can carry more water.
          </AnalogyPanel>

          {/* Controls panel */}
          <div className="panel">
            <div className="controls">
              <div className="inputs">
                <label
                  style={{
                    fontWeight: 600,
                    fontSize: "0.85rem",
                    color: "var(--text-secondary)",
                  }}
                >
                  Preset
                </label>
                <div className="ff-preset-buttons">
                  {Object.entries(PRESETS).map(([key, p]) => (
                    <button
                      key={key}
                      type="button"
                      className={`ff-preset-btn${activePresetKey === key ? " ff-preset-active" : ""}`}
                      onClick={() => handlePresetClick(key)}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
                <div className="ff-preset-desc">{preset.description}</div>
              </div>

              <div className="buttons" style={{ marginTop: "0.75rem" }}>
                <button
                  type="button"
                  className="ff-btn-primary"
                  onClick={handleRun}
                >
                  Run Algorithm
                </button>
                <button type="button" onClick={handleResetAll}>
                  Reset
                </button>
              </div>
            </div>

            {/* Info message */}
            <div className="info" style={{ marginTop: "0.75rem" }}>
              {infoText}
            </div>

            {/* SVG Visualization */}
            <div className="ff-svg-container">
              <FlowNetworkSvg
                preset={preset}
                step={step}
                minCut={visibleMinCut}
              />
            </div>

            {/* Path info banner — shown when a path is found or augmented */}
            {step &&
              (step.type === "bfs-path-found" || step.type === "augment") && (
                <PathInfoBanner
                  step={step}
                  source={preset.source}
                  sink={preset.sink}
                />
              )}

            {/* Min-cut display at completion */}
            {isDone && minCut && minCut.edges.length > 0 && (
              <div className="ff-mincut-panel">
                <div className="ff-mincut-title">
                  Min-Cut ({minCut.edges.length} edge
                  {minCut.edges.length !== 1 ? "s" : ""})
                </div>
                <div className="ff-mincut-edges">
                  {minCut.edges.map((e) => (
                    <span key={`${e.from}-${e.to}`} className="ff-mincut-edge">
                      {e.from} → {e.to}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Playback controls */}
            {hasRun && (
              <PlaybackController
                key={playbackResetRef.current}
                steps={steps}
                currentStep={currentStep}
                onStep={setCurrentStep}
                onReset={handleReset}
              />
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="sidebar">
          {/* Stats */}
          {hasRun && (
            <div
              className="stats-grid ff-stats-grid"
              style={{ marginBottom: "1rem" }}
            >
              <div className="stat-card">
                <span className="stat-value">{step?.totalFlow ?? 0}</span>
                <span className="stat-label">Max Flow</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">{pathsFound}</span>
                <span className="stat-label">Paths Found</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">
                  {hasRun ? `${currentStep + 1} / ${steps.length}` : "0 / 0"}
                </span>
                <span className="stat-label">Step</span>
              </div>
            </div>
          )}

          {/* Watch panel */}
          {watchVars.length > 0 && <WatchPanel vars={watchVars} />}

          {/* Pseudocode */}
          <div className="panel ff-pseudo-panel">
            <div className="panel-title">Pseudocode (Edmonds-Karp)</div>
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

          {/* Completion summary */}
          {atEnd && isDone && (
            <div
              style={{
                background: "rgba(63, 185, 80, 0.1)",
                border: "1px solid rgba(63, 185, 80, 0.4)",
                borderRadius: 8,
                padding: "0.75rem 1rem",
                fontSize: "0.85rem",
                color: "#3fb950",
                fontWeight: 600,
              }}
            >
              Max flow = {step?.totalFlow} (by max-flow min-cut theorem, equals
              the min-cut capacity)
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
