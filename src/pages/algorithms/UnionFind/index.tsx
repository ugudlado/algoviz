import { useState, useCallback, useRef, useEffect } from "react";
import { Nav } from "@/components/Nav";
import { PlaybackController } from "@/components/PlaybackController";
import { WatchPanel } from "@/components/WatchPanel";
import { ComplexityPopover } from "@/components/ComplexityPopover";
import { AnalogyPanel } from "@/components/AnalogyPanel";
import { ProblemFrame } from "@/components/ProblemFrame";
import { WhyComplexityPanel } from "@/components/WhyComplexityPanel";
import {
  runOperations,
  getComponentCount,
  MAX_NODES,
  type DSU,
  type UnionFindOperation,
  type UnionFindStep,
} from "@/lib/algorithms/union-find";
import "@/styles/union-find.css";

const DEFAULT_N = 8;
const DEFAULT_OPS: UnionFindOperation[] = [
  { type: "union", x: 0, y: 1 },
  { type: "union", x: 2, y: 3 },
  { type: "union", x: 0, y: 2 },
  { type: "union", x: 4, y: 5 },
  { type: "find", x: 0 },
  { type: "union", x: 5, y: 6 },
];

const PSEUDO_LINES = [
  "find(x) with path compression:",
  "  if parent[x] != x:",
  "    parent[x] = find(parent[x])",
  "  return parent[x]",
  "union(x, y) by rank:",
  "  rx, ry = find(x), find(y)",
  "  if rx == ry: return",
  "  if rank[rx] < rank[ry]: swap",
  "  parent[ry] = rx",
];

function makeInitDsu(n: number): DSU {
  return {
    parent: Array.from({ length: n }, (_, i) => i),
    rank: new Array(n).fill(0),
  };
}

function filterOps(ops: UnionFindOperation[], n: number): UnionFindOperation[] {
  return ops.filter((op) => op.x < n && (op.y === undefined || op.y < n));
}

// --- DSU visualization ---

function DSUView({
  dsu,
  n,
  step,
}: {
  dsu: DSU;
  n: number;
  step?: UnionFindStep;
}) {
  const { parent, rank } = dsu;

  const NODE_R = 20;
  const SPACING = 56;
  const svgW = Math.max(400, n * SPACING + 40);
  const svgH = 120;
  const nodeX = (i: number) => 30 + i * SPACING;
  const nodeY = 60;
  const nodes = Array.from({ length: n }, (_, i) => i);

  const activeNodes = new Set<number>();
  if (step?.x !== undefined) activeNodes.add(step.x);
  if (step?.y !== undefined) activeNodes.add(step.y);
  if (step?.root !== undefined) activeNodes.add(step.root);

  return (
    <div className="uf-dsu-container">
      <svg
        width={svgW}
        height={svgH}
        viewBox={`0 0 ${svgW} ${svgH}`}
        aria-label="Union-Find DSU visualization"
      >
        <defs>
          <marker
            id="uf-arrow"
            markerWidth="6"
            markerHeight="6"
            refX="5"
            refY="3"
            orient="auto"
          >
            <path d="M0,0 L0,6 L6,3 z" fill="#58a6ff" />
          </marker>
        </defs>

        {/* Draw parent pointer arcs */}
        {nodes.map((i) => {
          const p = parent[i];
          if (p === i) return null;
          const x1 = nodeX(i);
          const x2 = nodeX(p);
          const mid = (x1 + x2) / 2;
          const dist = Math.abs(x2 - x1);
          const arc = Math.max(20, dist * 0.4);
          const d = `M ${x1} ${nodeY} Q ${mid} ${nodeY - arc} ${x2} ${nodeY}`;
          const isActive = activeNodes.has(i) || activeNodes.has(p);
          return (
            <path
              key={i}
              d={d}
              className={isActive ? "uf-edge uf-edge-active" : "uf-edge"}
              markerEnd="url(#uf-arrow)"
            />
          );
        })}

        {/* Draw nodes */}
        {nodes.map((i) => {
          const isRoot = parent[i] === i;
          const isActive = activeNodes.has(i);
          const fill = isActive ? "#0f1f3a" : isRoot ? "#0f2a1a" : "#111111";
          const stroke = isActive ? "#58a6ff" : isRoot ? "#3fb950" : "#30363d";

          return (
            <g key={i}>
              <circle
                cx={nodeX(i)}
                cy={nodeY}
                r={NODE_R}
                fill={fill}
                stroke={stroke}
                strokeWidth={2}
              />
              <text x={nodeX(i)} y={nodeY} className="uf-node-text">
                {i}
              </text>
              {isRoot && (
                <text
                  x={nodeX(i)}
                  y={nodeY + NODE_R + 12}
                  className="uf-rank-text"
                >
                  r:{rank[i]}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default function UnionFindPage() {
  const [n, setN] = useState(DEFAULT_N);
  const [unionX, setUnionX] = useState("0");
  const [unionY, setUnionY] = useState("1");
  const [findX, setFindX] = useState("0");
  const [error, setError] = useState("");
  const [dsu, setDsu] = useState<DSU>(() => makeInitDsu(DEFAULT_N));
  const [ops, setOps] = useState<UnionFindOperation[]>(DEFAULT_OPS);
  const [steps, setSteps] = useState<UnionFindStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [lastRoot, setLastRoot] = useState<number | null>(null);
  const [lastCompressed, setLastCompressed] = useState<string>("-");
  const hasInit = useRef(false);

  useEffect(() => {
    if (hasInit.current) return;
    hasInit.current = true;
    const res = runOperations(DEFAULT_N, filterOps(DEFAULT_OPS, DEFAULT_N));
    setDsu(res.finalDsu);
    setSteps(res.steps);
    setCurrentStep(res.steps.length > 0 ? res.steps.length - 1 : 0);
    const findSteps = res.steps.filter((s) => s.root !== undefined);
    const last = findSteps[findSteps.length - 1];
    if (last?.root !== undefined) setLastRoot(last.root);
  }, []);

  const rerunOps = useCallback((n: number, allOps: UnionFindOperation[]) => {
    const res = runOperations(n, filterOps(allOps, n));
    setDsu(res.finalDsu);
    setSteps(res.steps);
    setCurrentStep(0);
    const findSteps = res.steps.filter((s) => s.root !== undefined);
    const last = findSteps[findSteps.length - 1];
    if (last?.root !== undefined) setLastRoot(last.root);
  }, []);

  const handleUnion = useCallback(() => {
    const x = parseInt(unionX, 10);
    const y = parseInt(unionY, 10);
    if (isNaN(x) || isNaN(y) || x < 0 || x >= n || y < 0 || y >= n) {
      setError(`Enter nodes between 0 and ${n - 1}.`);
      return;
    }
    setError("");
    const newOp: UnionFindOperation = { type: "union", x, y };
    const newOps = [...ops, newOp];
    setOps(newOps);
    rerunOps(n, newOps);
  }, [unionX, unionY, n, ops, rerunOps]);

  const handleFind = useCallback(() => {
    const x = parseInt(findX, 10);
    if (isNaN(x) || x < 0 || x >= n) {
      setError(`Enter a node between 0 and ${n - 1}.`);
      return;
    }
    setError("");
    const newOp: UnionFindOperation = { type: "find", x };
    const newOps = [...ops, newOp];
    setOps(newOps);
    const res = runOperations(n, filterOps(newOps, n));
    setDsu(res.finalDsu);
    setSteps(res.steps);
    setCurrentStep(0);
    const findSteps = res.steps.filter((s) => s.root !== undefined);
    const last = findSteps[findSteps.length - 1];
    if (last?.root !== undefined) setLastRoot(last.root);
    const compressedStep = res.steps.find((s) => s.type === "compressed");
    if (compressedStep) setLastCompressed(String(x));
  }, [findX, n, ops]);

  const handleNChange = useCallback(
    (newN: number) => {
      setN(newN);
      const resetOps = filterOps(DEFAULT_OPS, newN);
      setOps(resetOps);
      rerunOps(newN, resetOps);
      setLastRoot(null);
      setLastCompressed("-");
      setError("");
    },
    [rerunOps],
  );

  const handleReset = useCallback(() => {
    const resetOps = filterOps(DEFAULT_OPS, n);
    setOps(resetOps);
    rerunOps(n, resetOps);
    setLastRoot(null);
    setLastCompressed("-");
    setError("");
  }, [n, rerunOps]);

  const handleStepReset = useCallback(() => setCurrentStep(0), []);

  const step = steps[currentStep];
  const componentCount = getComponentCount(dsu);

  const watchVars = [
    { label: "nodes", value: n },
    { label: "components", value: componentCount },
    { label: "last root", value: lastRoot !== null ? lastRoot : "-" },
    { label: "last compressed", value: lastCompressed },
  ];

  return (
    <div className="algo-page" data-category="ds">
      <Nav currentCategory="ds" />

      <div className="page-header">
        <div className="title-group">
          <h1>Union-Find (DSU)</h1>
          <div className="title-meta">
            <span className="badge">Data Structures</span>
            <ComplexityPopover
              best="O(1)"
              avg="O(α(n))"
              worst="O(α(n))"
              space="O(n)"
              bestNote="Already at root — no traversal"
              avgNote="α(n) is the inverse Ackermann function"
              worstNote="Practically constant for any real input"
              spaceNote="Two arrays of size n (parent + rank)"
              why="Path compression makes every find operation point nodes directly to the root. Union by rank keeps trees shallow. Together they give amortized O(α(n)) per operation — where α(n) < 5 for any n that could exist in the physical universe."
            />
          </div>
        </div>
        <div className="uf-n-selector">
          <span className="uf-n-label">Nodes:</span>
          {[4, 6, 8, 10, 12].map((nv) => (
            <button
              key={nv}
              type="button"
              className={`uf-n-btn${n === nv ? " active" : ""}`}
              onClick={() => handleNChange(nv)}
              disabled={nv > MAX_NODES}
            >
              {nv}
            </button>
          ))}
        </div>
      </div>

      <div className="content-grid">
        <div className="main-column">
          <ProblemFrame title="The Problem">
            <div className="app-section">
              <span className="app-label">Given</span>
              <p>
                n elements in n singleton sets. Two operations: union(x, y) and
                find(x).
              </p>
            </div>
            <div className="app-section">
              <span className="app-label">Goal</span>
              <p>
                Maintain a partition of n elements into disjoint sets. Union
                merges two sets. Find returns the canonical representative
                (root) of an element's set. Path compression and union by rank
                make this near-O(1).
              </p>
            </div>
            <div className="app-section">
              <span className="app-label">Real use cases</span>
              <p>
                Kruskal's MST algorithm, network connectivity, image
                segmentation, detecting cycles in graphs, and percolation theory
                simulations.
              </p>
            </div>
          </ProblemFrame>

          <WhyComplexityPanel derivation="Without optimizations, find is O(n) in the worst case (skewed tree). Path compression flattens each traversed path to point directly to the root, amortizing future finds. Union by rank keeps the tree height O(log n). Together, the amortized cost per operation is O(α(n)) — the inverse Ackermann function, which grows slower than log*(n) and is practically constant for any real-world n." />

          <AnalogyPanel>
            Like sorting students into clubs — when two clubs merge, everyone
            points to the new club president. The next time you ask who the
            president is, you get a direct pointer (path compression) so future
            lookups are instant.
          </AnalogyPanel>

          <div className="panel">
            <div className="controls">
              <div className="inputs">
                <label htmlFor="uf-union-x">
                  Union(x, y)
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <input
                      id="uf-union-x"
                      type="number"
                      value={unionX}
                      min={0}
                      max={n - 1}
                      onChange={(e) => setUnionX(e.target.value)}
                      placeholder="x"
                      style={{ width: "60px" }}
                    />
                    <input
                      type="number"
                      value={unionY}
                      min={0}
                      max={n - 1}
                      onChange={(e) => setUnionY(e.target.value)}
                      placeholder="y"
                      style={{ width: "60px" }}
                    />
                  </div>
                </label>
                <label htmlFor="uf-find-x">
                  Find(x)
                  <input
                    id="uf-find-x"
                    type="number"
                    value={findX}
                    min={0}
                    max={n - 1}
                    onChange={(e) => setFindX(e.target.value)}
                    placeholder="x"
                    style={{ width: "60px" }}
                  />
                </label>
              </div>
              {error && <div className="algo-error visible">{error}</div>}
              <div className="buttons">
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleUnion}
                >
                  Union
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleFind}
                >
                  Find
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleReset}
                >
                  Reset
                </button>
              </div>
            </div>

            {step && (
              <div className="uf-step-info">
                {step.message ??
                  (step.type === "union"
                    ? `union(${step.x}, ${step.y})`
                    : step.type === "find"
                      ? `find(${step.x}) → root ${step.root}`
                      : `path compressed`)}
              </div>
            )}

            <DSUView dsu={dsu} n={n} step={step} />

            {steps.length > 0 && (
              <PlaybackController
                steps={steps}
                currentStep={currentStep}
                onStep={setCurrentStep}
                onReset={handleStepReset}
              />
            )}
          </div>
        </div>

        <div className="sidebar">
          <WatchPanel vars={watchVars} />

          <div className="panel">
            <div className="panel-title">Pseudocode</div>
            <div className="code-panel">
              {PSEUDO_LINES.map((line, idx) => (
                <span
                  key={idx}
                  className={`code-line${
                    step?.type === "find" && idx <= 3
                      ? " highlight"
                      : step?.type === "union" && idx >= 4
                        ? " highlight"
                        : ""
                  }`}
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
