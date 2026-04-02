import { Nav } from "@/components/Nav";
import { useAlgovizProgress } from "@/contexts/AlgovizProgressContext";
import {
  ALGORITHMS,
  CATEGORY_LABELS,
  DIFFICULTY_COLOR,
  getSpaceComplexity,
  type AlgoCard,
} from "@/data/algorithms";
import { useState } from "react";
import { Link } from "react-router-dom";

type DifficultyFilter = "all" | "Beginner" | "Intermediate" | "Advanced";
type StatusFilter = "all" | "completed" | "todo";

export default function Algorithms() {
  const { isAlgorithmComplete, toggleAlgorithmComplete } = useAlgovizProgress();
  const [activeCategory, setActiveCategory] = useState("all");
  const [difficulty, setDifficulty] = useState<DifficultyFilter>("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [query, setQuery] = useState("");

  const filtered = ALGORITHMS.filter((a) => {
    if (activeCategory !== "all" && a.category !== activeCategory) return false;
    if (difficulty !== "all" && a.difficulty !== difficulty) return false;
    if (status === "completed" && !isAlgorithmComplete(a.path)) return false;
    if (status === "todo" && isAlgorithmComplete(a.path)) return false;
    if (
      query &&
      !a.name.toLowerCase().includes(query.toLowerCase()) &&
      !a.categoryLabel.toLowerCase().includes(query.toLowerCase())
    )
      return false;
    return true;
  });

  const completedCount = ALGORITHMS.filter((a) =>
    isAlgorithmComplete(a.path),
  ).length;

  return (
    <div
      className="algo-page"
      data-category="home"
      style={{ alignItems: "stretch", padding: 0 }}
    >
      <Nav />

      <section
        style={{
          maxWidth: 1200,
          margin: "6rem auto 2rem",
          padding: "0 2rem",
          width: "100%",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            flexWrap: "wrap",
            gap: "0.5rem",
            marginBottom: "0.5rem",
          }}
        >
          <h1
            style={{
              fontSize: "clamp(1.5rem, 3vw, 2rem)",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              margin: 0,
            }}
          >
            Algorithms
          </h1>
          <span
            style={{
              fontSize: "0.82rem",
              color: "var(--text-muted)",
            }}
          >
            {completedCount} / {ALGORITHMS.length} completed
          </span>
        </div>
        <p
          style={{
            color: "var(--text-secondary)",
            fontSize: "0.9rem",
            margin: "0 0 1.5rem",
          }}
        >
          Browse and visualize {ALGORITHMS.length} algorithms across{" "}
          {CATEGORY_LABELS.length - 1} categories.
        </p>

        {/* Category Tabs */}
        <div
          className="algobrowse-tabs"
          role="tablist"
          aria-label="Algorithm categories"
        >
          {CATEGORY_LABELS.map((cat) => (
            <button
              key={cat.category}
              type="button"
              role="tab"
              aria-selected={activeCategory === cat.category}
              className={`algobrowse-tab${activeCategory === cat.category ? " algobrowse-tab--active" : ""}`}
              onClick={() => setActiveCategory(cat.category)}
            >
              {cat.label}
              {cat.category !== "all" && (
                <span className="algobrowse-tab-count">
                  {ALGORITHMS.filter((a) => a.category === cat.category).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Filters row */}
        <div className="algobrowse-filters">
          <input
            type="search"
            placeholder="Search algorithms..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="algobrowse-search"
            aria-label="Search algorithms"
          />

          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as DifficultyFilter)}
            className="algobrowse-select"
            aria-label="Filter by difficulty"
          >
            <option value="all">All levels</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as StatusFilter)}
            className="algobrowse-select"
            aria-label="Filter by status"
          >
            <option value="all">All status</option>
            <option value="completed">Completed</option>
            <option value="todo">Todo</option>
          </select>
        </div>

        {/* Results */}
        {filtered.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "3rem 0",
              color: "var(--text-muted)",
              fontSize: "0.95rem",
            }}
          >
            No algorithms match your filters.
          </div>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "1rem",
            marginBottom: "4rem",
          }}
        >
          {filtered.map((algo) => (
            <BrowseAlgoCard
              key={algo.name}
              algo={algo}
              done={isAlgorithmComplete(algo.path)}
              onToggle={() => toggleAlgorithmComplete(algo.path)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

function BrowseAlgoCard({
  algo,
  done,
  onToggle,
}: {
  algo: AlgoCard;
  done: boolean;
  onToggle: () => void;
}) {
  return (
    <Link to={algo.path} style={{ textDecoration: "none", display: "block" }}>
      <div
        className="algobrowse-card"
        onMouseEnter={(e) => {
          const el = e.currentTarget;
          el.style.borderColor = `var(${algo.accentVar})`;
          el.style.transform = "translateY(-2px)";
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget;
          el.style.borderColor = "var(--border)";
          el.style.transform = "";
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span
            style={{
              fontSize: "0.7rem",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: `var(${algo.accentVar})`,
            }}
          >
            {algo.categoryLabel}
          </span>
          <span
            style={{
              fontSize: "0.68rem",
              color: DIFFICULTY_COLOR[algo.difficulty],
              fontWeight: 600,
            }}
          >
            {algo.difficulty}
          </span>
        </div>

        <h3
          style={{
            fontSize: "1rem",
            fontWeight: 700,
            letterSpacing: "-0.01em",
            color: "var(--text-primary)",
          }}
        >
          {algo.name}
        </h3>

        <p
          style={{
            fontSize: "0.82rem",
            color: "var(--text-secondary)",
            lineHeight: 1.5,
            flex: 1,
          }}
        >
          {algo.description}
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "auto",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.78rem",
              color: `var(${algo.accentVar})`,
              fontWeight: 600,
            }}
          >
            T: {algo.complexity} · S: {getSpaceComplexity(algo.name)}
          </span>
        </div>

        <div className="algo-card-footer">
          <button
            type="button"
            className="algo-card-status-btn"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggle();
            }}
            aria-pressed={done}
            title={done ? "Completed — click to unmark" : "Mark as completed"}
            aria-label={done ? "Mark as not completed" : "Mark as completed"}
          >
            <span className="algo-card-status-led" aria-hidden />
            {done ? "Done" : "Todo"}
          </button>
          <span
            className="algo-card-visualize-hint"
            style={{ color: `var(${algo.accentVar})` }}
          >
            Visualize →
          </span>
        </div>
      </div>
    </Link>
  );
}
