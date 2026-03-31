// @ts-ignore — IIFE + CommonJS bridge from dfs-algorithm.js
import DFSAlgorithmModule from "./dfs-algorithm.js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const DFSAlgorithm: any = DFSAlgorithmModule;

export type DfsCell = [number, number];

export interface DfsSnapshot {
  stack: DfsCell[];
  visited: DfsCell[];
  current: DfsCell | null;
  path: DfsCell[] | null;
  found: boolean;
}

interface DfsSearchResult {
  snapshots: DfsSnapshot[];
  path: DfsCell[] | null;
  found: boolean;
}

interface DfsSearchOptions {
  walls: boolean[][];
  rows: number;
  cols: number;
  start: DfsCell;
  end: DfsCell;
}

export function search(options: DfsSearchOptions): DfsSearchResult {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  return DFSAlgorithm.search(options) as DfsSearchResult;
}
