import { useState, useCallback, useRef, useEffect } from "react";
import { Nav } from "@/components/Nav";
import { AlgorithmComplete } from "@/components/AlgorithmComplete";
import { PlaybackController } from "@/components/PlaybackController";
import { WatchPanel } from "@/components/WatchPanel";
import { ComplexityPopover } from "@/components/ComplexityPopover";
import { AnalogyPanel } from "@/components/AnalogyPanel";
import { ProblemFrame } from "@/components/ProblemFrame";
import { WhyComplexityPanel } from "@/components/WhyComplexityPanel";
import {
  insert,
  getLayout,
  size,
  height,
  balanceFactor,
  type AVLNode,
  type AVLStep,
  type AVLLayoutNode,
  type AVLLayoutEdge,
} from "@/lib/algorithms/avl-tree";
import "@/styles/avl-tree.css";

const DEFAULT_VALUES = [30, 20, 40, 10, 25, 35, 50, 5, 15];
const MAX_VAL = 99;
const MIN_VAL = 1;

const PSEUDO_LINES = [
  "insert(root, value):",
  "  BST insert recursively",
  "  update height",
  "  bf = height(left) - height(right)",
  "  if |bf| > 1:",
  "    rotate to restore balance",
  "  return balanced node",
];

// --- SVG Tree ---

function AVLTreeSvg({
  root,
  activeValue,
  rotationNodes,
}: {
  root: AVLNode | null;
  activeValue?: number | null;
  rotationNodes?: Set<number>;
}) {
  const layout = getLayout(root, 600, 72);
  const nodes: AVLLayoutNode[] = layout.nodes;
  const edges: AVLLayoutEdge[] = layout.edges;

  if (!root || nodes.length === 0) {
    return (
      <div className="avl-tree-container avl-tree-empty">
        <span>Insert values to build the tree</span>
      </div>
    );
  }

  const xs = nodes.map((n) => n.x);
  const ys = nodes.map((n) => n.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const pad = 40;
  const svgW = Math.max(300, maxX - minX + pad * 2);
  const svgH = Math.max(100, maxY - minY + pad * 2);
  const offsetX = -minX + pad;
  const offsetY = -minY + pad;
  const r = 22;

  return (
    <div className="avl-tree-container">
      <svg
        width={svgW}
        height={svgH}
        viewBox={`0 0 ${svgW} ${svgH}`}
        aria-label="AVL tree visualization"
      >
        {edges.map((e, i) => (
          <line
            key={i}
            x1={e.fromX + offsetX}
            y1={e.fromY + offsetY}
            x2={e.toX + offsetX}
            y2={e.toY + offsetY}
            className="avl-edge"
          />
        ))}
        {nodes.map((n) => {
          const cx = n.x + offsetX;
          const cy = n.y + offsetY;
          const isActive = n.value === activeValue;
          const isRotation = rotationNodes?.has(n.value);
          const nodeClass = isRotation
            ? "avl-node avl-node-rotation"
            : isActive
              ? "avl-node avl-node-active"
              : "avl-node";
          const fill = isRotation
            ? "#2d1f00"
            : isActive
              ? "#0f2a1a"
              : "#111111";
          const stroke = isRotation
            ? "#d29922"
            : isActive
              ? "#3fb950"
              : n.balanceFactor < -1 || n.balanceFactor > 1
                ? "#f85149"
                : "#30363d";

          return (
            <g key={n.value} className={nodeClass}>
              <circle
                cx={cx}
                cy={cy}
                r={r}
                fill={fill}
                stroke={stroke}
                strokeWidth={2}
              />
              <text x={cx} y={cy - 5} className="avl-node-value">
                {n.value}
              </text>
              <text x={cx} y={cy + 9} className="avl-node-bf">
                {n.balanceFactor > 0 ? `+${n.balanceFactor}` : n.balanceFactor}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// --- Main Page ---

export default function AvlTreePage() {
  const [inputVal, setInputVal] = useState("45");
  const [error, setError] = useState("");
  const [treeRoot, setTreeRoot] = useState<AVLNode | null>(null);
  const [allSteps, setAllSteps] = useState<AVLStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [lastRotation, setLastRotation] = useState<string>("-");
  const hasInit = useRef(false);

  const buildDefault = useCallback(() => {
    let root: AVLNode | null = null;
    const steps: AVLStep[] = [];
    for (const v of DEFAULT_VALUES) {
      const res = insert(root, v);
      root = res.root;
      steps.push(...res.steps);
    }
    setTreeRoot(root);
    setAllSteps(steps);
    setCurrentStep(steps.length - 1);
    const rotStep = [...steps].reverse().find((s) => s.type === "rotate");
    setLastRotation(rotStep?.rotationType ?? "-");
  }, []);

  useEffect(() => {
    if (hasInit.current) return;
    hasInit.current = true;
    buildDefault();
  }, [buildDefault]);

  const handleInsert = useCallback(() => {
    const v = parseInt(inputVal, 10);
    if (isNaN(v) || v < MIN_VAL || v > MAX_VAL) {
      setError(`Enter a number between ${MIN_VAL} and ${MAX_VAL}.`);
      return;
    }
    setError("");
    const res = insert(treeRoot, v);
    const newSteps = res.steps;
    setTreeRoot(res.root);
    setAllSteps(newSteps);
    setCurrentStep(0);
    const rotStep = newSteps.find((s) => s.type === "rotate");
    if (rotStep?.rotationType) setLastRotation(rotStep.rotationType);
  }, [inputVal, treeRoot]);

  const handleReset = useCallback(() => {
    setTreeRoot(null);
    setAllSteps([]);
    setCurrentStep(0);
    setLastRotation("-");
    setError("");
  }, []);

  const handleStepReset = useCallback(() => {
    setCurrentStep(0);
  }, []);

  const step = allSteps[currentStep];
  const displayRoot = step?.rootSnapshot ?? treeRoot;
  const activeValue = step?.value ?? null;
  const rotationNodes = new Set<number>();
  if (step?.type === "rotate" && step.imbalancedNode != null) {
    rotationNodes.add(step.imbalancedNode);
  }

  const treeSize = size(treeRoot);
  const treeHeight = height(treeRoot);
  const rootBf = balanceFactor(treeRoot);

  const watchVars = [
    { label: "size", value: treeSize },
    { label: "height", value: treeHeight },
    { label: "balance factor (root)", value: rootBf },
    { label: "last rotation", value: lastRotation },
  ];

  return (
    <div className="algo-page" data-category="ds">
      <Nav showStoryBanner />

      <div className="page-header">
        <div className="title-group">
          <h1>AVL Tree</h1>
          <div className="title-meta">
            <span className="badge">Data Structures</span>
            <ComplexityPopover
              best="O(log n)"
              avg="O(log n)"
              worst="O(log n)"
              space="O(n)"
              bestNote="Self-balancing ensures log height"
              avgNote="All operations: insert, search, delete"
              worstNote="Still O(log n) — rotations keep it balanced"
              spaceNote="n nodes in tree"
              why="AVL trees maintain the invariant that every node's balance factor is -1, 0, or +1. This constrains tree height to O(log n), guaranteeing O(log n) for all operations regardless of insertion order."
            />
          </div>
        </div>
        <div className="avl-legend">
          <span>
            <span className="avl-swatch avl-swatch-active" /> Inserted
          </span>
          <span>
            <span className="avl-swatch avl-swatch-rotation" /> Rotation node
          </span>
          <span>
            <span className="avl-swatch avl-swatch-normal" /> Balanced
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
                A sequence of integer insertions into an initially empty tree.
              </p>
            </div>
            <div className="app-section">
              <span className="app-label">Goal</span>
              <p>
                Maintain a binary search tree where the height difference
                between left and right subtrees (balance factor) never exceeds 1
                at any node. Restore balance with LL, RR, LR, or RL rotations.
              </p>
            </div>
            <div className="app-section">
              <span className="app-label">Real use cases</span>
              <p>
                Database indexes, in-memory sorted maps, symbol tables in
                compilers — anywhere you need guaranteed O(log n) search.
              </p>
            </div>
          </ProblemFrame>

          <WhyComplexityPanel derivation="AVL trees enforce |balance factor| ≤ 1 at every node. This constraint bounds the height to at most 1.44 log₂(n+2) − 1.33. Since height is O(log n), every operation that traverses from root to leaf — insert, search, delete — runs in O(log n). Rotations themselves take O(1) and happen at most twice per insertion." />

          <AnalogyPanel>
            Like a perfectly balanced filing cabinet — every drawer stays within
            one level of any other, so you never have to search too deep. When
            one side gets too tall, the cabinet rotates shelves to restore
            balance.
          </AnalogyPanel>

          <div className="panel">
            <div className="controls">
              <div className="inputs">
                <label htmlFor="avl-value">
                  Value to insert
                  <input
                    id="avl-value"
                    type="number"
                    value={inputVal}
                    min={MIN_VAL}
                    max={MAX_VAL}
                    onChange={(e) => setInputVal(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleInsert()}
                    placeholder="1–99"
                  />
                </label>
              </div>
              {error && <div className="algo-error visible">{error}</div>}
              <div className="buttons">
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleInsert}
                >
                  Insert
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
              <div className="avl-step-info">
                {step.type === "insert" && `Inserting ${step.value}`}
                {step.type === "rotate" &&
                  `Rotating (${step.rotationType}) at node ${step.imbalancedNode}`}
                {step.type === "balance-check" &&
                  `Checking balance at ${step.value}`}
              </div>
            )}

            <AVLTreeSvg
              root={displayRoot}
              activeValue={activeValue}
              rotationNodes={rotationNodes}
            />

            {allSteps.length > 0 && (
              <PlaybackController
                steps={allSteps}
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
                    step?.type === "insert" && idx <= 2
                      ? " highlight"
                      : step?.type === "balance-check" && idx === 3
                        ? " highlight"
                        : step?.type === "rotate" && idx >= 4
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
