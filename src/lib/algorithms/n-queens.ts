// @ts-ignore
import NQueensAlgorithmModule from "./n-queens-algorithm.js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const NQueensAlgorithm: any = NQueensAlgorithmModule;

// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
export const generateSteps: (n: number) => Array<{
  type: "place" | "conflict" | "backtrack" | "solution";
  row: number;
  col: number;
  board: number[];
  stepCount: number;
  backtracks: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  conflictCells: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  treeNode: any;
}> = NQueensAlgorithm.generateSteps;
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
export const solveAll: (n: number) => {
  count: number;
  firstSolution: number[] | null;
} = NQueensAlgorithm.solveAll;
