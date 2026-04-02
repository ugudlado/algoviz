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
        height: 4,
        borderRadius: 2,
        background: "var(--border)",
        overflow: "hidden",
        maxWidth: 320,
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
          <h3 className="lp-step-title">
            {step.name}
            <span
              style={{
                fontSize: "0.72rem",
                color: "var(--text-muted)",
                fontWeight: 400,
                marginLeft: "0.5rem",
              }}
            >
              {step.setting}
            </span>
          </h3>
        </div>
      </div>

      <p
        style={{
          margin: "0.35rem 0 0.5rem",
          fontSize: "0.85rem",
          color: "var(--text-secondary)",
          lineHeight: 1.55,
          fontStyle: "italic",
          paddingLeft: "2.1rem",
        }}
      >
        {step.narrative}
      </p>

      <p
        style={{
          margin: "0 0 0.5rem",
          fontSize: "0.8rem",
          color: "var(--text-muted)",
          lineHeight: 1.5,
          paddingLeft: "2.1rem",
          borderLeft: `2px solid color-mix(in srgb, ${tierAccent} 30%, transparent)`,
          marginLeft: "2.1rem",
          paddingTop: "0.15rem",
          paddingBottom: "0.15rem",
        }}
      >
        {step.takeaway}
      </p>

      <div className="lp-step-foot">
        <Link className="lp-step-open" to={vizLink}>
          {completed ? "Review →" : "Begin chapter →"}
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
    <section style={{ marginBottom: "2rem" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.6rem",
          marginBottom: "0.35rem",
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: "1.1rem",
            fontWeight: 700,
            color: badgeColor,
          }}
        >
          {tier.name}
        </h2>
        <span
          style={{
            fontSize: "0.7rem",
            color: "var(--text-muted)",
          }}
        >
          {tier.steps.length} {tier.steps.length === 1 ? "step" : "steps"}
        </span>
      </div>
      <p
        style={{
          color: "var(--text-muted)",
          fontSize: "0.82rem",
          marginBottom: "1rem",
        }}
      >
        {tier.description}
      </p>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
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
          maxWidth: 720,
          margin: "5rem auto 4rem",
          padding: "0 2rem",
        }}
      >
        <Link
          to="/#learning-paths"
          style={{
            color: "var(--text-muted)",
            fontSize: "0.78rem",
            textDecoration: "none",
            marginBottom: "1rem",
            display: "inline-block",
          }}
        >
          ← Learning Paths
        </Link>

        {/* Compact header */}
        <div style={{ marginBottom: "2rem" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.6rem",
              marginBottom: "0.35rem",
            }}
          >
            <span style={{ fontSize: "1.5rem" }}>{path.icon}</span>
            <h1
              style={{
                margin: 0,
                fontSize: "clamp(1.3rem, 3vw, 1.75rem)",
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
              margin: "0.25rem 0 0.75rem",
              fontSize: "0.88rem",
              color: "var(--text-secondary)",
            }}
          >
            {path.tagline}
          </p>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              marginBottom: "0.35rem",
            }}
          >
            <span
              style={{
                fontSize: "0.78rem",
                color: "var(--text-muted)",
              }}
            >
              {completed > 0
                ? `${completed} / ${totalSteps} ${unitLabel} complete`
                : `${totalSteps} ${unitLabel}`}
            </span>
          </div>
          <ProgressBar pct={pct} color={path.accentColor} />
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
