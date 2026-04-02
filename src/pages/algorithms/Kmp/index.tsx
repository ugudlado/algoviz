import { useState, useCallback, useEffect } from "react";
import { Nav } from "@/components/Nav";
import { AlgorithmComplete } from "@/components/AlgorithmComplete";
import { PlaybackController } from "@/components/PlaybackController";
import { WatchPanel } from "@/components/WatchPanel";
import { ComplexityPopover } from "@/components/ComplexityPopover";
import { AnalogyPanel } from "@/components/AnalogyPanel";
import { ProblemFrame } from "@/components/ProblemFrame";
import { WhyComplexityPanel } from "@/components/WhyComplexityPanel";
import {
  kmpSearch,
  naiveSearch,
  type KmpStep,
  type KmpResult,
} from "@/lib/algorithms/kmp";
import "@/styles/kmp.css";

const DEFAULT_TEXT = "ABABDABACDABABCABAB";
const DEFAULT_PATTERN = "ABABCABAB";
const MAX_TEXT = 50;
const MAX_PATTERN = 20;

const PSEUDO_LINES = [
  "failure = buildFailure(pattern)",
  "i = 0, j = 0",
  "while i < n:",
  "  if text[i] == pattern[j]:",
  "    if j == m-1: found at i-m+1",
  "    i++, j++",
  "  else if j > 0:",
  "    j = failure[j-1]  // shift",
  "  else:",
  "    i++",
];

function pseudoHighlight(step: KmpStep | undefined): number {
  if (!step) return -1;
  if (step.isFound) return 4;
  if (step.isMatch) return 3;
  if (step.shift) return 7;
  if (!step.isMatch && step.patternIdx === 0) return 9;
  return 3;
}

function FailureFunctionDisplay({
  pattern,
  failure,
}: {
  pattern: string;
  failure: number[];
}) {
  if (!pattern || failure.length === 0) return null;
  return (
    <div className="kmp-failure-section">
      <div className="kmp-failure-label">Failure function (prefix table)</div>
      <div className="kmp-failure-table">
        {pattern.split("").map((ch, i) => (
          <div key={i} className="kmp-failure-cell">
            <div className="kmp-failure-char">{ch}</div>
            <div className="kmp-failure-val">{failure[i] ?? 0}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ComparisonView({
  text,
  pattern,
  step,
}: {
  text: string;
  pattern: string;
  step: KmpStep | undefined;
}) {
  if (!step) {
    return (
      <div className="kmp-comparison-section">
        <div className="kmp-row-label">Text</div>
        <div className="kmp-text-row">
          {text.split("").map((ch, i) => (
            <div key={i} className="kmp-text-cell">
              <span className="kmp-text-char">{ch}</span>
              <span className="kmp-text-idx">{i}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // The pattern is aligned starting at offset = textIdx - patternIdx
  const patternOffset = step.textIdx - step.patternIdx;

  // Determine cell states for text row
  const getTextCellClass = (i: number): string => {
    let cls = "kmp-text-cell";
    if (step.isFound) {
      // Highlight the entire matched portion
      const matchStart = step.textIdx - pattern.length + 1;
      if (i >= matchStart && i <= step.textIdx) {
        cls += " kmp-found";
      }
    } else if (i === step.textIdx) {
      if (step.isMatch) {
        cls += " kmp-match";
      } else {
        cls += " kmp-mismatch";
      }
      cls += " kmp-current";
    }
    return cls;
  };

  // Determine cell states for pattern row
  const getPatternCellClass = (j: number): string => {
    let cls = "kmp-pattern-cell";
    if (step.isFound) {
      cls += " kmp-found";
    } else if (j === step.patternIdx) {
      if (step.isMatch) {
        cls += " kmp-match";
      } else {
        cls += " kmp-mismatch";
      }
      cls += " kmp-current";
    } else if (j < step.patternIdx) {
      // Previously matched chars in this alignment
      cls += " kmp-match";
    }
    return cls;
  };

  return (
    <div className="kmp-comparison-section">
      <div className="kmp-row-label">Text</div>
      <div className="kmp-text-row">
        {text.split("").map((ch, i) => (
          <div key={i} className={getTextCellClass(i)}>
            <span className="kmp-text-char">{ch}</span>
            <span className="kmp-text-idx">{i}</span>
          </div>
        ))}
      </div>

      <div className="kmp-row-label" style={{ marginTop: "0.5rem" }}>
        Pattern
      </div>
      <div className="kmp-pattern-row">
        {Array.from({ length: patternOffset }).map((_, i) => (
          <div key={`empty-${i}`} className="kmp-empty-cell" />
        ))}
        {pattern.split("").map((ch, j) => (
          <div key={j} className={getPatternCellClass(j)}>
            <span className="kmp-pattern-char">{ch}</span>
            <span className="kmp-pattern-idx">{j}</span>
          </div>
        ))}
      </div>

      {step.shift && (
        <div className="kmp-shift-indicator">
          Shift: pattern[{step.shiftFrom}] → failure[{step.shiftFrom - 1}] ={" "}
          {step.shiftTo} (skip {step.shiftFrom - step.shiftTo} chars)
        </div>
      )}
    </div>
  );
}

function runKmp(text: string, pattern: string): KmpResult {
  return kmpSearch(text, pattern);
}

export default function KmpPage() {
  const [textInput, setTextInput] = useState(DEFAULT_TEXT);
  const [patternInput, setPatternInput] = useState(DEFAULT_PATTERN);
  const [result, setResult] = useState<KmpResult | null>(null);
  const [naiveSteps, setNaiveSteps] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState("");
  const [activeText, setActiveText] = useState(DEFAULT_TEXT);
  const [activePattern, setActivePattern] = useState(DEFAULT_PATTERN);

  const step =
    result && result.steps.length > 0 ? result.steps[currentStep] : undefined;

  const validate = useCallback((text: string, pattern: string): boolean => {
    if (text.length === 0) {
      setError("Text cannot be empty.");
      return false;
    }
    if (text.length > MAX_TEXT) {
      setError(`Text must be at most ${MAX_TEXT} characters.`);
      return false;
    }
    if (pattern.length === 0) {
      setError("Pattern cannot be empty.");
      return false;
    }
    if (pattern.length > MAX_PATTERN) {
      setError(`Pattern must be at most ${MAX_PATTERN} characters.`);
      return false;
    }
    setError("");
    return true;
  }, []);

  const runSearch = useCallback(() => {
    const text = textInput.trim();
    const pattern = patternInput.trim();
    if (!validate(text, pattern)) return;

    const kmpResult = runKmp(text, pattern);
    const naive = naiveSearch(text, pattern);

    setResult(kmpResult);
    setNaiveSteps(naive.stepCount);
    setCurrentStep(0);
    setActiveText(text);
    setActivePattern(pattern);
    setError("");
  }, [textInput, patternInput, validate]);

  const handleReset = useCallback(() => {
    setCurrentStep(0);
  }, []);

  // Run once on load with defaults
  useEffect(() => {
    const kmpResult = runKmp(DEFAULT_TEXT, DEFAULT_PATTERN);
    const naive = naiveSearch(DEFAULT_TEXT, DEFAULT_PATTERN);
    setResult(kmpResult);
    setNaiveSteps(naive.stepCount);
    setCurrentStep(0);
    setActiveText(DEFAULT_TEXT);
    setActivePattern(DEFAULT_PATTERN);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional one-shot init
  }, []);

  const codeLine = pseudoHighlight(step);

  const watchVars = step
    ? [
        {
          label: "Text Position (i)",
          value: String(step.textIdx),
          highlight: true,
        },
        {
          label: "Pattern Position (j)",
          value: String(step.patternIdx),
          highlight: true,
        },
        {
          label: "Comparison",
          value:
            activeText.length > 0 && activePattern.length > 0
              ? `'${activeText[step.textIdx] ?? ""}' vs '${activePattern[step.patternIdx] ?? ""}'`
              : "—",
        },
        {
          label: "Status",
          value: step.isFound
            ? "found"
            : step.shift
              ? "shift"
              : step.isMatch
                ? "match"
                : "mismatch",
          highlight: step.isFound || step.isMatch,
        },
        {
          label: "Matches Found",
          value: String(
            result
              ? result.matches.filter((m) => {
                  // count matches up to current step
                  const matchEnd = m + activePattern.length - 1;
                  return matchEnd <= step.textIdx;
                }).length
              : 0,
          ),
        },
        {
          label: "KMP Steps",
          value: String(currentStep + 1),
        },
      ]
    : [];

  return (
    <div className="algo-page" data-category="string">
      <Nav showStoryBanner />

      <div className="page-header">
        <div className="title-group">
          <h1>KMP String Search</h1>
          <div className="title-meta">
            <span className="badge">String</span>
            <ComplexityPopover
              best="O(n+m)"
              avg="O(n+m)"
              worst="O(n+m)"
              space="O(m)"
              bestNote="Linear scan"
              avgNote="Linear scan"
              worstNote="Linear scan — no backtracking"
              spaceNote="Failure function array"
              why="KMP preprocesses the pattern in O(m) to build a failure function, then scans the text in O(n) without ever stepping back. Naive search is O(nm) because it can restart from scratch on each mismatch."
            />
          </div>
        </div>
        <div className="kmp-legend">
          <span>
            <span className="swatch kmp-match-swatch" /> Match
          </span>
          <span>
            <span className="swatch kmp-mismatch-swatch" /> Mismatch
          </span>
          <span>
            <span className="swatch kmp-found-swatch" /> Found
          </span>
          <span>
            <span className="swatch kmp-current-swatch" /> Current
          </span>
        </div>
        <AlgorithmComplete />
      </div>

      <div className="content-grid">
        <div className="main-column">
          <ProblemFrame title="The Problem">
            <div className="app-section">
              <span className="app-label">Given</span>
              <p>A text string and a pattern to search for.</p>
            </div>
            <div className="app-section">
              <span className="app-label">Goal</span>
              <p>
                Find all occurrences of a pattern in a text string, efficiently
                skipping unnecessary comparisons.
              </p>
            </div>
            <div className="app-section">
              <span className="app-label">Real use cases</span>
              <p>
                Text editors (find/replace), grep, DNA sequence matching,
                intrusion detection systems.
              </p>
            </div>
          </ProblemFrame>

          <WhyComplexityPanel derivation="The failure function is built in O(m) — each character is processed at most twice (forward and fallback). The search phase scans the text in O(n) — index i never decreases, and j only falls back along previously matched positions bounded by i. Total: O(n+m). The O(m) space is for the failure function array." />

          <AnalogyPanel>
            Like searching for a word in a book — when you find a partial match
            then hit a mismatch, you do not restart from scratch. You use what
            you already know about the pattern to skip ahead, just as a careful
            reader remembers which letters already lined up.
          </AnalogyPanel>

          <div className="panel">
            <div className="controls">
              <div className="inputs">
                <label htmlFor="kmp-text">
                  Text (max {MAX_TEXT} chars)
                  <input
                    id="kmp-text"
                    type="text"
                    value={textInput}
                    onChange={(e) =>
                      setTextInput(e.target.value.slice(0, MAX_TEXT))
                    }
                    placeholder="e.g. ABABDABACDABABCABAB"
                    maxLength={MAX_TEXT}
                  />
                </label>
                <label htmlFor="kmp-pattern">
                  Pattern (max {MAX_PATTERN} chars)
                  <input
                    id="kmp-pattern"
                    type="text"
                    value={patternInput}
                    onChange={(e) =>
                      setPatternInput(e.target.value.slice(0, MAX_PATTERN))
                    }
                    placeholder="e.g. ABABCABAB"
                    maxLength={MAX_PATTERN}
                  />
                </label>
              </div>
              {error && <div className="algo-error visible">{error}</div>}
              <div className="buttons">
                <button
                  type="button"
                  className="btn-primary"
                  onClick={runSearch}
                >
                  Search
                </button>
              </div>
            </div>

            {result && activeText && activePattern && (
              <>
                <div
                  className="kmp-viz-container"
                  style={{ marginTop: "1rem" }}
                >
                  <FailureFunctionDisplay
                    pattern={activePattern}
                    failure={result.failureFunction}
                  />
                  <ComparisonView
                    text={activeText}
                    pattern={activePattern}
                    step={step}
                  />
                </div>

                {step && (
                  <div className="info" style={{ marginTop: "0.75rem" }}>
                    {step.explanation}
                  </div>
                )}

                <div className="kmp-stats-comparison">
                  <div className="kmp-stat-card">
                    <div className="kmp-stat-card-label">KMP Steps</div>
                    <div className="kmp-stat-card-value kmp-stat-highlight">
                      {result.stepCount}
                    </div>
                  </div>
                  <div className="kmp-stat-card">
                    <div className="kmp-stat-card-label">Naive Steps</div>
                    <div className="kmp-stat-card-value">{naiveSteps}</div>
                  </div>
                  <div className="kmp-stat-card">
                    <div className="kmp-stat-card-label">Matches</div>
                    <div className="kmp-stat-card-value kmp-stat-highlight">
                      {result.matches.length}
                    </div>
                  </div>
                  {result.matches.length > 0 && (
                    <div className="kmp-stat-card">
                      <div className="kmp-stat-card-label">At index</div>
                      <div className="kmp-stat-card-value">
                        {result.matches.join(", ")}
                      </div>
                    </div>
                  )}
                </div>

                {currentStep >= result.steps.length - 1 &&
                  result.steps.length > 0 && (
                    <div className="result" style={{ marginTop: "0.75rem" }}>
                      {result.matches.length > 0
                        ? `Found ${result.matches.length} match(es) at index ${result.matches.join(", ")} in ${result.stepCount} KMP step(s) vs ${naiveSteps} naive step(s).`
                        : `Pattern not found after ${result.stepCount} KMP step(s) vs ${naiveSteps} naive step(s).`}
                    </div>
                  )}

                <PlaybackController
                  steps={result.steps}
                  currentStep={currentStep}
                  onStep={setCurrentStep}
                  onReset={handleReset}
                />
              </>
            )}
          </div>
        </div>

        <div className="sidebar">
          {result && (
            <div className="stats-grid" style={{ marginBottom: "1rem" }}>
              <div className="stat-card">
                <span className="stat-value">{currentStep + 1}</span>
                <span className="stat-label">Step</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">{result.steps.length}</span>
                <span className="stat-label">Total</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">{result.matches.length}</span>
                <span className="stat-label">Matches</span>
              </div>
            </div>
          )}

          {step && <WatchPanel vars={watchVars} />}

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
