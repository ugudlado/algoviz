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
  createHeap,
  insert,
  extractMin,
  peek,
  buildHeap,
  size,
  MAX_SIZE,
  type Heap,
  type HeapStep,
} from "@/lib/algorithms/heap";
import "@/styles/heap.css";

const DEFAULT_ARRAY = [3, 1, 4, 1, 5, 9, 2, 6];

const PSEUDO_LINES = [
  "insert(heap, value):",
  "  heap[size] = value",
  "  sift up from size",
  "extractMin(heap):",
  "  min = heap[0]",
  "  heap[0] = heap[size-1]",
  "  sift down from 0",
  "  return min",
];

// --- Array row view ---

function HeapArrayRow({
  data,
  activeIdx,
  parentIdx,
}: {
  data: number[];
  activeIdx: number;
  parentIdx?: number;
}) {
  return (
    <div className="heap-array-row">
      {data.map((val, i) => (
        <div
          key={i}
          className={`heap-array-cell${
            i === activeIdx
              ? " heap-cell-active"
              : i === parentIdx
                ? " heap-cell-parent"
                : ""
          }`}
        >
          <span className="heap-cell-val">{val}</span>
          <span className="heap-cell-idx">{i}</span>
        </div>
      ))}
      {data.length === 0 && (
        <span className="heap-empty-label">Empty heap</span>
      )}
    </div>
  );
}

// --- SVG tree view ---

function HeapTreeSvg({
  data,
  activeIdx,
  parentIdx,
}: {
  data: number[];
  activeIdx: number;
  parentIdx?: number;
}) {
  if (data.length === 0) return null;

  const NODE_R = 22;
  const LEVEL_H = 72;
  const levels = Math.ceil(Math.log2(data.length + 1));
  const svgW = Math.max(300, Math.pow(2, levels - 1) * 64);
  const svgH = levels * LEVEL_H + 40;

  interface Pos {
    x: number;
    y: number;
  }
  const positions: Pos[] = [];

  function assignPos(i: number, depth: number, xMin: number, xMax: number) {
    if (i >= data.length) return;
    const x = (xMin + xMax) / 2;
    const y = depth * LEVEL_H + 36;
    positions[i] = { x, y };
    const mid = (xMin + xMax) / 2;
    assignPos(2 * i + 1, depth + 1, xMin, mid);
    assignPos(2 * i + 2, depth + 1, mid, xMax);
  }

  assignPos(0, 0, 0, svgW);

  return (
    <div className="heap-tree-container">
      <svg
        width={svgW}
        height={svgH}
        viewBox={`0 0 ${svgW} ${svgH}`}
        aria-label="Min-heap tree visualization"
      >
        {data.map((_, i) => {
          const left = 2 * i + 1;
          const right = 2 * i + 2;
          const pos = positions[i];
          if (!pos) return null;
          return (
            <g key={`edges-${i}`}>
              {left < data.length && positions[left] && (
                <line
                  x1={pos.x}
                  y1={pos.y}
                  x2={positions[left].x}
                  y2={positions[left].y}
                  className="heap-edge"
                />
              )}
              {right < data.length && positions[right] && (
                <line
                  x1={pos.x}
                  y1={pos.y}
                  x2={positions[right].x}
                  y2={positions[right].y}
                  className="heap-edge"
                />
              )}
            </g>
          );
        })}
        {data.map((val, i) => {
          const pos = positions[i];
          if (!pos) return null;
          const isActive = i === activeIdx;
          const isParent = i === parentIdx;
          const fill = isActive ? "#0f1f3a" : isParent ? "#1a0f2a" : "#111111";
          const stroke = isActive
            ? "#58a6ff"
            : isParent
              ? "#9a4cf0"
              : "#30363d";

          return (
            <g key={i}>
              <circle
                cx={pos.x}
                cy={pos.y}
                r={NODE_R}
                fill={fill}
                stroke={stroke}
                strokeWidth={2}
              />
              <text x={pos.x} y={pos.y} className="heap-node-text">
                {val}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// --- Main Page ---

export default function MinHeapPage() {
  const [inputVal, setInputVal] = useState("7");
  const [buildInput, setBuildInput] = useState("3,1,4,1,5,9,2,6");
  const [error, setError] = useState("");
  const [heap, setHeap] = useState<Heap>(createHeap());
  const [steps, setSteps] = useState<HeapStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [lastExtracted, setLastExtracted] = useState<number | null>(null);
  const hasInit = useRef(false);

  useEffect(() => {
    if (hasInit.current) return;
    hasInit.current = true;
    const res = buildHeap(DEFAULT_ARRAY);
    const finalHeap =
      res.steps.length > 0
        ? { data: res.steps[res.steps.length - 1].heap }
        : createHeap();
    setHeap(finalHeap);
    setSteps(res.steps);
    setCurrentStep(res.steps.length > 0 ? res.steps.length - 1 : 0);
  }, []);

  const handleInsert = useCallback(() => {
    const v = parseInt(inputVal, 10);
    if (isNaN(v) || v < 0 || v > 99) {
      setError("Enter a value between 0 and 99.");
      return;
    }
    if (size(heap) >= MAX_SIZE) {
      setError(`Heap is full (max ${MAX_SIZE} elements).`);
      return;
    }
    setError("");
    const res = insert(heap, v);
    const finalHeap =
      res.steps.length > 0
        ? { data: res.steps[res.steps.length - 1].heap }
        : heap;
    setHeap(finalHeap);
    setSteps(res.steps);
    setCurrentStep(0);
  }, [inputVal, heap]);

  const handleExtract = useCallback(() => {
    if (size(heap) === 0) {
      setError("Heap is empty.");
      return;
    }
    setError("");
    const res = extractMin(heap);
    const finalHeap =
      res.steps.length > 0
        ? { data: res.steps[res.steps.length - 1].heap }
        : heap;
    setHeap(finalHeap);
    setSteps(res.steps);
    setCurrentStep(0);
    if (res.extracted !== undefined) setLastExtracted(res.extracted);
  }, [heap]);

  const handleBuild = useCallback(() => {
    const nums = buildInput
      .split(",")
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n));
    if (nums.length === 0 || nums.length > MAX_SIZE) {
      setError(`Enter 1–${MAX_SIZE} comma-separated numbers.`);
      return;
    }
    setError("");
    const res = buildHeap(nums);
    const finalHeap =
      res.steps.length > 0
        ? { data: res.steps[res.steps.length - 1].heap }
        : createHeap();
    setHeap(finalHeap);
    setSteps(res.steps);
    setCurrentStep(0);
    setLastExtracted(null);
  }, [buildInput]);

  const handleReset = useCallback(() => {
    const res = buildHeap(DEFAULT_ARRAY);
    const finalHeap =
      res.steps.length > 0
        ? { data: res.steps[res.steps.length - 1].heap }
        : createHeap();
    setHeap(finalHeap);
    setSteps(res.steps);
    setCurrentStep(res.steps.length > 0 ? res.steps.length - 1 : 0);
    setLastExtracted(null);
    setError("");
  }, []);

  const handleStepReset = useCallback(() => setCurrentStep(0), []);

  const step = steps[currentStep];
  const displayData = step?.heap ?? heap.data;
  const activeIdx = step?.activeIdx ?? -1;
  const parentIdx = step?.parentIdx;
  const minVal = peek(heap);
  const heapSize = size(heap);

  const watchVars = [
    { label: "size", value: heapSize },
    { label: "min (peek)", value: minVal !== null ? minVal : "-" },
    {
      label: "last extracted",
      value: lastExtracted !== null ? lastExtracted : "-",
    },
  ];

  return (
    <div className="algo-page" data-category="ds">
      <Nav showStoryBanner />

      <div className="page-header">
        <div className="title-group">
          <h1>Min-Heap</h1>
          <div className="title-meta">
            <span className="badge">Data Structures</span>
            <ComplexityPopover
              best="O(1)"
              avg="O(log n)"
              worst="O(log n)"
              space="O(n)"
              bestNote="Peek minimum is O(1)"
              avgNote="Insert and extract are O(log n)"
              worstNote="Sift up/down at most log n levels"
              spaceNote="Flat array of n elements"
              why="A heap is a complete binary tree, so its height is always ⌊log₂ n⌋. Insert appends to the end and sifts up at most h levels. Extract swaps root with the last element and sifts down at most h levels. Both are O(log n). Building from an array is O(n) by sifting down from the bottom."
            />
          </div>
        </div>
        <AlgorithmComplete />
      </div>

      <div className="content-grid">
        <div className="main-column">
          <ProblemFrame title="The Problem">
            <div className="app-section">
              <span className="app-label">Given</span>
              <p>A dynamic set of numbers requiring fast minimum retrieval.</p>
            </div>
            <div className="app-section">
              <span className="app-label">Goal</span>
              <p>
                Maintain a binary tree where every parent is smaller than its
                children (min-heap property), enabling O(1) peek and O(log n)
                insert and extract-minimum operations.
              </p>
            </div>
            <div className="app-section">
              <span className="app-label">Real use cases</span>
              <p>
                Priority queues, Dijkstra and Prim algorithms, task schedulers,
                heap sort, median maintenance with two heaps.
              </p>
            </div>
          </ProblemFrame>

          <WhyComplexityPanel derivation="A min-heap is stored as a flat array where parent(i) = ⌊(i-1)/2⌋. The tree is always complete, so height = ⌊log₂ n⌋. Insert: append + sift up = O(log n). Extract: swap root with last + sift down = O(log n). Build from array: sifting down from all non-leaf nodes costs O(n) total (harmonic series argument — lower nodes do less work)." />

          <AnalogyPanel>
            Like a tournament bracket where the best player always bubbles to
            the top — whenever a match is played, the winner moves up one round
            until the champion sits at position 0.
          </AnalogyPanel>

          <div className="panel">
            <div className="controls">
              <div className="inputs">
                <label htmlFor="heap-insert">
                  Value (0–99)
                  <input
                    id="heap-insert"
                    type="number"
                    value={inputVal}
                    min={0}
                    max={99}
                    onChange={(e) => setInputVal(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleInsert()}
                    placeholder="0–99"
                  />
                </label>
                <label htmlFor="heap-build">
                  Build from array
                  <input
                    id="heap-build"
                    type="text"
                    value={buildInput}
                    onChange={(e) => setBuildInput(e.target.value)}
                    placeholder="comma-separated numbers"
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
                  onClick={handleExtract}
                >
                  Extract Min
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleBuild}
                >
                  Build
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

            {step && <div className="heap-step-info">{step.message}</div>}

            <div className="heap-section-label">Array</div>
            <HeapArrayRow
              data={displayData}
              activeIdx={activeIdx}
              parentIdx={parentIdx}
            />

            <div
              className="heap-section-label"
              style={{ marginTop: "0.75rem" }}
            >
              Tree
            </div>
            <HeapTreeSvg
              data={displayData}
              activeIdx={activeIdx}
              parentIdx={parentIdx}
            />

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
                    step?.type === "insert" && idx <= 2
                      ? " highlight"
                      : (step?.type === "extract" ||
                            step?.type === "sift-down") &&
                          idx >= 3
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
