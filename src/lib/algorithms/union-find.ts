import UnionFindAlgorithmModule from "./union-find-algorithm";

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

type UnionFindAlgorithmModuleType = {
  MAX_NODES: number;
  getComponentCount: (dsu: DSU) => number;
  runOperations: (
    n: number,
    operations: UnionFindOperation[],
  ) => { finalDsu: DSU; steps: UnionFindStep[] };
};

const UnionFindAlgorithm =
  UnionFindAlgorithmModule as UnionFindAlgorithmModuleType;

export const MAX_NODES: number = UnionFindAlgorithm.MAX_NODES;
export const getComponentCount: (dsu: DSU) => number =
  UnionFindAlgorithm.getComponentCount;
export const runOperations: (
  n: number,
  operations: UnionFindOperation[],
) => { finalDsu: DSU; steps: UnionFindStep[] } =
  UnionFindAlgorithm.runOperations;
