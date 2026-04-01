import {
  useState,
  useCallback,
  useRef,
  useEffect,
  type MouseEvent,
} from "react";
import { Nav } from "@/components/Nav";
import { PlaybackController } from "@/components/PlaybackController";
import { WatchPanel } from "@/components/WatchPanel";
import { ComplexityPopover } from "@/components/ComplexityPopover";
import { AnalogyPanel } from "@/components/AnalogyPanel";
import { ProblemFrame } from "@/components/ProblemFrame";
import { WhyComplexityPanel } from "@/components/WhyComplexityPanel";
import {
  generateSteps,
  PRESETS,
  type TarjanEdge,
  type TarjanStep,
  type TarjanPresetKey,
} from "@/lib/algorithms/tarjan";
import "@/styles/tarjan.css";

// ── Constants ──────────────────────────────────────────────────────────────

const NODE_RADIUS = 24;
const SVG_WIDTH = 700;
const SVG_HEIGHT = 420;

const SCC_COLORS = [
  "#3fb950",
  "#f0a500",
  "#a371f7",
  "#f85149",
  "#58a6ff",
  "#e3b341",
  "#39d353",
  "#ff7b72",
];

const EDGE_COLORS: Record<string, string> = {
  tree: "#3fb950",
  back: "#f85149",
  cross: "#8b949e",
  default: "#444c56",
};

const PRESET_POSITIONS: Record<
  string,
  Array<{ id: string; x: number; y: number }>
> = {
  classic: [
    { id: "0", x: 150, y: 120 },
    { id: "1", x: 280, y: 60 },
    { id: "2", x: 280, y: 200 },
    { id: "3", x: 420, y: 120 },
    { id: "4", x: 530, y: 60 },
    { id: "5", x: 530, y: 200 },
    { id: "6", x: 610, y: 120 },
    { id: "7", x: 640, y: 310 },
  ],
  simpleCycle: [
    { id: "A", x: 350, y: 80 },
    { id: "B", x: 500, y: 300 },
    { id: "C", x: 200, y: 300 },
  ],
  dag: [
    { id: "A", x: 180, y: 200 },
    { id: "B", x: 360, y: 100 },
    { id: "C", x: 360, y: 320 },
    { id: "D", x: 530, y: 200 },
  ],
};

const PSEUDO_LINES = [
  "function strongConnect(v):",
  "  disc[v] = low[v] = index++",
  "  push v onto stack",
  "  onStack[v] = true",
  "  for each neighbor w:",
  "    if w not visited:",
  "      strongConnect(w)  // tree",
  "      low[v] = min(low[v], low[w])",
  "    elif w is onStack:",
  "      low[v] = min(low[v], disc[w]) // back",
  "  if low[v] == disc[v]:  // root",
  "    pop stack until v",
  "    report SCC",
];

// ── Types ──────────────────────────────────────────────────────────────────

interface GraphNode {
  id: string;
  x: number;
  y: number;
}

type InteractionMode = "add-node" | "add-edge" | "move";

// ── Helpers ────────────────────────────────────────────────────────────────

function arrowPath(
  from: GraphNode,
  to: GraphNode,
): { sx: number; sy: number; ex: number; ey: number } | null {
  if (from.id === to.id) return null;
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len === 0) return null;

  const ux = dx / len;
  const uy = dy / len;
  const offset = 8;
  const px = -uy * offset;
  const py = ux * offset;

  return {
    sx: from.x + ux * NODE_RADIUS + px,
    sy: from.y + uy * NODE_RADIUS + py,
    ex: to.x - ux * NODE_RADIUS + px,
    ey: to.y - uy * NODE_RADIUS + py,
  };
}

function pseudoLineForStep(step: TarjanStep | undefined): number {
  if (!step) return -1;
  switch (step.type) {
    case "visit":
      return 1;
    case "push":
      return 2;
    case "lowlink-update":
      if (step.edgeType === "back") return 9;
      if (step.edgeType === "cross") return 9;
      return 7;
    case "scc-found":
      return 11;
    case "done":
      return 12;
    default:
      return -1;
  }
}

// ── Arrow component ────────────────────────────────────────────────────────

interface ArrowProps {
  from: GraphNode;
  to: GraphNode;
  color: string;
  highlighted?: boolean;
}

function Arrow({ from, to, color, highlighted }: ArrowProps) {
  if (from.id === to.id) {
    // Self-loop
    return (
      <g>
        <path
          d={`M ${from.x} ${from.y - NODE_RADIUS}
              a 14 14 0 1 1 0.1 0`}
          fill="none"
          stroke={color}
          strokeWidth={highlighted ? 2.5 : 1.5}
        />
      </g>
    );
  }

  const pts = arrowPath(from, to);
  if (!pts) return null;
  const { sx, sy, ex, ey } = pts;

  const aLen = 10;
  const aAngle = 0.4;
  const angle = Math.atan2(ey - sy, ex - sx);

  const ax1 = ex - aLen * Math.cos(angle - aAngle);
  const ay1 = ey - aLen * Math.sin(angle - aAngle);
  const ax2 = ex - aLen * Math.cos(angle + aAngle);
  const ay2 = ey - aLen * Math.sin(angle + aAngle);

  return (
    <g>
      <line
        x1={sx}
        y1={sy}
        x2={ex}
        y2={ey}
        stroke={color}
        strokeWidth={highlighted ? 2.5 : 1.5}
      />
      <polygon
        points={`${ex},${ey} ${ax1},${ay1} ${ax2},${ay2}`}
        fill={color}
      />
    </g>
  );
}

// ── Node component ─────────────────────────────────────────────────────────

interface NodeCircleProps {
  node: GraphNode;
  isCurrentNode: boolean;
  onStack: boolean;
  sccColor: string | null;
  disc: number | undefined;
  low: number | undefined;
}

function NodeCircle({
  node,
  isCurrentNode,
  onStack,
  sccColor,
  disc,
  low,
}: NodeCircleProps) {
  let fill = "#21262d";
  let stroke = "#444c56";
  let textColor = "#8b949e";

  if (sccColor) {
    fill = sccColor + "33";
    stroke = sccColor;
    textColor = sccColor;
  } else if (isCurrentNode) {
    fill = "#f0a50033";
    stroke = "#f0a500";
    textColor = "#f0a500";
  } else if (onStack) {
    fill = "#1f6feb33";
    stroke = "#58a6ff";
    textColor = "#58a6ff";
  }

  const hasLabel = disc !== undefined;
  const labelY = node.y - (hasLabel ? 6 : 0);

  return (
    <g>
      <circle
        cx={node.x}
        cy={node.y}
        r={NODE_RADIUS}
        fill={fill}
        stroke={stroke}
        strokeWidth={2}
      />
      <text
        x={node.x}
        y={labelY}
        textAnchor="middle"
        dominantBaseline="middle"
        fill={textColor}
        fontSize={13}
        fontWeight="bold"
        fontFamily="monospace"
        style={{ userSelect: "none" }}
      >
        {node.id}
      </text>
      {hasLabel && (
        <text
          x={node.x}
          y={node.y + 8}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#6e7681"
          fontSize={10}
          fontFamily="monospace"
          style={{ userSelect: "none" }}
        >
          {`d=${disc} l=${low}`}
        </text>
      )}
    </g>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

export default function TarjanPage() {
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<TarjanEdge[]>([]);
  const [nodeCounter, setNodeCounter] = useState(0);
  const [steps, setSteps] = useState<TarjanStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [infoText, setInfoText] = useState(
    "Select a preset or build your own graph, then press Run Algorithm.",
  );
  const [activePreset, setActivePreset] = useState<TarjanPresetKey | null>(
    null,
  );
  const [mode, setMode] = useState<InteractionMode>("add-node");
  const [speed, setSpeed] = useState(5);

  // Drag/edge draw state
  const svgRef = useRef<SVGSVGElement>(null);
  const dragNodeRef = useRef<GraphNode | null>(null);
  const edgeFromRef = useRef<string | null>(null);
  const mouseDrawRef = useRef<{ x: number; y: number } | null>(null);
  const [drawEdgeLine, setDrawEdgeLine] = useState<{
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  } | null>(null);

  const hasRun = steps.length > 0;
  const step = hasRun ? steps[currentStep] : undefined;

  // ── Build SCC color map ──────────────────────────────────────────────────
  const sccColorMap: Record<string, string> = {};
  if (step) {
    step.sccs.forEach((scc, i) => {
      const color = SCC_COLORS[i % SCC_COLORS.length]!;
      scc.forEach((nid) => {
        sccColorMap[nid] = color;
      });
    });
  }

  // ── Compute active edge highlight ────────────────────────────────────────
  const activeEdgeFrom = step?.fromNode ?? null;
  const activeEdgeTo = step?.toNode ?? null;
  const activeEdgeType = step?.edgeType ?? null;

  // ── SVG coordinate helper ────────────────────────────────────────────────
  function getSvgPos(e: MouseEvent): { x: number; y: number } | null {
    if (!svgRef.current) return null;
    const rect = svgRef.current.getBoundingClientRect();
    const scaleX = SVG_WIDTH / rect.width;
    const scaleY = SVG_HEIGHT / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }

  function nodeAtPos(x: number, y: number): GraphNode | null {
    for (let i = nodes.length - 1; i >= 0; i--) {
      const n = nodes[i]!;
      const dx = n.x - x;
      const dy = n.y - y;
      if (Math.sqrt(dx * dx + dy * dy) <= NODE_RADIUS) return n;
    }
    return null;
  }

  // ── Graph interactions ───────────────────────────────────────────────────

  const handleSvgMouseDown = useCallback(
    (e: MouseEvent<SVGSVGElement>) => {
      if (hasRun) return;
      const pos = getSvgPos(e);
      if (!pos) return;
      const hit = nodeAtPos(pos.x, pos.y);

      if (mode === "add-edge" || e.button === 2) {
        if (hit) {
          edgeFromRef.current = hit.id;
          mouseDrawRef.current = pos;
          setDrawEdgeLine({ x1: hit.x, y1: hit.y, x2: pos.x, y2: pos.y });
        }
        return;
      }

      if (mode === "move" && hit) {
        dragNodeRef.current = hit;
        return;
      }

      if (mode === "add-node") {
        if (hit) {
          // Left-click on node in add-node mode — start drag
          dragNodeRef.current = hit;
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [hasRun, mode, nodes],
  );

  const handleSvgMouseMove = useCallback(
    (e: MouseEvent<SVGSVGElement>) => {
      if (hasRun) return;
      const pos = getSvgPos(e);
      if (!pos) return;

      if (dragNodeRef.current) {
        setNodes((prev) =>
          prev.map((n) =>
            n.id === dragNodeRef.current!.id ? { ...n, x: pos.x, y: pos.y } : n,
          ),
        );
        // Keep ref updated to latest position
        dragNodeRef.current = { ...dragNodeRef.current, x: pos.x, y: pos.y };
        return;
      }

      if (edgeFromRef.current) {
        const fromNode = nodes.find((n) => n.id === edgeFromRef.current);
        if (fromNode) {
          setDrawEdgeLine({
            x1: fromNode.x,
            y1: fromNode.y,
            x2: pos.x,
            y2: pos.y,
          });
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [hasRun, nodes],
  );

  const handleSvgMouseUp = useCallback(
    (e: MouseEvent<SVGSVGElement>) => {
      if (hasRun) return;
      const pos = getSvgPos(e);

      setDrawEdgeLine(null);

      if (dragNodeRef.current) {
        dragNodeRef.current = null;
        return;
      }

      if (edgeFromRef.current && pos) {
        const target = nodeAtPos(pos.x, pos.y);
        if (target && target.id !== edgeFromRef.current) {
          const exists = edges.some(
            (ed) => ed.from === edgeFromRef.current && ed.to === target.id,
          );
          if (!exists && edges.length < 40) {
            setEdges((prev) => [
              ...prev,
              { from: edgeFromRef.current!, to: target.id },
            ]);
          }
        }
        edgeFromRef.current = null;
        mouseDrawRef.current = null;
        return;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [hasRun, edges, nodes],
  );

  const handleSvgClick = useCallback(
    (e: MouseEvent<SVGSVGElement>) => {
      if (hasRun) return;
      // Only fire for true left-click in add-node mode
      if (e.button !== 0 || mode !== "add-node") return;
      const pos = getSvgPos(e);
      if (!pos) return;
      const hit = nodeAtPos(pos.x, pos.y);
      if (!hit) {
        if (nodes.length >= 15) {
          setInfoText("Maximum 15 nodes allowed.");
          return;
        }
        const label = String(nodeCounter);
        setNodes((prev) => [...prev, { id: label, x: pos.x, y: pos.y }]);
        setNodeCounter((c) => c + 1);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [hasRun, mode, nodes, nodeCounter],
  );

  const handleSvgDoubleClick = useCallback(
    (e: MouseEvent<SVGSVGElement>) => {
      if (hasRun) return;
      const pos = getSvgPos(e);
      if (!pos) return;
      const hit = nodeAtPos(pos.x, pos.y);
      if (hit) {
        setNodes((prev) => prev.filter((n) => n.id !== hit.id));
        setEdges((prev) =>
          prev.filter((ed) => ed.from !== hit.id && ed.to !== hit.id),
        );
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [hasRun, nodes],
  );

  const handleSvgContextMenu = useCallback(
    (e: MouseEvent<SVGSVGElement>) => {
      e.preventDefault();
      if (hasRun) return;
      const pos = getSvgPos(e);
      if (!pos) return;
      const hit = nodeAtPos(pos.x, pos.y);
      if (hit) {
        edgeFromRef.current = hit.id;
        setDrawEdgeLine({ x1: hit.x, y1: hit.y, x2: pos.x, y2: pos.y });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [hasRun, nodes],
  );

  // Global mouseup to cancel edge draw
  useEffect(() => {
    const onUp = () => {
      if (edgeFromRef.current) {
        edgeFromRef.current = null;
        setDrawEdgeLine(null);
      }
      dragNodeRef.current = null;
    };
    document.addEventListener("mouseup", onUp);
    return () => document.removeEventListener("mouseup", onUp);
  }, []);

  // ── Load preset ──────────────────────────────────────────────────────────

  const loadPreset = useCallback((key: TarjanPresetKey) => {
    const preset = PRESETS[key];
    const positions = PRESET_POSITIONS[key] ?? [];
    const newNodes: GraphNode[] = preset.nodes.map((id, i) => {
      const p = positions[i] ?? { x: 100 + i * 80, y: 200 };
      return { id, x: p.x, y: p.y };
    });
    setNodes(newNodes);
    setEdges(preset.edges.map((e) => ({ from: e.from, to: e.to })));
    setNodeCounter(newNodes.length);
    setSteps([]);
    setCurrentStep(0);
    setActivePreset(key);
    setInfoText("Preset loaded. Press Run Algorithm to start.");
  }, []);

  // ── Run algorithm ────────────────────────────────────────────────────────

  const handleRun = useCallback(() => {
    if (nodes.length === 0) {
      setInfoText("Add some nodes first.");
      return;
    }
    const nodeIds = nodes.map((n) => n.id);
    const newSteps = generateSteps(nodeIds, edges);
    setSteps(newSteps);
    setCurrentStep(0);
    setInfoText(newSteps[0]?.description ?? "");
  }, [nodes, edges]);

  const handleReset = useCallback(() => {
    setSteps([]);
    setCurrentStep(0);
    setInfoText(
      "Select a preset or build your own graph, then press Run Algorithm.",
    );
  }, []);

  const handleClear = useCallback(() => {
    setSteps([]);
    setCurrentStep(0);
    setNodes([]);
    setEdges([]);
    setNodeCounter(0);
    setActivePreset(null);
    setInfoText(
      "Select a preset or build your own graph, then press Run Algorithm.",
    );
  }, []);

  // Update info text when step changes
  useEffect(() => {
    if (step) setInfoText(step.description);
  }, [step]);

  // ── Derived state ────────────────────────────────────────────────────────

  const sccCount = step ? step.sccs.length : 0;

  const watchVars = step
    ? [
        {
          label: "current node",
          value: step.nodeId ?? "—",
          highlight: step.nodeId !== null,
        },
        {
          label: "stack size",
          value: String(step.stack.length),
          highlight: step.stack.length > 0,
        },
        {
          label: "SCCs found",
          value: sccCount > 0 ? String(sccCount) : "—",
          highlight: sccCount > 0,
        },
        {
          label: "step type",
          value: step.type,
          highlight: step.type === "scc-found",
        },
      ]
    : [];

  const codeLine = pseudoLineForStep(step);

  return (
    <div className="algo-page" data-category="graph">
      <Nav currentCategory="graph" algorithmProgressPath="/algorithms/tarjan" />

      {/* Page header */}
      <div className="page-header">
        <div className="title-group">
          <h1>Tarjan's SCC</h1>
          <div className="title-meta">
            <span className="badge">Graph</span>
            <ComplexityPopover
              best="O(V+E)"
              avg="O(V+E)"
              worst="O(V+E)"
              space="O(V)"
              bestNote="Single DFS pass"
              avgNote="Linear in graph size"
              worstNote="Always linear"
              spaceNote="Stack + discovery arrays"
              why="One DFS pass visits every vertex and edge exactly once — O(V+E). The stack, discovery, and low-link arrays each require O(V) space. No sorting or repeated passes needed."
            />
          </div>
        </div>
        <div className="tj-legend">
          <div className="tj-legend-item">
            <span className="tj-swatch tj-swatch-current" /> Current node
          </div>
          <div className="tj-legend-item">
            <span className="tj-swatch tj-swatch-on-stack" /> On stack
          </div>
          <div className="tj-legend-item">
            <span className="tj-edge-tree" /> Tree edge
          </div>
          <div className="tj-legend-item">
            <span className="tj-edge-back" /> Back edge
          </div>
          <div className="tj-legend-item">
            <span className="tj-edge-cross" /> Cross edge
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="content-grid">
        <div className="main-column">
          {/* Problem frame */}
          <ProblemFrame title="The Problem">
            <div className="app-section">
              <span className="app-label">The Problem</span>
              <p>
                Find all Strongly Connected Components (SCCs) in a directed
                graph. An SCC is a maximal set of vertices where every vertex is
                reachable from every other vertex.
              </p>
            </div>
            <div className="app-section">
              <span className="app-label">The Approach</span>
              <p>
                Run DFS while tracking each node's discovery time and low-link
                value (the smallest discovery time reachable via its subtree).
                When a node's low-link equals its own discovery time, it is an
                SCC root — pop everything above it on the stack.
              </p>
            </div>
            <div className="app-section">
              <span className="app-label">When To Use</span>
              <p>
                Compiler dependency analysis, detecting cycles in directed
                graphs, solving 2-SAT problems, finding circular dependencies in
                package managers, and decomposing graphs into DAGs.
              </p>
            </div>
          </ProblemFrame>

          {/* Why complexity */}
          <WhyComplexityPanel derivation="Tarjan's makes a single DFS pass: each vertex is visited once (O(V)), and each edge is examined once (O(E)). The stack push/pop operations are amortized O(1) per vertex. Total: O(V+E) — optimal for graph traversal." />

          {/* Analogy */}
          <AnalogyPanel>
            Like finding friend circles in a social network — a strongly
            connected component is a group where everyone can reach everyone
            else through a chain of connections. Tarjan's finds all such
            self-contained circles in one efficient sweep.
          </AnalogyPanel>

          {/* Controls */}
          <div className="panel">
            <div className="tj-controls">
              <div className="tj-preset-row">
                <span className="tj-control-label">Preset:</span>
                {(["classic", "simpleCycle", "dag"] as TarjanPresetKey[]).map(
                  (key) => (
                    <button
                      key={key}
                      type="button"
                      className={`tj-preset-btn${activePreset === key ? " tj-preset-active" : ""}`}
                      onClick={() => loadPreset(key)}
                    >
                      {key === "classic"
                        ? "Classic 3-SCC"
                        : key === "simpleCycle"
                          ? "Simple Cycle"
                          : "DAG"}
                    </button>
                  ),
                )}
              </div>

              <div className="tj-mode-row">
                <span className="tj-control-label">Mode:</span>
                {(["add-node", "add-edge", "move"] as InteractionMode[]).map(
                  (m) => (
                    <button
                      key={m}
                      type="button"
                      className={`tj-mode-btn${mode === m ? " tj-mode-active" : ""}`}
                      onClick={() => setMode(m)}
                    >
                      {m === "add-node"
                        ? "Add Node"
                        : m === "add-edge"
                          ? "Add Edge"
                          : "Move"}
                    </button>
                  ),
                )}
              </div>

              <div className="tj-btn-row">
                <button
                  type="button"
                  className="tj-btn-primary"
                  onClick={handleRun}
                >
                  Run Algorithm
                </button>
                <button type="button" onClick={handleReset}>
                  Reset
                </button>
                <button type="button" onClick={handleClear}>
                  Clear Graph
                </button>
              </div>
            </div>

            <div className="tj-speed-row" style={{ marginTop: "0.5rem" }}>
              <label htmlFor="tj-speed">Speed:</label>
              <input
                id="tj-speed"
                type="range"
                min={1}
                max={10}
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
              />
              <span>{speed}</span>
            </div>

            <div className="tj-hint">
              {mode === "add-node"
                ? "Click canvas to add node · Drag node to move · Double-click node to remove · Right-click node to start edge"
                : mode === "add-edge"
                  ? "Drag from one node to another to add a directed edge"
                  : "Drag nodes to reposition them"}
            </div>

            <div className="tj-info" style={{ marginTop: "0.75rem" }}>
              {infoText}
            </div>

            {/* SVG Graph */}
            <div className="tj-svg-wrapper" style={{ marginTop: "0.75rem" }}>
              <svg
                ref={svgRef}
                viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
                width={SVG_WIDTH}
                height={SVG_HEIGHT}
                onMouseDown={handleSvgMouseDown}
                onMouseMove={handleSvgMouseMove}
                onMouseUp={handleSvgMouseUp}
                onClick={handleSvgClick}
                onDoubleClick={handleSvgDoubleClick}
                onContextMenu={handleSvgContextMenu}
                style={{
                  cursor:
                    mode === "add-node"
                      ? "crosshair"
                      : mode === "add-edge"
                        ? "cell"
                        : "grab",
                }}
              >
                {/* Define arrowhead marker */}
                <defs>
                  {Object.entries(EDGE_COLORS).map(([key, color]) => (
                    <marker
                      key={key}
                      id={`arrow-${key}`}
                      markerWidth={10}
                      markerHeight={7}
                      refX={10}
                      refY={3.5}
                      orient="auto"
                    >
                      <polygon points="0 0, 10 3.5, 0 7" fill={color} />
                    </marker>
                  ))}
                </defs>

                {/* Draw edges */}
                {edges.map((ed) => {
                  const fromNode = nodes.find((n) => n.id === ed.from);
                  const toNode = nodes.find((n) => n.id === ed.to);
                  if (!fromNode || !toNode) return null;

                  let color = EDGE_COLORS.default!;
                  let highlighted = false;
                  if (
                    step &&
                    activeEdgeFrom !== null &&
                    activeEdgeTo !== null &&
                    ed.from === activeEdgeFrom &&
                    ed.to === activeEdgeTo
                  ) {
                    if (activeEdgeType === "back") color = EDGE_COLORS.back!;
                    else if (activeEdgeType === "cross")
                      color = EDGE_COLORS.cross!;
                    else if (activeEdgeType === "tree")
                      color = EDGE_COLORS.tree!;
                    highlighted = true;
                  } else if (
                    step &&
                    activeEdgeType === "tree" &&
                    step.type === "lowlink-update" &&
                    ed.from === step.fromNode
                  ) {
                    // tree edge after recursion
                    color = EDGE_COLORS.tree!;
                    highlighted = true;
                  }

                  return (
                    <Arrow
                      key={`${ed.from}-${ed.to}`}
                      from={fromNode}
                      to={toNode}
                      color={color}
                      highlighted={highlighted}
                    />
                  );
                })}

                {/* Drag edge preview line */}
                {drawEdgeLine && (
                  <line
                    x1={drawEdgeLine.x1}
                    y1={drawEdgeLine.y1}
                    x2={drawEdgeLine.x2}
                    y2={drawEdgeLine.y2}
                    stroke="#58a6ff"
                    strokeWidth={2}
                    strokeDasharray="6 4"
                  />
                )}

                {/* Draw nodes */}
                {nodes.map((n) => {
                  const isCurrentNode = step?.nodeId === n.id;
                  const onStack = step ? step.stack.includes(n.id) : false;
                  const sccColor = sccColorMap[n.id] ?? null;

                  return (
                    <NodeCircle
                      key={n.id}
                      node={n}
                      isCurrentNode={isCurrentNode}
                      onStack={onStack}
                      sccColor={sccColor}
                      disc={step?.discoveryTime[n.id]}
                      low={step?.lowLink[n.id]}
                    />
                  );
                })}
              </svg>
            </div>

            {/* Stack panel */}
            <div className="tj-stack-panel" style={{ marginTop: "0.75rem" }}>
              <div className="tj-stack-title">Algorithm Stack</div>
              <div className="tj-stack-contents">
                {!step || step.stack.length === 0 ? (
                  <span className="tj-stack-empty">Stack is empty</span>
                ) : (
                  step.stack.map((nid, i) => {
                    let cls = "tj-stack-node";
                    if (i === step.stack.length - 1)
                      cls += " tj-stack-node-new";
                    if (step.type === "scc-found") cls += " tj-stack-node-scc";
                    return (
                      <span key={`${nid}-${i}`} className={cls}>
                        {nid}
                      </span>
                    );
                  })
                )}
              </div>
            </div>

            {/* Playback */}
            {hasRun && (
              <PlaybackController
                steps={steps}
                currentStep={currentStep}
                onStep={setCurrentStep}
                onReset={() => setCurrentStep(0)}
              />
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="sidebar">
          {/* Stats */}
          <div className="stats-grid" style={{ marginBottom: "1rem" }}>
            <div className="stat-card">
              <span className="stat-value">{nodes.length}</span>
              <span className="stat-label">Nodes</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{edges.length}</span>
              <span className="stat-label">Edges</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">
                {sccCount > 0 ? sccCount : "\u2014"}
              </span>
              <span className="stat-label">SCCs Found</span>
            </div>
          </div>

          {/* Watch panel */}
          {step && <WatchPanel vars={watchVars} />}

          {/* Pseudocode */}
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

          {/* SCC color legend — shown after algorithm runs */}
          {step && step.sccs.length > 0 && (
            <div className="panel">
              <div className="panel-title">Found SCCs</div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.4rem",
                }}
              >
                {step.sccs.map((scc, i) => {
                  const color = SCC_COLORS[i % SCC_COLORS.length]!;
                  return (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        fontSize: "0.85rem",
                      }}
                    >
                      <span
                        style={{
                          display: "inline-block",
                          width: 12,
                          height: 12,
                          borderRadius: "50%",
                          background: color,
                          flexShrink: 0,
                        }}
                      />
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          color: color,
                        }}
                      >
                        {"{"}
                        {scc.join(", ")}
                        {"}"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
