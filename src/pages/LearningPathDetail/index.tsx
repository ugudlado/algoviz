import { Nav } from "@/components/Nav";
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

function StepCard({ step, index }: { step: PathStep; index: number }) {
  return (
    <Link
      to={step.algorithmPath}
      style={{
        display: "block",
        textDecoration: "none",
        color: "inherit",
        background: "var(--bg-secondary)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        padding: "1.25rem",
        transition: "border-color 0.2s, transform 0.15s",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLAnchorElement;
        el.style.borderColor = "var(--accent)";
        el.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLAnchorElement;
        el.style.borderColor = "var(--border)";
        el.style.transform = "";
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          marginBottom: "0.75rem",
        }}
      >
        <span
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            background: "rgba(88,166,255,0.12)",
            border: "1px solid rgba(88,166,255,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "0.78rem",
            fontWeight: 700,
            color: "#58a6ff",
            flexShrink: 0,
          }}
        >
          {index + 1}
        </span>
        <h3
          style={{
            margin: 0,
            fontSize: "1rem",
            fontWeight: 700,
            color: "var(--text-primary)",
          }}
        >
          {step.name}
        </h3>
      </div>
      <p
        style={{
          margin: "0 0 0.75rem",
          fontSize: "0.85rem",
          color: "var(--text-secondary)",
          lineHeight: 1.55,
        }}
      >
        {step.narrative}
      </p>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          fontSize: "0.75rem",
          color: "var(--text-muted)",
        }}
      >
        <span
          style={{
            padding: "0.15rem 0.5rem",
            borderRadius: 6,
            border: "1px solid var(--border)",
            background: "rgba(13,17,23,0.7)",
          }}
        >
          📍 {step.setting}
        </span>
        <span style={{ marginLeft: "auto", color: "var(--accent)" }}>
          Open visualization →
        </span>
      </div>
    </Link>
  );
}

function TierSection({
  tier,
  globalOffset,
}: {
  tier: PathTier;
  globalOffset: number;
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
          <StepCard key={step.id} step={step} index={globalOffset + i} />
        ))}
      </div>
    </section>
  );
}

export default function LearningPathDetail() {
  const { slug } = useParams<{ slug: string }>();
  const path = slug ? getPathBySlug(slug) : undefined;

  if (!path) {
    return <Navigate to="/" replace />;
  }

  const totalSteps = getTotalSteps(path);
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
        {/* Header */}
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

        {/* Tiers */}
        {path.tiers.map((tier) => {
          const section = (
            <TierSection key={tier.name} tier={tier} globalOffset={offset} />
          );
          offset += tier.steps.length;
          return section;
        })}
      </div>
    </div>
  );
}
