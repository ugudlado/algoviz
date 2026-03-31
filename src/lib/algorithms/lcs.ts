// @ts-ignore
import LCSAlgorithmModule from "./lcs-algorithm.js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const LCSAlgorithm: any = LCSAlgorithmModule;

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

export function solve(strA: string, strB: string): LcsResult {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  return LCSAlgorithm.solve(strA, strB) as LcsResult;
}
