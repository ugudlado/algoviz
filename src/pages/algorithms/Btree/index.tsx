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
  bulkInsert,
  insertKey,
  deleteKey,
  keyCount,
  type BTreeNode,
  type BTreeStep,
} from "@/lib/algorithms/btree";
import "@/styles/btree.css";

const DEFAULT_KEYS = [10, 20, 5, 6, 12, 30, 7, 17];
const DEFAULT_T = 2;

const PSEUDO_LINES = [
  "insert(root, key, t):",
  "  if root is full: split root",
  "  insertNonFull(root, key)",
  "insertNonFull(node, key):",
  "  if leaf: insert in sorted order",
  "  else: find child, recurse",
  "  split child if full",
];

// --- B-Tree SVG rendering ---

interface NodeBox {
  node: BTreeNode;
  x: number;
  y: number;
  width: number;
  height: number;
}

const NODE_H = 36;
const KEY_W = 32;
const KEY_PAD = 8;
const LEVEL_H = 80;

function measureNode(node: BTreeNode): number {
  return Math.max(60, node.keys.length * (KEY_W + KEY_PAD) + KEY_PAD);
}

function layoutBTree(root: BTreeNode | null): {
  boxes: NodeBox[];
  edges: { x1: number; y1: number; x2: number; y2: number }[];
} {
  if (!root) return { boxes: [], edges: [] };

  const boxes: NodeBox[] = [];
  const edges: { x1: number; y1: number; x2: number; y2: number }[] = [];

  // BFS layout
  interface QItem {
    node: BTreeNode;
    depth: number;
    centerX: number;
    parentBox?: NodeBox;
  }
  const queue: QItem[] = [{ node: root, depth: 0, centerX: 0 }];
  // Two-pass: first measure widths at each depth, then assign positions
  // Simple approach: recursively compute subtree widths

  function subtreeWidth(node: BTreeNode): number {
    if (node.leaf || node.children.length === 0) return measureNode(node);
    const childWidths = node.children.map(subtreeWidth);
    return Math.max(
      measureNode(node),
      childWidths.reduce((a, b) => a + b + 16, 0) - 16,
    );
  }

  function place(
    node: BTreeNode,
    depth: number,
    cx: number,
    parentBox?: NodeBox,
  ): void {
    const w = measureNode(node);
    const x = cx - w / 2;
    const y = depth * LEVEL_H + 20;
    const box: NodeBox = { node, x, y, width: w, height: NODE_H };
    boxes.push(box);

    if (parentBox) {
      edges.push({
        x1: parentBox.x + parentBox.width / 2,
        y1: parentBox.y + parentBox.height,
        x2: cx,
        y2: y,
      });
    }

    if (!node.leaf && node.children.length > 0) {
      const childWidths = node.children.map(subtreeWidth);
      const totalW = childWidths.reduce((a, b) => a + b + 16, 0) - 16;
      let startX = cx - totalW / 2;
      node.children.forEach((child, i) => {
        const childCx = startX + childWidths[i] / 2;
        place(child, depth + 1, childCx, box);
        startX += childWidths[i] + 16;
      });
    }
  }

  // Drain queue to avoid unused variable warning
  while (queue.length > 0) queue.pop();

  place(root, 0, 0, undefined);

  return { boxes, edges };
}

function BTreeSvg({
  root,
  highlightStep,
}: {
  root: BTreeNode | null;
  highlightStep?: BTreeStep | null;
}) {
  const { boxes, edges } = layoutBTree(root);

  if (!root || boxes.length === 0) {
    return (
      <div className="btree-container btree-empty">
        <span>Insert keys to build the tree</span>
      </div>
    );
  }

  const xs = boxes.map((b) => b.x);
  const ys = boxes.map((b) => b.y);
  const minX = Math.min(...xs) - 20;
  const maxX = Math.max(...boxes.map((b) => b.x + b.width)) + 20;
  const minY = Math.min(...ys) - 10;
  const maxY = Math.max(...boxes.map((b) => b.y + b.height)) + 20;
  const svgW = maxX - minX;
  const svgH = maxY - minY;
  const ox = -minX;
  const oy = -minY;

  const isSplitStep = highlightStep?.type === "split";

  return (
    <div className="btree-container">
      <svg
        width={svgW}
        height={svgH}
        viewBox={`0 0 ${svgW} ${svgH}`}
        aria-label="B-tree visualization"
      >
        {edges.map((e, i) => (
          <line
            key={i}
            x1={e.x1 + ox}
            y1={e.y1 + oy}
            x2={e.x2 + ox}
            y2={e.y2 + oy}
            className="btree-edge"
          />
        ))}
        {boxes.map((box, bi) => {
          const { node, x, y, width } = box;
          const bx = x + ox;
          const by = y + oy;
          const isHighlighted = isSplitStep && bi === 0;

          return (
            <g key={bi}>
              <rect
                x={bx}
                y={by}
                width={width}
                height={NODE_H}
                rx={4}
                className={
                  isHighlighted ? "btree-node btree-node-split" : "btree-node"
                }
              />
              {node.keys.map((key, ki) => {
                const kx = bx + KEY_PAD + ki * (KEY_W + KEY_PAD) + KEY_W / 2;
                const ky = by + NODE_H / 2;
                return (
                  <g key={ki}>
                    {ki > 0 && (
                      <line
                        x1={bx + KEY_PAD + ki * (KEY_W + KEY_PAD) - KEY_PAD / 2}
                        y1={by + 4}
                        x2={bx + KEY_PAD + ki * (KEY_W + KEY_PAD) - KEY_PAD / 2}
                        y2={by + NODE_H - 4}
                        className="btree-divider"
                      />
                    )}
                    <text x={kx} y={ky} className="btree-key-text">
                      {key}
                    </text>
                  </g>
                );
              })}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// --- Main Page ---

export default function BtreePage() {
  const [keyInput, setKeyInput] = useState("");
  const [tDegree, setTDegree] = useState(DEFAULT_T);
  const [error, setError] = useState("");
  const [root, setRoot] = useState<BTreeNode | null>(null);
  const [steps, setSteps] = useState<BTreeStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const hasInit = useRef(false);

  useEffect(() => {
    if (hasInit.current) return;
    hasInit.current = true;
    const res = bulkInsert(DEFAULT_KEYS, DEFAULT_T);
    setRoot(res.root);
    setSteps(res.steps);
    setCurrentStep(res.steps.length > 0 ? res.steps.length - 1 : 0);
  }, []);

  const handleInsert = useCallback(() => {
    const k = parseInt(keyInput, 10);
    if (isNaN(k) || k < 1 || k > 9999) {
      setError("Enter a key between 1 and 9999.");
      return;
    }
    setError("");
    const res = insertKey(root, k, tDegree);
    if (res.error) {
      setError("Tree is full.");
      return;
    }
    setRoot(res.root);
    setSteps(res.steps);
    setCurrentStep(0);
    setKeyInput("");
  }, [keyInput, root, tDegree]);

  const handleDelete = useCallback(() => {
    const k = parseInt(keyInput, 10);
    if (isNaN(k)) {
      setError("Enter a valid key to delete.");
      return;
    }
    setError("");
    const res = deleteKey(root, k, tDegree);
    setRoot(res.root);
    setSteps(res.steps);
    setCurrentStep(0);
    setKeyInput("");
  }, [keyInput, root, tDegree]);

  const handleTChange = useCallback((t: number) => {
    setTDegree(t);
    const res = bulkInsert(DEFAULT_KEYS, t);
    setRoot(res.root);
    setSteps(res.steps);
    setCurrentStep(0);
    setError("");
  }, []);

  const handleReset = useCallback(() => {
    const res = bulkInsert(DEFAULT_KEYS, tDegree);
    setRoot(res.root);
    setSteps(res.steps);
    setCurrentStep(0);
    setKeyInput("");
    setError("");
  }, [tDegree]);

  const handleStepReset = useCallback(() => setCurrentStep(0), []);

  const step = steps[currentStep];
  const displayRoot = step?.root ?? root;
  const totalKeys = keyCount(root);

  function treeHeight(node: BTreeNode | null): number {
    if (!node) return 0;
    if (node.leaf || node.children.length === 0) return 1;
    return 1 + treeHeight(node.children[0]);
  }

  const watchVars = [
    { label: "total keys", value: totalKeys },
    { label: "tree height", value: treeHeight(root) },
    { label: "t (min degree)", value: tDegree },
  ];

  return (
    <div className="algo-page" data-category="ds">
      <Nav showStoryBanner />

      <div className="page-header">
        <div className="title-group">
          <h1>B-Tree</h1>
          <div className="title-meta">
            <span className="badge">Data Structures</span>
            <ComplexityPopover
              best="O(log n)"
              avg="O(log n)"
              worst="O(log n)"
              space="O(n)"
              bestNote="Guaranteed by balanced structure"
              avgNote="Search, insert, delete all O(log n)"
              worstNote="All leaves at same depth — always balanced"
              spaceNote="n keys stored across nodes"
              why="A B-tree of degree t has height at most log_t((n+1)/2). Since t is constant (typically large for disk I/O), height is O(log n). Each level requires reading one disk page, so search cost is O(log n) disk reads."
            />
          </div>
        </div>
        <div className="btree-t-selector">
          <span className="btree-t-label">Degree t:</span>
          {[2, 3].map((t) => (
            <button
              key={t}
              type="button"
              className={`btree-t-btn${tDegree === t ? " active" : ""}`}
              onClick={() => handleTChange(t)}
            >
              {t}
            </button>
          ))}
        </div>
        <AlgorithmComplete />
      </div>

      <div className="content-grid">
        <div className="main-column">
          <ProblemFrame title="The Problem">
            <div className="app-section">
              <span className="app-label">Given</span>
              <p>
                A set of integer keys and a minimum degree t. Each node holds at
                most 2t−1 keys and all leaves are at the same depth.
              </p>
            </div>
            <div className="app-section">
              <span className="app-label">Goal</span>
              <p>
                Maintain a self-balancing multi-way search tree where every
                operation — insert, delete, search — runs in O(log n). Splits
                keep all leaves at the same depth.
              </p>
            </div>
            <div className="app-section">
              <span className="app-label">Real use cases</span>
              <p>
                Database engines (PostgreSQL, SQLite), file systems (ext4,
                NTFS), and any storage system where minimizing disk I/O matters.
              </p>
            </div>
          </ProblemFrame>

          <WhyComplexityPanel derivation="A B-tree of degree t holds up to 2t−1 keys per node. With n total keys the tree height is O(log_t n). Because t is often large (e.g., 512 for disk pages), the height is a small constant in practice. Each level is a single disk page read, so O(log n) disk I/Os suffice for any operation." />

          <AnalogyPanel>
            Like a library card catalog — each drawer holds multiple entries,
            organized so you never need to open more than a handful of drawers
            to find anything. When a drawer gets too full, it splits in two and
            a new entry moves up to the index.
          </AnalogyPanel>

          <div className="panel">
            <div className="controls">
              <div className="inputs">
                <label htmlFor="btree-key">
                  Key
                  <input
                    id="btree-key"
                    type="number"
                    value={keyInput}
                    min={1}
                    max={9999}
                    onChange={(e) => setKeyInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleInsert()}
                    placeholder="1–9999"
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
                  onClick={handleDelete}
                >
                  Delete
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

            {step && <div className="btree-step-info">{step.message}</div>}

            <BTreeSvg root={displayRoot} highlightStep={step} />

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
                    step?.type === "split" && idx <= 1 ? " highlight" : ""
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
