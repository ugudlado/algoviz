import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { Nav } from "@/components/Nav";
import { AlgorithmComplete } from "@/components/AlgorithmComplete";
import { ComplexityPopover } from "@/components/ComplexityPopover";
import { AnalogyPanel } from "@/components/AnalogyPanel";
import { ProblemFrame } from "@/components/ProblemFrame";
import { WhyComplexityPanel } from "@/components/WhyComplexityPanel";
import { WatchPanel } from "@/components/WatchPanel";
import { search as runDfsSearch, type DfsSnapshot } from "@/lib/algorithms/dfs";
import "@/styles/dfs-pathfinding.css";

type EditMode = "WALL" | "START" | "END";

const GRID_SIZES = [10, 15, 20, 25] as const;
const DEFAULT_GRID = 20;
const MAX_STACK_DISPLAY = 50;

const SPEEDS_MS = [
  { label: "0.5x", ms: 1200 },
  { label: "1x", ms: 600 },
  { label: "2x", ms: 300 },
  { label: "4x", ms: 150 },
];

const PSEUDO_LINES = [
  "stack = [start]",
  "visited = {start}",
  "while stack is not empty:",
  " cell = stack.pop()",
  " if cell == goal:",
  "  return reconstruct_path()",
  " for neighbor in neighbors(cell) (reversed):",
  "  if neighbor not in visited:",
  "   visited.add(neighbor)",
  "   stack.push(neighbor)",
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
  snap: DfsSnapshot | undefined,
  stepIdx: number,
  totalSnapshots: number,
): number {
  if (!snap || totalSnapshots === 0) return -1;
  if (snap.path !== null && snap.found && stepIdx === totalSnapshots - 1)
    return 5;
  if (stepIdx === 0) return 0;
  if (snap.stack.length === 0 && snap.path === null && snap.current === null)
    return 2;
  return 6 + (stepIdx % 2);
}

function stackDisplayIndices(stackLen: number): number[] {
  if (stackLen === 0) return [];
  const startIdx = Math.max(0, stackLen - MAX_STACK_DISPLAY);
  const out: number[] = [];
  for (let i = stackLen - 1; i >= startIdx; i--) out.push(i);
  return out;
}

export default function DfsPathfindingPage() {
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
  const [snapshots, setSnapshots] = useState<DfsSnapshot[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [infoText, setInfoText] = useState(
    "Click cells to place walls, then set start and end points and click Run DFS.",
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

  const pathSet = useMemo(() => {
    if (!snap?.path) return new Set<string>();
    return new Set(snap.path.map(([r, c]) => cellKey(r, c)));
  }, [snap]);

  const currentKey = useMemo(() => {
    if (!snap?.current) return null;
    return cellKey(snap.current[0], snap.current[1]);
  }, [snap]);

  const liveInfo =
    hasRun && snap
      ? snap.path !== null && snap.found
        ? `Path found! Length: ${snap.path.length - 1} steps.`
        : !snap.found &&
            currentStep === snapshots.length - 1 &&
            snap.current === null
          ? "No path found — the end is unreachable."
          : `Step ${currentStep + 1}/${snapshots.length}: exploring cell (${snap.current?.[0] ?? "?"}, ${snap.current?.[1] ?? "?"})...`
      : null;

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
      "Click cells to place walls, then set start and end points and click Run DFS.",
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
        "Click cells to place walls, then set start and end points and click Run DFS.",
      );
      stopPlayback();
    },
    [stopPlayback],
  );

  const runDfs = useCallback(() => {
    if (!startPos || !endPos) {
      setInfoText("Please set both a start and end point before running DFS.");
      return;
    }
    if (startPos[0] === endPos[0] && startPos[1] === endPos[1]) {
      setInfoText("Start and end are the same cell — already there!");
      return;
    }

    const result = runDfsSearch({
      walls,
      rows: gridSize,
      cols: gridSize,
      start: startPos,
      end: endPos,
    });

    setSnapshots(result.snapshots);
    setCurrentStep(0);
    stopPlayback();
    setInfoText(
      result.found
        ? `DFS complete — path found: ${result.path ? result.path.length - 1 : 0} steps. DFS does not guarantee a shortest path. Use playback to step through.`
        : "DFS complete — no path found! The end is unreachable.",
    );
  }, [endPos, gridSize, startPos, stopPlayback, walls]);

  const handleRunClick = useCallback(() => {
    if (snapshots.length > 0) {
      setSnapshots([]);
      setCurrentStep(0);
      stopPlayback();
    }
    runDfs();
  }, [runDfs, snapshots.length, stopPlayback]);

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
            label: "stack size",
            value: String(snap.stack.length),
            highlight: snap.stack.length > 0,
          },
          {
            label: "visited",
            value: String(snap.visited.length),
          },
          {
            label: "current",
            value: snap.current
              ? `(${snap.current[0]}, ${snap.current[1]})`
              : "—",
            highlight: snap.current !== null,
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

  const stack = snap?.stack ?? [];
  const stackIdxs = stackDisplayIndices(stack.length);
  const stackHiddenBelow =
    stack.length > MAX_STACK_DISPLAY ? stack.length - MAX_STACK_DISPLAY : 0;

  return (
    <div className="algo-page" data-category="searching">
      <Nav showStoryBanner />

      <div className="page-header">
        <div className="title-group">
          <h1>DFS Pathfinding</h1>
          <div className="title-meta">
            <span className="badge">Searching</span>
            <ComplexityPopover
              best="O(V+E)"
              avg="O(V+E)"
              worst="O(V+E)"
              space="O(V)"
              bestNote="All nodes visited"
              avgNote="All nodes visited"
              worstNote="All nodes visited"
              spaceNote="Stack"
              why="Every vertex is visited once (V) and every edge is explored once (E). Total: V + E."
            />
          </div>
        </div>
        <div className="legend">
          <span>
            <span className="swatch dfs-empty" /> Empty
          </span>
          <span>
            <span className="swatch dfs-wall" /> Wall
          </span>
          <span>
            <span className="swatch dfs-start" /> Start
          </span>
          <span>
            <span className="swatch dfs-end" /> End
          </span>
          <span>
            <span className="swatch dfs-visited" /> Visited
          </span>
          <span>
            <span className="swatch dfs-current" /> Current
          </span>
          <span>
            <span className="swatch dfs-path" /> Path
          </span>
        </div>
        <AlgorithmComplete />
      </div>

      <div className="content-grid">
        <div className="main-column">
          <ProblemFrame title="The Problem">
            <div className="app-section">
              <span className="app-label">Given</span>
              <p>
                A grid with walls, a start cell, and a goal — move in four
                directions, one step per move.
              </p>
            </div>
            <div className="app-section">
              <span className="app-label">Goal</span>
              <p>
                Find some path from start to goal using a stack: go deep along
                one branch before backtracking. The path found is not guaranteed
                to be shortest.
              </p>
            </div>
            <div className="app-section">
              <span className="app-label">Real use cases</span>
              <p>
                Maze solving, topological reasoning, cycle detection, and
                building blocks for exhaustive search and backtracking.
              </p>
            </div>
          </ProblemFrame>

          <WhyComplexityPanel derivation="In the worst case every reachable cell is popped once and each adjacency is considered. The explicit stack holds at most O(V) cells. So time is O(V + E) and extra space O(V) for the stack and visited tracking." />

          <AnalogyPanel>
            <strong>Real-world analogy:</strong> Exploring a maze by always
            taking the first corridor you see and only backing up when you hit a
            dead end — you may walk a long route before finding the exit.
          </AnalogyPanel>

          <div className="panel">
            <div className="controls">
              <div className="inputs">
                <label htmlFor="dfs-grid-size">
                  Grid
                  <select
                    id="dfs-grid-size"
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
                <div className="dfs-mode-buttons">
                  <button
                    type="button"
                    className={`dfs-mode-btn${editMode === "WALL" ? " dfs-active-mode" : ""}`}
                    onClick={() => setEditMode("WALL")}
                  >
                    Wall
                  </button>
                  <button
                    type="button"
                    className={`dfs-mode-btn${editMode === "START" ? " dfs-active-mode" : ""}`}
                    onClick={() => setEditMode("START")}
                  >
                    Start
                  </button>
                  <button
                    type="button"
                    className={`dfs-mode-btn${editMode === "END" ? " dfs-active-mode" : ""}`}
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
                  className="dfs-btn-primary"
                  onClick={handleRunClick}
                >
                  Run DFS
                </button>
              </div>
            </div>

            <div className="info">{liveInfo ?? infoText}</div>

            <div className="dfs-layout">
              <div
                className="dfs-grid-container"
                style={{
                  gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
                }}
              >
                {Array.from({ length: gridSize }, (_, r) =>
                  Array.from({ length: gridSize }, (_, c) => {
                    const k = cellKey(r, c);
                    let cellClass = "dfs-grid-cell";
                    if (walls[r]![c]) cellClass += " dfs-wall";
                    if (startPos && startPos[0] === r && startPos[1] === c)
                      cellClass += " dfs-start";
                    if (endPos && endPos[0] === r && endPos[1] === c)
                      cellClass += " dfs-end";
                    if (hasRun && snap) {
                      if (pathSet.has(k)) cellClass += " dfs-path";
                      else if (currentKey === k)
                        cellClass += " dfs-current-cell";
                      else if (visitedSet.has(k)) cellClass += " dfs-visited";
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

              <div className="dfs-stack-sidebar">
                <h3>
                  Stack
                  <span className="dfs-lifo-badge">LIFO</span>
                </h3>
                <div className="dfs-stack-list">
                  {!hasRun && (
                    <div className="dfs-stack-empty">
                      Run DFS to see the stack
                    </div>
                  )}
                  {hasRun && stack.length === 0 && (
                    <div className="dfs-stack-empty">Stack is empty</div>
                  )}
                  {hasRun &&
                    stackIdxs.map((si) => {
                      const [r, c] = stack[si]!;
                      return (
                        <div
                          key={`${si}-${r},${c}`}
                          className={`dfs-stack-item${si === stack.length - 1 ? " dfs-stack-top" : ""}`}
                        >
                          ({r}, {c})
                        </div>
                      );
                    })}
                  {hasRun && stackHiddenBelow > 0 && (
                    <div className="dfs-stack-empty">
                      … and {stackHiddenBelow} more below
                    </div>
                  )}
                </div>
                <div className="dfs-stats">
                  <div>
                    Step: <span>{hasRun ? currentStep + 1 : 0}</span>
                  </div>
                  <div>
                    Visited: <span>{snap ? snap.visited.length : 0}</span>
                  </div>
                  <div>
                    Stack size: <span>{snap ? snap.stack.length : 0}</span>
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
                <span className="stat-value">{snap.stack.length}</span>
                <span className="stat-label">Stack</span>
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
