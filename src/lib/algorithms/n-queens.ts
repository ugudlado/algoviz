import NQueensAlgorithmModule from "./n-queens-algorithm";
interface NQueensStep {
  type: "place" | "conflict" | "backtrack" | "solution";
  row: number;
  col: number;
  board: number[];
  stepCount: number;
  backtracks: number;
  conflictCells: Array<{ row: number; col: number }>;
  treeNode: unknown;
}

type NQueensAlgorithmModuleType = {
  generateSteps: (n: number) => NQueensStep[];
  solveAll: (n: number) => {
    count: number;
    firstSolution: number[] | null;
  };
};

const NQueensAlgorithm = NQueensAlgorithmModule as NQueensAlgorithmModuleType;

export const generateSteps: (n: number) => NQueensStep[] =
  NQueensAlgorithm.generateSteps;
export const solveAll: (n: number) => {
  count: number;
  firstSolution: number[] | null;
} = NQueensAlgorithm.solveAll;
