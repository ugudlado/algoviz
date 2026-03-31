// @ts-ignore
import MinimaxAlgorithmModule from "./minimax-algorithm.js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const MinimaxAlgorithm: any = MinimaxAlgorithmModule;

export type Cell = "X" | "O" | null;

interface TreeNode {
  board: Cell[];
  move: number | null;
  player: "X" | "O";
  score: number | null;
  alpha: number;
  beta: number;
  pruned: boolean;
  children: TreeNode[];
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
export const checkWinner: (board: Cell[]) => "X" | "O" | "draw" | null =
  MinimaxAlgorithm.checkWinner;
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
export const getAvailableMoves: (board: Cell[]) => number[] =
  MinimaxAlgorithm.getAvailableMoves;
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
export const getBestMove: (
  board: Cell[],
  player: "X" | "O",
  usePruning: boolean,
) => {
  move: number | null;
  tree: TreeNode;
  nodesWithPruning: number;
  nodesWithoutPruning: number;
} = MinimaxAlgorithm.getBestMove;

export function findWinLine(
  board: Cell[],
  winner: "X" | "O" | "draw" | null,
): [number, number, number] | null {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  return MinimaxAlgorithm.findWinLine(board, winner) as
    | [number, number, number]
    | null;
}
