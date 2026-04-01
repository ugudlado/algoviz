import { useState, useCallback, useEffect, useRef } from "react";
import { Nav } from "@/components/Nav";
import { PlaybackController } from "@/components/PlaybackController";
import { WatchPanel } from "@/components/WatchPanel";
import { ComplexityPopover } from "@/components/ComplexityPopover";
import { AnalogyPanel } from "@/components/AnalogyPanel";
import { ProblemFrame } from "@/components/ProblemFrame";
import { WhyComplexityPanel } from "@/components/WhyComplexityPanel";
import {
  getSnapshots,
  type HuffmanSnapshot,
  type HuffmanNode,
  type HuffmanSnapshotsResult,
} from "@/lib/algorithms/huffman";
import "@/styles/huffman.css";

const DEFAULT_TEXT = "ABRACADABRA";
const MAX_TEXT_LENGTH = 50;

const PSEUDO_LINES = [
  "count frequencies",
  "create leaf node per char",
  "while queue.size > 1:",
  "  left = extractMin()",
  "  right = extractMin()",
  "  parent = merge(left, right)",
  "  insert(parent)",
  "tree = queue[0]",
];

// --- Tree layout helpers ---

interface LayoutNode {
  node: HuffmanNode;
  x: number;
  y: number;
  children: LayoutNode[];
}

function treeDepth(node: HuffmanNode | null): number {
  if (!node) return 0;
  return 1 + Math.max(treeDepth(node.left), treeDepth(node.right));
}

function assignLayout(
  node: HuffmanNode | null,
  depth: number,
  xMin: number,
  xMax: number,
  levelHeight: number,
  result: LayoutNode[],
  parent: LayoutNode | null,
): LayoutNode | null {
  if (!node) return null;
  const x = (xMin + xMax) / 2;
  const y = depth * levelHeight + 40;
  const layout: LayoutNode = { node, x, y, children: [] };
  if (parent) parent.children.push(layout);
  result.push(layout);
  const mid = (xMin + xMax) / 2;
  assignLayout(node.left, depth + 1, xMin, mid, levelHeight, result, layout);
  assignLayout(node.right, depth + 1, mid, xMax, levelHeight, result, layout);
  return layout;
}

interface TreeLayoutResult {
  nodes: LayoutNode[];
  root: LayoutNode | null;
  svgWidth: number;
  svgHeight: number;
}

function computeTreeLayout(root: HuffmanNode | null): TreeLayoutResult {
  if (!root) return { nodes: [], root: null, svgWidth: 200, svgHeight: 100 };
  const depth = treeDepth(root);
  const levelHeight = 72;
  const svgHeight = depth * levelHeight + 80;
  // Leaf count drives width; minimum width 240
  const leafCount = Math.pow(2, depth - 1);
  const nodeSpacing = 64;
  const svgWidth = Math.max(240, leafCount * nodeSpacing);
  const nodes: LayoutNode[] = [];
  const layoutRoot = assignLayout(
    root,
    0,
    0,
    svgWidth,
    levelHeight,
    nodes,
    null,
  );
  return { nodes, root: layoutRoot, svgWidth, svgHeight };
}

// --- Tree SVG component ---

function TreeSvg({
  tree,
  mergedIds,
}: {
  tree: HuffmanNode | null;
  mergedIds: Set<number>;
}) {
  const { nodes, svgWidth, svgHeight } = computeTreeLayout(tree);

  if (!tree || nodes.length === 0) {
    return (
      <div
        className="huf-tree-container"
        style={{ alignItems: "center", justifyContent: "center" }}
      >
        <span style={{ color: "#a1a1a1", fontSize: "0.82rem" }}>
          Tree builds step by step...
        </span>
      </div>
    );
  }

  const nodeRadius = 22;

  return (
    <div className="huf-tree-container">
      <svg
        width={svgWidth}
        height={svgHeight}
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        aria-label="Huffman tree visualization"
      >
        {/* Draw edges first */}
        {nodes.map((layout) =>
          layout.children.map((child, idx) => {
            const isLeft = idx === 0;
            const label = isLeft ? "0" : "1";
            const midX = (layout.x + child.x) / 2;
            const midY = (layout.y + child.y) / 2;
            return (
              <g key={`edge-${layout.node.id}-${child.node.id}`}>
                <line
                  x1={layout.x}
                  y1={layout.y}
                  x2={child.x}
                  y2={child.y}
                  className="huf-edge"
                />
                <text
                  x={midX}
                  y={midY - 4}
                  className={`huf-edge-label huf-edge-${label}`}
                >
                  {label}
                </text>
              </g>
            );
          }),
        )}

        {/* Draw nodes */}
        {nodes.map((layout) => {
          const { node, x, y } = layout;
          const isLeaf = node.char !== null;
          const isHighlighted = mergedIds.has(node.id);
          const circleClass = isHighlighted
            ? "huf-tree-node huf-node-merged"
            : isLeaf
              ? "huf-leaf-node"
              : "huf-internal-node";

          const circleFill = isHighlighted
            ? "#2d2200"
            : isLeaf
              ? "#0f2a1a"
              : "#111111";
          const circleStroke = isHighlighted
            ? "#d29922"
            : isLeaf
              ? "#3fb950"
              : "#30363d";

          return (
            <g key={`node-${node.id}`} className={circleClass}>
              <circle
                cx={x}
                cy={y}
                r={nodeRadius}
                fill={circleFill}
                stroke={circleStroke}
                strokeWidth={2}
              />
              {isLeaf ? (
                <>
                  <text x={x} y={y - 5} className="huf-node-text-char">
                    {node.char}
                  </text>
                  <text x={x} y={y + 9} className="huf-node-text-freq">
                    {node.freq}
                  </text>
                </>
              ) : (
                <text x={x} y={y} className="huf-node-text-freq-only">
                  {node.freq}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// --- Queue display ---

function QueueDisplay({
  queue,
  mergedIds,
}: {
  queue: HuffmanNode[];
  mergedIds: Set<number>;
}) {
  const sorted = [...queue].sort((a, b) =>
    a.freq !== b.freq ? a.freq - b.freq : a.id - b.id,
  );
  return (
    <div className="huf-queue">
      {sorted.length === 0 ? (
        <span style={{ color: "#a1a1a1", fontSize: "0.78rem" }}>Empty</span>
      ) : (
        sorted.map((node) => {
          const isInternal = node.char === null;
          const isHighlighted = mergedIds.has(node.id);
          let itemClass = "huf-queue-item";
          if (isHighlighted) itemClass += " huf-merged";
          else if (isInternal) itemClass += " huf-internal-queue";
          return (
            <div key={node.id} className={itemClass}>
              <span className="huf-char">
                {node.char !== null ? node.char : "#"}
              </span>
              <span className="huf-freq">{node.freq}</span>
            </div>
          );
        })
      )}
    </div>
  );
}

// --- Encoding table ---

function EncodingTable({
  encodingTable,
  freqTable,
}: {
  encodingTable: Record<string, string>;
  freqTable: Record<string, number>;
}) {
  const entries = Object.entries(encodingTable).sort((a, b) => {
    const fa = freqTable[a[0]] ?? 0;
    const fb = freqTable[b[0]] ?? 0;
    return fb - fa;
  });

  if (entries.length === 0) return null;

  return (
    <table className="huf-encoding-table">
      <thead>
        <tr>
          <th>Char</th>
          <th>Freq</th>
          <th>Code</th>
          <th>Bits</th>
        </tr>
      </thead>
      <tbody>
        {entries.map(([ch, code]) => (
          <tr key={ch} className="huf-encoding-row">
            <td className="huf-col-char">{ch === " " ? "space" : ch}</td>
            <td className="huf-col-freq">{freqTable[ch] ?? 0}</td>
            <td className="huf-col-code">{code}</td>
            <td className="huf-col-bits">{code.length}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// --- Pseudocode highlight ---

function pseudoHighlight(snap: HuffmanSnapshot | undefined): number {
  if (!snap) return -1;
  if (snap.phase === "init") return 1;
  if (snap.action === "merge") return 5;
  if (snap.phase === "done") return 7;
  return 2;
}

// --- Main Page ---

export default function HuffmanPage() {
  const [textInput, setTextInput] = useState(DEFAULT_TEXT);
  const [snapshots, setSnapshots] = useState<HuffmanSnapshot[]>([]);
  const [result, setResult] = useState<HuffmanSnapshotsResult | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState("");
  const hasRunRef = useRef(false);

  const snap = snapshots.length > 0 ? snapshots[currentStep] : undefined;

  const runEncoding = useCallback((text: string) => {
    const trimmed = text.trim();
    if (!trimmed.length) {
      setError("Enter some text to encode.");
      return;
    }
    if (trimmed.length > MAX_TEXT_LENGTH) {
      setError(`Maximum ${MAX_TEXT_LENGTH} characters.`);
      return;
    }
    setError("");
    const res = getSnapshots(trimmed);
    setResult(res);
    setSnapshots(res.snapshots);
    setCurrentStep(0);
  }, []);

  const handleRun = useCallback(() => {
    runEncoding(textInput);
  }, [textInput, runEncoding]);

  const handleReset = useCallback(() => {
    setCurrentStep(0);
  }, []);

  // Run on load with default text
  useEffect(() => {
    if (hasRunRef.current) return;
    hasRunRef.current = true;
    runEncoding(DEFAULT_TEXT);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional one-shot init
  }, []);

  // Merged node IDs for highlighting
  const mergedIds = new Set<number>();
  if (snap?.merged) {
    mergedIds.add(snap.merged.left.id);
    mergedIds.add(snap.merged.right.id);
    mergedIds.add(snap.merged.parent.id);
  }

  const codeLine = pseudoHighlight(snap);

  // Show the final tree if we're done; otherwise show the partial merge tree
  const treeToShow: HuffmanNode | null = snap?.tree ?? null;

  // Show final encoding table only when phase is done
  const showEncoding = snap?.phase === "done" && result && result.encodingTable;

  const encoded = result?.encoded ?? "";
  const originalBits =
    (result
      ? Object.entries(result.freqTable).reduce(
          (sum, [, freq]) => sum + freq,
          0,
        )
      : 0) * 8;
  const encodedBits = encoded.length;
  const savings =
    originalBits > 0
      ? Math.round(((originalBits - encodedBits) / originalBits) * 100)
      : 0;

  const uniqueChars = result ? Object.keys(result.freqTable).length : 0;

  const watchVars = snap
    ? [
        {
          label: "Step",
          value: `${snap.step} / ${snapshots.length - 1}`,
        },
        {
          label: "Phase",
          value: snap.phase,
          highlight: snap.phase === "done",
        },
        {
          label: "Queue Size",
          value: String(snap.queue.length),
          highlight: snap.queue.length === 1,
        },
        {
          label: "Action",
          value: snap.detail,
        },
        {
          label: "Unique Chars",
          value: String(uniqueChars),
        },
      ]
    : [];

  return (
    <div className="algo-page" data-category="string">
      <Nav
        currentCategory="string"
        algorithmProgressPath="/algorithms/huffman"
      />

      <div className="page-header">
        <div className="title-group">
          <h1>Huffman Coding</h1>
          <div className="title-meta">
            <span className="badge">String</span>
            <ComplexityPopover
              best="O(n log n)"
              avg="O(n log n)"
              worst="O(n log n)"
              space="O(n)"
              bestNote="n unique characters"
              avgNote="Typical text"
              worstNote="All characters unique"
              spaceNote="Tree + encoding table"
              why="Building the tree requires n−1 merges. Each merge pops two minimums and inserts one node into a min-heap of size n, costing O(log n) per merge. Total: O(n log n). Space holds the tree with O(n) nodes."
            />
          </div>
        </div>
        <div className="huf-legend">
          <span>
            <span className="swatch huf-leaf-swatch" /> Leaf (char)
          </span>
          <span>
            <span className="swatch huf-internal-swatch" /> Internal node
          </span>
          <span>
            <span className="swatch huf-merged-swatch" /> Just merged
          </span>
        </div>
      </div>

      <div className="content-grid">
        <div className="main-column">
          <ProblemFrame title="The Problem">
            <div className="app-section">
              <span className="app-label">Given</span>
              <p>A string of characters to compress.</p>
            </div>
            <div className="app-section">
              <span className="app-label">Goal</span>
              <p>
                Compress text by assigning shorter codes to more frequent
                characters. Build an optimal prefix-free binary code.
              </p>
            </div>
            <div className="app-section">
              <span className="app-label">Real use cases</span>
              <p>
                File compression (ZIP, GZIP), image formats (JPEG uses Huffman),
                and network data encoding.
              </p>
            </div>
          </ProblemFrame>

          <WhyComplexityPanel derivation="The algorithm performs n−1 merge operations, one per unique character minus one. Each merge pops two minimum-frequency nodes from a min-heap (O(log n) each) and inserts the combined parent back (O(log n)). Total heap operations: O(n log n). The encoding table traversal is O(n). Space holds the binary tree with 2n−1 nodes: O(n)." />

          <AnalogyPanel>
            Like Morse code — common letters (E, T) get short codes (·, −) while
            rare letters (Q, Z) get longer ones. Huffman finds the
            mathematically optimal assignment for any input.
          </AnalogyPanel>

          <div className="panel">
            <div className="controls">
              <div className="inputs">
                <label htmlFor="huf-text">
                  Text to encode
                  <input
                    id="huf-text"
                    type="text"
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder={`e.g. ${DEFAULT_TEXT}`}
                    maxLength={MAX_TEXT_LENGTH}
                  />
                </label>
              </div>
              {error && <div className="algo-error visible">{error}</div>}
              <div className="buttons">
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleRun}
                >
                  Encode
                </button>
              </div>
            </div>

            {snapshots.length > 0 && (
              <>
                {snap && <div className="huf-action-info">{snap.detail}</div>}

                {/* Priority Queue */}
                <div className="huf-section-label">Priority Queue</div>
                <QueueDisplay queue={snap?.queue ?? []} mergedIds={mergedIds} />

                {/* Tree */}
                <div
                  className="huf-section-label"
                  style={{ marginTop: "1rem" }}
                >
                  Tree
                </div>
                <TreeSvg tree={treeToShow} mergedIds={mergedIds} />

                {/* Encoding table (only when done) */}
                {showEncoding && result && (
                  <>
                    <div
                      className="huf-section-label"
                      style={{ marginTop: "1rem" }}
                    >
                      Encoding Table
                    </div>
                    <EncodingTable
                      encodingTable={result.encodingTable}
                      freqTable={result.freqTable}
                    />

                    <div
                      className="huf-section-label"
                      style={{ marginTop: "1rem" }}
                    >
                      Encoded Output
                    </div>
                    <div className="huf-bitstring">{encoded}</div>

                    <div className="huf-compression">
                      <div className="huf-compression-item">
                        <span className="huf-compression-label">Original</span>
                        <span className="huf-compression-value">
                          {originalBits} bits
                        </span>
                      </div>
                      <div className="huf-compression-item">
                        <span className="huf-compression-label">Encoded</span>
                        <span className="huf-compression-value">
                          {encodedBits} bits
                        </span>
                      </div>
                      <div className="huf-compression-item">
                        <span className="huf-compression-label">Savings</span>
                        <span
                          className={`huf-compression-value${savings > 0 ? " huf-savings" : ""}`}
                        >
                          {savings > 0 ? `${savings}%` : "0%"}
                        </span>
                      </div>
                      <div className="huf-compression-item">
                        <span className="huf-compression-label">
                          Unique Chars
                        </span>
                        <span className="huf-compression-value">
                          {uniqueChars}
                        </span>
                      </div>
                    </div>
                  </>
                )}

                <PlaybackController
                  steps={snapshots}
                  currentStep={currentStep}
                  onStep={setCurrentStep}
                  onReset={handleReset}
                />
              </>
            )}
          </div>
        </div>

        <div className="sidebar">
          {snap && (
            <div className="stats-grid" style={{ marginBottom: "1rem" }}>
              <div className="stat-card">
                <span className="stat-value">{snap.step}</span>
                <span className="stat-label">Merge</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">{snap.queue.length}</span>
                <span className="stat-label">Queue</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">
                  {currentStep + 1} / {snapshots.length}
                </span>
                <span className="stat-label">Step</span>
              </div>
            </div>
          )}

          {snap && <WatchPanel vars={watchVars} />}

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
