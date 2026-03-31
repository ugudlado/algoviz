import LCSAlgorithmModule from "./lcs-algorithm";
import type { SolveAlgorithmModule } from "./module-types";

export interface LcsStep {
  row: number;
  col: number;
  value: number;
  isMatch: boolean;
  explanation: string;
}

export interface LcsTraceback {
  path: Array<{ row: number; col: number }>;
  lcsString: string;
}

export interface LcsResult {
  dp: number[][];
  steps: LcsStep[];
  traceback: LcsTraceback;
  lcsString: string;
}

type LcsAlgorithmModuleType = SolveAlgorithmModule<[string, string], LcsResult>;

const LCSAlgorithm = LCSAlgorithmModule as LcsAlgorithmModuleType;

export const solve = (strA: string, strB: string): LcsResult =>
  LCSAlgorithm.solve(strA, strB);
