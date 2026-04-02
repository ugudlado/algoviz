import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { Nav } from "@/components/Nav";
import { AlgorithmComplete } from "@/components/AlgorithmComplete";
import { PlaybackController } from "@/components/PlaybackController";
import { WatchPanel } from "@/components/WatchPanel";
import { ComplexityPopover } from "@/components/ComplexityPopover";
import { AnalogyPanel } from "@/components/AnalogyPanel";
import { ProblemFrame } from "@/components/ProblemFrame";
import { WhyComplexityPanel } from "@/components/WhyComplexityPanel";
import {
  run,
  presets,
  MAX_NODES,
  type TopoEdge,
  type TopoSnapshot,
  type TopoSortResult,
  type TopoPreset,
} from "@/lib/algorithms/topo-sort";
import "@/styles/topo-sort.css";

const NODE_RADIUS = 22;

// Compute layered layout positions for DAG visualization.
// Returns a map of nodeId -> {x, y} within the given SVG dimensions.
function computeLayout(
  nodes: string[],
  edges: TopoEdge[],
  svgW: number,
  svgH: number,
): Record<string, { x: number; y: number }> {
  if (nodes.length === 0) return {};

  const padding = 40;
  const inDeg: Record<string, number> = {};
  const adj: Record<string, string[]> = {};

  for (const n of nodes) {
    inDeg[n] = 0;
    adj[n] = [];
  }
  for (const e of edges) {
    if (adj[e.from]) adj[e.from].push(e.to);
    if (inDeg[e.to] !== undefined) inDeg[e.to]++;
  }

  // BFS layering — longest path from sources
  const layer: Record<string, number> = {};
  const inDegCopy = { ...inDeg };
  const queue: string[] = [];

  for (const n of nodes) {
    if (inDegCopy[n] === 0) {
      queue.push(n);
      layer[n] = 0;
    }
  }

  let maxLayer = 0;
  let qi = 0;
  while (qi < queue.length) {
    const cur = queue[qi++];
    for (const nb of adj[cur] ?? []) {
      const nl = (layer[cur] ?? 0) + 1;
      if (layer[nb] === undefined || nl > layer[nb]) {
        layer[nb] = nl;
      }
      if (nl > maxLayer) maxLayer = nl;
      inDegCopy[nb]--;
      if (inDegCopy[nb] === 0) queue.push(nb);
    }
  }

  // Nodes not visited (cycle members) go to a final layer
  for (const n of nodes) {
    if (layer[n] === undefined) {
      maxLayer = maxLayer + 1;
      layer[n] = maxLayer;
    }
  }

  // Recompute true maxLayer
  maxLayer = 0;
  for (const n of nodes) {
    if ((layer[n] ?? 0) > maxLayer) maxLayer = layer[n] ?? 0;
  }

  // Group nodes by layer
  const layers: Record<number, string[]> = {};
  for (const n of nodes) {
    const l = layer[n] ?? 0;
    if (!layers[l]) layers[l] = [];
    layers[l].push(n);
  }

  const numLayers = maxLayer + 1;
  const layerWidth = (svgW - 2 * padding) / Math.max(numLayers, 1);
  const positions: Record<string, { x: number; y: number }> = {};

  for (let l = 0; l <= maxLayer; l++) {
    const nodesInLayer = layers[l] ?? [];
    const layerHeight = (svgH - 2 * padding) / Math.max(nodesInLayer.length, 1);
    for (let j = 0; j < nodesInLayer.length; j++) {
      const n = nodesInLayer[j];
      positions[n] = {
        x: padding + NODE_RADIUS + l * layerWidth,
        y: padding + NODE_RADIUS + j * layerHeight,
      };
    }
  }

  return positions;
}

// Determine node display state from the current snapshot
function nodeStateFromSnapshot(
  nodes: string[],
  snapshot: TopoSnapshot | null,
  isFinalStep: boolean,
  cycleNodes: string[],
): Record<string, "default" | "queued" | "processing" | "completed" | "cycle"> {
  const state: Record<
    string,
    "default" | "queued" | "processing" | "completed" | "cycle"
  > = {};
  for (const n of nodes) state[n] = "default";

  if (!snapshot) return state;

  for (const n of snapshot.order) state[n] = "completed";
  for (const n of snapshot.queue) state[n] = "queued";
  if (snapshot.currentNode) state[snapshot.currentNode] = "processing";
  if (snapshot.action === "cycle-detected" && isFinalStep) {
    for (const n of cycleNodes) state[n] = "cycle";
  }

  return state;
}

// DAG SVG component — pure React SVG rendering
interface DagSvgProps {
  nodes: string[];
  edges: TopoEdge[];
  snapshot: TopoSnapshot | null;
  isFinalStep: boolean;
  cycleNodes: string[];
  width: number;
  height: number;
}

function DagSvg({
  nodes,
  edges,
  snapshot,
  isFinalStep,
  cycleNodes,
  width,
  height,
}: DagSvgProps) {
  const positions = useMemo(
    () => computeLayout(nodes, edges, width, height),
    [nodes, edges, width, height],
  );

  const nodeState = useMemo(
    () => nodeStateFromSnapshot(nodes, snapshot, isFinalStep, cycleNodes),
    [nodes, snapshot, isFinalStep, cycleNodes],
  );

  return (
    <svg
      className="topo-svg"
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <marker
          id="topo-arrowhead"
          markerWidth="10"
          markerHeight="7"
          refX="10"
          refY="3.5"
          orient="auto"
        >
          <polygon points="0 0, 10 3.5, 0 7" fill="#30363d" />
        </marker>
        <marker
          id="topo-arrowhead-active"
          markerWidth="10"
          markerHeight="7"
          refX="10"
          refY="3.5"
          orient="auto"
        >
          <polygon points="0 0, 10 3.5, 0 7" fill="#d29922" />
        </marker>
        <marker
          id="topo-arrowhead-completed"
          markerWidth="10"
          markerHeight="7"
          refX="10"
          refY="3.5"
          orient="auto"
        >
          <polygon points="0 0, 10 3.5, 0 7" fill="#2ea04380" />
        </marker>
      </defs>

      {/* Edges */}
      {edges.map((e, i) => {
        const from = positions[e.from];
        const to = positions[e.to];
        if (!from || !to) return null;

        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 1) return null;

        const startX = from.x + (dx / dist) * NODE_RADIUS;
        const startY = from.y + (dy / dist) * NODE_RADIUS;
        const endX = to.x - (dx / dist) * (NODE_RADIUS + 8);
        const endY = to.y - (dy / dist) * (NODE_RADIUS + 8);

        const isActive = snapshot?.currentNode === e.from;
        const isCompleted =
          nodeState[e.from] === "completed" && nodeState[e.to] === "completed";

        const edgeClass = [
          "topo-edge",
          isActive ? "topo-edge-active" : "",
          isCompleted ? "topo-edge-completed" : "",
        ]
          .filter(Boolean)
          .join(" ");

        const markerId = isActive
          ? "topo-arrowhead-active"
          : isCompleted
            ? "topo-arrowhead-completed"
            : "topo-arrowhead";

        return (
          <line
            key={i}
            x1={startX}
            y1={startY}
            x2={endX}
            y2={endY}
            className={edgeClass}
            markerEnd={`url(#${markerId})`}
          />
        );
      })}

      {/* Nodes */}
      {nodes.map((n) => {
        const pos = positions[n];
        if (!pos) return null;
        const state = nodeState[n];

        return (
          <g key={n}>
            <circle
              cx={pos.x}
              cy={pos.y}
              r={NODE_RADIUS}
              className={`topo-node topo-node-${state}`}
            />
            <text x={pos.x} y={pos.y} className="topo-node-label">
              {n}
            </text>
            {snapshot?.inDegrees?.[n] !== undefined && (
              <text
                x={pos.x}
                y={pos.y - NODE_RADIUS - 6}
                className="topo-node-degree"
              >
                {snapshot.inDegrees[n]}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

// Main action info text from snapshot
function actionInfo(snapshot: TopoSnapshot | null, stepIdx: number): string {
  if (!snapshot) return "";
  switch (snapshot.action) {
    case "init":
      return "Initialized: enqueued nodes with in-degree 0.";
    case "dequeue":
      return `Dequeued ${snapshot.currentNode} \u2014 added to sorted order.`;
    case "update-neighbors":
      return `Updated neighbors of ${snapshot.currentNode} \u2014 decremented in-degrees.`;
    case "cycle-detected":
      return "Cycle detected! Remaining nodes cannot be sorted.";
    default:
      return `Step ${stepIdx + 1}`;
  }
}

const PSEUDO_LINES = [
  "kahn(graph):",
  " compute in-degree for each node",
  " queue = nodes with in-degree 0",
  " while queue not empty:",
  "   node = queue.dequeue()",
  "   add node to sorted order",
  "   for each neighbor of node:",
  "     decrement in-degree",
  "     if in-degree == 0: enqueue",
  " if sorted < all nodes: cycle!",
];

function pseudoLineIndex(snapshot: TopoSnapshot | null): number {
  if (!snapshot) return -1;
  switch (snapshot.action) {
    case "init":
      return 2;
    case "dequeue":
      return 4;
    case "update-neighbors":
      return 7;
    case "cycle-detected":
      return 9;
    default:
      return -1;
  }
}

export default function TopoSort() {
  const [nodes, setNodes] = useState<string[]>([]);
  const [edges, setEdges] = useState<TopoEdge[]>([]);
  const [snapshots, setSnapshots] = useState<TopoSnapshot[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [cycleNodes, setCycleNodes] = useState<string[]>([]);
  const [infoText, setInfoText] = useState(
    "Add nodes and edges to build a DAG, then run Kahn\u2019s algorithm.",
  );
  const [errorText, setErrorText] = useState("");
  const [nodeInput, setNodeInput] = useState("");
  const [edgeFrom, setEdgeFrom] = useState("");
  const [edgeTo, setEdgeTo] = useState("");
  const [presetKey, setPresetKey] = useState("");
  const [svgSize, setSvgSize] = useState({ w: 600, h: 400 });
  const svgContainerRef = useRef<HTMLDivElement>(null);

  const hasRun = snapshots.length > 0;
  const snap =
    hasRun && currentStep >= 0 && currentStep < snapshots.length
      ? snapshots[currentStep]
      : null;
  const isFinalStep = hasRun && currentStep === snapshots.length - 1;

  // Observe SVG container size for responsive layout
  useEffect(() => {
    if (!svgContainerRef.current) return;
    const obs = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = Math.max(200, entry.contentRect.width);
        setSvgSize({ w, h: Math.min(Math.max(280, w * 0.65), 420) });
      }
    });
    obs.observe(svgContainerRef.current);
    return () => obs.disconnect();
  }, []);

  // Show error for 3 seconds then clear
  const errorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showError = useCallback((msg: string) => {
    setErrorText(msg);
    if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
    errorTimerRef.current = setTimeout(() => setErrorText(""), 3000);
  }, []);

  useEffect(() => {
    return () => {
      if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
    };
  }, []);

  const handleAddNode = useCallback(() => {
    const name = nodeInput.trim();
    if (!name) {
      showError("Please enter a node name.");
      return;
    }
    if (name.length > 12) {
      showError("Node name must be 12 characters or less.");
      return;
    }
    if (nodes.includes(name)) {
      showError(`Node '${name}' already exists.`);
      return;
    }
    if (nodes.length >= MAX_NODES) {
      showError(`Maximum ${MAX_NODES} nodes allowed.`);
      return;
    }
    setNodes((prev) => [...prev, name]);
    setNodeInput("");
    setInfoText(`Added node '${name}'. Total: ${nodes.length + 1} nodes.`);
  }, [nodeInput, nodes, showError]);

  const handleAddEdge = useCallback(() => {
    if (!edgeFrom || !edgeTo) {
      showError("Select both 'from' and 'to' nodes.");
      return;
    }
    const dup = edges.some((e) => e.from === edgeFrom && e.to === edgeTo);
    if (dup) {
      showError(`Edge ${edgeFrom} \u2192 ${edgeTo} already exists.`);
      return;
    }
    setEdges((prev) => [...prev, { from: edgeFrom, to: edgeTo }]);
    setInfoText(
      `Added edge ${edgeFrom} \u2192 ${edgeTo}. Total: ${edges.length + 1} edges.`,
    );
  }, [edgeFrom, edgeTo, edges, showError]);

  const handleLoadPreset = useCallback((key: string) => {
    setPresetKey(key);
    if (!key) return;
    const preset: TopoPreset | undefined = presets[key];
    if (!preset) return;

    setNodes(preset.nodes.slice());
    setEdges(preset.edges.map((e) => ({ from: e.from, to: e.to })));
    setSnapshots([]);
    setCurrentStep(0);
    setCycleNodes([]);
    setInfoText(
      `Loaded preset: ${preset.name} (${preset.nodes.length} nodes, ${preset.edges.length} edges).`,
    );
  }, []);

  const handleRun = useCallback(() => {
    if (nodes.length === 0) {
      showError("Add at least one node before running.");
      return;
    }
    const result: TopoSortResult = run({ nodes, edges });
    setSnapshots(result.snapshots);
    setCycleNodes(result.cycleNodes);
    setCurrentStep(0);

    if (result.snapshots.length === 0) {
      setInfoText("No steps to visualize.");
      return;
    }

    if (result.hasCycle) {
      setInfoText(
        `Cycle detected! ${result.cycleNodes.length} node(s) are stuck. Step through to see the algorithm.`,
      );
    } else {
      setInfoText(
        `Algorithm ready. Order: ${result.order.join(" \u2192 ")}. Use controls to step through.`,
      );
    }
  }, [edges, nodes, showError]);

  const handleReset = useCallback(() => {
    setSnapshots([]);
    setCurrentStep(0);
    setCycleNodes([]);
    setInfoText("Reset. Press \u2018Run Kahn\u2019s\u2019 to visualize again.");
  }, []);

  const handleClear = useCallback(() => {
    setNodes([]);
    setEdges([]);
    setSnapshots([]);
    setCurrentStep(0);
    setCycleNodes([]);
    setPresetKey("");
    setEdgeFrom("");
    setEdgeTo("");
    setInfoText("Graph cleared. Add nodes and edges to start.");
  }, []);

  const handleStep = useCallback(
    (n: number) => {
      setCurrentStep(Math.max(0, Math.min(n, snapshots.length - 1)));
    },
    [snapshots.length],
  );

  // Keep edgeFrom/edgeTo valid when nodes change
  useEffect(() => {
    if (edgeFrom && !nodes.includes(edgeFrom)) setEdgeFrom("");
    if (edgeTo && !nodes.includes(edgeTo)) setEdgeTo("");
  }, [nodes, edgeFrom, edgeTo]);

  const codeLine = pseudoLineIndex(snap);

  const watchVars = snap
    ? [
        {
          label: "queue",
          value: snap.queue.length === 0 ? "empty" : snap.queue.join(", "),
          highlight: snap.queue.length > 0,
        },
        {
          label: "order",
          value: snap.order.length === 0 ? "[]" : snap.order.join(" \u2192 "),
          highlight: snap.order.length > 0,
        },
        {
          label: "current",
          value: snap.currentNode ?? "\u2014",
          highlight: snap.currentNode !== null,
        },
        {
          label: "step",
          value: String(currentStep + 1),
        },
      ]
    : [];

  const stepInfo = actionInfo(snap, currentStep);

  return (
    <div className="algo-page" data-category="graph">
      <Nav showStoryBanner />

      <div className="page-header">
        <div className="title-group">
          <h1>Topological Sort (Kahn&apos;s)</h1>
          <div className="title-meta">
            <span className="badge">Graph</span>
            <ComplexityPopover
              best="O(V+E)"
              avg="O(V+E)"
              worst="O(V+E)"
              space="O(V)"
              bestNote="All cases"
              avgNote="All cases"
              worstNote="All cases"
              spaceNote="In-degree table"
              why="Every vertex is enqueued once (V) and every edge is processed once (E). Total: V + E."
            />
          </div>
        </div>
        <div className="topo-legend">
          <span>
            <span className="topo-swatch topo-swatch-queued" /> In Queue
          </span>
          <span>
            <span className="topo-swatch topo-swatch-processing" /> Processing
          </span>
          <span>
            <span className="topo-swatch topo-swatch-completed" /> Completed
          </span>
          <span>
            <span className="topo-swatch topo-swatch-cycle" /> Cycle (Stuck)
          </span>
          <span>
            <span className="topo-swatch topo-swatch-default" /> Pending
          </span>
        </div>
        <AlgorithmComplete />
      </div>

      <div className="content-grid">
        <div className="main-column">
          <ProblemFrame title="The Problem">
            <div className="app-section">
              <span className="app-label">The Problem</span>
              <p>
                You have tasks where some must complete before others start
                (build dependencies, course prerequisites). In what order do you
                execute them?
              </p>
            </div>
            <div className="app-section">
              <span className="app-label">The Approach</span>
              <p>
                Find nodes with no incoming edges (nothing depends on them).
                Process them first, removing their outgoing edges. Repeat until
                all nodes are processed.
              </p>
            </div>
            <div className="app-section">
              <span className="app-label">When To Use</span>
              <p>
                Build systems (Make, Gradle), course scheduling, spreadsheet
                evaluation order, package dependency resolution.
              </p>
            </div>
          </ProblemFrame>

          <WhyComplexityPanel derivation="Every vertex is enqueued at most once when its in-degree reaches 0 (V operations). Every directed edge is traversed exactly once when its source node is dequeued (E operations). The in-degree table and queue together require O(V) extra space." />

          <AnalogyPanel>
            <strong>Real-world analogy:</strong> Like scheduling university
            courses &mdash; you can&apos;t take Advanced Algorithms before
            Introduction to CS. Topological sort gives you a valid order that
            respects all prerequisites.
          </AnalogyPanel>

          <div className="panel">
            {/* Controls */}
            <div className="controls">
              <div className="inputs">
                <label htmlFor="topo-node-input">
                  Node name
                  <input
                    id="topo-node-input"
                    type="text"
                    value={nodeInput}
                    onChange={(e) => setNodeInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAddNode();
                    }}
                    placeholder="e.g. A"
                    maxLength={12}
                  />
                </label>
                <button
                  type="button"
                  className="topo-btn-primary"
                  onClick={handleAddNode}
                >
                  Add Node
                </button>
              </div>

              <div className="inputs">
                <label htmlFor="topo-edge-from">
                  Edge from
                  <select
                    id="topo-edge-from"
                    value={edgeFrom}
                    onChange={(e) => setEdgeFrom(e.target.value)}
                  >
                    <option value="">--</option>
                    {nodes.map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </label>
                <label htmlFor="topo-edge-to">
                  to
                  <select
                    id="topo-edge-to"
                    value={edgeTo}
                    onChange={(e) => setEdgeTo(e.target.value)}
                  >
                    <option value="">--</option>
                    {nodes.map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </label>
                <button type="button" onClick={handleAddEdge}>
                  Add Edge
                </button>
              </div>

              <div className="inputs">
                <label htmlFor="topo-preset">
                  Preset
                  <select
                    id="topo-preset"
                    value={presetKey}
                    onChange={(e) => handleLoadPreset(e.target.value)}
                  >
                    <option value="">Custom</option>
                    <option value="buildSystem">Build System</option>
                    <option value="coursePrerequisites">
                      Course Prerequisites
                    </option>
                  </select>
                </label>
                <button
                  type="button"
                  className="topo-btn-primary"
                  onClick={handleRun}
                >
                  Run Kahn&apos;s
                </button>
                <button type="button" onClick={handleReset}>
                  Reset
                </button>
                <button type="button" onClick={handleClear}>
                  Clear Graph
                </button>
              </div>
            </div>

            {errorText && (
              <div
                className="algo-error visible"
                style={{ marginBottom: "0.75rem" }}
              >
                {errorText}
              </div>
            )}

            <div className="info">{stepInfo || infoText}</div>

            {/* Stats */}
            <div className="stats-grid" style={{ margin: "0.75rem 0" }}>
              <div className="stat-card">
                <span className="stat-value">
                  {hasRun ? currentStep + 1 : 0}
                </span>
                <span className="stat-label">Step</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">{nodes.length}</span>
                <span className="stat-label">Nodes</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">{edges.length}</span>
                <span className="stat-label">Edges</span>
              </div>
            </div>

            {/* Graph visualization */}
            <div className="topo-main-layout">
              <div className="topo-graph-panel" ref={svgContainerRef}>
                <h3>Dependency Graph</h3>
                <DagSvg
                  nodes={nodes}
                  edges={edges}
                  snapshot={snap}
                  isFinalStep={isFinalStep}
                  cycleNodes={cycleNodes}
                  width={svgSize.w}
                  height={svgSize.h}
                />
              </div>

              <div className="topo-side-panel">
                <div className="topo-indegree-panel">
                  <h3>In-Degree Counters</h3>
                  <div className="topo-indegree-list">
                    {snap
                      ? nodes.map((n) => {
                          const deg = snap.inDegrees?.[n];
                          if (deg === undefined) return null;
                          const inOrder = snap.order.includes(n);
                          const isCycle =
                            snap.action === "cycle-detected" &&
                            !inOrder &&
                            deg > 0;
                          const itemClass = [
                            "topo-indegree-item",
                            isCycle ? "topo-degree-cycle" : "",
                            inOrder ? "topo-degree-done" : "",
                            !isCycle && !inOrder && deg === 0
                              ? "topo-degree-zero"
                              : "",
                          ]
                            .filter(Boolean)
                            .join(" ");

                          return (
                            <div key={n} className={itemClass}>
                              <span className="topo-indegree-name">{n}</span>
                              <span className="topo-indegree-value">
                                {inOrder ? "\u2713" : String(deg)}
                              </span>
                            </div>
                          );
                        })
                      : null}
                  </div>
                </div>

                <div className="topo-queue-panel">
                  <h3>Queue</h3>
                  <div className="topo-queue-list">
                    {snap?.queue.map((n) => (
                      <span key={n} className="topo-queue-item">
                        {n}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="topo-order-panel">
                  <h3>Sorted Order</h3>
                  <div className="topo-order-list">
                    {snap?.order.map((n, i) => (
                      <span key={`${n}-${i}`} className="topo-order-item">
                        {n}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {hasRun && (
              <PlaybackController
                steps={snapshots}
                currentStep={currentStep}
                onStep={handleStep}
                onReset={handleReset}
              />
            )}
          </div>
        </div>

        <div className="sidebar">
          {watchVars.length > 0 && <WatchPanel vars={watchVars} />}

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
