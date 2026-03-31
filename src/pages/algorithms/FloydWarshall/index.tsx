import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { Nav } from "@/components/Nav";
import { WatchPanel } from "@/components/WatchPanel";
import { ComplexityPopover } from "@/components/ComplexityPopover";
import { AnalogyPanel } from "@/components/AnalogyPanel";
import { ProblemFrame } from "@/components/ProblemFrame";
import { WhyComplexityPanel } from "@/components/WhyComplexityPanel";
import {
  createAdjacencyMatrix,
  runFloydWarshall,
  reconstructPath,
  type Edge,
  type FloydWarshallStep,
  type FloydWarshallResult,
} from "@/lib/algorithms/floyd-warshall";
import "@/styles/floyd-warshall.css";

// ---- Constants -------------------------------------------------------

const MAX_VERTICES = 8;
const VERTEX_LABELS = "ABCDEFGH";

const PRESETS: Record<
  string,
  { label: string; numVertices: number; edges: Edge[] }
> = {
  simple: {
    label: "Simple 4-node",
    numVertices: 4,
    edges: [
      { from: 0, to: 1, weight: 3 },
      { from: 0, to: 2, weight: 8 },
      { from: 0, to: 3, weight: -4 },
      { from: 1, to: 3, weight: 7 },
      { from: 1, to: 2, weight: 4 },
      { from: 2, to: 1, weight: -5 },
      { from: 3, to: 2, weight: 6 },
    ],
  },
  cities: {
    label: "City Routes (5 nodes)",
    numVertices: 5,
    edges: [
      { from: 0, to: 1, weight: 2 },
      { from: 0, to: 2, weight: 6 },
      { from: 1, to: 2, weight: 3 },
      { from: 1, to: 3, weight: 8 },
      { from: 2, to: 3, weight: 2 },
      { from: 2, to: 4, weight: 5 },
      { from: 3, to: 4, weight: 1 },
      { from: 4, to: 0, weight: 7 },
    ],
  },
  complete: {
    label: "Complete 4-node",
    numVertices: 4,
    edges: [
      { from: 0, to: 1, weight: 1 },
      { from: 0, to: 2, weight: 4 },
      { from: 0, to: 3, weight: 7 },
      { from: 1, to: 0, weight: 1 },
      { from: 1, to: 2, weight: 2 },
      { from: 1, to: 3, weight: 5 },
      { from: 2, to: 0, weight: 4 },
      { from: 2, to: 1, weight: 2 },
      { from: 2, to: 3, weight: 1 },
      { from: 3, to: 0, weight: 7 },
      { from: 3, to: 1, weight: 5 },
      { from: 3, to: 2, weight: 1 },
    ],
  },
};

const PSEUDO_LINES = [
  "for k from 0 to V-1:",
  "  for i from 0 to V-1:",
  "    for j from 0 to V-1:",
  "      if dist[i][k] + dist[k][j]",
  "       < dist[i][j]:",
  "        dist[i][j] =",
  "          dist[i][k] + dist[k][j]",
  "        pred[i][j] = pred[k][j]",
];

// ---- Helpers ---------------------------------------------------------

function label(i: number): string {
  return VERTEX_LABELS[i] ?? String(i);
}

function distStr(d: number): string {
  return d === Infinity ? "\u221e" : String(d);
}

/**
 * Rebuild the dist/pred snapshot matrices up to (and including) stepIdx.
 */
function buildSnapshots(
  adjMatrix: number[][],
  steps: FloydWarshallStep[],
  stepIdx: number,
): { distSnap: number[][]; predSnap: (number | null)[][] } {
  const n = adjMatrix.length;
  const distSnap: number[][] = adjMatrix.map((row) => row.slice());
  const predSnap: (number | null)[][] = adjMatrix.map((row, i) =>
    row.map((v, j) => (i === j || v === Infinity ? null : i)),
  );

  for (let s = 0; s <= stepIdx; s++) {
    const step = steps[s];
    if (!step) break;
    if (step.updated) {
      distSnap[step.i]![step.j] = step.newDist;
      predSnap[step.i]![step.j] = predSnap[step.k]![step.j] ?? null;
    }
  }

  return { distSnap, predSnap };
}

// ---- Sub-components --------------------------------------------------

interface MatrixTableProps {
  n: number;
  data: number[][] | (number | null)[][] | null;
  type: "dist" | "pred";
  activeK: number;
  activeI: number;
  activeJ: number;
  selectedPair: { i: number; j: number } | null;
  onCellClick?: (i: number, j: number) => void;
}

function MatrixTable({
  n,
  data,
  type,
  activeK,
  activeI,
  activeJ,
  selectedPair,
  onCellClick,
}: MatrixTableProps) {
  return (
    <table className="fw-matrix-table">
      <thead>
        <tr>
          <th className="fw-matrix-corner" />
          {Array.from({ length: n }, (_, j) => (
            <th
              key={j}
              className={[
                "fw-matrix-header",
                j === activeK ? "fw-col-active-k" : "",
                j === activeJ && j !== activeK ? "fw-col-active" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {label(j)}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: n }, (_, i) => (
          <tr key={i}>
            <th
              className={[
                "fw-matrix-header",
                i === activeK ? "fw-row-active-k" : "",
                i === activeI && i !== activeK ? "fw-row-active" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {label(i)}
            </th>
            {Array.from({ length: n }, (_, j) => {
              const isActive = i === activeI && j === activeJ;
              const isKLine =
                !isActive && (i === activeK || j === activeK) && activeK >= 0;
              const isSelected =
                type === "dist" &&
                selectedPair !== null &&
                selectedPair.i === i &&
                selectedPair.j === j;
              const isClickable = type === "dist" && data !== null && i !== j;

              const classes = [
                "fw-matrix-cell",
                isActive ? "fw-cell-active" : "",
                isKLine ? "fw-cell-k" : "",
                isClickable ? "fw-cell-clickable" : "",
                isSelected ? "fw-cell-selected" : "",
              ]
                .filter(Boolean)
                .join(" ");

              let cellText = "\u2014";
              if (data !== null) {
                if (type === "pred") {
                  const v = (data as (number | null)[][])[i]![j];
                  cellText = v === null ? "\u2014" : label(v);
                } else {
                  const v = (data as number[][])[i]![j];
                  cellText = distStr(v!);
                }
              }

              return (
                <td
                  key={j}
                  className={classes}
                  onClick={
                    isClickable && onCellClick
                      ? () => onCellClick(i, j)
                      : undefined
                  }
                >
                  {cellText}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ---- SVG Graph -------------------------------------------------------

interface GraphSvgProps {
  numVertices: number;
  edges: Edge[];
  activeK: number;
  selectedPair: { i: number; j: number } | null;
  predSnap: (number | null)[][] | null;
  distSnap: number[][] | null;
}

function GraphSvg({
  numVertices,
  edges,
  activeK,
  selectedPair,
  predSnap,
  distSnap,
}: GraphSvgProps) {
  const W = 320;
  const H = 320;
  const cx = W / 2;
  const cy = H / 2;
  const r = Math.min(cx, cy) - 45;
  const nr = 18;

  const positions = useMemo(() => {
    return Array.from({ length: numVertices }, (_, i) => {
      const angle = (2 * Math.PI * i) / numVertices - Math.PI / 2;
      return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
    });
  }, [numVertices, cx, cy, r]);

  const pathEdgeSet = useMemo(() => {
    const set = new Set<string>();
    if (selectedPair !== null && predSnap !== null) {
      const path = reconstructPath(predSnap, selectedPair.i, selectedPair.j);
      if (path && path.length > 1) {
        for (let p = 0; p < path.length - 1; p++) {
          set.add(`${path[p]}-${path[p + 1]}`);
        }
      }
    }
    return set;
  }, [selectedPair, predSnap]);

  return (
    <svg
      className="fw-graph-svg"
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
    >
      <defs>
        <marker
          id="fw-arrow-default"
          markerWidth="8"
          markerHeight="8"
          refX="6"
          refY="3"
          orient="auto"
        >
          <path d="M0,0 L0,6 L8,3 z" fill="#30363d" />
        </marker>
        <marker
          id="fw-arrow-path"
          markerWidth="8"
          markerHeight="8"
          refX="6"
          refY="3"
          orient="auto"
        >
          <path d="M0,0 L0,6 L8,3 z" fill="#3fb950" />
        </marker>
        <marker
          id="fw-arrow-k"
          markerWidth="8"
          markerHeight="8"
          refX="6"
          refY="3"
          orient="auto"
        >
          <path d="M0,0 L0,6 L8,3 z" fill="#e3b341" />
        </marker>
      </defs>

      {/* Edges */}
      {edges.map((edge, idx) => {
        const from = positions[edge.from]!;
        const to = positions[edge.to]!;
        const key = `${edge.from}-${edge.to}`;
        const isPath = pathEdgeSet.has(key);
        const isKEdge =
          activeK >= 0 && (edge.from === activeK || edge.to === activeK);

        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist === 0) return null;
        const ux = dx / dist;
        const uy = dy / dist;

        const x1 = from.x + ux * (nr + 2);
        const y1 = from.y + uy * (nr + 2);
        const x2 = to.x - ux * (nr + 10);
        const y2 = to.y - uy * (nr + 10);

        const midX = (x1 + x2) / 2 - uy * 10;
        const midY = (y1 + y2) / 2 + ux * 10;

        const stroke = isPath ? "#3fb950" : isKEdge ? "#e3b341" : "#30363d";
        const marker = isPath
          ? "url(#fw-arrow-path)"
          : isKEdge
            ? "url(#fw-arrow-k)"
            : "url(#fw-arrow-default)";

        return (
          <g key={idx}>
            <line
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={stroke}
              strokeWidth={isPath ? 2.5 : 1.5}
              markerEnd={marker}
            />
            <text
              x={midX}
              y={midY}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={11}
              fill={isPath ? "#3fb950" : isKEdge ? "#e3b341" : "#8b949e"}
              fontFamily="inherit"
            >
              {edge.weight}
            </text>
          </g>
        );
      })}

      {/* Nodes */}
      {Array.from({ length: numVertices }, (_, i) => {
        const p = positions[i]!;
        const isK = i === activeK;
        const isPathNode =
          selectedPair !== null &&
          (i === selectedPair.i || i === selectedPair.j);

        const fill = isK ? "#d2992230" : isPathNode ? "#23863630" : "#21262d";
        const stroke = isK ? "#e3b341" : isPathNode ? "#3fb950" : "#30363d";
        const textFill = isK ? "#e3b341" : isPathNode ? "#3fb950" : "#c9d1d9";

        return (
          <g key={i}>
            <circle
              cx={p.x}
              cy={p.y}
              r={nr}
              fill={fill}
              stroke={stroke}
              strokeWidth={isK || isPathNode ? 2.5 : 1.5}
            />
            <text
              x={p.x}
              y={p.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={13}
              fontWeight={600}
              fill={textFill}
              fontFamily="inherit"
            >
              {label(i)}
            </text>
            {distSnap !== null && selectedPair !== null && (
              <text
                x={p.x}
                y={p.y - nr - 6}
                textAnchor="middle"
                fontSize={10}
                fill="#58a6ff"
                fontFamily="inherit"
              >
                {distStr(distSnap[selectedPair.i]![i]!)}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

// ---- Main Page Component ---------------------------------------------

const SPEEDS_MS = [
  { label: "0.5x", ms: 1200 },
  { label: "1x", ms: 600 },
  { label: "2x", ms: 300 },
  { label: "4x", ms: 150 },
];

export default function FloydWarshall() {
  const [presetKey, setPresetKey] = useState("simple");
  const [numVertices, setNumVertices] = useState(4);
  const [edges, setEdges] = useState<Edge[]>(PRESETS.simple!.edges.slice());
  const [adjMatrix, setAdjMatrix] = useState<number[][] | null>(() =>
    createAdjacencyMatrix(PRESETS.simple!.edges, 4),
  );
  const [result, setResult] = useState<FloydWarshallResult | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedPair, setSelectedPair] = useState<{
    i: number;
    j: number;
  } | null>(null);
  const [infoText, setInfoText] = useState(
    "Preset loaded. Click Run to start Floyd-Warshall.",
  );
  const [showCustom, setShowCustom] = useState(false);
  const [customVertices, setCustomVertices] = useState("3");
  const [customEdgeList, setCustomEdgeList] = useState("0 1 4\n1 2 3\n0 2 10");
  const [customError, setCustomError] = useState("");

  // Playback
  const [isPlaying, setIsPlaying] = useState(false);
  const [speedIdx, setSpeedIdx] = useState(1);
  const playTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (playTimerRef.current) clearTimeout(playTimerRef.current);
    };
  }, []);

  const stopPlayback = useCallback(() => {
    setIsPlaying(false);
    if (playTimerRef.current) {
      clearTimeout(playTimerRef.current);
      playTimerRef.current = null;
    }
  }, []);

  // Playback effect
  useEffect(() => {
    if (!isPlaying || !result) return;
    const total = result.steps.length;
    if (currentStep >= total - 1) {
      setIsPlaying(false);
      return;
    }
    playTimerRef.current = setTimeout(() => {
      setCurrentStep((s) => Math.min(s + 1, total - 1));
    }, SPEEDS_MS[speedIdx]!.ms);
    return () => {
      if (playTimerRef.current) clearTimeout(playTimerRef.current);
    };
  }, [isPlaying, currentStep, result, speedIdx, SPEEDS_MS]);

  // ---- Graph snapshot at current step ---
  const { distSnap, predSnap } = useMemo(() => {
    if (!result || !adjMatrix) return { distSnap: null, predSnap: null };
    return buildSnapshots(adjMatrix, result.steps, currentStep);
  }, [result, adjMatrix, currentStep]);

  const currentStepData: FloydWarshallStep | null =
    result && result.steps[currentStep] ? result.steps[currentStep]! : null;

  const activeK = currentStepData ? currentStepData.k : -1;
  const activeI = currentStepData ? currentStepData.i : -1;
  const activeJ = currentStepData ? currentStepData.j : -1;

  // ---- Load preset ---
  const loadPreset = useCallback(
    (key: string) => {
      const preset = PRESETS[key];
      if (!preset) return;
      stopPlayback();
      setNumVertices(preset.numVertices);
      setEdges(preset.edges.slice());
      const mat = createAdjacencyMatrix(preset.edges, preset.numVertices);
      setAdjMatrix(mat);
      setResult(null);
      setCurrentStep(0);
      setSelectedPair(null);
      setInfoText(
        `Preset loaded: ${preset.label}. Click Run to start Floyd-Warshall.`,
      );
    },
    [stopPlayback],
  );

  // ---- Apply custom graph ---
  const applyCustom = useCallback(() => {
    setCustomError("");
    const n = parseInt(customVertices, 10);
    if (isNaN(n) || n < 1 || n > MAX_VERTICES) {
      setCustomError(`Vertex count must be between 1 and ${MAX_VERTICES}.`);
      return;
    }
    const lines = customEdgeList.trim().split("\n");
    const newEdges: Edge[] = [];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]!.trim();
      if (!line) continue;
      const parts = line.split(/[\s,]+/);
      if (parts.length < 3) {
        setCustomError(`Line ${i + 1}: expected 'from to weight'.`);
        return;
      }
      const from = parseInt(parts[0]!, 10);
      const to = parseInt(parts[1]!, 10);
      const weight = parseInt(parts[2]!, 10);
      if (
        isNaN(from) ||
        isNaN(to) ||
        isNaN(weight) ||
        from < 0 ||
        from >= n ||
        to < 0 ||
        to >= n
      ) {
        setCustomError(
          `Line ${i + 1}: vertex indices must be 0..${n - 1} and weight must be a number.`,
        );
        return;
      }
      newEdges.push({ from, to, weight });
    }
    stopPlayback();
    setNumVertices(n);
    setEdges(newEdges);
    const mat = createAdjacencyMatrix(newEdges, n);
    setAdjMatrix(mat);
    setResult(null);
    setCurrentStep(0);
    setSelectedPair(null);
    setShowCustom(false);
    setInfoText(
      `Custom graph loaded (${n} vertices, ${newEdges.length} edges). Click Run to start.`,
    );
  }, [customVertices, customEdgeList, stopPlayback]);

  // ---- Run algorithm ---
  const handleRun = useCallback(() => {
    if (!adjMatrix) {
      setInfoText("Load a preset or custom graph first.");
      return;
    }
    stopPlayback();
    const res = runFloydWarshall(adjMatrix);
    setResult(res);
    setCurrentStep(0);
    setSelectedPair(null);
    setInfoText(
      `Running Floyd-Warshall — ${res.steps.length} steps total. Use playback to step through.`,
    );
  }, [adjMatrix, stopPlayback]);

  // ---- Reset ---
  const handleReset = useCallback(() => {
    stopPlayback();
    setCurrentStep(0);
    setSelectedPair(null);
  }, [stopPlayback]);

  // ---- Cell click for path display ---
  const handleCellClick = useCallback(
    (i: number, j: number) => {
      if (!result) return;
      setSelectedPair((prev) =>
        prev && prev.i === i && prev.j === j ? null : { i, j },
      );
    },
    [result],
  );

  // ---- Path info text ---
  const pathInfoText = useMemo(() => {
    if (!selectedPair || !predSnap || !distSnap) return "";
    const { i, j } = selectedPair;
    const path = reconstructPath(predSnap, i, j);
    if (path === null) {
      return `No path from ${label(i)} to ${label(j)}.`;
    }
    if (i === j) {
      return `Path ${label(i)} \u2192 ${label(j)}: [${label(i)}] (distance 0)`;
    }
    const dist = distSnap[i]![j]!;
    const pathStr = path.map(label).join(" \u2192 ");
    return `Shortest path ${label(i)} \u2192 ${label(j)}: ${pathStr} (distance ${distStr(dist)})`;
  }, [selectedPair, predSnap, distSnap]);

  // ---- Narrative ---
  const narrative = useMemo(() => {
    if (!currentStepData) return "";
    const through = `via ${label(currentStepData.k)}`;
    const route = `${label(currentStepData.i)}\u2192${label(currentStepData.k)}\u2192${label(currentStepData.j)}`;
    if (currentStepData.updated) {
      return (
        `Updated dist[${label(currentStepData.i)}][${label(currentStepData.j)}]: ` +
        `${distStr(currentStepData.oldDist)} \u2192 ${distStr(currentStepData.newDist)} (${through}, path ${route})`
      );
    }
    return (
      `Checking ${label(currentStepData.i)}\u2192${label(currentStepData.j)} ` +
      `via ${label(currentStepData.k)}: ${distStr(currentStepData.oldDist)} \u2264 ` +
      `${distStr(currentStepData.newDist)} \u2014 no improvement.`
    );
  }, [currentStepData]);

  // ---- Stats ---
  const updateCount = useMemo(() => {
    if (!result) return 0;
    return result.steps.slice(0, currentStep + 1).filter((s) => s.updated)
      .length;
  }, [result, currentStep]);

  // ---- Watch vars ---
  const watchVars = result
    ? [
        {
          label: "k (intermediate)",
          value: activeK >= 0 ? label(activeK) : "\u2014",
        },
        {
          label: "i (source)",
          value: activeI >= 0 ? label(activeI) : "\u2014",
        },
        {
          label: "j (target)",
          value: activeJ >= 0 ? label(activeJ) : "\u2014",
        },
        {
          label: "updated?",
          value: currentStepData
            ? currentStepData.updated
              ? "YES"
              : "no"
            : "\u2014",
          highlight: currentStepData?.updated ?? false,
        },
        { label: "updates so far", value: updateCount },
      ]
    : [];

  const hasRun = result !== null;
  const totalSteps = result ? result.steps.length : 0;
  const atEnd = hasRun && currentStep >= totalSteps - 1;

  const handlePlayPause = () => {
    if (!result) return;
    if (atEnd) {
      setCurrentStep(0);
      setIsPlaying(true);
    } else {
      setIsPlaying((p) => !p);
    }
  };

  // ---- Pseudocode line highlight ---
  // Line 0: for k  — always when result running
  // Line 1: for i
  // Line 2: for j
  // Lines 3-4: if condition (checking)
  // Lines 5-7: update block
  function pseudoLine(): number {
    if (!currentStepData) return -1;
    if (currentStepData.updated) return 5;
    return 3;
  }

  return (
    <div className="algo-page" data-category="graph">
      <Nav currentCategory="graph" />

      {/* Page Header */}
      <div className="page-header">
        <div className="title-group">
          <h1>Floyd-Warshall All-Pairs Shortest Paths</h1>
          <div className="title-meta">
            <span className="badge">Graph</span>
            <ComplexityPopover
              best="O(V\u00b3)"
              avg="O(V\u00b3)"
              worst="O(V\u00b3)"
              space="O(V\u00b2)"
              bestNote="All cases"
              avgNote="All cases"
              worstNote="All cases"
              spaceNote="Distance matrix"
              why="Three nested loops — for every pair of vertices (V\u00b2), try every intermediate vertex (V). Total: V\u00b3. No way around it — we check all paths."
            />
          </div>
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
                You need the shortest path between every pair of cities in a
                road network — not just from one source. Running Dijkstra n
                times works, but is there a cleaner way?
              </p>
            </div>
            <div className="app-section">
              <span className="app-label">The Approach</span>
              <p>
                For every pair (i, j), try every intermediate vertex k. If going
                through k is shorter, update the distance. Three nested loops
                cover all possibilities.
              </p>
            </div>
            <div className="app-section">
              <span className="app-label">When To Use</span>
              <p>
                All-pairs shortest paths in dense graphs. Detecting negative
                cycles. Computing transitive closure. Network analysis where all
                distances are needed.
              </p>
            </div>
          </ProblemFrame>

          <WhyComplexityPanel derivation="Floyd-Warshall uses three nested loops each iterating V times, giving V\u00b3 total operations. The inner body does O(1) work (one comparison and possible assignment). Space is O(V\u00b2) for the distance and predecessor matrices — we cannot avoid storing all pairs." />

          <AnalogyPanel>
            Like checking every possible layover city: &ldquo;Is it shorter to
            fly from A to B directly, or to stop through C?&rdquo; Repeat for
            every possible intermediate stop across all city pairs, and after V
            rounds you know the shortest route between every pair of cities.
          </AnalogyPanel>

          {/* Controls panel */}
          <div className="panel">
            <div className="controls">
              <div className="inputs">
                <label htmlFor="fw-preset-select">Preset</label>
                <select
                  id="fw-preset-select"
                  value={presetKey}
                  onChange={(e) => {
                    setPresetKey(e.target.value);
                    loadPreset(e.target.value);
                  }}
                >
                  {Object.entries(PRESETS).map(([key, p]) => (
                    <option key={key} value={key}>
                      {p.label}
                    </option>
                  ))}
                </select>
                <button type="button" onClick={() => setShowCustom((s) => !s)}>
                  {showCustom ? "Hide Custom" : "Custom Graph"}
                </button>
                <button
                  type="button"
                  className="fw-btn-primary"
                  onClick={handleRun}
                >
                  Run Floyd-Warshall
                </button>
              </div>
            </div>

            {/* Custom graph input */}
            {showCustom && (
              <div className="fw-custom-panel">
                <div className="fw-custom-row">
                  <label>
                    Vertices (1&ndash;{MAX_VERTICES}):
                    <input
                      type="number"
                      min={1}
                      max={MAX_VERTICES}
                      value={customVertices}
                      onChange={(e) => setCustomVertices(e.target.value)}
                    />
                  </label>
                </div>
                <div className="fw-custom-row">
                  <label>
                    Edges (one per line: <code>from to weight</code>,
                    0-indexed):
                  </label>
                  <textarea
                    rows={5}
                    value={customEdgeList}
                    onChange={(e) => setCustomEdgeList(e.target.value)}
                    placeholder={"0 1 4\n1 2 3\n0 2 10"}
                    maxLength={500}
                  />
                </div>
                {customError && (
                  <div className="algo-error visible">{customError}</div>
                )}
                <button type="button" onClick={applyCustom}>
                  Apply
                </button>
              </div>
            )}

            {/* Info text */}
            <div className="info" style={{ marginTop: "0.75rem" }}>
              {infoText}
            </div>

            {/* Narrative */}
            {hasRun && (
              <div className="fw-narrative">
                {narrative || "Step through to see the algorithm explanation."}
              </div>
            )}

            {/* Visualization layout */}
            <div className="fw-layout">
              {/* Graph SVG */}
              <div className="fw-graph-panel">
                <div className="fw-panel-title">Graph</div>
                <GraphSvg
                  numVertices={numVertices}
                  edges={edges}
                  activeK={activeK}
                  selectedPair={selectedPair}
                  predSnap={predSnap}
                  distSnap={distSnap}
                />
                {selectedPair && (
                  <div className="fw-path-info">{pathInfoText}</div>
                )}
              </div>

              {/* Matrices */}
              <div className="fw-matrices-panel">
                <div className="fw-matrix-section">
                  <div className="fw-panel-title">
                    Distance Matrix
                    <span className="fw-hint">(click cell to show path)</span>
                  </div>
                  <MatrixTable
                    n={numVertices}
                    data={distSnap}
                    type="dist"
                    activeK={activeK}
                    activeI={activeI}
                    activeJ={activeJ}
                    selectedPair={selectedPair}
                    onCellClick={handleCellClick}
                  />
                </div>
                <div className="fw-matrix-section">
                  <div className="fw-panel-title">Predecessor Matrix</div>
                  <MatrixTable
                    n={numVertices}
                    data={predSnap}
                    type="pred"
                    activeK={activeK}
                    activeI={activeI}
                    activeJ={activeJ}
                    selectedPair={selectedPair}
                  />
                </div>
              </div>
            </div>

            {/* Playback */}
            {hasRun && (
              <div className="playback-controls">
                <div className="playback-btns">
                  <button
                    type="button"
                    className="icon-btn"
                    onClick={handleReset}
                    title="Reset"
                    aria-label="Reset"
                  >
                    ↺
                  </button>
                  <button
                    type="button"
                    className="icon-btn"
                    onClick={() => setCurrentStep((s) => Math.max(s - 1, 0))}
                    disabled={currentStep <= 0}
                    title="Step back"
                    aria-label="Step back"
                  >
                    ⏮
                  </button>
                  <button
                    type="button"
                    className={`icon-btn${isPlaying ? " active" : ""}`}
                    onClick={handlePlayPause}
                    title={isPlaying ? "Pause" : "Play"}
                    aria-label={isPlaying ? "Pause" : "Play"}
                  >
                    {isPlaying ? "⏸" : "▶"}
                  </button>
                  <button
                    type="button"
                    className="icon-btn"
                    onClick={() =>
                      setCurrentStep((s) => Math.min(s + 1, totalSteps - 1))
                    }
                    disabled={atEnd}
                    title="Step forward"
                    aria-label="Step forward"
                  >
                    ⏭
                  </button>
                </div>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.8rem",
                    color: "var(--text-secondary)",
                  }}
                >
                  Step {totalSteps > 0 ? currentStep + 1 : 0} / {totalSteps}
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

        {/* Sidebar */}
        <div className="sidebar">
          {/* Stats */}
          {hasRun && (
            <div className="stats-grid" style={{ marginBottom: "1rem" }}>
              <div className="stat-card">
                <span className="stat-value">{currentStep + 1}</span>
                <span className="stat-label">Step</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">
                  {activeK >= 0 ? label(activeK) : "\u2014"}
                </span>
                <span className="stat-label">k</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">{updateCount}</span>
                <span className="stat-label">Updates</span>
              </div>
            </div>
          )}

          {/* Watch panel */}
          {result && <WatchPanel vars={watchVars} />}

          {/* Pseudocode */}
          <div className="panel">
            <div className="panel-title">Pseudocode</div>
            <div className="code-panel">
              {PSEUDO_LINES.map((line, idx) => (
                <span
                  key={idx}
                  className={`code-line${pseudoLine() === idx ? " highlight" : ""}`}
                >
                  {line}
                </span>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div
            className="panel"
            style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}
          >
            <div className="panel-title">Legend</div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.35rem",
              }}
            >
              <span>
                <span
                  className="swatch"
                  style={{
                    background: "rgba(88, 166, 255, 0.25)",
                    borderColor: "var(--accent)",
                  }}
                />
                Active cell (i, j)
              </span>
              <span>
                <span
                  className="swatch"
                  style={{
                    background: "rgba(210, 153, 34, 0.12)",
                    borderColor: "#e3b341",
                  }}
                />
                Intermediate vertex k
              </span>
              <span>
                <span
                  className="swatch"
                  style={{
                    background: "rgba(63, 185, 80, 0.25)",
                    borderColor: "#3fb950",
                  }}
                />
                Selected path
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
