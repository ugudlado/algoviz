import BFSAlgorithmModule from "./bfs-algorithm";
import type { SearchAlgorithmModule } from "./module-types";

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

const BFSAlgorithm = BFSAlgorithmModule as SearchAlgorithmModule<
  [BfsSearchOptions],
  BfsSearchResult
>;

export const search = (options: BfsSearchOptions): BfsSearchResult => {
  return BFSAlgorithm.search(options);
};
