import { useState, useCallback, useRef, useEffect } from "react";
import { Nav } from "@/components/Nav";
import { PlaybackController } from "@/components/PlaybackController";
import { WatchPanel } from "@/components/WatchPanel";
import { ComplexityPopover } from "@/components/ComplexityPopover";
import { AnalogyPanel } from "@/components/AnalogyPanel";
import { ProblemFrame } from "@/components/ProblemFrame";
import { WhyComplexityPanel } from "@/components/WhyComplexityPanel";
import {
  createTree,
  insert,
  bulkInsert,
  inorder,
  preorder,
  postorder,
  getLayout,
  size,
  type BSTTree,
  type BSTStep,
  type BSTLayoutNode,
  type BSTLayoutEdge,
} from "@/lib/algorithms/bst";
import "@/styles/bst.css";

const DEFAULT_VALUES = [5, 3, 7, 1, 4, 6, 8];
const MAX_VAL = 99;
const MIN_VAL = 1;

type TraversalMode = "inorder" | "preorder" | "postorder";

const PSEUDO: Record<TraversalMode, string[]> = {
  inorder: [
    "inorder(node):",
    "  if node is null: return",
    "  inorder(node.left)",
    "  visit(node)",
    "  inorder(node.right)",
  ],
  preorder: [
    "preorder(node):",
    "  if node is null: return",
    "  visit(node)",
    "  preorder(node.left)",
    "  preorder(node.right)",
  ],
  postorder: [
    "postorder(node):",
    "  if node is null: return",
    "  postorder(node.left)",
    "  postorder(node.right)",
    "  visit(node)",
  ],
};

function BSTSvg({
  tree,
  visitedSet,
  activeValue,
}: {
  tree: BSTTree;
  visitedSet: Set<number>;
  activeValue?: number | null;
}) {
  const layout = getLayout(tree, 600, 72);
  const nodes: BSTLayoutNode[] = layout.nodes;
  const edges: BSTLayoutEdge[] = layout.edges;

  if (!tree.root || nodes.length === 0) {
    return (
      <div className="bst-tree-container bst-tree-empty">
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
    <div className="bst-tree-container">
      <svg
        width={svgW}
        height={svgH}
        viewBox={`0 0 ${svgW} ${svgH}`}
        aria-label="BST traversal visualization"
      >
        {edges.map((e, i) => (
          <line
            key={i}
            x1={e.fromX + offsetX}
            y1={e.fromY + offsetY}
            x2={e.toX + offsetX}
            y2={e.toY + offsetY}
            className="bst-edge"
          />
        ))}
        {nodes.map((n) => {
          const cx = n.x + offsetX;
          const cy = n.y + offsetY;
          const isActive = n.value === activeValue;
          const isVisited = visitedSet.has(n.value);
          const fill = isActive ? "#0f1f3a" : isVisited ? "#0f2a1a" : "#111111";
          const stroke = isActive
            ? "#58a6ff"
            : isVisited
              ? "#3fb950"
              : "#30363d";

          return (
            <g key={n.value}>
              <circle
                cx={cx}
                cy={cy}
                r={r}
                fill={fill}
                stroke={stroke}
                strokeWidth={2}
              />
              <text x={cx} y={cy} className="bst-node-value">
                {n.value}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default function BstTraversalPage() {
  const [insertInput, setInsertInput] = useState("");
  const [error, setError] = useState("");
  const [tree, setTree] = useState<BSTTree>(createTree());
  const [mode, setMode] = useState<TraversalMode>("inorder");
  const [steps, setSteps] = useState<BSTStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const hasInit = useRef(false);

  useEffect(() => {
    if (hasInit.current) return;
    hasInit.current = true;
    const t = bulkInsert(createTree(), DEFAULT_VALUES);
    setTree(t);
    const res = inorder(t);
    setSteps(res.steps);
    setCurrentStep(0);
  }, []);

  const runTraversal = useCallback((t: BSTTree, m: TraversalMode) => {
    let res;
    if (m === "inorder") res = inorder(t);
    else if (m === "preorder") res = preorder(t);
    else res = postorder(t);
    setSteps(res.steps);
    setCurrentStep(0);
  }, []);

  const handleModeChange = useCallback(
    (m: TraversalMode) => {
      setMode(m);
      runTraversal(tree, m);
    },
    [tree, runTraversal],
  );

  const handleInsert = useCallback(() => {
    const v = parseInt(insertInput, 10);
    if (isNaN(v) || v < MIN_VAL || v > MAX_VAL) {
      setError(`Enter a number between ${MIN_VAL} and ${MAX_VAL}.`);
      return;
    }
    setError("");
    const newTree = insert(tree, v);
    setTree(newTree);
    setInsertInput("");
    runTraversal(newTree, mode);
  }, [insertInput, tree, mode, runTraversal]);

  const handleReset = useCallback(() => {
    const t = bulkInsert(createTree(), DEFAULT_VALUES);
    setTree(t);
    runTraversal(t, mode);
    setInsertInput("");
    setError("");
  }, [mode, runTraversal]);

  const handleStepReset = useCallback(() => setCurrentStep(0), []);

  const step = steps[currentStep];
  const visitedSet = new Set<number>(step?.visited ?? []);
  const activeValue = step?.value ?? null;
  const result = step?.visited ?? [];

  const treeSize = size(tree);

  const watchVars = [
    { label: "mode", value: mode },
    {
      label: "visited",
      value: result.length > 0 ? result.join(", ") : "-",
    },
    {
      label: "result",
      value:
        steps.length > 0
          ? (steps[steps.length - 1]?.visited ?? []).join(", ")
          : "-",
    },
    { label: "size", value: treeSize },
  ];

  return (
    <div className="algo-page" data-category="ds">
      <Nav currentCategory="ds" />

      <div className="page-header">
        <div className="title-group">
          <h1>BST Traversal</h1>
          <div className="title-meta">
            <span className="badge">Data Structures</span>
            <ComplexityPopover
              best="O(n)"
              avg="O(n)"
              worst="O(n)"
              space="O(h)"
              bestNote="Must visit every node"
              avgNote="Traversal always visits all n nodes"
              worstNote="Same — every node visited once"
              spaceNote="h = tree height, O(log n) balanced, O(n) skewed"
              why="Any traversal must visit all n nodes exactly once, giving O(n) time. The call stack depth equals the tree height h — O(log n) for a balanced BST, O(n) in the worst case (skewed tree)."
            />
          </div>
        </div>
        <div className="bst-mode-selector">
          {(["inorder", "preorder", "postorder"] as TraversalMode[]).map(
            (m) => (
              <button
                key={m}
                type="button"
                className={`bst-mode-btn${mode === m ? " active" : ""}`}
                onClick={() => handleModeChange(m)}
              >
                {m}
              </button>
            ),
          )}
        </div>
      </div>

      <div className="content-grid">
        <div className="main-column">
          <ProblemFrame title="The Problem">
            <div className="app-section">
              <span className="app-label">Given</span>
              <p>A binary search tree and a traversal order.</p>
            </div>
            <div className="app-section">
              <span className="app-label">Goal</span>
              <p>
                Visit every node exactly once in a defined order: inorder
                (left→root→right) yields sorted output; preorder
                (root→left→right) is used for tree copies; postorder
                (left→right→root) is used for deletion.
              </p>
            </div>
            <div className="app-section">
              <span className="app-label">Real use cases</span>
              <p>
                Inorder: sorting values from a BST. Preorder: serializing a
                tree. Postorder: evaluating expression trees, freeing memory
                bottom-up.
              </p>
            </div>
          </ProblemFrame>

          <WhyComplexityPanel derivation="All three traversals visit each of the n nodes exactly once with O(1) work per node, giving O(n) time. The recursive call stack grows proportional to the tree height h — O(log n) for a balanced BST, O(n) in the degenerate case where the tree becomes a linked list." />

          <AnalogyPanel>
            Like reading a book — inorder reads chapters in numerical order,
            preorder reads the table of contents first (root before children),
            postorder reads footnotes last (children before parent).
          </AnalogyPanel>

          <div className="panel">
            <div className="controls">
              <div className="inputs">
                <label htmlFor="bst-insert">
                  Insert value
                  <input
                    id="bst-insert"
                    type="number"
                    value={insertInput}
                    min={MIN_VAL}
                    max={MAX_VAL}
                    onChange={(e) => setInsertInput(e.target.value)}
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
              <div className="bst-step-info">
                {step.type === "visit"
                  ? `Visiting node ${step.value}`
                  : `Traversing subtree`}
              </div>
            )}

            <BSTSvg
              tree={tree}
              visitedSet={visitedSet}
              activeValue={activeValue}
            />

            {result.length > 0 && (
              <div className="bst-result-row">
                <span className="bst-result-label">Order so far:</span>
                <span className="bst-result-values">{result.join(" → ")}</span>
              </div>
            )}

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
              {PSEUDO[mode].map((line, idx) => (
                <span
                  key={idx}
                  className={`code-line${
                    step?.type === "visit" && idx === 3 ? " highlight" : ""
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
