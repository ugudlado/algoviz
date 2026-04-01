import { useState, useCallback, useRef, useEffect } from "react";
import { Nav } from "@/components/Nav";
import { PlaybackController } from "@/components/PlaybackController";
import { WatchPanel } from "@/components/WatchPanel";
import { ComplexityPopover } from "@/components/ComplexityPopover";
import { AnalogyPanel } from "@/components/AnalogyPanel";
import { ProblemFrame } from "@/components/ProblemFrame";
import { WhyComplexityPanel } from "@/components/WhyComplexityPanel";
import {
  createTrie,
  insert,
  search,
  prefixQuery,
  getWords,
  type Trie,
  type TrieNode,
  type TrieStep,
} from "@/lib/algorithms/trie";
import "@/styles/trie.css";

const DEFAULT_WORDS = ["apple", "app", "apt", "bat", "ball"];
const MAX_WORD_LEN = 20;

type TrieMode = "insert" | "search" | "prefix";

const PSEUDO: Record<TrieMode, string[]> = {
  insert: [
    "insert(trie, word):",
    "  node = root",
    "  for char in word:",
    "    if char not in node.children:",
    "      node.children[char] = new TrieNode",
    "    node = node.children[char]",
    "  node.isEnd = true",
  ],
  search: [
    "search(trie, word):",
    "  node = root",
    "  for char in word:",
    "    if char not in node.children:",
    "      return false",
    "    node = node.children[char]",
    "  return node.isEnd",
  ],
  prefix: [
    "prefix(trie, prefix):",
    "  node = root",
    "  for char in prefix:",
    "    if char not in node.children:",
    "      return []",
    "    node = node.children[char]",
    "  collect all words from node",
  ],
};

// --- SVG Trie rendering ---

interface LayoutTrieNode {
  char: string;
  isEnd: boolean;
  x: number;
  y: number;
  children: LayoutTrieNode[];
  path: string[];
}

function subtreeWidth(node: TrieNode, depth: number): number {
  const keys = Object.keys(node.children);
  if (keys.length === 0) return 44;
  return Math.max(
    44,
    keys
      .map((k) => subtreeWidth(node.children[k], depth + 1))
      .reduce((a, b) => a + b, 0),
  );
}

function buildLayout(
  node: TrieNode,
  char: string,
  depth: number,
  cx: number,
  path: string[],
  result: LayoutTrieNode[],
  edges: { x1: number; y1: number; x2: number; y2: number; char: string }[],
  parentX?: number,
  parentY?: number,
): LayoutTrieNode {
  const LEVEL_H = 60;
  const y = depth * LEVEL_H + 30;
  const layout: LayoutTrieNode = {
    char,
    isEnd: node.isEnd,
    x: cx,
    y,
    children: [],
    path,
  };
  result.push(layout);

  if (parentX !== undefined && parentY !== undefined) {
    edges.push({ x1: parentX, y1: parentY, x2: cx, y2: y, char });
  }

  const childKeys = Object.keys(node.children).sort();
  const childWidths = childKeys.map((k) =>
    subtreeWidth(node.children[k], depth + 1),
  );
  const totalW = childWidths.reduce((a, b) => a + b, 0);
  let startX = cx - totalW / 2;

  childKeys.forEach((k, i) => {
    const childCx = startX + childWidths[i] / 2;
    const child = buildLayout(
      node.children[k],
      k,
      depth + 1,
      childCx,
      [...path, k],
      result,
      edges,
      cx,
      y,
    );
    layout.children.push(child);
    startX += childWidths[i];
  });

  return layout;
}

function TrieSvg({ trie, activePath }: { trie: Trie; activePath: string[] }) {
  const layoutNodes: LayoutTrieNode[] = [];
  const edges: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    char: string;
  }[] = [];

  buildLayout(trie.root, "", 0, 0, [], layoutNodes, edges);

  if (layoutNodes.length <= 1 && Object.keys(trie.root.children).length === 0) {
    return (
      <div className="trie-container trie-empty">
        <span>Insert words to build the trie</span>
      </div>
    );
  }

  const xs = layoutNodes.map((n) => n.x);
  const ys = layoutNodes.map((n) => n.y);
  const minX = Math.min(...xs) - 30;
  const maxX = Math.max(...xs) + 30;
  const minY = Math.min(...ys) - 15;
  const maxY = Math.max(...ys) + 30;
  const svgW = Math.max(300, maxX - minX);
  const svgH = maxY - minY;
  const ox = -minX;
  const oy = -minY;
  const r = 18;

  const activePathStr = activePath.join("");

  return (
    <div className="trie-container">
      <svg
        width={svgW}
        height={svgH}
        viewBox={`0 0 ${svgW} ${svgH}`}
        aria-label="Trie visualization"
      >
        {edges.map((e, i) => {
          const pathToHere =
            layoutNodes.find(
              (n) => Math.abs(n.x - e.x2) < 1 && Math.abs(n.y - e.y2) < 1,
            )?.path ?? [];
          const pathStr = pathToHere.join("");
          const isActive =
            activePathStr.startsWith(pathStr) && pathStr.length > 0;
          return (
            <line
              key={i}
              x1={e.x1 + ox}
              y1={e.y1 + oy}
              x2={e.x2 + ox}
              y2={e.y2 + oy}
              className={isActive ? "trie-edge trie-edge-active" : "trie-edge"}
            />
          );
        })}
        {layoutNodes.map((n, i) => {
          if (n.char === "" && i === 0) {
            // root node
            return (
              <g key={i}>
                <circle
                  cx={n.x + ox}
                  cy={n.y + oy}
                  r={r}
                  fill="#111111"
                  stroke="#30363d"
                  strokeWidth={2}
                />
                <text x={n.x + ox} y={n.y + oy} className="trie-node-char">
                  *
                </text>
              </g>
            );
          }
          const pathStr = n.path.join("");
          const isOnActivePath =
            activePathStr.length > 0 &&
            activePathStr.startsWith(pathStr) &&
            pathStr.length > 0;
          const isExactMatch = pathStr === activePathStr && n.isEnd;
          const fill = isExactMatch
            ? "#0f2a1a"
            : isOnActivePath
              ? "#0f1f3a"
              : "#111111";
          const stroke = isExactMatch
            ? "#3fb950"
            : isOnActivePath
              ? "#58a6ff"
              : n.isEnd
                ? "#d29922"
                : "#30363d";

          return (
            <g key={i}>
              <circle
                cx={n.x + ox}
                cy={n.y + oy}
                r={r}
                fill={fill}
                stroke={stroke}
                strokeWidth={2}
              />
              <text x={n.x + ox} y={n.y + oy} className="trie-node-char">
                {n.char}
              </text>
              {n.isEnd && (
                <circle
                  cx={n.x + ox + r - 4}
                  cy={n.y + oy - r + 4}
                  r={4}
                  fill="#d29922"
                  stroke="none"
                />
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// --- Main Page ---

export default function TriePage() {
  const [wordInput, setWordInput] = useState("");
  const [error, setError] = useState("");
  const [trie, setTrie] = useState<Trie>(createTrie());
  const [mode, setMode] = useState<TrieMode>("insert");
  const [steps, setSteps] = useState<TrieStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [lastResult, setLastResult] = useState<string>("-");
  const [wordCount, setWordCount] = useState(0);
  const hasInit = useRef(false);

  useEffect(() => {
    if (hasInit.current) return;
    hasInit.current = true;
    const t = createTrie();
    for (const w of DEFAULT_WORDS) insert(t, w);
    setTrie(t);
    setWordCount(getWords(t).length);
  }, []);

  const handleAction = useCallback(() => {
    const word = wordInput.trim().toLowerCase();
    if (!word || word.length > MAX_WORD_LEN) {
      setError(`Enter a word (max ${MAX_WORD_LEN} characters).`);
      return;
    }
    if (!/^[a-z]+$/.test(word)) {
      setError("Use only lowercase letters a–z.");
      return;
    }
    setError("");

    if (mode === "insert") {
      const res = insert(trie, word);
      setSteps(res.steps);
      setCurrentStep(0);
      // Force re-render since insert mutates trie in-place
      setTrie({ ...trie });
      setWordCount(getWords(trie).length);
      setLastResult(`inserted "${word}"`);
    } else if (mode === "search") {
      const res = search(trie, word);
      setSteps(res.steps);
      setCurrentStep(0);
      setLastResult(res.found ? `found "${word}"` : `"${word}" not found`);
    } else {
      const res = prefixQuery(trie, word);
      setSteps(res.steps);
      setCurrentStep(0);
      setLastResult(res.words.length > 0 ? res.words.join(", ") : "no matches");
    }
  }, [wordInput, mode, trie]);

  const handleReset = useCallback(() => {
    const t = createTrie();
    for (const w of DEFAULT_WORDS) insert(t, w);
    setTrie(t);
    setSteps([]);
    setCurrentStep(0);
    setLastResult("-");
    setWordCount(getWords(t).length);
    setWordInput("");
    setError("");
  }, []);

  const handleStepReset = useCallback(() => setCurrentStep(0), []);

  const step = steps[currentStep];
  const activePath = step?.path ?? [];

  const watchVars = [
    { label: "word count", value: wordCount },
    {
      label: "last operation",
      value: `${mode}${wordInput ? ` "${wordInput}"` : ""}`,
    },
    { label: "result/matches", value: lastResult },
  ];

  return (
    <div className="algo-page" data-category="ds">
      <Nav currentCategory="ds" algorithmProgressPath="/algorithms/trie" />

      <div className="page-header">
        <div className="title-group">
          <h1>Trie (Prefix Tree)</h1>
          <div className="title-meta">
            <span className="badge">Data Structures</span>
            <ComplexityPopover
              best="O(m)"
              avg="O(m)"
              worst="O(m)"
              space="O(total chars)"
              bestNote="m = length of word"
              avgNote="Insert, search, prefix all O(m)"
              worstNote="Independent of number of words n"
              spaceNote="Sum of all unique character paths"
              why="A trie traverses exactly m nodes for a word of length m — one per character. This is O(m), independent of how many words are stored. Hash tables give O(m) average but O(m²) worst case; tries are always O(m)."
            />
          </div>
        </div>
        <div className="trie-mode-selector">
          {(["insert", "search", "prefix"] as TrieMode[]).map((m) => (
            <button
              key={m}
              type="button"
              className={`trie-mode-btn${mode === m ? " active" : ""}`}
              onClick={() => setMode(m)}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div className="content-grid">
        <div className="main-column">
          <ProblemFrame title="The Problem">
            <div className="app-section">
              <span className="app-label">Given</span>
              <p>A set of words to store with fast prefix-based lookup.</p>
            </div>
            <div className="app-section">
              <span className="app-label">Goal</span>
              <p>
                Store words so that any word or prefix can be found in O(m) time
                where m is the query length. Each path from root to a marked
                node spells a valid word.
              </p>
            </div>
            <div className="app-section">
              <span className="app-label">Real use cases</span>
              <p>
                Autocomplete engines, spell checkers, IP routing tables,
                dictionary compression, and search query suggestions.
              </p>
            </div>
          </ProblemFrame>

          <WhyComplexityPanel derivation="A trie stores each word as a chain of nodes, one per character. Inserting or searching a word of length m visits exactly m nodes, giving O(m) time independent of the total number of words n. This beats hash tables for prefix queries, which must scan all keys. Space is proportional to the total number of unique character positions across all words." />

          <AnalogyPanel>
            Like autocomplete on your phone — every prefix you type branches
            into all possible completions. Typing 'ap' immediately narrows to
            all words starting with 'ap', without scanning every word in the
            dictionary.
          </AnalogyPanel>

          <div className="panel">
            <div className="controls">
              <div className="inputs">
                <label htmlFor="trie-word">
                  Word (a–z only)
                  <input
                    id="trie-word"
                    type="text"
                    value={wordInput}
                    maxLength={MAX_WORD_LEN}
                    onChange={(e) => setWordInput(e.target.value.toLowerCase())}
                    onKeyDown={(e) => e.key === "Enter" && handleAction()}
                    placeholder={
                      mode === "insert"
                        ? "e.g. apple"
                        : mode === "search"
                          ? "e.g. app"
                          : "e.g. ap"
                    }
                  />
                </label>
              </div>
              {error && <div className="algo-error visible">{error}</div>}
              <div className="buttons">
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleAction}
                >
                  {mode === "insert"
                    ? "Insert"
                    : mode === "search"
                      ? "Search"
                      : "Prefix"}
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
              <div className="trie-step-info">
                {mode === "insert" &&
                  `Inserting char '${step.char}' (index ${step.charIndex})`}
                {mode === "search" &&
                  `Checking char '${step.char}'${step.found !== undefined ? (step.found ? " — found" : " — not found") : ""}`}
                {mode === "prefix" &&
                  `Prefix char '${step.char}' — ${step.words ? step.words.length + " match(es)" : ""}`}
              </div>
            )}

            <TrieSvg trie={trie} activePath={activePath} />

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
                    step && idx >= 2 && idx <= 5 ? " highlight" : ""
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
