import { Nav } from "@/components/Nav";
import { useAlgovizProgress } from "@/contexts/AlgovizProgressContext";
import { ALGORITHMS, DIFFICULTY_COLOR, type AlgoCard } from "@/data/algorithms";
import { LEARNING_PATHS, getTotalSteps } from "@/data/learningPaths";
import { useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";

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
        marginTop: "0.5rem",
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
  const spotlightCandidates = ALGORITHMS.filter((a) => a.available);
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

      {/* Spotlight */}
      <section
        style={{
          maxWidth: 1200,
          margin: "5rem auto 2.5rem",
          padding: "0 2rem",
          textAlign: "center",
        }}
      >
        <div
          style={{
            maxWidth: 680,
            margin: "0 auto",
            border: "1px solid var(--border)",
            borderRadius: 12,
            background: "var(--bg-secondary)",
            padding: "1.5rem",
            textAlign: "left",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              bottom: 0,
              width: 3,
              background: `var(${spotlightAlgorithm.accentVar})`,
            }}
          />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "0.5rem",
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: "0.7rem",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                fontWeight: 700,
                color: "var(--text-muted)",
                fontFamily: "var(--font-mono)",
              }}
            >
              Algorithm Spotlight
            </p>
            <div
              style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}
            >
              <span
                style={{
                  fontSize: "0.68rem",
                  color: `var(${spotlightAlgorithm.accentVar})`,
                  fontWeight: 600,
                }}
              >
                {spotlightAlgorithm.categoryLabel}
              </span>
              <span
                style={{
                  width: 3,
                  height: 3,
                  borderRadius: "50%",
                  background: "var(--text-muted)",
                }}
              />
              <span
                style={{
                  fontSize: "0.68rem",
                  color: DIFFICULTY_COLOR[spotlightAlgorithm.difficulty],
                  fontWeight: 600,
                }}
              >
                {spotlightAlgorithm.difficulty}
              </span>
            </div>
          </div>
          <h2
            style={{
              margin: "0 0 0.4rem",
              fontSize: "clamp(1.2rem, 2vw, 1.5rem)",
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
              color: "var(--text-primary)",
            }}
          >
            {spotlightAlgorithm.name}
          </h2>
          <p
            style={{
              margin: "0 0 0.5rem",
              color: "var(--text-secondary)",
              lineHeight: 1.55,
              fontSize: "0.88rem",
            }}
          >
            {spotlightAlgorithm.description}
          </p>
          <p
            style={{
              margin: "0 0 1rem",
              fontFamily: "var(--font-mono)",
              fontSize: "0.72rem",
              color: "var(--text-muted)",
            }}
          >
            {spotlightAlgorithm.complexity} time
          </p>
          <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
            <Link
              to={spotlightAlgorithm.path}
              style={{
                padding: "0.55rem 1rem",
                borderRadius: 6,
                fontWeight: 600,
                fontSize: "0.85rem",
                cursor: "pointer",
                textDecoration: "none",
                background: `var(${spotlightAlgorithm.accentVar})`,
                color: "#000",
                border: "none",
              }}
            >
              Visualize →
            </Link>
            <button
              type="button"
              onClick={() => {
                setSpotlightAlgorithm((current) =>
                  pickRandomAlgorithm(spotlightCandidates, current.name),
                );
              }}
              style={{
                padding: "0.55rem 1rem",
                borderRadius: 6,
                fontWeight: 600,
                fontSize: "0.85rem",
                cursor: "pointer",
                background: "transparent",
                color: "var(--text-muted)",
                border: "1px solid var(--border)",
              }}
            >
              Shuffle
            </button>
          </div>
        </div>
      </section>

      {/* Learning Paths */}
      <section
        id="learning-paths"
        style={{
          maxWidth: 1200,
          margin: "0 auto 2.5rem",
          padding: "0 2rem",
          width: "100%",
        }}
      >
        <h2
          style={{
            fontSize: "1.25rem",
            fontWeight: 700,
            marginBottom: "0.25rem",
            letterSpacing: "-0.02em",
          }}
        >
          Learning Paths
        </h2>
        <p
          style={{
            color: "var(--text-muted)",
            fontSize: "0.85rem",
            marginBottom: "1rem",
          }}
        >
          Learn algorithms through story-driven challenges.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))",
            gap: "1.25rem",
          }}
        >
          {LEARNING_PATHS.map((path) => {
            const { completed, total, pct } = getPathStats(path);
            const unit =
              path.slug === "algorithm-detective" ? "cases" : "chapters";
            const allSteps = path.tiers.flatMap((t) => t.steps);
            const previewSteps = allSteps.slice(0, 3);
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
                    marginBottom: "0.35rem",
                  }}
                >
                  <span style={{ fontSize: "1.4rem" }}>{path.icon}</span>
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
                    margin: "0 0 0.65rem",
                    fontSize: "0.82rem",
                    color: "var(--text-secondary)",
                    lineHeight: 1.5,
                  }}
                >
                  {path.tagline}
                </p>

                {/* Step preview */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.3rem",
                    marginBottom: "0.65rem",
                  }}
                >
                  {previewSteps.map((step, i) => (
                    <div
                      key={step.id}
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--text-muted)",
                        display: "flex",
                        gap: "0.4rem",
                      }}
                    >
                      <span
                        style={{
                          color: "var(--text-muted)",
                          fontFamily: "var(--font-mono)",
                          minWidth: "1.2rem",
                        }}
                      >
                        {i + 1}.
                      </span>
                      <span>{step.name}</span>
                    </div>
                  ))}
                  {allSteps.length > 3 && (
                    <span
                      style={{
                        fontSize: "0.72rem",
                        color: "var(--text-muted)",
                        paddingLeft: "1.6rem",
                      }}
                    >
                      +{allSteps.length - 3} more
                    </span>
                  )}
                </div>

                <div
                  style={{
                    fontSize: "0.72rem",
                    color: "var(--text-muted)",
                  }}
                >
                  {completed > 0
                    ? `${completed} / ${total} ${unit} complete`
                    : `${total} ${unit} · Start your journey`}
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
                    marginTop: "0.5rem",
                  }}
                >
                  <span>
                    {getTotalSteps(path)} algorithms · {path.tiers.length}{" "}
                    {path.tiers.length === 1 ? "chapter" : "tiers"}
                  </span>
                  <span style={{ color: path.accentColor, fontWeight: 600 }}>
                    {completed > 0 ? "Continue →" : "Start →"}
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
          margin: "0 auto 4rem",
          padding: "0 2rem",
          width: "100%",
          textAlign: "center",
        }}
      >
        <Link to="/algorithms" className="home-browse-cta">
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
