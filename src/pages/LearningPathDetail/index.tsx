import { Nav } from "@/components/Nav";
import { useAlgovizProgress } from "@/contexts/AlgovizProgressContext";
import { useEffect, type CSSProperties } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import {
  getPathBySlug,
  getTotalSteps,
  type PathStep,
  type PathTier,
} from "@/data/learningPaths";

const TIER_BADGE_COLORS: Record<string, string> = {
  Rookie: "#3fb950",
  Inspector: "#d29922",
  Chief: "#f85149",
  Chapters: "#58a6ff",
};

function ProgressBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Path progress, ${pct} percent`}
      style={{
        height: 6,
        borderRadius: 3,
        background: "var(--border)",
        overflow: "hidden",
        maxWidth: 360,
        marginTop: "0.75rem",
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${pct}%`,
          background: color,
          transition: "width 0.25s ease-out",
        }}
      />
    </div>
  );
}

function StepCard({
  step,
  index,
  completed,
  onToggle,
  tierAccent,
  pathSlug,
}: {
  step: PathStep;
  index: number;
  completed: boolean;
  onToggle: () => void;
  tierAccent: string;
  pathSlug: string;
}) {
  const vizLink = `${step.algorithmPath}?lp=${pathSlug}&step=${step.id}`;

  return (
    <article
      className={`lp-step-card${completed ? " lp-step-card--complete" : ""}`}
      style={{ ["--lp-tier-accent"]: tierAccent } as CSSProperties}
    >
      <div className="lp-step-card-top">
        <button
          type="button"
          className="lp-step-check"
          onClick={onToggle}
          aria-pressed={completed}
          title={
            completed
              ? "Marked complete — click to unmark"
              : "Mark as completed"
          }
          aria-label={completed ? "Mark as not completed" : "Mark as completed"}
        >
          {completed ? <span aria-hidden>✓</span> : null}
        </button>
        <div className="lp-step-head">
          <span className="lp-step-num" aria-hidden>
            {index + 1}
          </span>
          <h3 className="lp-step-title">{step.name}</h3>
        </div>
      </div>

      <div className="lp-lesson-sections">
        <div className="lp-lesson-section">
          <span className="lp-lesson-icon" aria-hidden>
            📖
          </span>
          <div>
            <div className="lp-lesson-label">Story</div>
            <div className="lp-lesson-text">{step.narrative}</div>
          </div>
        </div>
        <div className="lp-lesson-section">
          <span className="lp-lesson-icon" aria-hidden>
            🌍
          </span>
          <div>
            <div className="lp-lesson-label">Real-World Analogy</div>
            <div className="lp-lesson-text">{step.analogy}</div>
          </div>
        </div>
        <div className="lp-lesson-section">
          <span className="lp-lesson-icon" aria-hidden>
            💡
          </span>
          <div>
            <div className="lp-lesson-label">Key Takeaway</div>
            <div className="lp-lesson-text">{step.takeaway}</div>
          </div>
        </div>
      </div>

      <div className="lp-step-foot">
        <span className="lp-step-setting">📍 {step.setting}</span>
        <Link className="lp-step-open" to={vizLink}>
          Open visualization →
        </Link>
      </div>
    </article>
  );
}

function TierSection({
  tier,
  globalOffset,
  isAlgorithmComplete,
  toggleAlgorithmComplete,
  pathSlug,
}: {
  tier: PathTier;
  globalOffset: number;
  isAlgorithmComplete: (algorithmPath: string) => boolean;
  toggleAlgorithmComplete: (algorithmPath: string) => void;
  pathSlug: string;
}) {
  const badgeColor = TIER_BADGE_COLORS[tier.name] ?? "#58a6ff";

  return (
    <section style={{ marginBottom: "2.5rem" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          marginBottom: "0.5rem",
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: "1.25rem",
            fontWeight: 700,
            color: badgeColor,
          }}
        >
          {tier.name}
        </h2>
        <span
          style={{
            fontSize: "0.72rem",
            padding: "0.18rem 0.5rem",
            borderRadius: 6,
            border: `1px solid color-mix(in srgb, ${badgeColor} 40%, transparent)`,
            color: badgeColor,
            fontWeight: 600,
          }}
        >
          {tier.steps.length} {tier.steps.length === 1 ? "case" : "cases"}
        </span>
      </div>
      <p
        style={{
          color: "var(--text-muted)",
          fontSize: "0.85rem",
          marginBottom: "1.25rem",
        }}
      >
        {tier.description}
      </p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: "1rem",
        }}
      >
        {tier.steps.map((step, i) => (
          <StepCard
            key={step.id}
            step={step}
            index={globalOffset + i}
            tierAccent={badgeColor}
            pathSlug={pathSlug}
            completed={isAlgorithmComplete(step.algorithmPath)}
            onToggle={() => toggleAlgorithmComplete(step.algorithmPath)}
          />
        ))}
      </div>
    </section>
  );
}

export default function LearningPathDetail() {
  const { slug } = useParams<{ slug: string }>();
  const path = slug ? getPathBySlug(slug) : undefined;
  const {
    getPathStats,
    isAlgorithmComplete,
    toggleAlgorithmComplete,
    recordPathVisit,
    clearPathMetaForSlug,
  } = useAlgovizProgress();

  useEffect(() => {
    if (path?.slug) recordPathVisit(path.slug);
  }, [path?.slug, recordPathVisit]);

  if (!path) {
    return <Navigate to="/" replace />;
  }

  const totalSteps = getTotalSteps(path);
  const { completed, pct } = getPathStats(path);
  const unitLabel = path.slug === "algorithm-detective" ? "cases" : "chapters";
  let offset = 0;

  return (
    <div
      className="algo-page"
      data-category="home"
      style={{ alignItems: "stretch", padding: 0 }}
    >
      <Nav />

      <div
        style={{
          maxWidth: 1000,
          margin: "6rem auto 4rem",
          padding: "0 2rem",
        }}
      >
        <Link
          to="/#learning-paths"
          style={{
            color: "var(--text-muted)",
            fontSize: "0.82rem",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.3rem",
            marginBottom: "1.5rem",
          }}
        >
          ← Back to Learning Paths
        </Link>

        <div style={{ marginBottom: "2.5rem" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              marginBottom: "0.5rem",
            }}
          >
            <span style={{ fontSize: "2rem" }}>{path.icon}</span>
            <h1
              style={{
                margin: 0,
                fontSize: "clamp(1.5rem, 3vw, 2rem)",
                fontWeight: 800,
                letterSpacing: "-0.03em",
                color: "var(--text-primary)",
              }}
            >
              {path.title}
            </h1>
          </div>
          <p
            style={{
              margin: "0.5rem 0 0",
              fontSize: "1rem",
              color: "var(--text-secondary)",
              lineHeight: 1.6,
              maxWidth: 700,
            }}
          >
            {path.description}
          </p>
          <p
            style={{
              margin: "1rem 0 0",
              fontSize: "0.85rem",
              color: "var(--text-muted)",
            }}
          >
            Progress is saved per visualization (algorithm page). Steps here
            share the same completion state as the home grid and nav control.
          </p>
          <div
            style={{
              fontSize: "0.82rem",
              color: "var(--text-secondary)",
              marginTop: "0.35rem",
            }}
          >
            {completed} / {totalSteps} {unitLabel} complete ({pct}%)
          </div>
          <ProgressBar pct={pct} color={path.accentColor} />
          <div style={{ marginTop: "0.85rem" }}>
            <button
              type="button"
              className="learning-path-meta-btn"
              onClick={() => {
                if (
                  window.confirm(
                    "Clear last-visited metadata for this path only? Your algorithm completions stay — they are global.",
                  )
                ) {
                  clearPathMetaForSlug(path.slug);
                }
              }}
            >
              Reset path visit time
            </button>
          </div>
          <div
            style={{
              display: "flex",
              gap: "0.75rem",
              marginTop: "1rem",
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                fontSize: "0.78rem",
                padding: "0.25rem 0.6rem",
                borderRadius: 6,
                border: "1px solid var(--border)",
                color: "var(--text-muted)",
                background: "rgba(13,17,23,0.7)",
              }}
            >
              {totalSteps} algorithms
            </span>
            <span
              style={{
                fontSize: "0.78rem",
                padding: "0.25rem 0.6rem",
                borderRadius: 6,
                border: "1px solid var(--border)",
                color: "var(--text-muted)",
                background: "rgba(13,17,23,0.7)",
              }}
            >
              {path.tiers.length}{" "}
              {path.tiers.length === 1 ? "chapter" : "tiers"}
            </span>
          </div>
        </div>

        {path.tiers.map((tier) => {
          const section = (
            <TierSection
              key={tier.name}
              tier={tier}
              globalOffset={offset}
              isAlgorithmComplete={isAlgorithmComplete}
              toggleAlgorithmComplete={toggleAlgorithmComplete}
              pathSlug={path.slug}
            />
          );
          offset += tier.steps.length;
          return section;
        })}
      </div>
    </div>
  );
}
