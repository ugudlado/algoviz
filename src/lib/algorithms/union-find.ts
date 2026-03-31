// @ts-ignore
import UnionFindAlgorithmModule from "./union-find-algorithm.js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const UnionFindAlgorithm: any = UnionFindAlgorithmModule;

export interface DSU {
  parent: number[];
  rank: number[];
}

export interface UnionFindStep {
  type: "find" | "union" | "compressed";
  x?: number;
  y?: number;
  root?: number;
  parentBefore?: number[];
  parentAfter?: number[];
  rank?: number[];
  merged?: boolean;
  message?: string;
}

export interface UnionFindOperation {
  type: "union" | "find";
  x: number;
  y?: number;
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
export const MAX_NODES: number = UnionFindAlgorithm.MAX_NODES;
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
export const getComponentCount: (dsu: DSU) => number =
  UnionFindAlgorithm.getComponentCount;
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
export const runOperations: (
  n: number,
  operations: UnionFindOperation[],
) => { finalDsu: DSU; steps: UnionFindStep[] } =
  UnionFindAlgorithm.runOperations;
