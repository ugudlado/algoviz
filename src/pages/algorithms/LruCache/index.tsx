import { useState, useCallback, useRef, useEffect } from "react";
import { Nav } from "@/components/Nav";
import { PlaybackController } from "@/components/PlaybackController";
import { WatchPanel } from "@/components/WatchPanel";
import { ComplexityPopover } from "@/components/ComplexityPopover";
import { AnalogyPanel } from "@/components/AnalogyPanel";
import { ProblemFrame } from "@/components/ProblemFrame";
import { WhyComplexityPanel } from "@/components/WhyComplexityPanel";
import {
  createCache,
  putWithSteps,
  getWithSteps,
  getBrowserCachePreset,
  type LRUCache,
  type LRUStep,
} from "@/lib/algorithms/lru-cache";
import "@/styles/lru-cache.css";

const DEFAULT_CAPACITY = 4;

const PSEUDO_LINES = [
  "get(key):",
  "  if key not in map: return -1",
  "  move node to front (MRU)",
  "  return node.value",
  "put(key, value):",
  "  if key in map: update, move front",
  "  else: insert at front",
  "  if size > capacity: evict tail",
];

function LRUListView({
  order,
  evicted,
  hitKey,
}: {
  order: Array<{ key: string | number; value: number }>;
  evicted: string | number | null;
  hitKey: string | number | null;
}) {
  return (
    <div className="lru-list-view">
      <div className="lru-list-label">
        <span>MRU</span>
        <span>LRU</span>
      </div>
      <div className="lru-list-row">
        {order.map((item, i) => {
          const isHit = item.key === hitKey;
          const isEvict = item.key === evicted;
          return (
            <div
              key={i}
              className={`lru-list-item${isHit ? " lru-item-hit" : isEvict ? " lru-item-evict" : ""}`}
            >
              <span className="lru-item-key">{item.key}</span>
              <span className="lru-item-val">{item.value}</span>
            </div>
          );
        })}
        {order.length === 0 && (
          <span className="lru-empty">Cache is empty</span>
        )}
      </div>
      {evicted !== null && (
        <div className="lru-evict-label">Evicted: {evicted}</div>
      )}
    </div>
  );
}

function LRUMapView({
  snapshot,
  activeKey,
}: {
  snapshot: Array<{ key: string | number; value: number }>;
  activeKey: string | number | null;
}) {
  return (
    <div className="lru-map-view">
      <div className="lru-map-title">Hash Map</div>
      <div className="lru-map-entries">
        {snapshot.map((entry, i) => (
          <div
            key={i}
            className={`lru-map-entry${entry.key === activeKey ? " lru-map-active" : ""}`}
          >
            <span className="lru-map-key">{entry.key}</span>
            <span className="lru-map-arrow">→</span>
            <span className="lru-map-val">{entry.value}</span>
          </div>
        ))}
        {snapshot.length === 0 && <span className="lru-empty">Empty</span>}
      </div>
    </div>
  );
}

export default function LruCachePage() {
  const [keyInput, setKeyInput] = useState("");
  const [valueInput, setValueInput] = useState("");
  const [capacity, setCapacity] = useState(DEFAULT_CAPACITY);
  const [error, setError] = useState("");
  const [cache, setCache] = useState<LRUCache>(() =>
    createCache(DEFAULT_CAPACITY),
  );
  const [steps, setSteps] = useState<LRUStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [lastHitMiss, setLastHitMiss] = useState<string>("-");
  const [lastEvicted, setLastEvicted] = useState<string | number | null>(null);
  const hasInit = useRef(false);

  useEffect(() => {
    if (hasInit.current) return;
    hasInit.current = true;
    const c = createCache(DEFAULT_CAPACITY);
    const preset = getBrowserCachePreset();
    const s: LRUStep[] = [];
    for (const op of preset) {
      if (op.op === "put" && op.value !== undefined) {
        putWithSteps(c, op.key, op.value, s);
      } else {
        getWithSteps(c, op.key, s);
      }
    }
    setCache(c);
    setSteps(s);
    setCurrentStep(s.length > 0 ? s.length - 1 : 0);
    const lastStep = s[s.length - 1];
    if (lastStep?.evicted !== null) setLastEvicted(lastStep?.evicted ?? null);
    if (lastStep?.hit !== null) setLastHitMiss(lastStep?.hit ? "hit" : "miss");
  }, []);

  const handleGet = useCallback(() => {
    const k = keyInput.trim();
    if (!k) {
      setError("Enter a key.");
      return;
    }
    setError("");
    const s: LRUStep[] = [];
    getWithSteps(cache, k, s);
    setSteps(s);
    setCurrentStep(0);
    const st = s[s.length - 1];
    if (st) setLastHitMiss(st.hit ? "hit" : "miss");
  }, [keyInput, cache]);

  const handlePut = useCallback(() => {
    const k = keyInput.trim();
    const v = parseInt(valueInput, 10);
    if (!k) {
      setError("Enter a key.");
      return;
    }
    if (isNaN(v)) {
      setError("Enter a numeric value.");
      return;
    }
    setError("");
    const s: LRUStep[] = [];
    putWithSteps(cache, k, v, s);
    setSteps(s);
    setCurrentStep(0);
    const st = s[s.length - 1];
    if (st?.evicted !== null) setLastEvicted(st?.evicted ?? null);
  }, [keyInput, valueInput, cache]);

  const handleCapacityChange = useCallback((cap: number) => {
    setCapacity(cap);
    const c = createCache(cap);
    const preset = getBrowserCachePreset();
    const s: LRUStep[] = [];
    for (const op of preset) {
      if (op.op === "put" && op.value !== undefined) {
        putWithSteps(c, op.key, op.value, s);
      } else {
        getWithSteps(c, op.key, s);
      }
    }
    setCache(c);
    setSteps(s);
    setCurrentStep(s.length > 0 ? s.length - 1 : 0);
    setLastEvicted(null);
    setLastHitMiss("-");
    setError("");
  }, []);

  const handleReset = useCallback(() => {
    const c = createCache(capacity);
    const preset = getBrowserCachePreset();
    const s: LRUStep[] = [];
    for (const op of preset) {
      if (op.op === "put" && op.value !== undefined) {
        putWithSteps(c, op.key, op.value, s);
      } else {
        getWithSteps(c, op.key, s);
      }
    }
    setCache(c);
    setSteps(s);
    setCurrentStep(s.length > 0 ? s.length - 1 : 0);
    setLastEvicted(null);
    setLastHitMiss("-");
    setKeyInput("");
    setValueInput("");
    setError("");
  }, [capacity]);

  const handleStepReset = useCallback(() => setCurrentStep(0), []);

  const step = steps[currentStep];
  const displayOrder = step?.order ?? [];
  const mapSnapshot = step?.mapSnapshot ?? [];
  const evicted = step?.evicted ?? null;
  const hitKey = step?.hit ? step.key : null;
  const activeKey = step?.key ?? null;

  const watchVars = [
    { label: "capacity", value: capacity },
    { label: "size", value: displayOrder.length },
    { label: "last hit/miss", value: lastHitMiss },
    {
      label: "evicted",
      value: lastEvicted !== null ? String(lastEvicted) : "-",
    },
  ];

  return (
    <div className="algo-page" data-category="ds">
      <Nav currentCategory="ds" algorithmProgressPath="/algorithms/lru-cache" />

      <div className="page-header">
        <div className="title-group">
          <h1>LRU Cache</h1>
          <div className="title-meta">
            <span className="badge">Data Structures</span>
            <ComplexityPopover
              best="O(1)"
              avg="O(1)"
              worst="O(1)"
              space="O(capacity)"
              bestNote="Hash map gives O(1) lookup"
              avgNote="Both get and put are O(1)"
              worstNote="Doubly-linked list gives O(1) reorder"
              spaceNote="Stores at most capacity key-value pairs"
              why="A doubly-linked list maintains MRU→LRU order, allowing O(1) move-to-front and O(1) evict-from-tail. A hash map gives O(1) key lookup. Together they make both get and put O(1) — no traversal needed."
            />
          </div>
        </div>
        <div className="lru-capacity-selector">
          <span className="lru-cap-label">Capacity:</span>
          {[2, 3, 4, 5, 6, 8].map((cap) => (
            <button
              key={cap}
              type="button"
              className={`lru-cap-btn${capacity === cap ? " active" : ""}`}
              onClick={() => handleCapacityChange(cap)}
            >
              {cap}
            </button>
          ))}
        </div>
      </div>

      <div className="content-grid">
        <div className="main-column">
          <ProblemFrame title="The Problem">
            <div className="app-section">
              <span className="app-label">Given</span>
              <p>A cache with fixed capacity and key-value pairs.</p>
            </div>
            <div className="app-section">
              <span className="app-label">Goal</span>
              <p>
                When the cache is full and a new item arrives, evict the Least
                Recently Used item. Both get and put must run in O(1).
              </p>
            </div>
            <div className="app-section">
              <span className="app-label">Real use cases</span>
              <p>
                Browser cache, CPU cache, Redis eviction policies, CDN edge
                caching, database buffer pool management.
              </p>
            </div>
          </ProblemFrame>

          <WhyComplexityPanel derivation="The key insight: a doubly-linked list can move any node to the front (MRU) in O(1) if you have a direct pointer to it. A hash map stores key → node pointer, giving O(1) lookup. Combining both: get = map lookup + list move-to-front = O(1). Put = map insert + list prepend + optional tail evict = O(1)." />

          <AnalogyPanel>
            Like keeping your desk clear — when it gets full, you put away
            whatever you haven't touched in the longest time to make room for
            what you just picked up.
          </AnalogyPanel>

          <div className="panel">
            <div className="controls">
              <div className="inputs">
                <label htmlFor="lru-key">
                  Key
                  <input
                    id="lru-key"
                    type="text"
                    value={keyInput}
                    maxLength={10}
                    onChange={(e) => setKeyInput(e.target.value)}
                    placeholder="e.g. page1"
                  />
                </label>
                <label htmlFor="lru-value">
                  Value
                  <input
                    id="lru-value"
                    type="number"
                    value={valueInput}
                    onChange={(e) => setValueInput(e.target.value)}
                    placeholder="numeric"
                  />
                </label>
              </div>
              {error && <div className="algo-error visible">{error}</div>}
              <div className="buttons">
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleGet}
                >
                  Get
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handlePut}
                >
                  Put
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
              <div className="lru-step-info">
                {step.type === "get"
                  ? `GET ${step.key} → ${step.hit ? `hit (${step.value})` : "miss"}`
                  : `PUT ${step.key} = ${step.value}${step.evicted !== null ? ` (evicted ${step.evicted})` : ""}`}
              </div>
            )}

            <LRUListView
              order={displayOrder}
              evicted={evicted}
              hitKey={hitKey}
            />
            <LRUMapView snapshot={mapSnapshot} activeKey={activeKey} />

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
                    step?.type === "get" && idx <= 3
                      ? " highlight"
                      : step?.type === "put" && idx >= 4
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
