// @ts-ignore — IIFE + CommonJS bridge from bfs-algorithm.js
import BFSAlgorithmModule from "./bfs-algorithm.js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const BFSAlgorithm: any = BFSAlgorithmModule;

export type BfsCell = [number, number];

export interface BfsSnapshot {
  frontier: BfsCell[];
  visited: BfsCell[];
  queue: BfsCell[];
  path: BfsCell[] | null;
  found: boolean;
}

interface BfsSearchResult {
  found: boolean;
  path: BfsCell[] | null;
  snapshots: BfsSnapshot[];
  visitedCount: number;
}

interface BfsSearchOptions {
  gridSize: number;
  walls: boolean[][];
  start: BfsCell;
  end: BfsCell;
}

export function search(options: BfsSearchOptions): BfsSearchResult {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  return BFSAlgorithm.search(options) as BfsSearchResult;
}
