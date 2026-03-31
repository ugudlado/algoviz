import MinimaxAlgorithmModule from "./minimax-algorithm";

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

type MinimaxAlgorithmModuleType = {
  checkWinner: (board: Cell[]) => "X" | "O" | "draw" | null;
  getAvailableMoves: (board: Cell[]) => number[];
  getBestMove: (
    board: Cell[],
    player: "X" | "O",
    usePruning: boolean,
  ) => {
    move: number | null;
    tree: TreeNode;
    nodesWithPruning: number;
    nodesWithoutPruning: number;
  };
  findWinLine: (
    board: Cell[],
    winner: "X" | "O" | "draw" | null,
  ) => [number, number, number] | null;
};

const MinimaxAlgorithm = MinimaxAlgorithmModule as MinimaxAlgorithmModuleType;

export const checkWinner: (board: Cell[]) => "X" | "O" | "draw" | null =
  MinimaxAlgorithm.checkWinner;
export const getAvailableMoves: (board: Cell[]) => number[] =
  MinimaxAlgorithm.getAvailableMoves;
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

export const findWinLine = (
  board: Cell[],
  winner: "X" | "O" | "draw" | null,
): [number, number, number] | null =>
  MinimaxAlgorithm.findWinLine(board, winner);
