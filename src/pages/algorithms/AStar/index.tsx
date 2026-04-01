import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { Nav } from "@/components/Nav";
import { ComplexityPopover } from "@/components/ComplexityPopover";
import { AnalogyPanel } from "@/components/AnalogyPanel";
import { ProblemFrame } from "@/components/ProblemFrame";
import { WhyComplexityPanel } from "@/components/WhyComplexityPanel";
import { WatchPanel } from "@/components/WatchPanel";
import {
  runAStar,
  runBFS,
  type AStarSnapshot,
  type AStarResult,
  type AStarCell,
} from "@/lib/algorithms/astar";
import "@/styles/astar-pathfinding.css";

type EditMode = "WALL" | "START" | "END";
type Heuristic = "manhattan" | "euclidean";

const GRID_SIZES = [5, 10, 15, 20, 25] as const;
const DEFAULT_GRID = 10;
const MAX_OPEN_DISPLAY = 30;

const SPEEDS_MS = [
  { label: "0.5x", ms: 1200 },
  { label: "1x", ms: 600 },
  { label: "2x", ms: 300 },
  { label: "4x", ms: 150 },
];

const PSEUDO_LINES = [
  "open = {start}",
  "g[start] = 0; f[start] = h(start, goal)",
  "while open is not empty:",
  "  curr = node in open with min f",
  "  if curr == goal: return path",
  "  open.remove(curr)",
  "  for neighbor of curr:",
  "    tentative_g = g[curr] + 1",
  "    if tentative_g < g[neighbor]:",
  "      g[neighbor] = tentative_g",
  "      f[neighbor] = g + h(n, goal)",
  "      open.add(neighbor)",
];

function cellKey(r: number, c: number): string {
  return `${r},${c}`;
}

function wallsToArray(walls: boolean[][]): AStarCell[] {
  const arr: AStarCell[] = [];
  for (let r = 0; r < walls.length; r++) {
    for (let c = 0; c < (walls[r]?.length ?? 0); c++) {
      if (walls[r]![c]) arr.push([r, c]);
    }
  }
  return arr;
}

function emptyWalls(size: number): boolean[][] {
  return Array.from({ length: size }, () =>
    Array.from({ length: size }, () => false),
  );
}

function defaultStart(_size: number): [number, number] {
  return [1, 1];
}

function defaultEnd(size: number): [number, number] {
  return [Math.max(0, size - 2), Math.max(0, size - 2)];
}

function pseudoLineIndex(
  snap: AStarSnapshot | undefined,
  stepIdx: number,
  totalSnapshots: number,
): number {
  if (!snap || totalSnapshots === 0) return -1;
  if (stepIdx === totalSnapshots - 1) return 4;
  if (stepIdx === 0) return 0;
  return 6 + (stepIdx % 4);
}

export default function AStarPage() {
  const [gridSize, setGridSize] = useState(DEFAULT_GRID);
  const [walls, setWalls] = useState<boolean[][]>(() =>
    emptyWalls(DEFAULT_GRID),
  );
  const [startPos, setStartPos] = useState<[number, number] | null>(() =>
    defaultStart(DEFAULT_GRID),
  );
  const [endPos, setEndPos] = useState<[number, number] | null>(() =>
    defaultEnd(DEFAULT_GRID),
  );
  const [editMode, setEditMode] = useState<EditMode>("WALL");
  const [heuristic, setHeuristic] = useState<Heuristic>("manhattan");
  const [snapshots, setSnapshots] = useState<AStarSnapshot[]>([]);
  const [bfsSnapshots, setBfsSnapshots] = useState<AStarSnapshot[]>([]);
  const [astarResult, setAstarResult] = useState<AStarResult | null>(null);
  const [bfsResult, setBfsResult] = useState<AStarResult | null>(null);
  const [compareMode, setCompareMode] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [infoText, setInfoText] = useState(
    "Click cells to place walls, set start and end points, then click Run A*.",
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [speedIdx, setSpeedIdx] = useState(1);
  const [hoveredCell, setHoveredCell] = useState<[number, number] | null>(null);
  const wallDragRef = useRef(false);
  const playTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hasRun = snapshots.length > 0;
  const snap =
    hasRun && currentStep >= 0 && currentStep < snapshots.length
      ? snapshots[currentStep]
      : undefined;

  const bfsSnap =
    compareMode &&
    bfsSnapshots.length > 0 &&
    currentStep >= 0 &&
    currentStep < bfsSnapshots.length
      ? bfsSnapshots[Math.min(currentStep, bfsSnapshots.length - 1)]
      : undefined;

  // Memoize set lookups for the A* grid
  const astarOpenSet = useMemo(() => {
    if (!snap) return new Set<string>();
    return new Set(snap.openSet.map(([r, c]) => cellKey(r, c)));
  }, [snap]);

  const astarClosedSet = useMemo(() => {
    if (!snap) return new Set<string>();
    return new Set(snap.closedSet.map(([r, c]) => cellKey(r, c)));
  }, [snap]);

  const astarCurrentKey = snap ? cellKey(snap.current[0], snap.current[1]) : "";

  const astarPathSet = useMemo(() => {
    if (!snap?.costs || !astarResult?.path) return new Set<string>();
    if (currentStep !== snapshots.length - 1) return new Set<string>();
    return new Set(astarResult.path.map(([r, c]) => cellKey(r, c)));
  }, [snap, astarResult, currentStep, snapshots.length]);

  // BFS grid sets (for comparison mode)
  const bfsOpenSet = useMemo(() => {
    if (!bfsSnap) return new Set<string>();
    return new Set(bfsSnap.openSet.map(([r, c]) => cellKey(r, c)));
  }, [bfsSnap]);

  const bfsClosedSet = useMemo(() => {
    if (!bfsSnap) return new Set<string>();
    return new Set(bfsSnap.closedSet.map(([r, c]) => cellKey(r, c)));
  }, [bfsSnap]);

  const bfsCurrentKey = bfsSnap
    ? cellKey(bfsSnap.current[0], bfsSnap.current[1])
    : "";

  const bfsPathSet = useMemo(() => {
    if (!bfsSnap || !bfsResult?.path) return new Set<string>();
    if (currentStep < bfsSnapshots.length - 1) return new Set<string>();
    return new Set(bfsResult.path.map(([r, c]) => cellKey(r, c)));
  }, [bfsSnap, bfsResult, currentStep, bfsSnapshots.length]);

  const stopPlayback = useCallback(() => {
    setIsPlaying(false);
    if (playTimerRef.current) {
      clearTimeout(playTimerRef.current);
      playTimerRef.current = null;
    }
  }, []);

  const clearRun = useCallback(() => {
    stopPlayback();
    setSnapshots([]);
    setBfsSnapshots([]);
    setAstarResult(null);
    setBfsResult(null);
    setCompareMode(false);
    setCurrentStep(0);
    setInfoText(
      "Click cells to place walls, set start and end points, then click Run A*.",
    );
  }, [stopPlayback]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (playTimerRef.current) clearTimeout(playTimerRef.current);
    };
  }, []);

  // Mouse up to stop wall drag
  useEffect(() => {
    const onUp = () => {
      wallDragRef.current = false;
    };
    document.addEventListener("mouseup", onUp);
    return () => document.removeEventListener("mouseup", onUp);
  }, []);

  const handleCell = useCallback(
    (r: number, c: number) => {
      if (snapshots.length > 0) return;

      if (editMode === "WALL") {
        if (startPos && r === startPos[0] && c === startPos[1]) return;
        if (endPos && r === endPos[0] && c === endPos[1]) return;
        setWalls((prev) => {
          const next = prev.map((row) => [...row]);
          next[r]![c] = !next[r]![c];
          return next;
        });
      } else if (editMode === "START") {
        setWalls((prev) => {
          const next = prev.map((row) => [...row]);
          next[r]![c] = false;
          return next;
        });
        setStartPos([r, c]);
        if (endPos && endPos[0] === r && endPos[1] === c) setEndPos(null);
      } else {
        setWalls((prev) => {
          const next = prev.map((row) => [...row]);
          next[r]![c] = false;
          return next;
        });
        setEndPos([r, c]);
        if (startPos && startPos[0] === r && startPos[1] === c)
          setStartPos(null);
      }
    },
    [editMode, endPos, snapshots.length, startPos],
  );

  const reinitGrid = useCallback(
    (size: number) => {
      stopPlayback();
      setGridSize(size);
      setWalls(emptyWalls(size));
      setStartPos(defaultStart(size));
      setEndPos(defaultEnd(size));
      setSnapshots([]);
      setBfsSnapshots([]);
      setAstarResult(null);
      setBfsResult(null);
      setCompareMode(false);
      setCurrentStep(0);
      setInfoText(
        "Click cells to place walls, set start and end points, then click Run A*.",
      );
    },
    [stopPlayback],
  );

  const doRunAStar = useCallback(
    (withCompare: boolean) => {
      if (!startPos || !endPos) {
        setInfoText("Please set both a start and end point before running A*.");
        return;
      }
      if (startPos[0] === endPos[0] && startPos[1] === endPos[1]) {
        setInfoText("Start and end are the same cell — already there!");
        return;
      }

      const options = {
        grid: {
          rows: gridSize,
          cols: gridSize,
          walls: wallsToArray(walls),
        },
        start: startPos as AStarCell,
        end: endPos as AStarCell,
        heuristic,
      };

      const result = runAStar(options);
      setAstarResult(result);
      setSnapshots(result.snapshots);
      setCompareMode(withCompare);

      if (withCompare) {
        const bResult = runBFS(options);
        setBfsResult(bResult);
        setBfsSnapshots(bResult.snapshots);
      } else {
        setBfsResult(null);
        setBfsSnapshots([]);
      }

      setCurrentStep(0);
      stopPlayback();

      if (result.path) {
        setInfoText(
          `A* complete — path length: ${result.pathLength} steps, explored: ${result.explored} cells. Use playback to step through.`,
        );
      } else {
        setInfoText("A* complete — no path found! The end is unreachable.");
      }
    },
    [endPos, gridSize, heuristic, startPos, stopPlayback, walls],
  );

  const handleRunClick = useCallback(() => {
    if (snapshots.length > 0) {
      setSnapshots([]);
      setBfsSnapshots([]);
      setCurrentStep(0);
      stopPlayback();
    }
    doRunAStar(false);
  }, [doRunAStar, snapshots.length, stopPlayback]);

  const handleCompareClick = useCallback(() => {
    if (snapshots.length > 0) {
      setSnapshots([]);
      setBfsSnapshots([]);
      setCurrentStep(0);
      stopPlayback();
    }
    doRunAStar(true);
  }, [doRunAStar, snapshots.length, stopPlayback]);

  const stepForward = useCallback(() => {
    if (snapshots.length === 0) return;
    setCurrentStep((s) => Math.min(s + 1, snapshots.length - 1));
  }, [snapshots.length]);

  const stepBackward = useCallback(() => {
    setCurrentStep((s) => Math.max(s - 1, 0));
  }, []);

  const advancePlay = useCallback(() => {
    setCurrentStep((s) => {
      if (s >= snapshots.length - 1) return s;
      return s + 1;
    });
  }, [snapshots.length]);

  useEffect(() => {
    if (!isPlaying || snapshots.length === 0) return;
    if (currentStep >= snapshots.length - 1) {
      setIsPlaying(false);
      return;
    }
    playTimerRef.current = setTimeout(() => {
      advancePlay();
    }, SPEEDS_MS[speedIdx].ms);
    return () => {
      if (playTimerRef.current) clearTimeout(playTimerRef.current);
    };
  }, [isPlaying, currentStep, snapshots.length, speedIdx, advancePlay]);

  const handlePlayPause = () => {
    if (snapshots.length === 0) return;
    if (currentStep >= snapshots.length - 1) {
      setCurrentStep(0);
      setIsPlaying(true);
    } else {
      setIsPlaying((p) => !p);
    }
  };

  const clearWallsOnly = useCallback(() => {
    if (snapshots.length > 0) clearRun();
    setWalls(emptyWalls(gridSize));
  }, [clearRun, gridSize, snapshots.length]);

  const clearAll = useCallback(() => {
    reinitGrid(gridSize);
  }, [gridSize, reinitGrid]);

  // Hovered cell cost info
  const hoveredCost =
    hoveredCell && snap?.costs
      ? snap.costs[cellKey(hoveredCell[0], hoveredCell[1])]
      : null;

  const showCostLabels = gridSize <= 15;

  const codeLine = pseudoLineIndex(snap, currentStep, snapshots.length);

  const watchVars =
    snap && snapshots.length > 0
      ? [
          {
            label: "open set",
            value: String(snap.openSet.length),
            highlight: snap.openSet.length > 0,
          },
          {
            label: "closed set",
            value: String(snap.closedSet.length),
          },
          {
            label: "current f",
            value: snap.costs[cellKey(snap.current[0], snap.current[1])]
              ? String(
                  Math.round(
                    snap.costs[cellKey(snap.current[0], snap.current[1])]!.f *
                      100,
                  ) / 100,
                )
              : "—",
            highlight: true,
          },
          {
            label: "path found",
            value:
              currentStep === snapshots.length - 1
                ? String(astarResult?.path !== null)
                : "—",
            highlight:
              currentStep === snapshots.length - 1 &&
              astarResult?.path !== null,
          },
        ]
      : [];

  const atStart = currentStep <= 0;
  const atEnd = snapshots.length > 0 && currentStep >= snapshots.length - 1;

  const openItems = snap?.openSet ?? [];
  const displayOpen = openItems.slice(0, MAX_OPEN_DISPLAY);

  function renderGrid(
    gridId: string,
    openSet: Set<string>,
    closedSet: Set<string>,
    currentKey: string,
    pathSet: Set<string>,
    costs: AStarSnapshot["costs"] | undefined,
    interactive: boolean,
  ) {
    return (
      <div
        id={gridId}
        className={`astar-grid-container${gridSize >= 20 ? " astar-grid-large" : ""}`}
        style={{
          gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
        }}
      >
        {Array.from({ length: gridSize }, (_, r) =>
          Array.from({ length: gridSize }, (_, c) => {
            const k = cellKey(r, c);
            let cellClass = "astar-grid-cell";
            if (walls[r]![c]) cellClass += " astar-wall";
            if (startPos && startPos[0] === r && startPos[1] === c)
              cellClass += " astar-start";
            if (endPos && endPos[0] === r && endPos[1] === c)
              cellClass += " astar-end";
            if (hasRun && snap) {
              if (pathSet.has(k)) cellClass += " astar-path";
              else if (k === currentKey) cellClass += " astar-current";
              else if (closedSet.has(k)) cellClass += " astar-closed";
              else if (openSet.has(k)) cellClass += " astar-open";
            }

            const cellCost = costs?.[k];
            const showF = showCostLabels && !!cellCost;

            return (
              <div
                key={k}
                className={cellClass}
                role="button"
                tabIndex={0}
                onMouseDown={
                  interactive
                    ? (e) => {
                        e.preventDefault();
                        if (editMode === "WALL") wallDragRef.current = true;
                        handleCell(r, c);
                      }
                    : undefined
                }
                onMouseEnter={() => {
                  if (
                    interactive &&
                    wallDragRef.current &&
                    editMode === "WALL"
                  ) {
                    handleCell(r, c);
                  }
                  setHoveredCell([r, c]);
                }}
                onMouseLeave={() => setHoveredCell(null)}
                onKeyDown={
                  interactive
                    ? (e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleCell(r, c);
                        }
                      }
                    : undefined
                }
              >
                {showF && (
                  <span className="astar-cost-f">
                    {Math.round(cellCost!.f)}
                  </span>
                )}
              </div>
            );
          }),
        ).flat()}
      </div>
    );
  }

  return (
    <div className="algo-page" data-category="graph">
      <Nav
        currentCategory="graph"
        algorithmProgressPath="/algorithms/astar-pathfinding"
      />

      <div className="page-header">
        <div className="title-group">
          <h1>A* Pathfinding</h1>
          <div className="title-meta">
            <span className="badge">Graph</span>
            <ComplexityPopover
              best="O(E)"
              avg="O(E log V)"
              worst="O(V²)"
              space="O(V)"
              bestNote="Perfect heuristic"
              avgNote="Good heuristic"
              worstNote="Poor/no heuristic (degrades to Dijkstra)"
              spaceNote="Open/closed sets"
              why="Like Dijkstra but guided by heuristic. Best case: perfect heuristic → straight-line path O(E). Worst: heuristic is zero → degrades to Dijkstra O(E log V) or O(V²) on dense graphs."
            />
          </div>
        </div>
        <div className="legend">
          <span>
            <span className="swatch astar-empty" /> Empty
          </span>
          <span>
            <span className="swatch astar-wall" /> Wall
          </span>
          <span>
            <span className="swatch astar-start" /> Start
          </span>
          <span>
            <span className="swatch astar-end" /> End
          </span>
          <span>
            <span className="swatch astar-open" /> Open Set
          </span>
          <span>
            <span className="swatch astar-closed" /> Closed Set
          </span>
          <span>
            <span className="swatch astar-current" /> Current
          </span>
          <span>
            <span className="swatch astar-path" /> Path
          </span>
        </div>
      </div>

      <div className="content-grid">
        <div className="main-column">
          <ProblemFrame title="The Problem">
            <div className="app-section">
              <span className="app-label">Given</span>
              <p>
                A grid with walls, a start cell, and a goal cell. Each step
                costs 1. You need to find the shortest path from start to goal.
              </p>
            </div>
            <div className="app-section">
              <span className="app-label">Goal</span>
              <p>
                Find the optimal path using both actual cost from start (g) and
                an estimated cost to the goal (h). Always expand the node with
                lowest f = g + h.
              </p>
            </div>
            <div className="app-section">
              <span className="app-label">Real use cases</span>
              <p>
                Game AI pathfinding, robot navigation, map routing. Faster than
                Dijkstra when a good distance heuristic exists. Used in game
                engines and navigation apps.
              </p>
            </div>
          </ProblemFrame>

          <WhyComplexityPanel derivation="A* explores nodes in order of f = g + h. With an admissible heuristic, each cell is expanded at most once. The priority queue (min-heap) costs O(log V) per insertion. In the worst case (zero heuristic) every cell is expanded, giving O(V log V) with E edge relaxations for O(E log V) total." />

          <AnalogyPanel>
            <strong>Real-world analogy:</strong> Like a GPS that does not just
            know how far you have driven (g), but also estimates how far remains
            (h) — always exploring the route that looks most promising overall.
            Unlike plain BFS or Dijkstra which explore outward equally in all
            directions, A* focuses toward the goal, visiting far fewer cells.
          </AnalogyPanel>

          <div className="panel">
            <div className="controls">
              <div className="inputs">
                <label htmlFor="astar-grid-size">
                  Grid
                  <select
                    id="astar-grid-size"
                    value={gridSize}
                    onChange={(e) => reinitGrid(Number(e.target.value))}
                  >
                    {GRID_SIZES.map((n) => (
                      <option key={n} value={n}>
                        {n} × {n}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="astar-mode-buttons">
                  <button
                    type="button"
                    className={`astar-mode-btn${editMode === "WALL" ? " astar-active-mode" : ""}`}
                    onClick={() => setEditMode("WALL")}
                  >
                    Wall
                  </button>
                  <button
                    type="button"
                    className={`astar-mode-btn${editMode === "START" ? " astar-active-mode" : ""}`}
                    onClick={() => setEditMode("START")}
                  >
                    Start
                  </button>
                  <button
                    type="button"
                    className={`astar-mode-btn${editMode === "END" ? " astar-active-mode" : ""}`}
                    onClick={() => setEditMode("END")}
                  >
                    End
                  </button>
                </div>

                <div className="astar-heuristic-buttons">
                  <span className="astar-heuristic-label">Heuristic:</span>
                  <button
                    type="button"
                    className={`astar-heuristic-btn${heuristic === "manhattan" ? " astar-active-heuristic" : ""}`}
                    onClick={() => setHeuristic("manhattan")}
                  >
                    Manhattan
                  </button>
                  <button
                    type="button"
                    className={`astar-heuristic-btn${heuristic === "euclidean" ? " astar-active-heuristic" : ""}`}
                    onClick={() => setHeuristic("euclidean")}
                  >
                    Euclidean
                  </button>
                </div>

                <button type="button" onClick={clearWallsOnly}>
                  Clear walls
                </button>
                <button type="button" onClick={clearAll}>
                  Clear all
                </button>
                <button
                  type="button"
                  className="astar-btn-primary"
                  onClick={handleRunClick}
                >
                  Run A*
                </button>
                <button
                  type="button"
                  className="astar-btn-compare"
                  onClick={handleCompareClick}
                >
                  Compare vs BFS
                </button>
              </div>
            </div>

            <div className="info">{infoText}</div>

            {/* Visualization area: single or comparison layout */}
            {compareMode && hasRun ? (
              <div className="astar-comparison-layout">
                {/* A* panel */}
                <div className="astar-comparison-panel">
                  <div className="astar-comparison-title">A* ({heuristic})</div>
                  {renderGrid(
                    "astar-grid-main",
                    astarOpenSet,
                    astarClosedSet,
                    astarCurrentKey,
                    astarPathSet,
                    snap?.costs,
                    true,
                  )}
                  <div className="astar-comparison-stats">
                    Explored:{" "}
                    <strong>{snap ? snap.closedSet.length : 0}</strong> cells
                  </div>
                </div>

                {/* BFS panel */}
                <div className="astar-comparison-panel">
                  <div className="astar-comparison-title">
                    BFS (no heuristic)
                  </div>
                  {renderGrid(
                    "astar-grid-bfs",
                    bfsOpenSet,
                    bfsClosedSet,
                    bfsCurrentKey,
                    bfsPathSet,
                    bfsSnap?.costs,
                    false,
                  )}
                  <div className="astar-comparison-stats">
                    Explored:{" "}
                    <strong>{bfsSnap ? bfsSnap.closedSet.length : 0}</strong>{" "}
                    cells
                  </div>
                </div>
              </div>
            ) : (
              <div className="astar-layout">
                {renderGrid(
                  "astar-grid-main",
                  astarOpenSet,
                  astarClosedSet,
                  astarCurrentKey,
                  astarPathSet,
                  snap?.costs,
                  true,
                )}

                <div className="astar-open-sidebar">
                  <h3>Open Set (Priority Queue)</h3>
                  <div className="astar-open-list">
                    {!hasRun && (
                      <div className="astar-open-empty">
                        Run A* to see the open set
                      </div>
                    )}
                    {hasRun && openItems.length === 0 && (
                      <div className="astar-open-empty">Open set is empty</div>
                    )}
                    {hasRun &&
                      displayOpen.map(([r, c]) => {
                        const cost = snap?.costs[cellKey(r, c)];
                        return (
                          <div key={`${r},${c}`} className="astar-open-item">
                            ({r},{c}) {cost ? `f=${Math.round(cost.f)}` : ""}
                          </div>
                        );
                      })}
                    {hasRun && openItems.length > MAX_OPEN_DISPLAY && (
                      <div className="astar-open-empty">
                        … and {openItems.length - MAX_OPEN_DISPLAY} more
                      </div>
                    )}
                  </div>

                  <div className="astar-stats">
                    <div>
                      Step: <span>{hasRun ? currentStep + 1 : 0}</span>
                    </div>
                    <div>
                      Open: <span>{snap ? snap.openSet.length : 0}</span>
                    </div>
                    <div>
                      Closed: <span>{snap ? snap.closedSet.length : 0}</span>
                    </div>
                    <div>
                      Path:{" "}
                      <span>
                        {atEnd &&
                        astarResult?.pathLength !== undefined &&
                        astarResult.pathLength >= 0
                          ? astarResult.pathLength
                          : "—"}
                      </span>
                    </div>
                  </div>

                  {/* Hover cost detail */}
                  {hasRun && (
                    <div className="astar-cost-detail">
                      <h4>Cell Costs (hover)</h4>
                      {hoveredCell && hoveredCost ? (
                        <>
                          <div className="astar-cost-row">
                            Cell:{" "}
                            <span>
                              ({hoveredCell[0]},{hoveredCell[1]})
                            </span>
                          </div>
                          <div className="astar-cost-row">
                            g(n) = <span>{hoveredCost.g}</span>
                          </div>
                          <div className="astar-cost-row">
                            h(n) ={" "}
                            <span>{Math.round(hoveredCost.h * 100) / 100}</span>
                          </div>
                          <div className="astar-cost-row">
                            f(n) ={" "}
                            <span>{Math.round(hoveredCost.f * 100) / 100}</span>
                          </div>
                        </>
                      ) : (
                        <div className="astar-cost-row">
                          {hoveredCell
                            ? `(${hoveredCell[0]},${hoveredCell[1]}): not evaluated`
                            : "Hover a cell to see costs"}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {hasRun && (
              <div className="playback-controls">
                <div className="playback-btns">
                  <button
                    type="button"
                    className="icon-btn"
                    onClick={clearRun}
                    title="Reset visualization"
                    aria-label="Reset visualization"
                  >
                    ↺
                  </button>
                  <button
                    type="button"
                    className="icon-btn"
                    onClick={stepBackward}
                    disabled={atStart}
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
                    onClick={stepForward}
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
                  {SPEEDS_MS[speedIdx].label}
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
                <span className="stat-value">{snap.openSet.length}</span>
                <span className="stat-label">Open</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">{snap.closedSet.length}</span>
                <span className="stat-label">Closed</span>
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
