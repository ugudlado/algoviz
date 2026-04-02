import { Nav } from "@/components/Nav";
import { useAlgovizProgress } from "@/contexts/AlgovizProgressContext";
import {
  ALGORITHMS,
  DIFFICULTY_COLOR,
  getSpaceComplexity,
  type AlgoCard,
} from "@/data/algorithms";
import { LEARNING_PATHS, getTotalSteps } from "@/data/learningPaths";
import { useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";

const HOMEPAGE_VISIBLE_CATEGORIES = new Set([
  "sorting",
  "searching",
  "string",
  "dp",
]);

function LearningPathProgressBar({
  pct,
  accentColor,
}: {
  pct: number;
  accentColor: string;
}) {
  return (
    <div
      style={{
        height: 5,
        borderRadius: 3,
        background: "var(--border)",
        overflow: "hidden",
        marginTop: "0.65rem",
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${pct}%`,
          background: accentColor,
          transition: "width 0.25s ease-out",
        }}
      />
    </div>
  );
}

export default function Home() {
  const { getPathStats } = useAlgovizProgress();
  const spotlightCandidates = ALGORITHMS.filter(
    (a) => a.available && HOMEPAGE_VISIBLE_CATEGORIES.has(a.category),
  );
  const [spotlightAlgorithm, setSpotlightAlgorithm] = useState(() =>
    pickRandomAlgorithm(spotlightCandidates),
  );

  return (
    <div
      className="algo-page"
      data-category="home"
      style={{ alignItems: "stretch", padding: 0 }}
    >
      <Nav />

      {/* Hero */}
      <section
        style={{
          maxWidth: 1200,
          margin: "6rem auto 4rem",
          padding: "0 2rem",
          textAlign: "center",
        }}
      >
        <div
          style={{
            maxWidth: 760,
            margin: "0 auto",
            border: "1px solid var(--border)",
            borderRadius: 16,
            background:
              "repeating-linear-gradient(0deg, rgba(255,255,255,0.025) 0px, rgba(255,255,255,0.025) 1px, transparent 1px, transparent 34px), linear-gradient(180deg, rgba(22,27,34,0.95) 0%, rgba(13,17,23,0.95) 100%)",
            boxShadow: "0 16px 36px rgba(0,0,0,0.28)",
            padding: "1.45rem",
            textAlign: "left",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              borderLeft: `4px solid var(${spotlightAlgorithm.accentVar})`,
              borderRadius: 16,
              pointerEvents: "none",
            }}
          />
          <p
            style={{
              margin: 0,
              fontSize: "0.75rem",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              fontWeight: 700,
              color: "var(--text-muted)",
              fontFamily: "var(--font-mono)",
            }}
          >
            Algorithm Spotlight
          </p>
          <h2
            style={{
              margin: "0.55rem 0 0.35rem",
              fontSize: "clamp(1.3rem, 2vw, 1.75rem)",
              lineHeight: 1.12,
              letterSpacing: "-0.03em",
              color: "var(--text-primary)",
              position: "relative",
            }}
          >
            {spotlightAlgorithm.name}
          </h2>
          <p
            style={{
              margin: "0 0 1rem",
              color: "var(--text-secondary)",
              lineHeight: 1.55,
              maxWidth: 620,
            }}
          >
            {spotlightAlgorithm.description}
          </p>
          <p
            style={{
              margin: "0 0 1rem",
              color: "var(--text-muted)",
              fontSize: "0.82rem",
              fontStyle: "italic",
            }}
          >
            {getSpotlightReason(spotlightAlgorithm.category)}
          </p>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              flexWrap: "wrap",
              marginBottom: "1.15rem",
            }}
          >
            <span
              style={{
                fontSize: "0.72rem",
                padding: "0.22rem 0.6rem",
                borderRadius: 6,
                color: `var(${spotlightAlgorithm.accentVar})`,
                border: `1px solid color-mix(in srgb, var(${spotlightAlgorithm.accentVar}) 50%, var(--border))`,
                background: "rgba(13,17,23,0.85)",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
            >
              {spotlightAlgorithm.categoryLabel}
            </span>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                color: "var(--text-secondary)",
                fontSize: "0.78rem",
                padding: "0.2rem 0.5rem",
                borderRadius: 6,
                border: "1px solid var(--border)",
                background: "rgba(13,17,23,0.7)",
              }}
            >
              Time: {spotlightAlgorithm.complexity}
            </span>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                color: "var(--text-secondary)",
                fontSize: "0.78rem",
                padding: "0.2rem 0.5rem",
                borderRadius: 6,
                border: "1px solid var(--border)",
                background: "rgba(13,17,23,0.7)",
              }}
            >
              Space: {getSpaceComplexity(spotlightAlgorithm.name)}
            </span>
            <span
              style={{
                color: DIFFICULTY_COLOR[spotlightAlgorithm.difficulty],
                fontSize: "0.78rem",
                fontWeight: 600,
                padding: "0.2rem 0.5rem",
                borderRadius: 6,
                border:
                  "1px solid color-mix(in srgb, currentColor 40%, transparent)",
                background: "rgba(13,17,23,0.7)",
              }}
            >
              {spotlightAlgorithm.difficulty}
            </span>
          </div>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <Link
              to={spotlightAlgorithm.path}
              style={{
                padding: "0.65rem 1.15rem",
                borderRadius: 8,
                fontWeight: 600,
                fontSize: "0.9rem",
                cursor: "pointer",
                textDecoration: "none",
                background: "var(--accent)",
                color: "#00131f",
                border: "1px solid rgba(0,0,0,0.18)",
                boxShadow: "0 2px 0 rgba(0,0,0,0.24)",
              }}
            >
              Run this algorithm →
            </Link>
            <button
              type="button"
              onClick={() => {
                setSpotlightAlgorithm((current) =>
                  pickRandomAlgorithm(spotlightCandidates, current.name),
                );
              }}
              style={{
                padding: "0.65rem 1.15rem",
                borderRadius: 8,
                fontWeight: 600,
                fontSize: "0.9rem",
                cursor: "pointer",
                background: "rgba(13,17,23,0.72)",
                color: "var(--text-primary)",
                border: "1px solid var(--border)",
              }}
            >
              Pick another challenge
            </button>
          </div>
        </div>
      </section>

      {/* Learning Paths */}
      <section
        id="learning-paths"
        style={{
          maxWidth: 1200,
          margin: "0 auto 4rem",
          padding: "0 2rem",
          width: "100%",
        }}
      >
        <h2
          style={{
            fontSize: "1.5rem",
            fontWeight: 700,
            marginBottom: "0.5rem",
            letterSpacing: "-0.02em",
          }}
        >
          Learning Paths
        </h2>
        <p
          style={{
            color: "var(--text-muted)",
            fontSize: "0.9rem",
            marginBottom: "0.35rem",
          }}
        >
          Follow a narrative to learn algorithms in context — each path connects
          algorithms through a story.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {LEARNING_PATHS.map((path) => {
            const { completed, total, pct } = getPathStats(path);
            const unit =
              path.slug === "algorithm-detective" ? "cases" : "chapters";
            return (
              <Link
                key={path.slug}
                className="home-learning-path-card"
                to={`/learning-paths/${path.slug}`}
                style={
                  {
                    ["--path-accent"]: path.accentColor,
                  } as CSSProperties
                }
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.6rem",
                    marginBottom: "0.5rem",
                  }}
                >
                  <span style={{ fontSize: "1.5rem" }}>{path.icon}</span>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: "1.05rem",
                      fontWeight: 700,
                      color: path.accentColor,
                    }}
                  >
                    {path.title}
                  </h3>
                </div>
                <p
                  style={{
                    margin: "0 0 0.75rem",
                    fontSize: "0.82rem",
                    color: "var(--text-secondary)",
                    lineHeight: 1.5,
                  }}
                >
                  {path.tagline}
                </p>
                <div
                  style={{
                    fontSize: "0.72rem",
                    color: "var(--text-muted)",
                    marginBottom: "0.15rem",
                  }}
                >
                  {completed} / {total} {unit} complete
                </div>
                <LearningPathProgressBar
                  pct={pct}
                  accentColor={path.accentColor}
                />
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontSize: "0.75rem",
                    color: "var(--text-muted)",
                    marginTop: "0.65rem",
                  }}
                >
                  <span>
                    {getTotalSteps(path)} algorithms · {path.tiers.length}{" "}
                    {path.tiers.length === 1 ? "chapter" : "tiers"}
                  </span>
                  <span style={{ color: path.accentColor, fontWeight: 600 }}>
                    Explore →
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Browse All CTA */}
      <section
        style={{
          maxWidth: 1200,
          margin: "0 auto 6rem",
          padding: "0 2rem",
          width: "100%",
          textAlign: "center",
        }}
      >
        <Link
          to="/algorithms"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.85rem 2rem",
            borderRadius: 10,
            fontWeight: 700,
            fontSize: "1rem",
            textDecoration: "none",
            background: "var(--bg-secondary)",
            color: "var(--text-primary)",
            border: "1px solid var(--border)",
            transition: "border-color 0.2s, transform 0.15s",
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget;
            el.style.borderColor = "var(--accent)";
            el.style.transform = "translateY(-2px)";
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget;
            el.style.borderColor = "var(--border)";
            el.style.transform = "";
          }}
        >
          Browse all {ALGORITHMS.length} algorithms →
        </Link>
      </section>
    </div>
  );
}

function pickRandomAlgorithm(
  algorithms: AlgoCard[],
  excludeName?: string,
): AlgoCard {
  if (algorithms.length === 0) {
    throw new Error("No algorithm candidates available for spotlight.");
  }
  const candidates = excludeName
    ? algorithms.filter((algorithm) => algorithm.name !== excludeName)
    : algorithms;
  const pool = candidates.length > 0 ? candidates : algorithms;
  const randomIndex = Math.floor(Math.random() * pool.length);
  return pool[randomIndex];
}

function getSpotlightReason(category: string): string {
  switch (category) {
    case "sorting":
      return "Why this pick: great for building intuition about step-by-step state changes.";
    case "searching":
      return "Why this pick: ideal for learning how to shrink a problem space efficiently.";
    case "dp":
      return "Why this pick: helps you see overlapping subproblems and reuse in action.";
    case "string":
      return "Why this pick: useful for interview-style pattern matching practice.";
    default:
      return "Why this pick: strong visual signal-to-concept ratio for quick learning.";
  }
}
