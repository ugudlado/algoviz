import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { Nav } from "@/components/Nav";
import { ComplexityPopover } from "@/components/ComplexityPopover";
import { AnalogyPanel } from "@/components/AnalogyPanel";
import { ProblemFrame } from "@/components/ProblemFrame";
import { WhyComplexityPanel } from "@/components/WhyComplexityPanel";
import { WatchPanel } from "@/components/WatchPanel";
import {
  run as runDijkstra,
  MAX_WEIGHT,
  type DijkstraNode,
  type DijkstraEdge,
  type DijkstraSnapshot,
} from "@/lib/algorithms/dijkstra";
import "@/styles/dijkstra.css";

type EditMode = "NODE" | "EDGE" | "SOURCE";

const NODE_RADIUS = 20;
const MAX_NODES = 15;
const NODE_NAMES = "ABCDEFGHIJKLMNO";
const MAX_PQ_DISPLAY = 30;

const SPEEDS_MS = [
  { label: "0.5x", ms: 1200 },
  { label: "1x", ms: 600 },
  { label: "2x", ms: 300 },
  { label: "4x", ms: 150 },
];

const PSEUDO_LINES = [
  "dist[source] = 0",
  "pq = [(0, source)]",
  "while pq is not empty:",
  "  (d, u) = pq.extractMin()",
  "  if d > dist[u]: continue",
  "  for (v, w) in adj[u]:",
  "    if dist[u] + w < dist[v]:",
  "      dist[v] = dist[u] + w",
  "      prev[v] = u",
  "      pq.insert((dist[v], v))",
];

const PRESET_NODES: DijkstraNode[] = [
  { id: "A", x: 80, y: 80 },
  { id: "B", x: 250, y: 50 },
  { id: "C", x: 420, y: 80 },
  { id: "D", x: 100, y: 230 },
  { id: "E", x: 300, y: 200 },
  { id: "F", x: 500, y: 220 },
  { id: "G", x: 200, y: 370 },
  { id: "H", x: 420, y: 370 },
];

const PRESET_EDGES: DijkstraEdge[] = [
  { from: "A", to: "B", weight: 4 },
  { from: "A", to: "D", weight: 8 },
  { from: "B", to: "C", weight: 3 },
  { from: "B", to: "E", weight: 5 },
  { from: "C", to: "F", weight: 2 },
  { from: "D", to: "E", weight: 2 },
  { from: "D", to: "G", weight: 7 },
  { from: "E", to: "F", weight: 6 },
  { from: "E", to: "H", weight: 3 },
  { from: "F", to: "H", weight: 1 },
  { from: "G", to: "H", weight: 4 },
  { from: "B", to: "A", weight: 4 },
  { from: "E", to: "D", weight: 2 },
];

function edgeKey(from: string, to: string): string {
  return `${from}->${to}`;
}

function distStr(d: number | undefined): string {
  if (d === undefined || d === Infinity) return "\u221E";
  return String(d);
}

function pseudoLineIndex(snap: DijkstraSnapshot | undefined): number {
  if (!snap) return -1;
  if (snap.relaxedEdge) return 7;
  return 3;
}

export default function DijkstraPage() {
  const [nodes, setNodes] = useState<DijkstraNode[]>(() =>
    PRESET_NODES.map((n) => ({ ...n })),
  );
  const [edges, setEdges] = useState<DijkstraEdge[]>(() =>
    PRESET_EDGES.map((e) => ({ ...e })),
  );
  const [sourceNode, setSourceNode] = useState<string | null>("A");
  const [editMode, setEditMode] = useState<EditMode>("NODE");
  const [edgeStart, setEdgeStart] = useState<string | null>(null);

  // Weight dialog state
  const [weightDialog, setWeightDialog] = useState<{
    from: string;
    to: string;
    x: number;
    y: number;
  } | null>(null);
  const [weightInput, setWeightInput] = useState("1");

  const [snapshots, setSnapshots] = useState<DijkstraSnapshot[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [shortestPathEdges, setShortestPathEdges] = useState<Set<string>>(
    new Set(),
  );
  const [infoText, setInfoText] = useState(
    "Preset loaded: 8 cities with weighted roads. Source is A. Click Run Dijkstra!",
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [speedIdx, setSpeedIdx] = useState(1);

  const playTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef<{
    node: DijkstraNode;
    ox: number;
    oy: number;
  } | null>(null);

  const hasRun = snapshots.length > 0;
  const snap =
    hasRun && currentStep >= 0 && currentStep < snapshots.length
      ? snapshots[currentStep]
      : undefined;

  const stopPlayback = useCallback(() => {
    setIsPlaying(false);
    if (playTimerRef.current) {
      clearTimeout(playTimerRef.current);
      playTimerRef.current = null;
    }
  }, []);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (playTimerRef.current) clearTimeout(playTimerRef.current);
    };
  }, []);

  // Playback tick
  useEffect(() => {
    if (!isPlaying || snapshots.length === 0) return;
    if (currentStep >= snapshots.length - 1) {
      setIsPlaying(false);
      return;
    }
    playTimerRef.current = setTimeout(() => {
      setCurrentStep((s) => Math.min(s + 1, snapshots.length - 1));
    }, SPEEDS_MS[speedIdx].ms);
    return () => {
      if (playTimerRef.current) clearTimeout(playTimerRef.current);
    };
  }, [isPlaying, currentStep, snapshots.length, speedIdx]);

  // Mouse drag handlers on document
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!draggingRef.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      let x = e.clientX - rect.left - draggingRef.current.ox;
      let y = e.clientY - rect.top - draggingRef.current.oy;
      x = Math.max(NODE_RADIUS, Math.min(rect.width - NODE_RADIUS, x));
      y = Math.max(NODE_RADIUS, Math.min(rect.height - NODE_RADIUS, y));
      draggingRef.current.node.x = x;
      draggingRef.current.node.y = y;
      // Force re-render by cloning array
      setNodes((prev) =>
        prev.map((n) =>
          n.id === draggingRef.current!.node.id ? { ...n, x, y } : n,
        ),
      );
    };
    const onUp = () => {
      draggingRef.current = null;
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
  }, []);

  const findNode = useCallback(
    (id: string): DijkstraNode | undefined => nodes.find((n) => n.id === id),
    [nodes],
  );

  const nodeAt = useCallback(
    (x: number, y: number): DijkstraNode | undefined => {
      return nodes.find((n) => {
        const dx = n.x - x;
        const dy = n.y - y;
        return dx * dx + dy * dy <= NODE_RADIUS * NODE_RADIUS * 1.5;
      });
    },
    [nodes],
  );

  const hasEdge = useCallback(
    (from: string, to: string): boolean =>
      edges.some((e) => e.from === from && e.to === to),
    [edges],
  );

  const handleContainerMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (hasRun) return;
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (editMode === "NODE") {
        if (nodes.length >= MAX_NODES) {
          setInfoText(`Maximum ${MAX_NODES} nodes reached.`);
          return;
        }
        if (nodeAt(x, y)) return;
        const id = NODE_NAMES[nodes.length];
        setNodes((prev) => [...prev, { id, x, y }]);
        setInfoText(`Node ${id} added. Add more or switch to Edge mode.`);
      }
    },
    [editMode, hasRun, nodeAt, nodes.length],
  );

  const handleNodeMouseDown = useCallback(
    (e: React.MouseEvent, node: DijkstraNode) => {
      e.stopPropagation();
      if (hasRun) return;

      if (editMode === "EDGE") {
        if (edgeStart === null) {
          setEdgeStart(node.id);
          setInfoText(
            `Now click the destination node for the edge from ${node.id}.`,
          );
        } else {
          if (edgeStart === node.id) {
            setInfoText("Self-loops not allowed. Click a different node.");
            setEdgeStart(null);
            return;
          }
          if (hasEdge(edgeStart, node.id)) {
            setInfoText(`Edge from ${edgeStart} to ${node.id} already exists.`);
            setEdgeStart(null);
            return;
          }
          // Show weight dialog
          const fromNode = findNode(edgeStart);
          const toNode = node;
          if (fromNode && containerRef.current) {
            const mx = (fromNode.x + toNode.x) / 2;
            const my = (fromNode.y + toNode.y) / 2;
            setWeightDialog({ from: edgeStart, to: node.id, x: mx, y: my });
            setWeightInput("1");
          }
        }
        return;
      }

      if (editMode === "SOURCE") {
        setSourceNode(node.id);
        setInfoText(`Source set to ${node.id}. Click Run Dijkstra.`);
        return;
      }

      // NODE mode — drag
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      draggingRef.current = {
        node,
        ox: e.clientX - rect.left - node.x,
        oy: e.clientY - rect.top - node.y,
      };
    },
    [editMode, edgeStart, findNode, hasEdge, hasRun],
  );

  const confirmWeight = useCallback(() => {
    if (!weightDialog) return;
    const w = parseInt(weightInput, 10);
    if (isNaN(w) || w < 0 || w > MAX_WEIGHT) {
      setInfoText(`Weight must be 0-${MAX_WEIGHT}. Try again.`);
      setWeightDialog(null);
      setEdgeStart(null);
      return;
    }
    setEdges((prev) => [
      ...prev,
      { from: weightDialog.from, to: weightDialog.to, weight: w },
    ]);
    setInfoText(
      `Edge ${weightDialog.from} \u2192 ${weightDialog.to} (weight ${w}) added.`,
    );
    setWeightDialog(null);
    setEdgeStart(null);
  }, [weightDialog, weightInput]);

  const cancelWeight = useCallback(() => {
    setWeightDialog(null);
    setEdgeStart(null);
  }, []);

  const handleRunDijkstra = useCallback(() => {
    if (nodes.length === 0) {
      setInfoText("Add some nodes first.");
      return;
    }
    if (!sourceNode) {
      setInfoText(
        "Set a source node first (switch to Source mode and click a node).",
      );
      return;
    }

    const nodeIds = nodes.map((n) => n.id);
    const result = runDijkstra({ nodes: nodeIds, edges, source: sourceNode });

    if (result.error) {
      setInfoText(`Error: ${result.error}`);
      return;
    }

    // Compute all shortest path edges for final display
    const spEdges = new Set<string>();
    for (const target of nodeIds) {
      if (target === sourceNode) continue;
      const p = result.path(target);
      if (p && p.length > 1) {
        for (let i = 0; i < p.length - 1; i++) {
          spEdges.add(edgeKey(p[i]!, p[i + 1]!));
        }
      }
    }

    stopPlayback();
    setShortestPathEdges(spEdges);
    setSnapshots(result.snapshots);
    setCurrentStep(0);
    setInfoText(
      `Dijkstra complete! ${result.snapshots.length} steps. Use playback to animate.`,
    );
  }, [edges, nodes, sourceNode, stopPlayback]);

  const handleRunClick = useCallback(() => {
    if (hasRun) {
      stopPlayback();
      setSnapshots([]);
      setCurrentStep(0);
      setShortestPathEdges(new Set());
    }
    handleRunDijkstra();
  }, [handleRunDijkstra, hasRun, stopPlayback]);

  const resetVisualization = useCallback(() => {
    stopPlayback();
    setSnapshots([]);
    setCurrentStep(0);
    setShortestPathEdges(new Set());
    setInfoText(
      `Click the canvas to add nodes (max ${MAX_NODES}). Switch to Edge mode to connect them.`,
    );
  }, [stopPlayback]);

  const loadPreset = useCallback(() => {
    stopPlayback();
    setNodes(PRESET_NODES.map((n) => ({ ...n })));
    setEdges(PRESET_EDGES.map((e) => ({ ...e })));
    setSourceNode("A");
    setEdgeStart(null);
    setWeightDialog(null);
    setSnapshots([]);
    setCurrentStep(0);
    setShortestPathEdges(new Set());
    setInfoText(
      "Preset loaded: 8 cities with weighted roads. Source is A. Click Run Dijkstra!",
    );
  }, [stopPlayback]);

  const clearAll = useCallback(() => {
    stopPlayback();
    setNodes([]);
    setEdges([]);
    setSourceNode(null);
    setEdgeStart(null);
    setWeightDialog(null);
    setSnapshots([]);
    setCurrentStep(0);
    setShortestPathEdges(new Set());
    setInfoText(
      `Click the canvas to add nodes (max ${MAX_NODES}). Switch to Edge mode to connect them.`,
    );
  }, [stopPlayback]);

  const setMode = useCallback((m: EditMode) => {
    setEditMode(m);
    setEdgeStart(null);
    setWeightDialog(null);
    if (m === "NODE") {
      setInfoText(`Click the canvas to add nodes (max ${MAX_NODES}).`);
    } else if (m === "EDGE") {
      setInfoText(
        "Click a source node, then a destination node to create a directed edge.",
      );
    } else {
      setInfoText("Click a node to set it as the source for Dijkstra.");
    }
  }, []);

  const stepForward = useCallback(() => {
    if (snapshots.length === 0) return;
    setCurrentStep((s) => Math.min(s + 1, snapshots.length - 1));
  }, [snapshots.length]);

  const stepBackward = useCallback(() => {
    setCurrentStep((s) => Math.max(s - 1, 0));
  }, []);

  const handlePlayPause = useCallback(() => {
    if (snapshots.length === 0) return;
    if (currentStep >= snapshots.length - 1) {
      setCurrentStep(0);
      setIsPlaying(true);
    } else {
      setIsPlaying((p) => !p);
    }
  }, [currentStep, snapshots.length]);

  const atStart = currentStep <= 0;
  const atEnd = hasRun && currentStep >= snapshots.length - 1;

  // Determine which edges to highlight as shortest path during animation
  const activeShortestPathEdges = useMemo(() => {
    if (!hasRun) return new Set<string>();
    // Only show shortest path at the final step
    if (currentStep === snapshots.length - 1) return shortestPathEdges;
    return new Set<string>();
  }, [currentStep, hasRun, shortestPathEdges, snapshots.length]);

  // Compute node visual states for current snapshot
  const nodeStates = useMemo((): Map<string, string> => {
    const m = new Map<string, string>();
    if (!snap) return m;
    for (const node of nodes) {
      let state = "unvisited";
      if (snap.visited.includes(node.id)) state = "visited";
      if (node.id === snap.current) state = "current";
      if (snap.relaxedEdge && node.id === snap.relaxedEdge.to)
        state = "relaxed";
      m.set(node.id, state);
    }
    return m;
  }, [snap, nodes]);

  const codeLine = pseudoLineIndex(snap);

  const watchVars = snap
    ? [
        {
          label: "current node",
          value: snap.current,
          highlight: true,
        },
        {
          label: "relaxing edge",
          value: snap.relaxedEdge
            ? `${snap.relaxedEdge.from} \u2192 ${snap.relaxedEdge.to}`
            : "\u2014",
          highlight: snap.relaxedEdge !== null,
        },
        {
          label: "new dist",
          value: snap.relaxedEdge
            ? distStr(snap.distances[snap.relaxedEdge.to])
            : "\u2014",
          highlight: snap.relaxedEdge !== null,
        },
        {
          label: "visited count",
          value: String(snap.visited.length),
        },
        {
          label: "pq size",
          value: String(snap.priorityQueue.length),
        },
      ]
    : [];

  const isEdgeMode = editMode === "EDGE" || editMode === "SOURCE";

  return (
    <div className="algo-page" data-category="graph">
      <Nav currentCategory="graph" />

      <div className="page-header">
        <div className="title-group">
          <h1>Dijkstra&apos;s Shortest Path</h1>
          <div className="title-meta">
            <span className="badge">Graph</span>
            <ComplexityPopover
              best="O((V+E) log V)"
              avg="O((V+E) log V)"
              worst="O((V+E) log V)"
              space="O(V)"
              bestNote="Binary heap"
              avgNote="Typical graph"
              worstNote="All edges relaxed"
              spaceNote="Distance table"
              why="Each vertex is extracted from the min-heap once (V \u00d7 log V). Each edge relaxation may update the heap (E \u00d7 log V). Total: (V + E) log V."
            />
          </div>
        </div>
        <div className="legend">
          <span>
            <span className="swatch dijk-unvisited" /> Unvisited
          </span>
          <span>
            <span className="swatch dijk-source-sw" /> Source
          </span>
          <span>
            <span className="swatch dijk-visited-sw" /> Visited
          </span>
          <span>
            <span className="swatch dijk-current-sw" /> Current
          </span>
          <span>
            <span className="swatch dijk-relaxed-sw" /> Relaxed
          </span>
          <span>
            <span className="swatch dijk-shortest-sw" /> Shortest Path
          </span>
        </div>
      </div>

      <div className="content-grid">
        <div className="main-column">
          <ProblemFrame title="Context">
            <div className="app-section">
              <span className="app-label">The Problem</span>
              <p>
                You&apos;re building a GPS app. Roads have different travel
                times. How do you find the fastest route from A to B through
                hundreds of intersections?
              </p>
            </div>
            <div className="app-section">
              <span className="app-label">The Approach</span>
              <p>
                Always expand the cheapest unvisited node. Use a priority queue
                to efficiently pick the minimum. Update neighbors&apos;
                distances when a shorter path is found.
              </p>
            </div>
            <div className="app-section">
              <span className="app-label">When To Use</span>
              <p>
                Shortest paths in weighted graphs with non-negative edges. GPS
                routing, network packet routing, game AI pathfinding.
              </p>
            </div>
          </ProblemFrame>

          <WhyComplexityPanel derivation="Each vertex is extracted from the min-heap exactly once (V extractions at O(log V) each). Each edge may trigger one heap update (E updates at O(log V) each). Total time: O((V+E) log V). Space is O(V) for the distance and previous arrays." />

          <AnalogyPanel>
            GPS navigation &mdash; starting from your location, the GPS explores
            nearby intersections first, always expanding to the closest
            unvisited intersection, until it finds the shortest route to your
            destination.
          </AnalogyPanel>

          <div className="panel">
            <div className="controls">
              <div className="inputs">
                <div className="dijk-mode-buttons">
                  <button
                    type="button"
                    className={`dijk-mode-btn${editMode === "NODE" ? " dijk-active-mode" : ""}`}
                    onClick={() => setMode("NODE")}
                  >
                    Add Node
                  </button>
                  <button
                    type="button"
                    className={`dijk-mode-btn${editMode === "EDGE" ? " dijk-active-mode" : ""}`}
                    onClick={() => setMode("EDGE")}
                  >
                    Add Edge
                  </button>
                  <button
                    type="button"
                    className={`dijk-mode-btn${editMode === "SOURCE" ? " dijk-active-mode" : ""}`}
                    onClick={() => setMode("SOURCE")}
                  >
                    Set Source
                  </button>
                </div>
                <button type="button" onClick={loadPreset}>
                  Load Preset
                </button>
                <button type="button" onClick={clearAll}>
                  Clear All
                </button>
                <button
                  type="button"
                  className="dijk-btn-primary"
                  onClick={handleRunClick}
                >
                  Run Dijkstra
                </button>
              </div>
            </div>

            <div className="info">{infoText}</div>

            <div className="dijk-layout">
              <div
                ref={containerRef}
                className={`dijk-graph-container${isEdgeMode ? " dijk-edge-mode" : ""}`}
                onMouseDown={handleContainerMouseDown}
              >
                {/* SVG layer for edges */}
                <svg className="dijk-edge-svg">
                  <defs>
                    <marker
                      id="dijk-arrow-default"
                      viewBox="0 0 10 10"
                      refX="9"
                      refY="5"
                      markerWidth="8"
                      markerHeight="8"
                      orient="auto-start-reverse"
                    >
                      <path d="M 0 0 L 10 5 L 0 10 z" fill="#30363d" />
                    </marker>
                    <marker
                      id="dijk-arrow-relaxed"
                      viewBox="0 0 10 10"
                      refX="9"
                      refY="5"
                      markerWidth="8"
                      markerHeight="8"
                      orient="auto-start-reverse"
                    >
                      <path d="M 0 0 L 10 5 L 0 10 z" fill="#bc8cff" />
                    </marker>
                    <marker
                      id="dijk-arrow-shortest"
                      viewBox="0 0 10 10"
                      refX="9"
                      refY="5"
                      markerWidth="8"
                      markerHeight="8"
                      orient="auto-start-reverse"
                    >
                      <path d="M 0 0 L 10 5 L 0 10 z" fill="#3fb950" />
                    </marker>
                  </defs>
                  {edges.map((edge, i) => {
                    const fromNode = findNode(edge.from);
                    const toNode = findNode(edge.to);
                    if (!fromNode || !toNode) return null;
                    const dx = toNode.x - fromNode.x;
                    const dy = toNode.y - fromNode.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist === 0) return null;
                    const ux = dx / dist;
                    const uy = dy / dist;
                    const x1 = fromNode.x + ux * NODE_RADIUS;
                    const y1 = fromNode.y + uy * NODE_RADIUS;
                    const x2 = toNode.x - ux * (NODE_RADIUS + 6);
                    const y2 = toNode.y - uy * (NODE_RADIUS + 6);
                    const mx = (fromNode.x + toNode.x) / 2;
                    const my = (fromNode.y + toNode.y) / 2;
                    const px = -uy * 12;
                    const py = ux * 12;
                    const ek = edgeKey(edge.from, edge.to);
                    const isShortest = activeShortestPathEdges.has(ek);
                    const isRelaxed =
                      snap?.relaxedEdge?.from === edge.from &&
                      snap?.relaxedEdge?.to === edge.to;
                    let lineClass = "dijk-edge-line";
                    let textClass = "dijk-edge-weight";
                    let marker = "url(#dijk-arrow-default)";
                    if (isShortest) {
                      lineClass += " dijk-edge-shortest";
                      textClass += " dijk-edge-shortest";
                      marker = "url(#dijk-arrow-shortest)";
                    } else if (isRelaxed) {
                      lineClass += " dijk-edge-relaxed";
                      textClass += " dijk-edge-relaxed";
                      marker = "url(#dijk-arrow-relaxed)";
                    }
                    return (
                      <g key={`edge-${i}`}>
                        <line
                          className={lineClass}
                          x1={x1}
                          y1={y1}
                          x2={x2}
                          y2={y2}
                          markerEnd={marker}
                        />
                        <text
                          className={textClass}
                          x={mx + px}
                          y={my + py}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          {edge.weight}
                        </text>
                      </g>
                    );
                  })}
                </svg>

                {/* Node elements */}
                {nodes.map((node) => {
                  const state = nodeStates.get(node.id) ?? "unvisited";
                  const dist = snap?.distances[node.id];
                  let nodeClass = "dijk-node";
                  if (node.id === sourceNode) nodeClass += " dijk-node-source";
                  if (hasRun) {
                    if (state === "visited") nodeClass += " dijk-node-visited";
                    if (state === "current") nodeClass += " dijk-node-current";
                    if (state === "relaxed") nodeClass += " dijk-node-relaxed";
                  }
                  if (node.id === edgeStart) nodeClass += " dijk-node-selected";
                  return (
                    <div
                      key={node.id}
                      className={nodeClass}
                      style={{
                        left: node.x - NODE_RADIUS,
                        top: node.y - NODE_RADIUS,
                      }}
                      onMouseDown={(e) => handleNodeMouseDown(e, node)}
                    >
                      {hasRun && dist !== undefined && (
                        <div className="dijk-dist-label">{distStr(dist)}</div>
                      )}
                      {node.id}
                    </div>
                  );
                })}

                {/* Weight dialog */}
                {weightDialog && (
                  <div
                    className="dijk-weight-dialog"
                    style={{ left: weightDialog.x, top: weightDialog.y }}
                  >
                    <input
                      type="number"
                      min="0"
                      max={String(MAX_WEIGHT)}
                      value={weightInput}
                      onChange={(e) => setWeightInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") confirmWeight();
                        if (e.key === "Escape") cancelWeight();
                      }}
                      autoFocus
                    />
                    <button type="button" onClick={confirmWeight}>
                      OK
                    </button>
                    <button type="button" onClick={cancelWeight}>
                      X
                    </button>
                  </div>
                )}
              </div>

              {/* Priority Queue Sidebar */}
              <div className="dijk-pq-sidebar">
                <h3>
                  Priority Queue <span className="dijk-pq-badge">Min-Heap</span>
                </h3>
                <div className="dijk-pq-list">
                  {!hasRun && (
                    <div className="dijk-pq-empty">
                      Run Dijkstra to see the queue
                    </div>
                  )}
                  {hasRun && snap && snap.priorityQueue.length === 0 && (
                    <div className="dijk-pq-empty">Queue is empty</div>
                  )}
                  {hasRun &&
                    snap &&
                    snap.priorityQueue
                      .slice(0, MAX_PQ_DISPLAY)
                      .map((entry, i) => (
                        <div
                          key={`${entry.node}-${i}`}
                          className={`dijk-pq-item${i === 0 ? " dijk-pq-top" : ""}`}
                        >
                          <span>{entry.node}</span>
                          <span className="dijk-pq-item-dist">
                            {distStr(entry.distance)}
                          </span>
                        </div>
                      ))}
                  {hasRun &&
                    snap &&
                    snap.priorityQueue.length > MAX_PQ_DISPLAY && (
                      <div className="dijk-pq-empty">
                        ... and {snap.priorityQueue.length - MAX_PQ_DISPLAY}{" "}
                        more
                      </div>
                    )}
                </div>
                <div className="dijk-stats">
                  <div>
                    Step: <span>{hasRun ? currentStep + 1 : 0}</span>
                  </div>
                  <div>
                    Visited: <span>{snap ? snap.visited.length : 0}</span>
                  </div>
                  <div>
                    PQ size: <span>{snap ? snap.priorityQueue.length : 0}</span>
                  </div>
                </div>
                <div className="dijk-dist-table">
                  <h4>Distances</h4>
                  {hasRun && snap
                    ? nodes.map((node) => (
                        <div key={node.id} className="dijk-dist-row">
                          <span>{node.id}</span>
                          <span className="dijk-dist-row-val">
                            {distStr(snap.distances[node.id])}
                          </span>
                        </div>
                      ))
                    : null}
                </div>
              </div>
            </div>

            {/* Playback Controls */}
            {hasRun && (
              <div className="playback-controls">
                <div className="playback-btns">
                  <button
                    type="button"
                    className="icon-btn"
                    onClick={resetVisualization}
                    title="Reset visualization"
                    aria-label="Reset visualization"
                  >
                    &#x21BA;
                  </button>
                  <button
                    type="button"
                    className="icon-btn"
                    onClick={stepBackward}
                    disabled={atStart}
                    title="Step back"
                    aria-label="Step back"
                  >
                    &#x23EE;
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
                    &#x23ED;
                  </button>
                </div>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.8rem",
                    color: "var(--text-secondary)",
                  }}
                >
                  Step {snapshots.length ? currentStep + 1 : 0} /{" "}
                  {snapshots.length}
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
                  {SPEEDS_MS[speedIdx]!.label}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="sidebar">
          {snap && (
            <div className="stats-grid" style={{ marginBottom: "1rem" }}>
              <div className="stat-card">
                <span className="stat-value">{currentStep + 1}</span>
                <span className="stat-label">Step</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">{snap.visited.length}</span>
                <span className="stat-label">Visited</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">{snap.priorityQueue.length}</span>
                <span className="stat-label">PQ Size</span>
              </div>
            </div>
          )}

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
