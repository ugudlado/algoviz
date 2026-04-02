import { useMemo, useState } from "react";
import { Nav } from "@/components/Nav";
import { AlgorithmComplete } from "@/components/AlgorithmComplete";
import { WatchPanel } from "@/components/WatchPanel";
import { PlaybackController } from "@/components/PlaybackController";
import { ComplexityPopover } from "@/components/ComplexityPopover";
import { AnalogyPanel } from "@/components/AnalogyPanel";
import { ProblemFrame } from "@/components/ProblemFrame";
import { WhyComplexityPanel } from "@/components/WhyComplexityPanel";
import {
  checkWinner,
  findWinLine,
  getAvailableMoves,
  getBestMove,
  type Cell,
} from "@/lib/algorithms/minimax";
import "@/styles/minimax.css";

const PSEUDO_LINES = [
  "if terminal(board): return score",
  "if maximizing:",
  "  best = -inf",
  "  for move in moves:",
  "    best = max(best, minimax(child))",
  "else (minimizing):",
  "  best = +inf",
  "  for move in moves:",
  "    best = min(best, minimax(child))",
  "apply alpha-beta pruning when possible",
];

export default function MinimaxPage() {
  const [board, setBoard] = useState<Cell[]>(Array(9).fill(null));
  const [aiFirst, setAiFirst] = useState(false);
  const [usePruning, setUsePruning] = useState(true);
  const [status, setStatus] = useState("Your turn.");
  const [stats, setStats] = useState<{ with: number; without: number } | null>(
    null,
  );
  const [treeSummary, setTreeSummary] = useState("");
  const [history, setHistory] = useState<Cell[][]>([Array(9).fill(null)]);
  const [historyStep, setHistoryStep] = useState(0);

  const human: "X" | "O" = aiFirst ? "O" : "X";
  const ai: "X" | "O" = aiFirst ? "X" : "O";
  const replayBoard = history[historyStep] ?? board;
  const winner = checkWinner(board);
  const replayWinner = checkWinner(replayBoard);
  const winLine = findWinLine(replayBoard, replayWinner);

  const watchVars = [
    { label: "AI Player", value: ai },
    {
      label: "Pruning",
      value: usePruning ? "ON" : "OFF",
      highlight: usePruning,
    },
    {
      label: "Available Moves",
      value: String(getAvailableMoves(board).length),
    },
    { label: "Winner", value: winner ?? "ongoing", highlight: !!winner },
    {
      label: "Nodes (pruned/full)",
      value: stats ? `${stats.with} / ${stats.without}` : "—",
    },
    {
      label: "Replay",
      value: `${historyStep + 1} / ${history.length}`,
    },
  ];
  const codeLine = winner ? 0 : usePruning ? 9 : 3;

  const nextAIMove = useMemo(() => {
    if (winner) return null;
    if (getAvailableMoves(board).length === 0) return null;
    return getBestMove(board, ai, usePruning);
  }, [ai, board, usePruning, winner]);

  const applyAIMove = () => {
    if (!nextAIMove || nextAIMove.move === null || winner) return;
    const next = [...board];
    next[nextAIMove.move] = ai;
    setBoard(next);
    setHistory((prev) => {
      const nextHistory = [...prev, next];
      setHistoryStep(nextHistory.length - 1);
      return nextHistory;
    });
    setStats({
      with: nextAIMove.nodesWithPruning,
      without: nextAIMove.nodesWithoutPruning,
    });
    setTreeSummary(
      `Best move: cell ${nextAIMove.move}. Root score ${nextAIMove.tree.score ?? "?"}, children explored ${nextAIMove.tree.children.length}.`,
    );
    const w = checkWinner(next);
    if (w === ai) setStatus("AI wins.");
    else if (w === "draw") setStatus("Draw.");
    else setStatus("Your turn.");
  };

  const onHumanMove = (idx: number) => {
    if (winner || board[idx] !== null) return;
    const next = [...board];
    next[idx] = human;
    setBoard(next);
    setHistory((prev) => {
      const nextHistory = [...prev, next];
      setHistoryStep(nextHistory.length - 1);
      return nextHistory;
    });
    const w = checkWinner(next);
    if (w === human) {
      setStatus("You win.");
      return;
    }
    if (w === "draw") {
      setStatus("Draw.");
      return;
    }
    setStatus("AI is thinking...");
    setTimeout(() => {
      const move = getBestMove(next, ai, usePruning);
      if (move.move === null) return;
      next[move.move] = ai;
      setBoard([...next]);
      setHistory((prev) => {
        const nextHistory = [...prev, [...next]];
        setHistoryStep(nextHistory.length - 1);
        return nextHistory;
      });
      setStats({
        with: move.nodesWithPruning,
        without: move.nodesWithoutPruning,
      });
      setTreeSummary(
        `Best move: cell ${move.move}. Root score ${move.tree.score ?? "?"}, children explored ${move.tree.children.length}.`,
      );
      const ww = checkWinner(next);
      if (ww === ai) setStatus("AI wins.");
      else if (ww === "draw") setStatus("Draw.");
      else setStatus("Your turn.");
    }, 220);
  };

  return (
    <div className="algo-page" data-category="advanced">
      <Nav showStoryBanner />
      <div className="page-header">
        <div className="title-group">
          <h1>Minimax (Tic-Tac-Toe)</h1>
          <div className="title-meta">
            <span className="badge">Advanced</span>
            <ComplexityPopover
              best="O(b^(d/2))"
              avg="O(b^d)"
              worst="O(b^d)"
              space="O(d)"
              bestNote="With strong pruning"
              avgNote="Without ordering hints"
              worstNote="No pruning opportunities"
              spaceNote="Recursion stack depth"
              why="Minimax explores game states recursively. Alpha-beta pruning reduces explored nodes by cutting branches that cannot change the final decision."
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
                Choose the move that maximizes guaranteed outcome against a
                perfect opponent.
              </p>
            </div>
          </ProblemFrame>
          <WhyComplexityPanel derivation="Branching factor b and depth d define game tree size O(b^d). Alpha-beta pruning can cut many branches, often reducing effective search toward O(b^(d/2))." />
          <AnalogyPanel>
            <strong>Real-world analogy:</strong> Think several moves ahead in
            chess: you pick moves that guarantee the best worst-case outcome.
          </AnalogyPanel>

          <div className="panel">
            <div className="buttons" style={{ marginBottom: "0.75rem" }}>
              <button
                type="button"
                className="btn-primary"
                onClick={() => {
                  setBoard(Array(9).fill(null));
                  setHistory([Array(9).fill(null)]);
                  setHistoryStep(0);
                  setStatus(aiFirst ? "AI turn." : "Your turn.");
                  setStats(null);
                  setTreeSummary("");
                }}
              >
                New Game
              </button>
              <button
                type="button"
                onClick={() => {
                  const next = !aiFirst;
                  setAiFirst(next);
                  setBoard(Array(9).fill(null));
                  setHistory([Array(9).fill(null)]);
                  setHistoryStep(0);
                  setStatus(next ? "AI turn." : "Your turn.");
                  setStats(null);
                  setTreeSummary("");
                }}
              >
                AI First: {aiFirst ? "ON" : "OFF"}
              </button>
              <button type="button" onClick={() => setUsePruning((p) => !p)}>
                α-β Pruning: {usePruning ? "ON" : "OFF"}
              </button>
              <button type="button" onClick={applyAIMove} disabled={!!winner}>
                AI Move
              </button>
            </div>

            <div className="mm-board">
              {replayBoard.map((cell, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`mm-cell${winLine?.includes(idx) ? " mm-win" : ""}`}
                  onClick={() => onHumanMove(idx)}
                  disabled={
                    !!winner ||
                    cell !== null ||
                    historyStep !== history.length - 1
                  }
                >
                  {cell}
                </button>
              ))}
            </div>

            <div className="info" style={{ marginTop: "0.75rem" }}>
              {status}
            </div>
            {treeSummary && (
              <div className="result" style={{ marginTop: "0.75rem" }}>
                {treeSummary}
              </div>
            )}
            {history.length > 1 && (
              <PlaybackController
                steps={history}
                currentStep={historyStep}
                onStep={(n) =>
                  setHistoryStep(Math.max(0, Math.min(history.length - 1, n)))
                }
                onReset={() => setHistoryStep(0)}
              />
            )}
          </div>
        </div>
        <div className="sidebar">
          <div className="stats-grid" style={{ marginBottom: "1rem" }}>
            <div className="stat-card">
              <span className="stat-value">
                {getAvailableMoves(board).length}
              </span>
              <span className="stat-label">Moves Left</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{stats ? stats.with : "—"}</span>
              <span className="stat-label">Nodes</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{history.length - 1}</span>
              <span className="stat-label">Turns</span>
            </div>
          </div>
          <WatchPanel vars={watchVars} />
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
