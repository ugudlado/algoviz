import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { Nav } from "@/components/Nav";
import { ComplexityPopover } from "@/components/ComplexityPopover";
import { AnalogyPanel } from "@/components/AnalogyPanel";
import { ProblemFrame } from "@/components/ProblemFrame";
import { WhyComplexityPanel } from "@/components/WhyComplexityPanel";
import { WatchPanel } from "@/components/WatchPanel";
import { search as runBfsSearch, type BfsSnapshot } from "@/lib/algorithms/bfs";
import "@/styles/bfs-pathfinding.css";

type EditMode = "WALL" | "START" | "END";

const GRID_SIZES = [10, 15, 20, 25] as const;
const DEFAULT_GRID = 20;
const MAX_QUEUE_DISPLAY = 50;

const SPEEDS_MS = [
  { label: "0.5x", ms: 1200 },
  { label: "1x", ms: 600 },
  { label: "2x", ms: 300 },
  { label: "4x", ms: 150 },
];

const PSEUDO_LINES = [
  "queue = [start]",
  "visited = {start}",
  "while queue is not empty:",
  " node = queue.dequeue()",
  " if node == goal:",
  "  return reconstruct_path()",
  " for neighbor of node:",
  " if neighbor not in visited:",
  "  visited.add(neighbor)",
  "  queue.enqueue(neighbor)",
];

function cellKey(r: number, c: number): string {
  return `${r},${c}`;
}

function emptyWalls(size: number): boolean[][] {
  return Array.from({ length: size }, () =>
    Array.from({ length: size }, () => false),
  );
}

function defaultStart(_gridSize: number): [number, number] {
  return [1, 1];
}

function defaultEnd(size: number): [number, number] {
  return [Math.max(0, size - 2), Math.max(0, size - 2)];
}

function pseudoLineIndex(
  snap: BfsSnapshot | undefined,
  stepIdx: number,
  totalSnapshots: number,
): number {
  if (!snap || totalSnapshots === 0) return -1;
  if (snap.path !== null && stepIdx === totalSnapshots - 1) return 5;
  if (stepIdx === 0) return 0;
  if (snap.queue.length === 0 && snap.path === null) return 2;
  return 6 + (stepIdx % 2);
}

export default function BfsPathfindingPage() {
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
  const [snapshots, setSnapshots] = useState<BfsSnapshot[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [infoText, setInfoText] = useState(
    "Click cells to place walls, then set start and end points and click Run BFS.",
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [speedIdx, setSpeedIdx] = useState(1);
  const wallDragRef = useRef(false);
  const playTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hasRun = snapshots.length > 0;
  const snap =
    hasRun && currentStep >= 0 && currentStep < snapshots.length
      ? snapshots[currentStep]
      : undefined;

  const visitedSet = useMemo(() => {
    if (!snap) return new Set<string>();
    return new Set(snap.visited.map(([r, c]) => cellKey(r, c)));
  }, [snap]);

  const frontierSet = useMemo(() => {
    if (!snap) return new Set<string>();
    return new Set(snap.frontier.map(([r, c]) => cellKey(r, c)));
  }, [snap]);

  const pathSet = useMemo(() => {
    if (!snap?.path) return new Set<string>();
    return new Set(snap.path.map(([r, c]) => cellKey(r, c)));
  }, [snap]);

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
    setCurrentStep(0);
    setInfoText(
      "Click cells to place walls, then set start and end points and click Run BFS.",
    );
  }, [stopPlayback]);

  useEffect(() => {
    const onUp = () => {
      wallDragRef.current = false;
    };
    document.addEventListener("mouseup", onUp);
    return () => document.removeEventListener("mouseup", onUp);
  }, []);

  useEffect(() => {
    return () => {
      if (playTimerRef.current) clearTimeout(playTimerRef.current);
    };
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
      setGridSize(size);
      setWalls(emptyWalls(size));
      setStartPos(defaultStart(size));
      setEndPos(defaultEnd(size));
      setSnapshots([]);
      setCurrentStep(0);
      setInfoText(
        "Click cells to place walls, then set start and end points and click Run BFS.",
      );
      stopPlayback();
    },
    [stopPlayback],
  );

  const runBfs = useCallback(() => {
    if (!startPos || !endPos) {
      setInfoText("Please set both a start and end point before running BFS.");
      return;
    }
    if (startPos[0] === endPos[0] && startPos[1] === endPos[1]) {
      setInfoText("Start and end are the same cell — already there!");
      return;
    }

    const result = runBfsSearch({
      gridSize,
      walls,
      start: startPos,
      end: endPos,
    });

    setSnapshots(result.snapshots);
    setCurrentStep(0);
    stopPlayback();
    setInfoText(
      result.found
        ? `BFS complete — shortest path: ${result.path ? result.path.length - 1 : 0} steps. Use playback to step through.`
        : "BFS complete — no path found! The end is unreachable.",
    );
  }, [endPos, gridSize, startPos, stopPlayback, walls]);

  const handleRunClick = useCallback(() => {
    if (snapshots.length > 0) {
      setSnapshots([]);
      setCurrentStep(0);
      stopPlayback();
    }
    runBfs();
  }, [runBfs, snapshots.length, stopPlayback]);

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

  const codeLine = pseudoLineIndex(snap, currentStep, snapshots.length);

  const watchVars =
    snap && snapshots.length > 0
      ? [
          {
            label: "queue size",
            value: String(snap.queue.length),
            highlight: snap.queue.length > 0,
          },
          {
            label: "visited",
            value: String(snap.visited.length),
          },
          {
            label: "frontier",
            value: String(snap.frontier.length),
            highlight: snap.frontier.length > 0,
          },
          {
            label: "found",
            value:
              currentStep === snapshots.length - 1 ? String(snap.found) : "—",
            highlight: currentStep === snapshots.length - 1,
          },
        ]
      : [];

  const atStart = currentStep <= 0;
  const atEnd = snapshots.length > 0 && currentStep >= snapshots.length - 1;

  const queueItems = snap?.queue ?? [];
  const displayQueue = queueItems.slice(0, MAX_QUEUE_DISPLAY);

  return (
    <div className="algo-page" data-category="searching">
      <Nav
        currentCategory="searching"
        algorithmProgressPath="/algorithms/bfs-pathfinding"
      />

      <div className="page-header">
        <div className="title-group">
          <h1>BFS Pathfinding</h1>
          <div className="title-meta">
            <span className="badge">Searching</span>
            <ComplexityPopover
              best="O(V+E)"
              avg="O(V+E)"
              worst="O(V+E)"
              space="O(V)"
              bestNote="Target near start"
              avgNote="All nodes visited"
              worstNote="All nodes visited"
              spaceNote="Queue"
              why="Every vertex is visited once (V) and every edge is traversed once (E). Total: V + E."
            />
          </div>
        </div>
        <div className="legend">
          <span>
            <span className="swatch bfs-empty" /> Empty
          </span>
          <span>
            <span className="swatch bfs-wall" /> Wall
          </span>
          <span>
            <span className="swatch bfs-start" /> Start
          </span>
          <span>
            <span className="swatch bfs-end" /> End
          </span>
          <span>
            <span className="swatch bfs-visited" /> Visited
          </span>
          <span>
            <span className="swatch bfs-frontier" /> Frontier
          </span>
          <span>
            <span className="swatch bfs-path" /> Path
          </span>
        </div>
      </div>

      <div className="content-grid">
        <div className="main-column">
          <ProblemFrame title="The Problem">
            <div className="app-section">
              <span className="app-label">Given</span>
              <p>
                A grid with walls, a start cell, and a goal cell — move in four
                directions, one step per move.
              </p>
            </div>
            <div className="app-section">
              <span className="app-label">Goal</span>
              <p>
                Find a shortest path (fewest steps) from start to goal using a
                queue so closer cells are explored first.
              </p>
            </div>
            <div className="app-section">
              <span className="app-label">Real use cases</span>
              <p>
                Unweighted shortest path, social degrees of separation, web
                crawling, and level-order tree walks.
              </p>
            </div>
          </ProblemFrame>

          <WhyComplexityPanel derivation="Each reachable cell is dequeued at most once and each edge to a neighbor is examined at most once. The queue holds at most O(V) positions. Hence time O(V + E) and extra space O(V) on the grid." />

          <AnalogyPanel>
            <strong>Real-world analogy:</strong> Ripples on a pond — waves
            expand one ring at a time from the start, so the first time the goal
            is reached uses the minimum number of steps.
          </AnalogyPanel>

          <div className="panel">
            <div className="controls">
              <div className="inputs">
                <label htmlFor="bfs-grid-size">
                  Grid
                  <select
                    id="bfs-grid-size"
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
                <div className="bfs-mode-buttons">
                  <button
                    type="button"
                    className={`bfs-mode-btn${editMode === "WALL" ? " bfs-active-mode" : ""}`}
                    onClick={() => setEditMode("WALL")}
                  >
                    Wall
                  </button>
                  <button
                    type="button"
                    className={`bfs-mode-btn${editMode === "START" ? " bfs-active-mode" : ""}`}
                    onClick={() => setEditMode("START")}
                  >
                    Start
                  </button>
                  <button
                    type="button"
                    className={`bfs-mode-btn${editMode === "END" ? " bfs-active-mode" : ""}`}
                    onClick={() => setEditMode("END")}
                  >
                    End
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
                  className="bfs-btn-primary"
                  onClick={handleRunClick}
                >
                  Run BFS
                </button>
              </div>
            </div>

            <div className="info">{infoText}</div>

            <div className="bfs-layout">
              <div
                className="bfs-grid-container"
                style={{
                  gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
                }}
              >
                {Array.from({ length: gridSize }, (_, r) =>
                  Array.from({ length: gridSize }, (_, c) => {
                    const k = cellKey(r, c);
                    let cellClass = "bfs-grid-cell";
                    if (walls[r]![c]) cellClass += " bfs-wall";
                    if (startPos && startPos[0] === r && startPos[1] === c)
                      cellClass += " bfs-start";
                    if (endPos && endPos[0] === r && endPos[1] === c)
                      cellClass += " bfs-end";
                    if (hasRun && snap) {
                      if (pathSet.has(k)) cellClass += " bfs-path";
                      else if (frontierSet.has(k)) cellClass += " bfs-frontier";
                      else if (visitedSet.has(k)) cellClass += " bfs-visited";
                    }
                    return (
                      <div
                        key={k}
                        className={cellClass}
                        role="button"
                        tabIndex={0}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          if (editMode === "WALL") wallDragRef.current = true;
                          handleCell(r, c);
                        }}
                        onMouseEnter={() => {
                          if (wallDragRef.current && editMode === "WALL") {
                            handleCell(r, c);
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            handleCell(r, c);
                          }
                        }}
                      />
                    );
                  }),
                ).flat()}
              </div>

              <div className="bfs-queue-sidebar">
                <h3>Queue</h3>
                <div className="bfs-queue-list">
                  {!hasRun && (
                    <div className="bfs-queue-empty">
                      Run BFS to see the queue
                    </div>
                  )}
                  {hasRun && queueItems.length === 0 && (
                    <div className="bfs-queue-empty">Queue is empty</div>
                  )}
                  {hasRun &&
                    displayQueue.map(([r, c]) => (
                      <div
                        key={`${r},${c}`}
                        className={`bfs-queue-item${frontierSet.has(cellKey(r, c)) ? " bfs-frontier-item" : ""}`}
                      >
                        ({r}, {c})
                      </div>
                    ))}
                  {hasRun && queueItems.length > MAX_QUEUE_DISPLAY && (
                    <div className="bfs-queue-empty">
                      … and {queueItems.length - MAX_QUEUE_DISPLAY} more
                    </div>
                  )}
                </div>
                <div className="bfs-stats">
                  <div>
                    Step: <span>{hasRun ? currentStep + 1 : 0}</span>
                  </div>
                  <div>
                    Visited: <span>{snap ? snap.visited.length : 0}</span>
                  </div>
                  <div>
                    Queue size: <span>{snap ? snap.queue.length : 0}</span>
                  </div>
                </div>
              </div>
            </div>

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
                <span className="stat-value">{snap.visited.length}</span>
                <span className="stat-label">Visited</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">{snap.queue.length}</span>
                <span className="stat-label">Queue</span>
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
