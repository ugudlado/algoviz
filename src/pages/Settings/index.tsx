import { Nav } from "@/components/Nav";
import { useAlgovizProgress } from "@/contexts/AlgovizProgressContext";
import {
  ALGORITHM_ROUTE_PATHS,
  ALGORITHM_ROUTE_PATH_SET,
} from "@/data/algorithmRoutes";
import { LEARNING_PATHS, type LearningPath } from "@/data/learningPaths";
import type { AlgorithmProgressEntry } from "@/lib/algovizProgress";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
} from "react";
import { Link } from "react-router-dom";

function formatProgressDate(iso: string): string {
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return iso.slice(0, 10);
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
  }).format(t);
}

interface AlgorithmProgressSummary {
  totalAlgos: number;
  completedCount: number;
  overallPct: number;
  earliest: string | null;
  latest: string | null;
}

function computeAlgorithmProgressSummary(
  algorithms: Record<string, AlgorithmProgressEntry>,
): AlgorithmProgressSummary {
  const totalAlgos: number = ALGORITHM_ROUTE_PATHS.length;
  let completedCount = 0;
  let earliest: string | null = null;
  let latest: string | null = null;
  for (const route of Object.keys(algorithms)) {
    if (!ALGORITHM_ROUTE_PATH_SET.has(route)) continue;
    completedCount += 1;
    const at = algorithms[route]?.completedAt;
    if (typeof at !== "string" || at.length < 10) continue;
    if (!earliest || at < earliest) earliest = at;
    if (!latest || at > latest) latest = at;
  }
  const overallPct =
    totalAlgos === 0
      ? 0
      : Math.min(100, Math.round((completedCount / totalAlgos) * 100));
  return {
    totalAlgos,
    completedCount,
    overallPct,
    earliest,
    latest,
  };
}

interface SettingsLearningPathRowProps {
  path: LearningPath;
  completed: number;
  total: number;
  pct: number;
}

function SettingsLearningPathRow({
  path,
  completed,
  total,
  pct,
}: SettingsLearningPathRowProps) {
  const linkStyle = { "--path-accent": path.accentColor } as CSSProperties;
  return (
    <li>
      <Link
        to={`/learning-paths/${path.slug}`}
        className="settings-profile-path-link"
        style={linkStyle}
      >
        <span className="settings-profile-path-icon" aria-hidden="true">
          {path.icon}
        </span>
        <span className="settings-profile-path-body">
          <span className="settings-profile-path-title">{path.title}</span>
          <span className="settings-profile-path-meta">
            {completed} / {total} steps · {pct}%
          </span>
          <span className="settings-profile-path-bar" aria-hidden="true">
            <span
              className="settings-profile-path-bar-fill"
              style={{ width: `${pct}%` }}
            />
          </span>
        </span>
        <span className="settings-profile-path-chevron" aria-hidden="true">
          →
        </span>
      </Link>
    </li>
  );
}

export default function Settings() {
  const progressFileInputRef = useRef<HTMLInputElement>(null);
  const backupDescriptionId = useId();
  const [importSuccessMessage, setImportSuccessMessage] = useState<
    string | null
  >(null);
  const {
    document,
    exportProgressJson,
    importProgressJson,
    clearAllProgress,
    getPathStats,
    importError,
    setImportError,
  } = useAlgovizProgress();

  const progressSummary = useMemo(
    () => computeAlgorithmProgressSummary(document.algorithms),
    [document.algorithms],
  );

  const activityEntries = useMemo(() => {
    const { earliest, latest } = progressSummary;
    const rows: { id: string; label: string; iso: string }[] = [];
    if (latest) {
      rows.push({ id: "last", label: "Last completion", iso: latest });
    }
    if (earliest && earliest !== latest) {
      rows.push({ id: "first", label: "First completion", iso: earliest });
    }
    return rows;
  }, [progressSummary.earliest, progressSummary.latest]);

  const handleProgressFileChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const input = e.target;
      const file = input.files?.[0];
      input.value = "";
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const text = typeof reader.result === "string" ? reader.result : "";
        const r = importProgressJson(text);
        if (!r.ok) {
          setImportError(r.error);
          setImportSuccessMessage(null);
        } else {
          setImportError(null);
          setImportSuccessMessage("Progress restored from file.");
        }
      };
      reader.readAsText(file);
    },
    [importProgressJson, setImportError],
  );

  const donutStyle = {
    "--settings-donut-pct": String(progressSummary.overallPct),
  } as CSSProperties;

  useEffect(() => {
    if (!importSuccessMessage) return;
    const t = window.setTimeout(() => setImportSuccessMessage(null), 4500);
    return () => window.clearTimeout(t);
  }, [importSuccessMessage]);

  return (
    <div
      className="algo-page"
      data-category="home"
      style={{ alignItems: "stretch", padding: 0 }}
    >
      <Nav />

      <main className="settings-page">
        <Link to="/" className="settings-back-link">
          ← Back to home
        </Link>
        <h1>Settings</h1>
        <p className="settings-page-dek">
          See how far you have come, then manage backups. Everything stays on
          this device — nothing is sent to a server.
        </p>

        <section
          className="settings-profile-card"
          aria-labelledby="settings-progress-summary-heading"
        >
          <h2
            id="settings-progress-summary-heading"
            className="settings-profile-title"
          >
            Your progress
          </h2>
          <div className="settings-profile-hero">
            <div className="settings-profile-identity">
              <div className="settings-profile-avatar" aria-hidden="true">
                AV
              </div>
              <div className="settings-profile-identity-text">
                <p className="settings-profile-label">Local learner</p>
                <p className="settings-profile-blurb">
                  Completions and path visits are stored in this browser only.
                </p>
              </div>
            </div>
            <div
              className="settings-profile-donut"
              style={donutStyle}
              role="img"
              aria-label={`${progressSummary.overallPct} percent of algorithms marked complete`}
            >
              <div className="settings-profile-donut-inner">
                <span className="settings-profile-donut-value">
                  {progressSummary.overallPct}%
                </span>
                <span className="settings-profile-donut-caption">
                  algorithms
                </span>
              </div>
            </div>
          </div>

          <p className="settings-profile-statline">
            <span className="settings-profile-statline-strong">
              {progressSummary.completedCount}
            </span>
            <span className="settings-profile-statline-of"> of </span>
            <span className="settings-profile-statline-strong">
              {progressSummary.totalAlgos}
            </span>
            <span className="settings-profile-statline-rest">
              {" "}
              algorithms marked complete.
            </span>
          </p>

          <h3 className="settings-profile-subheading">Learning paths</h3>
          <ul className="settings-profile-path-list">
            {LEARNING_PATHS.map((path) => {
              const { completed, total, pct } = getPathStats(path);
              return (
                <SettingsLearningPathRow
                  key={path.slug}
                  path={path}
                  completed={completed}
                  total={total}
                  pct={pct}
                />
              );
            })}
          </ul>

          {activityEntries.length > 0 && (
            <div className="settings-profile-activity">
              <h3 className="settings-profile-subheading">Activity</h3>
              <dl className="settings-profile-activity-dl">
                {activityEntries.map(({ id, label, iso }) => (
                  <div key={id}>
                    <dt>{label}</dt>
                    <dd>{formatProgressDate(iso)}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </section>

        <section
          className="settings-backup-card"
          aria-labelledby="settings-backup-heading"
          aria-describedby={backupDescriptionId}
        >
          <h2 id="settings-backup-heading">Backup &amp; reset</h2>
          <p className="settings-backup-lede" id={backupDescriptionId}>
            Completions are stored in this browser only. Export a JSON file to
            move progress between devices; import replaces the current state.
          </p>
          <div className="settings-backup-actions">
            <button
              type="button"
              className="settings-backup-btn"
              onClick={() => {
                exportProgressJson();
                setImportSuccessMessage(null);
              }}
            >
              Export JSON
            </button>
            <button
              type="button"
              className="settings-backup-btn"
              onClick={() => progressFileInputRef.current?.click()}
            >
              Import JSON
            </button>
            <input
              ref={progressFileInputRef}
              type="file"
              accept="application/json,.json"
              style={{ display: "none" }}
              aria-label="Import Algoviz progress JSON file"
              onChange={handleProgressFileChange}
            />
          </div>
          {importError && (
            <p
              className="settings-backup-msg settings-backup-msg--error"
              role="alert"
            >
              {importError}
            </p>
          )}
          {importSuccessMessage && (
            <p
              className="settings-backup-msg settings-backup-msg--success"
              role="status"
            >
              {importSuccessMessage}
            </p>
          )}

          <div className="settings-backup-separator">
            <p className="settings-backup-danger-label">Danger zone</p>
            <button
              type="button"
              className="settings-backup-btn settings-backup-btn--danger"
              onClick={() => {
                if (
                  window.confirm(
                    "Remove all marked completions and path visit metadata? This cannot be undone.",
                  )
                ) {
                  clearAllProgress();
                  setImportError(null);
                  setImportSuccessMessage(null);
                }
              }}
            >
              Clear all progress
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
