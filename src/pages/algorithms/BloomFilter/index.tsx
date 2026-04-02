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
  createFilter,
  insert,
  query,
  getFalsePositiveRate,
  getFillLevel,
  getPasswordPreset,
  type BloomFilter,
} from "@/lib/algorithms/bloom-filter";
import "@/styles/bloom-filter.css";

const DEFAULT_M = 32;
const DEFAULT_K = 3;

const PSEUDO_LINES = [
  "insert(filter, word):",
  "  for i in 0..k:",
  "    idx = hash(word, i) % m",
  "    bits[idx] = 1",
  "query(filter, word):",
  "  for i in 0..k:",
  "    if bits[hash(word,i)%m] == 0:",
  "      return 'definite-no'",
  "  return 'probable-yes'",
];

interface FilterOpState {
  activeIndices: number[];
  opResult: "definite-no" | "probable-yes" | "definite-yes" | null;
  opWord: string;
  opType: "insert" | "query" | null;
}

function BitArrayView({
  bits,
  activeIndices,
  opType,
}: {
  bits: number[];
  activeIndices: number[];
  opType: "insert" | "query" | null;
}) {
  const activeSet = new Set(activeIndices);
  const activeColor = opType === "insert" ? "#3fb950" : "#58a6ff";
  const activeBg = opType === "insert" ? "#0f2a1a" : "#0f1f3a";

  return (
    <div className="bloom-bit-array">
      {bits.map((bit, i) => {
        const isActive = activeSet.has(i);
        return (
          <div
            key={i}
            className={`bloom-bit${bit === 1 ? " bloom-bit-set" : ""}${isActive ? " bloom-bit-active" : ""}`}
            style={
              isActive ? { borderColor: activeColor, background: activeBg } : {}
            }
            title={`index ${i}`}
          >
            <span className="bloom-bit-val">{bit}</span>
            <span className="bloom-bit-idx">{i}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function BloomFilterPage() {
  const [wordInput, setWordInput] = useState("");
  const [m, setM] = useState(DEFAULT_M);
  const [k, setK] = useState(DEFAULT_K);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<BloomFilter>(() =>
    createFilter(DEFAULT_M, DEFAULT_K),
  );
  const [opState, setOpState] = useState<FilterOpState>({
    activeIndices: [],
    opResult: null,
    opWord: "",
    opType: null,
  });
  const [insertCount, setInsertCount] = useState(0);
  const [steps, setSteps] = useState<
    { bits: number[]; activeIndices: number[] }[]
  >([]);
  const [currentStep, setCurrentStep] = useState(0);
  const hasInit = useRef(false);

  useEffect(() => {
    if (hasInit.current) return;
    hasInit.current = true;
    const f = createFilter(DEFAULT_M, DEFAULT_K);
    const preset = getPasswordPreset();
    for (const word of preset) {
      insert(f, word);
    }
    setFilter(f);
    setInsertCount(preset.length);
  }, []);

  const handleInsert = useCallback(() => {
    const word = wordInput.trim().toLowerCase();
    if (!word || word.length > 30) {
      setError("Enter a word (max 30 characters).");
      return;
    }
    setError("");
    const res = insert(filter, word);
    // Build step-through: one step per hash index
    const stepArr = res.indices.map((_, si) => ({
      bits: [...filter.bits],
      activeIndices: res.indices.slice(0, si + 1),
    }));
    setSteps(stepArr);
    setCurrentStep(0);
    setOpState({
      activeIndices: res.indices,
      opResult: null,
      opWord: word,
      opType: "insert",
    });
    setInsertCount((c) => c + 1);
    setWordInput("");
  }, [wordInput, filter]);

  const handleQuery = useCallback(() => {
    const word = wordInput.trim().toLowerCase();
    if (!word || word.length > 30) {
      setError("Enter a word to query.");
      return;
    }
    setError("");
    const res = query(filter, word);
    const stepArr = res.indices.map((_, si) => ({
      bits: [...filter.bits],
      activeIndices: res.indices.slice(0, si + 1),
    }));
    setSteps(stepArr);
    setCurrentStep(0);
    setOpState({
      activeIndices: res.indices,
      opResult: res.result,
      opWord: word,
      opType: "query",
    });
  }, [wordInput, filter]);

  const handleMChange = useCallback(
    (newM: number) => {
      setM(newM);
      const f = createFilter(newM, k);
      const preset = getPasswordPreset();
      for (const word of preset) insert(f, word);
      setFilter(f);
      setInsertCount(preset.length);
      setSteps([]);
      setCurrentStep(0);
      setOpState({
        activeIndices: [],
        opResult: null,
        opWord: "",
        opType: null,
      });
      setError("");
    },
    [k],
  );

  const handleKChange = useCallback(
    (newK: number) => {
      setK(newK);
      const f = createFilter(m, newK);
      const preset = getPasswordPreset();
      for (const word of preset) insert(f, word);
      setFilter(f);
      setInsertCount(preset.length);
      setSteps([]);
      setCurrentStep(0);
      setOpState({
        activeIndices: [],
        opResult: null,
        opWord: "",
        opType: null,
      });
      setError("");
    },
    [m],
  );

  const handleReset = useCallback(() => {
    const f = createFilter(m, k);
    const preset = getPasswordPreset();
    for (const word of preset) insert(f, word);
    setFilter(f);
    setInsertCount(preset.length);
    setSteps([]);
    setCurrentStep(0);
    setOpState({ activeIndices: [], opResult: null, opWord: "", opType: null });
    setWordInput("");
    setError("");
  }, [m, k]);

  const handleStepReset = useCallback(() => setCurrentStep(0), []);

  const step = steps[currentStep];
  const displayBits = step ? step.bits : filter.bits;
  const displayActiveIndices = step
    ? step.activeIndices
    : opState.activeIndices;
  const falsePositiveRate =
    Math.round(getFalsePositiveRate(filter) * 10000) / 100;
  const fillLevel = Math.round(getFillLevel(filter) * 100);

  const resultColor =
    opState.opResult === "definite-no"
      ? "#3fb950"
      : opState.opResult === "definite-yes"
        ? "#58a6ff"
        : opState.opResult === "probable-yes"
          ? "#d29922"
          : "";

  const resultLabel =
    opState.opResult === "definite-no"
      ? "Definitely NOT in set"
      : opState.opResult === "definite-yes"
        ? "Definitely in set"
        : opState.opResult === "probable-yes"
          ? "Probably in set (possible false positive)"
          : "";

  const watchVars = [
    { label: "items", value: insertCount },
    { label: "fill level %", value: fillLevel },
    { label: "false positive rate %", value: falsePositiveRate },
    {
      label: "last result",
      value: opState.opResult ?? "-",
      highlight: opState.opResult === "definite-no",
    },
  ];

  return (
    <div className="algo-page" data-category="ds">
      <Nav showStoryBanner />

      <div className="page-header">
        <div className="title-group">
          <h1>Bloom Filter</h1>
          <div className="title-meta">
            <span className="badge">Data Structures</span>
            <ComplexityPopover
              best="O(k)"
              avg="O(k)"
              worst="O(k)"
              space="O(m)"
              bestNote="k = number of hash functions"
              avgNote="Insert and query both hash k times"
              worstNote="Always exactly k hash computations"
              spaceNote="m = bit array size (fixed, independent of items)"
              why="A bloom filter uses a bit array of size m and k hash functions. Each insert/query computes k hashes — always O(k). Space is fixed at O(m) bits regardless of how many items are inserted. This is why it's so space-efficient compared to hash sets."
            />
          </div>
        </div>
        <div className="bloom-params">
          <span className="bloom-param-label">m (bits):</span>
          {[16, 32, 64].map((mv) => (
            <button
              key={mv}
              type="button"
              className={`bloom-param-btn${m === mv ? " active" : ""}`}
              onClick={() => handleMChange(mv)}
            >
              {mv}
            </button>
          ))}
          <span className="bloom-param-label" style={{ marginLeft: "0.75rem" }}>
            k (hashes):
          </span>
          {[1, 2, 3, 4, 5].map((kv) => (
            <button
              key={kv}
              type="button"
              className={`bloom-param-btn${k === kv ? " active" : ""}`}
              onClick={() => handleKChange(kv)}
            >
              {kv}
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
                A set of items with fixed memory budget (m bits, k hash
                functions).
              </p>
            </div>
            <div className="app-section">
              <span className="app-label">Goal</span>
              <p>
                Answer "is this item in the set?" with no false negatives and a
                tunable false positive rate. Never store the actual items — only
                their hash fingerprints.
              </p>
            </div>
            <div className="app-section">
              <span className="app-label">Real use cases</span>
              <p>
                Password breach checking (HaveIBeenPwned), browser safe-browsing
                lists, database query optimization, CDN cache pre-warming, and
                distributed deduplication.
              </p>
            </div>
          </ProblemFrame>

          <WhyComplexityPanel derivation="A bloom filter uses m bits and k independent hash functions. Each insert sets k bits. Each query checks k bits — if any is 0, the item is definitely absent (no false negatives). If all k bits are 1, it's probably present. The false positive rate is approximately (1 - e^(-kn/m))^k where n is the number of insertions. More bits (larger m) or fewer insertions reduce false positives." />

          <AnalogyPanel>
            Like a bouncer with a fuzzy memory — they remember everyone on the
            list by a rough fingerprint (k hashes). If none of the fingerprints
            match, you're definitely not on the list. If they all match, you
            probably are — but occasionally someone with a similar fingerprint
            gets waved in by mistake.
          </AnalogyPanel>

          <div className="panel">
            <div className="controls">
              <div className="inputs">
                <label htmlFor="bloom-word">
                  Word
                  <input
                    id="bloom-word"
                    type="text"
                    value={wordInput}
                    maxLength={30}
                    onChange={(e) => setWordInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleInsert()}
                    placeholder="e.g. password123"
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
                  onClick={handleQuery}
                >
                  Query
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

            {opState.opWord && (
              <div className="bloom-op-info">
                <span>
                  {opState.opType === "insert" ? "Inserted" : "Queried"}:{" "}
                  <strong>{opState.opWord}</strong>
                </span>
                {opState.opResult && (
                  <span
                    className="bloom-result-badge"
                    style={{ color: resultColor }}
                  >
                    {resultLabel}
                  </span>
                )}
                {opState.activeIndices.length > 0 && (
                  <span className="bloom-indices">
                    Bit indices: [{opState.activeIndices.join(", ")}]
                  </span>
                )}
              </div>
            )}

            <div className="bloom-section-label">Bit Array (m={m})</div>
            <BitArrayView
              bits={displayBits}
              activeIndices={displayActiveIndices}
              opType={opState.opType}
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
                    opState.opType === "insert" && idx <= 3
                      ? " highlight"
                      : opState.opType === "query" && idx >= 4
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
