import { useMemo, useState } from "react";
import { Nav } from "@/components/Nav";
import { AlgorithmComplete } from "@/components/AlgorithmComplete";
import { PlaybackController } from "@/components/PlaybackController";
import { WatchPanel } from "@/components/WatchPanel";
import { ComplexityPopover } from "@/components/ComplexityPopover";
import { AnalogyPanel } from "@/components/AnalogyPanel";
import { ProblemFrame } from "@/components/ProblemFrame";
import { WhyComplexityPanel } from "@/components/WhyComplexityPanel";
import { MAX_SIZE, runStableMatching } from "@/lib/algorithms/gale-shapley";
import "@/styles/gale-shapley.css";

interface PageMatchingInput {
  proposers: string[];
  acceptors: string[];
  proposerPreferences: Record<string, string[]>;
  acceptorPreferences: Record<string, string[]>;
}

const PSEUDO_LINES = [
  "free proposers exist:",
  "  p = first free proposer",
  "  a = highest-ranked unproposed acceptor",
  "  p proposes to a",
  "  if a is free: tentatively accept p",
  "  else if a prefers p to current partner:",
  "    swap partners and free old proposer",
  "  else reject p",
];

function createNames(prefix: string, n: number): string[] {
  return Array.from({ length: n }, (_, i) => `${prefix}${i + 1}`);
}

function rotate<T>(arr: T[], shift: number): T[] {
  const out: T[] = [];
  for (let i = 0; i < arr.length; i++) {
    out.push(arr[(i + shift) % arr.length]!);
  }
  return out;
}

function generateInput(size: number): PageMatchingInput {
  const proposers = createNames("S", size);
  const acceptors = createNames("H", size);
  const proposerPreferences: Record<string, string[]> = {};
  const acceptorPreferences: Record<string, string[]> = {};
  proposers.forEach((p, i) => {
    proposerPreferences[p] = rotate(acceptors, i);
  });
  acceptors.forEach((a, i) => {
    acceptorPreferences[a] = rotate(proposers, size - i - 1);
  });
  return { proposers, acceptors, proposerPreferences, acceptorPreferences };
}

function toPreferenceText(
  names: string[],
  prefs: Record<string, string[]>,
): string {
  return names.map((name) => `${name}: ${prefs[name]!.join(",")}`).join("\n");
}

function parsePreferenceText(
  raw: string,
  expectedNames: string[],
): Record<string, string[]> {
  const lines = raw
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
  const out: Record<string, string[]> = {};
  lines.forEach((line) => {
    const parts = line.split(":");
    if (parts.length !== 2) {
      throw new Error(`Invalid preference line: ${line}`);
    }
    const name = parts[0]!.trim();
    const list = parts[1]!
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    out[name] = list;
  });
  expectedNames.forEach((name) => {
    if (!out[name]) {
      throw new Error(`Missing preference list for ${name}.`);
    }
  });
  return out;
}

function parseNames(raw: string): string[] {
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function GaleShapleyPage() {
  const [size, setSize] = useState(4);
  const [input, setInput] = useState<PageMatchingInput>(() => generateInput(4));
  const [proposerNamesText, setProposerNamesText] = useState("S1,S2,S3,S4");
  const [acceptorNamesText, setAcceptorNamesText] = useState("H1,H2,H3,H4");
  const [proposerPrefsText, setProposerPrefsText] = useState(() =>
    toPreferenceText(input.proposers, input.proposerPreferences),
  );
  const [acceptorPrefsText, setAcceptorPrefsText] = useState(() =>
    toPreferenceText(input.acceptors, input.acceptorPreferences),
  );
  const [error, setError] = useState("");
  const [stepIdx, setStepIdx] = useState(0);

  const result = useMemo(() => {
    try {
      const computed = runStableMatching(input);
      return computed;
    } catch (e) {
      return e instanceof Error ? e.message : "Failed to run algorithm.";
    }
  }, [input]);

  const resultError = typeof result === "string" ? result : "";
  const steps = typeof result === "string" ? [] : result.steps;
  const step =
    steps.length > 0 ? steps[Math.min(stepIdx, steps.length - 1)] : null;
  const safeStepIdx = Math.min(stepIdx, Math.max(0, steps.length - 1));

  const watchVars = step
    ? [
        { label: "Proposal #", value: step.proposalNumber },
        {
          label: "Step Type",
          value: step.type,
          highlight: step.type === "proposal" || step.type === "swap",
        },
        { label: "Proposer", value: step.proposer ?? "—" },
        { label: "Acceptor", value: step.acceptor ?? "—" },
      ]
    : [];

  const codeLine =
    step?.type === "proposal"
      ? 3
      : step?.type === "accept"
        ? 4
        : step?.type === "swap"
          ? 6
          : step?.type === "reject"
            ? 7
            : 0;

  function loadGenerated(nextSize: number) {
    const generated = generateInput(nextSize);
    setInput(generated);
    setProposerNamesText(generated.proposers.join(","));
    setAcceptorNamesText(generated.acceptors.join(","));
    setProposerPrefsText(
      toPreferenceText(generated.proposers, generated.proposerPreferences),
    );
    setAcceptorPrefsText(
      toPreferenceText(generated.acceptors, generated.acceptorPreferences),
    );
    setError("");
    setStepIdx(0);
  }

  function applyCustomInput() {
    try {
      const proposers = parseNames(proposerNamesText);
      const acceptors = parseNames(acceptorNamesText);
      const proposerPreferences = parsePreferenceText(
        proposerPrefsText,
        proposers,
      );
      const acceptorPreferences = parsePreferenceText(
        acceptorPrefsText,
        acceptors,
      );
      const nextInput = {
        proposers,
        acceptors,
        proposerPreferences,
        acceptorPreferences,
      };
      runStableMatching(nextInput);
      setInput(nextInput);
      setError("");
      setStepIdx(0);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Could not parse custom input.",
      );
    }
  }

  return (
    <div className="algo-page" data-category="graph">
      <Nav showStoryBanner />
      <div className="page-header">
        <div className="title-group">
          <h1>Gale-Shapley Stable Matching</h1>
          <div className="title-meta">
            <span className="badge">Graph</span>
            <ComplexityPopover
              best="O(n²)"
              avg="O(n²)"
              worst="O(n²)"
              space="O(n²)"
              bestNote="Each proposer proposes at most n times"
              avgNote="Proposal count bounded by n²"
              worstNote="Complete preference traversal"
              spaceNote="Preference + rank tables"
              why="Each proposer can propose to each acceptor at most once. With n proposers and n acceptors, proposals are bounded by n²."
            />
          </div>
        </div>
        <AlgorithmComplete />
      </div>

      <div className="content-grid">
        <div className="main-column">
          <ProblemFrame title="The Problem">
            <div className="app-section">
              <span className="app-label">Goal</span>
              <p>
                Pair students and hospitals so no student-hospital pair would
                both prefer each other over their assigned partners.
              </p>
            </div>
          </ProblemFrame>

          <WhyComplexityPanel derivation="At most n² proposals occur because each proposer advances through a finite preference list and never proposes to the same acceptor twice." />

          <AnalogyPanel>
            Residency matching: medical students apply to hospitals in
            preference order, hospitals hold their favorite tentative applicant,
            and final matches are stable when no student-hospital pair mutually
            prefers a swap.
          </AnalogyPanel>

          <div className="panel">
            <fieldset className="gs-fieldset">
              <legend className="gs-legend">Input Controls</legend>
              <div className="controls">
                <div className="inputs">
                  <label htmlFor="gs-size">
                    Group Size (1-{MAX_SIZE})
                    <input
                      id="gs-size"
                      type="number"
                      min={1}
                      max={MAX_SIZE}
                      value={size}
                      onChange={(e) =>
                        setSize(
                          Math.max(
                            1,
                            Math.min(MAX_SIZE, Number(e.target.value) || 1),
                          ),
                        )
                      }
                    />
                  </label>
                </div>
                <div className="buttons">
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => loadGenerated(size)}
                  >
                    Generate Preferences
                  </button>
                  <button type="button" onClick={() => setStepIdx(0)}>
                    Restart Playback
                  </button>
                </div>
              </div>
            </fieldset>

            <fieldset className="gs-fieldset">
              <legend className="gs-legend">Custom Preferences</legend>
              <div className="gs-text-grid">
                <label htmlFor="gs-proposers">
                  Proposers (comma-separated)
                  <input
                    id="gs-proposers"
                    type="text"
                    value={proposerNamesText}
                    maxLength={320}
                    onChange={(e) => setProposerNamesText(e.target.value)}
                  />
                </label>
                <label htmlFor="gs-acceptors">
                  Acceptors (comma-separated)
                  <input
                    id="gs-acceptors"
                    type="text"
                    value={acceptorNamesText}
                    maxLength={320}
                    onChange={(e) => setAcceptorNamesText(e.target.value)}
                  />
                </label>
                <label htmlFor="gs-prefs-p">
                  Proposer Preferences (one per line: Name: A,B,C)
                  <textarea
                    id="gs-prefs-p"
                    value={proposerPrefsText}
                    maxLength={8000}
                    onChange={(e) => setProposerPrefsText(e.target.value)}
                  />
                </label>
                <label htmlFor="gs-prefs-a">
                  Acceptor Preferences (one per line: Name: A,B,C)
                  <textarea
                    id="gs-prefs-a"
                    value={acceptorPrefsText}
                    maxLength={8000}
                    onChange={(e) => setAcceptorPrefsText(e.target.value)}
                  />
                </label>
              </div>
              <div className="buttons" style={{ marginTop: "0.8rem" }}>
                <button type="button" onClick={applyCustomInput}>
                  Apply Custom Input
                </button>
              </div>
            </fieldset>

            <div className="info" style={{ marginTop: "0.75rem" }}>
              {error ||
                resultError ||
                step?.description ||
                "Run input generation to begin."}
            </div>

            {steps.length > 0 && (
              <PlaybackController
                steps={steps}
                currentStep={safeStepIdx}
                onStep={(n) =>
                  setStepIdx(Math.max(0, Math.min(steps.length - 1, n)))
                }
                onReset={() => setStepIdx(0)}
              />
            )}
          </div>

          {step && (
            <div className="panel">
              <div className="panel-title">Tentative Engagements</div>
              <div className="gs-pairs-grid">
                {Object.entries(step.matches).map(([acceptor, proposer]) => (
                  <div className="gs-pair-card" key={acceptor}>
                    <div className="gs-pair-title">{acceptor}</div>
                    <div className="gs-pair-value">
                      {proposer ?? "unmatched"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {typeof result !== "string" && (
            <div className="panel">
              <div className="panel-title">
                Final Stability: {result.isStable ? "Stable" : "Not Stable"}
              </div>
              <div className="gs-outcome-grid">
                <div>
                  <h3 className="gs-subtitle">Student Outcome Rank</h3>
                  {result.proposerOutcome.map((row) => (
                    <div key={row.proposer} className="gs-row">
                      <span>{row.proposer}</span>
                      <span>
                        {row.acceptor ?? "—"} (#{row.rank ?? "—"})
                      </span>
                    </div>
                  ))}
                </div>
                <div>
                  <h3 className="gs-subtitle">Hospital Outcome Rank</h3>
                  {result.acceptorOutcome.map((row) => (
                    <div key={row.acceptor} className="gs-row">
                      <span>{row.acceptor}</span>
                      <span>
                        {row.proposer ?? "—"} (#{row.rank ?? "—"})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="sidebar">
          {watchVars.length > 0 && <WatchPanel vars={watchVars} />}
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
